//! Axum API integration - generates FromRef and api module with handlers

use proc_macro::TokenStream;
use quote::quote;
use syn::{DeriveInput, parse_macro_input};

/// Generates FromRef implementation and api module with CRUD handlers
///
/// Usage:
/// ```ignore
/// #[stately::axum_api(State)]  // Pass the state type name
/// pub struct AppState {
///     state: StatelyState,
/// }
/// ```
///
/// This generates:
/// 1. The `state` field with type `StatelyState` (generated from State)
/// 2. `FromRef<AppState> for StatelyState` - allows Axum to extract state
/// 3. `AppState::api` module with all CRUD handlers, router, and OpenAPI docs
pub fn generate(attr: TokenStream, item: TokenStream) -> TokenStream {
    let input = parse_macro_input!(item as DeriveInput);

    // Parse the state type name and optional 'openapi' parameter
    // Expected: StateName or StateName, openapi
    if attr.is_empty() {
        return syn::Error::new_spanned(
            &input,
            "axum_api requires a state type parameter: #[stately::axum_api(StateName)] or \
             #[stately::axum_api(StateName, openapi)]",
        )
        .to_compile_error()
        .into();
    }

    // Parse macro attributes
    // Expected formats:
    //   StateName
    //   StateName, openapi
    //   StateName, openapi, components = [Type1, Type2, ...]

    let attr_str = attr.to_string();

    // First, extract the state type name (always first)
    let state_type_name = if let Some(first_comma) = attr_str.find(',') {
        attr_str[..first_comma].trim()
    } else {
        attr_str.trim()
    };

    let state_type_name = match syn::parse_str::<syn::Ident>(state_type_name) {
        Ok(ident) => ident,
        Err(_) => {
            return syn::Error::new_spanned(
                &input,
                format!("Invalid state type name: {}", state_type_name),
            )
            .to_compile_error()
            .into();
        }
    };

    // Check for 'openapi' flag
    let enable_openapi = attr_str.contains("openapi");

    // Parse components if present
    let additional_components: Vec<syn::Type> = if let Some(components_start) =
        attr_str.find("components")
    {
        // Validate that openapi is also enabled
        if !enable_openapi {
            return syn::Error::new_spanned(
                &input,
                "components parameter requires openapi to be enabled: #[stately::axum_api(State, \
                 openapi, components = [...])]",
            )
            .to_compile_error()
            .into();
        }

        // Extract the content between [ and ]
        if let Some(bracket_start) = attr_str[components_start..].find('[') {
            if let Some(bracket_end) = attr_str[components_start..].find(']') {
                let components_content =
                    &attr_str[components_start + bracket_start + 1..components_start + bracket_end];

                // Parse each type separated by commas
                components_content
                    .split(',')
                    .map(|s| s.trim())
                    .filter(|s| !s.is_empty())
                    .map(|type_str| {
                        syn::parse_str::<syn::Type>(type_str)
                            .unwrap_or_else(|_| panic!("Invalid type in components: {}", type_str))
                    })
                    .collect()
            } else {
                return syn::Error::new_spanned(
                    &input,
                    "components parameter missing closing bracket ']'",
                )
                .to_compile_error()
                .into();
            }
        } else {
            return syn::Error::new_spanned(
                &input,
                "components parameter missing opening bracket '['",
            )
            .to_compile_error()
            .into();
        }
    } else {
        Vec::new()
    };

    let struct_name = &input.ident;
    let vis = &input.vis;

    // Conditional OpenAPI annotations
    let get_entity_query_derive = if enable_openapi {
        quote! { #[derive(::serde::Deserialize, ::utoipa::IntoParams)] }
    } else {
        quote! { #[derive(::serde::Deserialize)] }
    };

    let operation_response_id_schema = if enable_openapi {
        quote! { #[schema(value_type = String, format = "uuid")] }
    } else {
        quote! {}
    };

    let common_response_derive = if enable_openapi {
        quote! { #[derive(Debug, ::serde::Serialize, ::serde::Deserialize, ::utoipa::ToSchema, ::utoipa::ToResponse)] }
    } else {
        quote! { #[derive(Debug, ::serde::Serialize, ::serde::Deserialize)] }
    };

    let entities_map_derive = if enable_openapi {
        quote! { #[derive(Debug, Clone, PartialEq, ::serde::Deserialize, ::utoipa::ToSchema)] }
    } else {
        quote! { #[derive(Debug, Clone, PartialEq, ::serde::Deserialize)] }
    };

    let list_response_field_attr = if enable_openapi {
        quote! {
            #[schema(
                value_type = HashMap<StateEntry, Vec<::stately::Summary>>,
                example = json!({
                    "pipeline": [
                        {"id": "my-pipeline", "name": "My Pipeline", "description": "Example pipeline"}
                    ],
                    "source": [
                        {"id": "my-source", "name": "My Source", "description": "Example source"}
                    ]
                })
            )]
        }
    } else {
        quote! {}
    };

    // Conditionally generate OpenAPI path attributes for each handler
    let create_entity_path = if enable_openapi {
        quote! {
            #[::utoipa::path(
                put,
                path = "/",
                tag = "entity",
                request_body = Entity,
                responses(
                    (status = 200, description = "Entity created successfully", body = OperationResponse),
                    (status = 500, description = "Internal server error", body = String)
                )
            )]
        }
    } else {
        quote! {}
    };

    let list_all_entities_path = if enable_openapi {
        quote! {
            #[::utoipa::path(
                get,
                path = "/list",
                tag = "entity",
                responses((status = 200, description = "List all entities", body = ListResponse))
            )]
        }
    } else {
        quote! {}
    };

    let list_entities_path = if enable_openapi {
        quote! {
            #[::utoipa::path(
                get,
                path = "/list/{type}",
                tag = "entity",
                params(("type" = StateEntry, Path, description = "Entity type to list")),
                responses((status = 200, description = "List entities by type", body = ListResponse)),
            )]
        }
    } else {
        quote! {}
    };

    let get_entity_by_id_path = if enable_openapi {
        quote! {
            #[::utoipa::path(
                get,
                path = "/{id}",
                tag = "entity",
                params(
                    ("id" = String, Path, description = "Entity ID"),
                    GetEntityQuery
                ),
                responses(
                    (status = 200, description = "Successfully retrieved entity", body = GetEntityResponse),
                    (status = 404, description = "Entity not found")
                )
            )]
        }
    } else {
        quote! {}
    };

    let update_entity_path = if enable_openapi {
        quote! {
            #[::utoipa::path(
                post,
                path = "/{id}",
                tag = "entity",
                params(("id" = String, Path, description = "Entity ID")),
                request_body = Entity,
                responses(
                    (status = 200, description = "Entity updated successfully", body = OperationResponse),
                    (status = 500, description = "Internal server error", body = String)
                )
            )]
        }
    } else {
        quote! {}
    };

    let patch_entity_by_id_path = if enable_openapi {
        quote! {
            #[::utoipa::path(
                patch,
                path = "/{id}",
                tag = "entity",
                params(("id" = String, Path, description = "Entity ID")),
                request_body = Entity,
                responses(
                    (status = 200, description = "Entity patched successfully", body = OperationResponse),
                    (status = 500, description = "Internal server error", body = String)
                )
            )]
        }
    } else {
        quote! {}
    };

    let remove_entity_path = if enable_openapi {
        quote! {
            #[::utoipa::path(
                delete,
                path = "/{entry}/{id}",
                tag = "entity",
                params(
                    ("entry" = StateEntry, Path, description = "Entity type"),
                    ("id" = String, Path, description = "Entity ID")
                ),
                responses(
                    (status = 200, description = "Entity removed successfully", body = OperationResponse),
                    (status = 404, description = "Entity not found"),
                    (status = 500, description = "Internal server error", body = String)
                )
            )]
        }
    } else {
        quote! {}
    };

    let get_entities_path = if enable_openapi {
        quote! {
            #[::utoipa::path(
                get,
                path = "/",
                tag = "entity",
                params(
                    ("name" = Option<String>, Query, description = "Identifier of entity, ie id or name"),
                    ("type" = Option<StateEntry>, Query, description = "Type of entity")
                ),
                responses((status = 200, description = "Get entities with filters", body = EntitiesResponse)),
            )]
        }
    } else {
        quote! {}
    };

    let api_doc = if enable_openapi {
        quote! {
            /// OpenAPI documentation
            #[derive(::utoipa::OpenApi)]
            #[openapi(
                paths(
                    create_entity,
                    list_entities,
                    get_entity_by_id,
                    update_entity,
                    patch_entity_by_id,
                    remove_entity
                ),
                components(
                    responses(
                        OperationResponse,
                        EntitiesResponse,
                        ListResponse,
                        GetEntityResponse,
                    ),
                    schemas(
                        Entity,
                        StateEntry,
                        OperationResponse,
                        EntitiesResponse,
                        EntitiesMap,
                        ListResponse,
                        GetEntityResponse,
                        ::stately::Summary,
                        ::stately::EntityId,
                        #(#additional_components),*
                    )
                ),
                tags(
                    (name = "entity", description = "Entity management endpoints"),
                )
            )]
        }
    } else {
        quote! {}
    };

    // Generate StatelyState wrapper and api module
    let expanded = quote! {
        // Generate the AppState struct with the state field
        #[derive(Clone)]
        #api_doc
        #vis struct #struct_name {
            #vis state: ::std::sync::Arc<::tokio::sync::RwLock<#state_type_name>>,
        }

        impl #struct_name {
            /// Creates a new API state wrapper
            #vis fn new(state: #state_type_name) -> Self {
                Self {
                    state: ::std::sync::Arc::new(::tokio::sync::RwLock::new(state)),
                }
            }

            /// Creates a new wrapped state for use with Axum
            #vis fn new_from_state(state: ::std::sync::Arc<::tokio::sync::RwLock<#state_type_name>>) -> Self {
                Self { state }
            }
        }

        // Generated API implementation on the user's struct
        impl #struct_name {
            /// Creates the Axum router with all entity CRUD endpoints
            pub fn router<S>(state: S) -> ::axum::Router<S>
            where
                S: Send + Sync + Clone + 'static,
                #struct_name: ::axum::extract::FromRef<S>,
            {
                ::axum::Router::new()
                    .route(
                        "/",
                        ::axum::routing::get(get_entities)
                            .put(create_entity)
                            .layer(::tower_http::compression::CompressionLayer::new())
                    )
                    .route(
                        "/list",
                        ::axum::routing::get(list_all_entities)
                            .layer(::tower_http::compression::CompressionLayer::new())
                    )
                    .route(
                        "/list/{type}",
                        ::axum::routing::get(list_entities)
                            .layer(::tower_http::compression::CompressionLayer::new())
                    )
                    .route(
                        "/{id}",
                        ::axum::routing::get(get_entity_by_id)
                            .post(update_entity)
                            .patch(patch_entity_by_id)
                    )
                    .route("/{entry}/{id}", ::axum::routing::delete(remove_entity))
                    .with_state(state)
            }

            /// Creates middleware that extracts ResponseEvent from response extensions and sends to channel
            ///
            /// The channel can send any type `T` that implements `From<ResponseEvent>`, allowing you to
            /// convert the event into your own enum variant (e.g., `events::Api::StateEvent(event)`).
            pub fn event_middleware<T>(
                event_tx: ::tokio::sync::mpsc::Sender<T>
            ) -> impl Fn(::axum::http::Request<::axum::body::Body>, ::axum::middleware::Next) -> std::pin::Pin<Box<dyn std::future::Future<Output = ::axum::response::Response> + Send>> + Clone
            where
                T: From<ResponseEvent> + Send + 'static,
            {
                move |req: ::axum::http::Request<::axum::body::Body>, next: ::axum::middleware::Next| {
                    let tx = event_tx.clone();
                    Box::pin(async move {
                        let response = next.run(req).await;

                        if let Some(event) = response.extensions().get::<ResponseEvent>() {
                            let converted: T = event.clone().into();
                            let _ = tx.send(converted).await;
                        }

                        response
                    })
                }
            }
        }

        /// Query parameters for getting a single entity by ID and type
        #get_entity_query_derive
        #vis struct GetEntityQuery {
            #[serde(rename = "type")]
            entity_type: StateEntry,
        }

        // Generate the OperationResponse type (outside impl block)
        /// Standard operation response with ID and optional message
        #common_response_derive
        #vis struct OperationResponse {
            #operation_response_id_schema
            pub id: ::stately::EntityId,
            pub message: String,
        }

        /// Query parameters for getting a single entity by ID and type
        #common_response_derive
        #vis struct GetEntityResponse {
            id: ::stately::EntityId,
            entity: Entity,
        }

        /// Response for full entity queries
        #common_response_derive
        #vis struct EntitiesResponse {
            #vis entities: EntitiesMap,
        }

        #entities_map_derive
        #vis struct EntitiesMap {
            #vis entities: ::stately::hashbrown::HashMap<
                StateEntry,
                ::stately::hashbrown::HashMap<::stately::EntityId, Entity>
            >,
        }

        /// Response for entity summary list queries
        #common_response_derive
        #vis struct ListResponse {
            #list_response_field_attr
            #vis entities: ::stately::hashbrown::HashMap<StateEntry, Vec<::stately::Summary>>,
        }

        /// Event emitted after CRUD operations
        #[derive(Debug, Clone)]
        #vis enum ResponseEvent {
            Created { id: ::stately::EntityId, entity: Entity },
            Updated { id: ::stately::EntityId, entity: Entity },
            Deleted { id: ::stately::EntityId, entry: StateEntry },
        }

        /// Create a new entity
        #create_entity_path
        #vis async fn create_entity(
            ::axum::extract::State(stately): ::axum::extract::State<#struct_name>,
            ::axum::Json(entity): ::axum::Json<Entity>,
        ) -> ::axum::response::Response {
            use ::axum::response::IntoResponse;

            let mut state = stately.state.write().await;
            let id = state.create_entity(entity.clone());

            let mut response = ::axum::Json(OperationResponse { id: id.clone(), message: format!("Entity created") }).into_response();
            response.extensions_mut().insert(ResponseEvent::Created { id, entity });
            response
        }

        /// Update an existing entity (full replacement)
        #update_entity_path
        pub async fn update_entity(
            ::axum::extract::State(stately): ::axum::extract::State<#struct_name>,
            ::axum::extract::Path(id): ::axum::extract::Path<String>,
            ::axum::Json(entity): ::axum::Json<Entity>,
        ) -> ::axum::response::Response {
            use ::axum::response::IntoResponse;

            let mut state = stately.state.write().await;
            match state.update_entity(&id, entity.clone()) {
                Ok(_) => {
                    let entity_id: ::stately::EntityId = id.into();
                    let mut response = ::axum::Json(OperationResponse { id: entity_id.clone(), message: format!("Entity updated") }).into_response();
                    response.extensions_mut().insert(ResponseEvent::Updated { id: entity_id, entity });
                    response
                }
                Err(e) => e.into_response()
            }
        }

        /// Patch an existing entity (same as update)
        #patch_entity_by_id_path
        pub async fn patch_entity_by_id(
            ::axum::extract::State(stately): ::axum::extract::State<#struct_name>,
            ::axum::extract::Path(id): ::axum::extract::Path<String>,
            ::axum::Json(entity): ::axum::Json<Entity>,
        ) -> ::axum::response::Response {
            use ::axum::response::IntoResponse;

            let mut state = stately.state.write().await;
            match state.update_entity(&id, entity.clone()) {
                Ok(_) => {
                    let entity_id: ::stately::EntityId = id.into();
                    let mut response = ::axum::Json(OperationResponse { id: entity_id.clone(), message: format!("Entity patched") }).into_response();
                    response.extensions_mut().insert(ResponseEvent::Updated { id: entity_id, entity });
                    response
                }
                Err(e) => e.into_response()
            }
        }

        /// Remove an entity
        #remove_entity_path
        pub async fn remove_entity(
            ::axum::extract::State(stately): ::axum::extract::State<#struct_name>,
            ::axum::extract::Path((entry, id)): ::axum::extract::Path<(StateEntry, String)>,
        ) -> ::axum::response::Response {
            use ::axum::response::IntoResponse;

            let mut state = stately.state.write().await;
            if let Err(e) = state.remove_entity(&id, entry) {
                return e.into_response();
            };

            let entity_id: ::stately::EntityId = id.into();
            let mut response = ::axum::Json(OperationResponse { id: entity_id.clone(), message: format!("Entity removed") }).into_response();
            response.extensions_mut().insert(ResponseEvent::Deleted { id: entity_id, entry });
            response
        }

        /// List all entity summaries
        #list_all_entities_path
        pub async fn list_all_entities(
            ::axum::extract::State(stately): ::axum::extract::State<#struct_name>,
        ) -> ::stately::Result<::axum::Json<ListResponse>> {
            let state = stately.state.read().await;
            let entities = state.list_entities(None);
            Ok(::axum::Json(ListResponse { entities }))
        }

        /// List entity summaries
        #list_entities_path
        pub async fn list_entities(
            ::axum::extract::State(stately): ::axum::extract::State<#struct_name>,
            ::axum::extract::Path(entity_type): ::axum::extract::Path<StateEntry>,
        ) -> ::stately::Result<::axum::Json<ListResponse>> {
            let state = stately.state.read().await;
            let entities = state.list_entities(Some(entity_type));
            Ok(::axum::Json(ListResponse { entities }))
        }

        /// Get all entities for all types
        #get_entities_path
        pub async fn get_entities(
            ::axum::extract::State(stately): ::axum::extract::State<#struct_name>,
        ) -> ::stately::Result<::axum::Json<EntitiesResponse>> {
            let state = stately.state.read().await;
            let entities = state.search_entities("");
            Ok(::axum::Json(EntitiesResponse { entities: EntitiesMap { entities } }))
        }

        /// Get entity by ID and type
        #get_entity_by_id_path
        pub async fn get_entity_by_id(
            ::axum::extract::State(stately): ::axum::extract::State<#struct_name>,
            ::axum::extract::Path(id): ::axum::extract::Path<String>,
            ::axum::extract::Query(query): ::axum::extract::Query<GetEntityQuery>,
        ) -> ::stately::Result<::axum::Json<GetEntityResponse>> {
            let state = stately.state.read().await;
            let Some((id, entity)) = state.get_entity(&id, query.entity_type) else {
                return Err(::stately::Error::NotFound(format!("Entity with ID {id} not found")))
            };
            Ok(::axum::Json(GetEntityResponse { id, entity }))
        }

        // Custom serialization so that entities don't have unnecessary duplicated information
        impl ::serde::Serialize for EntitiesMap {
            fn serialize<S>(&self, serializer: S) -> ::std::result::Result<S::Ok, S::Error>
            where
                S: ::serde::Serializer,
            {
                use ::serde::ser::SerializeMap;

                let mut map = serializer.serialize_map(Some(self.entities.len()))?;
                for (state_entry, entities) in &self.entities {
                    let mut entity_map: ::stately::hashbrown::HashMap<::stately::EntityId, ::serde_json::Value> = ::stately::hashbrown::HashMap::default();

                    for (id, entity) in entities {
                        // Extract the inner data from the Entity enum, bypassing the tag/content
                        // structure
                        let inner_value =
                            ::serde_json::to_value(entity).map_err(::serde::ser::Error::custom)?;
                        drop(entity_map.insert(id.clone(), inner_value));
                    }
                    map.serialize_entry(&state_entry.as_ref(), &entity_map)?;
                }
                map.end()
            }
        }

    };

    TokenStream::from(expanded)
}
