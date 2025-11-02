//! Axum API integration - generates FromRef and api module with handlers

use proc_macro::TokenStream;
use quote::quote;
use syn::{DeriveInput, Type, parse_macro_input};

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

    let attr_str = attr.to_string();
    let parts: Vec<&str> = attr_str.split(',').map(|s| s.trim()).collect();

    let state_type_name = match syn::parse_str::<syn::Ident>(parts[0]) {
        Ok(ident) => ident,
        Err(_) => {
            return syn::Error::new_spanned(
                &input,
                format!("Invalid state type name: {}", parts[0]),
            )
            .to_compile_error()
            .into();
        }
    };

    let enable_openapi = parts.len() > 1 && parts[1] == "openapi";

    let struct_name = &input.ident;
    let vis = &input.vis;

    // Generate the Stately{StateName} type name
    let stately_type_name =
        syn::Ident::new(&format!("Stately{}", state_type_name), state_type_name.span());
    let stately_type: Type = syn::parse_quote!(#stately_type_name);

    // Conditional OpenAPI annotations
    let get_entity_query_derive = if enable_openapi {
        quote! { #[derive(::serde::Deserialize, ::utoipa::IntoParams)] }
    } else {
        quote! { #[derive(::serde::Deserialize)] }
    };

    let operation_response_derives = if enable_openapi {
        quote! { #[derive(Debug, Clone, ::serde::Serialize, ::serde::Deserialize, ::utoipa::ToSchema, ::utoipa::ToResponse)] }
    } else {
        quote! { #[derive(Debug, Clone, ::serde::Serialize, ::serde::Deserialize)] }
    };

    let operation_response_id_schema = if enable_openapi {
        quote! { #[schema(value_type = String, format = "uuid")] }
    } else {
        quote! {}
    };

    let get_entity_response_derive = if enable_openapi {
        quote! { #[derive(::serde::Serialize, ::serde::Deserialize, ::utoipa::ToSchema, utoipa::ToResponse)] }
    } else {
        quote! { #[derive(::serde::Serialize, ::serde::Deserialize)] }
    };

    let entities_response_derive = if enable_openapi {
        quote! { #[derive(::serde::Serialize, ::utoipa::ToSchema, ::utoipa::ToResponse)] }
    } else {
        quote! { #[derive(::serde::Serialize)] }
    };

    let entities_map_derive = if enable_openapi {
        quote! { #[derive(Debug, Clone, PartialEq, ::utoipa::ToSchema)] }
    } else {
        quote! { #[derive(Debug, Clone, PartialEq)] }
    };

    let list_response_derive = if enable_openapi {
        quote! { #[derive(::serde::Serialize, ::utoipa::ToSchema, ::utoipa::ToResponse)] }
    } else {
        quote! { #[derive(::serde::Serialize)] }
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
                path = "",
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

    let list_entities_path = if enable_openapi {
        quote! {
            #[::utoipa::path(
                get,
                path = "",
                tag = "entity",
                responses(
                    (status = 200, description = "Successfully retrieved all entities")
                )
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
                    (status = 200, description = "Successfully retrieved entity", body = Entity),
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
                params(
                    ("id" = String, Path, description = "Entity ID")
                ),
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
                params(
                    ("id" = String, Path, description = "Entity ID")
                ),
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
                    (status = 200, description = "Entity removed successfully", body = String),
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
                path = "",
                tag = "entity",
                responses((status = 200, description = "Get entities with filters", body = EntitiesResponse)),
                params(
                    ("name" = Option<String>, Query, description = "Identifier of entity, ie id or name"),
                    ("type" = Option<StateEntry>, Query, description = "Type of entity")
                )
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
                        // TODO: Remove - Figure this out
                        // ::stately::Link<T>
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
        // Generate the Stately{StateName} wrapper struct for Axum integration
        /// Wrapper around state for Axum integration with Arc<RwLock<T>>
        #[derive(Clone)]
        #vis struct #stately_type_name {
            #vis state: ::std::sync::Arc<::tokio::sync::RwLock<#state_type_name>>,
        }

        impl #stately_type_name {
            /// Creates a new wrapped state for use with Axum
            #vis fn new(state: #state_type_name) -> Self {
                Self {
                    state: ::std::sync::Arc::new(::tokio::sync::RwLock::new(state)),
                }
            }
        }

        // Generate the AppState struct with the state field
        #[derive(Clone)]
        #api_doc
        #vis struct #struct_name {
            #vis state: #stately_type,
        }

        impl #struct_name {
            /// Creates a new API state wrapper
            #vis fn new(state: #state_type_name) -> Self {
                Self {
                    state: #stately_type_name::new(state),
                }
            }
        }

        // Generate FromRef so Axum can extract Stately{Name} from user's AppState
        impl ::axum::extract::FromRef<#struct_name> for #stately_type {
            fn from_ref(app_state: &#struct_name) -> Self {
                app_state.state.clone()
            }
        }


        // Generated API implementation on the user's struct
        #[allow(clippy::needless_for_each)] // TODO: Remove or keep
        impl #struct_name {
            /// Creates the Axum router with all entity CRUD endpoints
            pub fn router<S>(state: S) -> ::axum::Router<S>
            where
                S: Send + Sync + Clone + 'static,
                #stately_type: ::axum::extract::FromRef<S>,
            {
                ::axum::Router::new()
                    .route(
                        "/",
                        ::axum::routing::get(list_entities)
                            .put(create_entity)
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
        }

        /// Query parameters for getting a single entity by ID and type
        #get_entity_query_derive
        #vis struct GetEntityQuery {
            #[serde(rename = "type")]
            entity_type: StateEntry,
        }

        // Generate the OperationResponse type (outside impl block)
        /// Standard operation response with ID and optional message
        #operation_response_derives
        #vis struct OperationResponse {
            #operation_response_id_schema
            pub id: ::stately::EntityId,
            pub message: String,
        }

        /// Query parameters for getting a single entity by ID and type
        #get_entity_response_derive
        #vis struct GetEntityResponse {
            id: ::stately::EntityId,
            entity: Entity,
        }

        /// Response for full entity queries
        #entities_response_derive
        #vis struct EntitiesResponse {
            #vis entities: EntitiesMap,
        }

        #entities_map_derive
        #vis struct EntitiesMap {
            entities: ::stately::hashbrown::HashMap<StateEntry, ::stately::hashbrown::HashMap<::stately::EntityId, Entity>>,
        }

        /// Response for entity summary list queries
        #list_response_derive
        #vis struct ListResponse {
            #list_response_field_attr
            #vis entities: ::stately::hashbrown::HashMap<StateEntry, Vec<::stately::Summary>>,
        }

        /// Create a new entity
        #create_entity_path
        #vis async fn create_entity(
            ::axum::extract::State(stately): ::axum::extract::State<#stately_type>,
            ::axum::Json(entity): ::axum::Json<Entity>,
        ) -> ::stately::Result<::axum::Json<OperationResponse>> {
            let mut state = stately.state.write().await;
            let id = state.create_entity(entity);
            Ok(::axum::Json(OperationResponse{ id, message: format!("Entity created") }))
        }

        /// Update an existing entity (full replacement)
        #update_entity_path
        pub async fn update_entity(
            ::axum::extract::State(stately): ::axum::extract::State<#stately_type>,
            ::axum::extract::Path(id): ::axum::extract::Path<String>,
            ::axum::Json(entity): ::axum::Json<Entity>,
        ) -> ::stately::Result<::axum::Json<OperationResponse>> {
            let mut state = stately.state.write().await;
            state.update_entity(&id, entity)?;
            Ok(::axum::Json(OperationResponse { id: id.into(), message: format!("Entity updated") }))
        }

        /// Patch an existing entity (same as update)
        #patch_entity_by_id_path
        pub async fn patch_entity_by_id(
            ::axum::extract::State(stately): ::axum::extract::State<#stately_type>,
            ::axum::extract::Path(id): ::axum::extract::Path<String>,
            ::axum::Json(entity): ::axum::Json<Entity>,
        ) -> ::stately::Result<::axum::Json<OperationResponse>> {
            let mut state = stately.state.write().await;
            state.update_entity(&id, entity)?;
            Ok(::axum::Json(OperationResponse { id: id.into(), message: format!("Entity patched") }))
        }

        /// Remove an entity
        #remove_entity_path
        pub async fn remove_entity(
            ::axum::extract::State(stately): ::axum::extract::State<#stately_type>,
            ::axum::extract::Path((entry, id)): ::axum::extract::Path<(StateEntry, String)>,
        ) -> ::stately::Result<::axum::Json<OperationResponse>> {
            let mut state = stately.state.write().await;
            if state.remove_entity(&id, entry) {
                Ok(::axum::Json(OperationResponse { id: id.into(), message: format!("Entity removed") }))
            } else {
                Err(::stately::Error::NotFound(id.to_string()))
            }
        }

        /// List entity summaries
        #list_entities_path
        pub async fn list_entities(
            ::axum::extract::State(stately): ::axum::extract::State<#stately_type>,
        ) -> ::stately::Result<::axum::Json<ListResponse>> {
            let state = stately.state.read().await;
            let entities = state.list_entities(None);
            Ok(::axum::Json(ListResponse { entities }))
        }

        /// List entity summaries
        #get_entities_path
        pub async fn get_entities(
            ::axum::extract::State(stately): ::axum::extract::State<#stately_type>,
        ) -> ::stately::Result<::axum::Json<EntitiesResponse>> {
            let state = stately.state.read().await;
            let entities = state.search_entities("");
            Ok(::axum::Json(EntitiesResponse { entities: EntitiesMap { entities } }))
        }

        /// Get entity by ID and type
        #get_entity_by_id_path
        pub async fn get_entity_by_id(
            ::axum::extract::State(stately): ::axum::extract::State<#stately_type>,
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
