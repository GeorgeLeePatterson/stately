//! Axum API integration - generates FromRef and api module with handlers

use proc_macro::TokenStream;
use quote::quote;
use syn::{Data, DeriveInput, Fields, Type, parse_macro_input};

/// Generates FromRef implementation and api module with CRUD handlers
///
/// Usage:
/// ```ignore
/// #[stately::axum_api]
/// pub struct AppState {
///     state: StatelyState,  // Field named "state" by default, or mark with #[state]
/// }
/// ```
///
/// This generates:
/// 1. `FromRef<AppState> for StatelyState` - allows Axum to extract state
/// 2. `AppState::api` module with all CRUD handlers, router, and OpenAPI docs
pub fn generate(_attr: TokenStream, item: TokenStream) -> TokenStream {
    let input = parse_macro_input!(item as DeriveInput);

    let struct_name = &input.ident;

    // Find the fields
    let fields = match &input.data {
        Data::Struct(data) => match &data.fields {
            Fields::Named(fields) => &fields.named,
            _ => {
                return syn::Error::new_spanned(
                    &input,
                    "axum_api can only be used on structs with named fields",
                )
                .to_compile_error()
                .into();
            }
        },
        _ => {
            return syn::Error::new_spanned(&input, "axum_api can only be used on structs")
                .to_compile_error()
                .into();
        }
    };

    // Find the field of type Stately{Something} - default name "state"
    let state_field = fields.iter().find(|f| {
        // Check if field has #[state] attribute OR is named "state" and type starts with "Stately"
        if f.attrs.iter().any(|attr| attr.path().is_ident("state")) {
            return true;
        }

        // Check if field name is "state" by default
        if let Some(ident) = &f.ident
            && ident == "state"
        {
            // Check if type starts with "Stately"
            if let Type::Path(type_path) = &f.ty
                && let Some(segment) = type_path.path.segments.last()
            {
                return segment.ident.to_string().starts_with("Stately");
            }
        }
        false
    });

    let state_field = match state_field {
        Some(field) => field,
        None => {
            return syn::Error::new_spanned(
                &input,
                "axum_api requires a field named 'state' of type Stately{Name}, or mark a field \
                 with #[state]",
            )
            .to_compile_error()
            .into();
        }
    };

    let state_field_name = state_field.ident.as_ref().unwrap();

    // Extract the Stately{Name} type
    let stately_type = &state_field.ty;

    // Generate FromRef implementation and api module
    let expanded = quote! {
        // Preserve the original struct definition
        #input

        // Generate FromRef so Axum can extract Stately{Name} from user's AppState
        #[cfg(feature = "axum")]
        impl ::axum::extract::FromRef<#struct_name> for #stately_type {
            fn from_ref(app_state: &#struct_name) -> Self {
                app_state.#state_field_name.clone()
            }
        }

        /// Generated API module with Axum handlers and router
        #[cfg(feature = "axum")]
        pub mod api {
            #![allow(clippy::needless_for_each)]
            use super::*;

            // Re-export types from the state module
            pub use super::Entity;
            pub use super::StateEntry;

            /// Standard operation response with ID and optional message
            #[derive(Debug, Clone, ::serde::Serialize, ::serde::Deserialize)]
            #[cfg_attr(feature = "openapi", derive(::utoipa::ToSchema))]
            pub struct OperationResponse {
                #[cfg_attr(feature = "openapi", schema(value_type = String, format = "uuid"))]
                pub id: ::stately::EntityIdentifier,
                #[serde(skip_serializing_if = "Option::is_none")]
                pub message: Option<String>,
            }

            /// Create a new entity
            #[cfg_attr(feature = "openapi", ::utoipa::path(
                put,
                path = "",
                request_body = Entity,
                responses(
                    (status = 200, description = "Entity created successfully", body = OperationResponse),
                    (status = 500, description = "Internal server error", body = String)
                )
            ))]
            pub async fn create_entity(
                ::axum::extract::State(stately): ::axum::extract::State<#stately_type>,
                ::axum::Json(entity): ::axum::Json<Entity>,
            ) -> ::axum::response::Response {
                use ::axum::response::IntoResponse;
                let mut state = stately.state.write().await;
                match state.create_entity(entity) {
                    Ok((id, message)) => {
                        let response = OperationResponse { id, message };
                        (::axum::http::StatusCode::OK, ::axum::Json(response)).into_response()
                    }
                    Err(e) => (::axum::http::StatusCode::INTERNAL_SERVER_ERROR, e).into_response(),
                }
            }

            /// List all entities
            #[cfg_attr(feature = "openapi", ::utoipa::path(
                get,
                path = "",
                responses(
                    (status = 200, description = "Successfully retrieved all entities")
                )
            ))]
            pub async fn list_entities(
                ::axum::extract::State(stately): ::axum::extract::State<#stately_type>,
            ) -> ::axum::response::Response {
                use ::axum::response::IntoResponse;
                let state = stately.state.read().await;
                let entities = state.list_entities(None);
                (::axum::http::StatusCode::OK, ::axum::Json(entities)).into_response()
            }

            /// Query parameters for getting a single entity by ID and type
            #[derive(::serde::Deserialize)]
            #[cfg_attr(feature = "openapi", derive(::utoipa::IntoParams))]
            struct GetEntityQuery {
                #[serde(rename = "type")]
                entity_type: StateEntry,
            }

            /// Get entity by ID and type
            #[cfg_attr(feature = "openapi", ::utoipa::path(
                get,
                path = "/{id}",
                params(
                    ("id" = String, Path, description = "Entity ID"),
                    GetEntityQuery
                ),
                responses(
                    (status = 200, description = "Successfully retrieved entity", body = Entity),
                    (status = 404, description = "Entity not found")
                )
            ))]
            pub async fn get_entity_by_id(
                ::axum::extract::State(stately): ::axum::extract::State<#stately_type>,
                ::axum::extract::Path(id): ::axum::extract::Path<String>,
                ::axum::extract::Query(query): ::axum::extract::Query<GetEntityQuery>,
            ) -> ::axum::response::Response {
                use ::axum::response::IntoResponse;
                let state = stately.state.read().await;
                match state.get_entity(&id, query.entity_type) {
                    Some((_id, entity)) => (::axum::http::StatusCode::OK, ::axum::Json(entity)).into_response(),
                    None => ::axum::http::StatusCode::NOT_FOUND.into_response(),
                }
            }

            /// Update an existing entity (full replacement)
            #[cfg_attr(feature = "openapi", ::utoipa::path(
                post,
                path = "/{id}",
                params(
                    ("id" = String, Path, description = "Entity ID")
                ),
                request_body = Entity,
                responses(
                    (status = 200, description = "Entity updated successfully", body = OperationResponse),
                    (status = 500, description = "Internal server error", body = String)
                )
            ))]
            pub async fn update_entity(
                ::axum::extract::State(stately): ::axum::extract::State<#stately_type>,
                ::axum::extract::Path(id): ::axum::extract::Path<String>,
                ::axum::Json(entity): ::axum::Json<Entity>,
            ) -> ::axum::response::Response {
                use ::axum::response::IntoResponse;
                let mut state = stately.state.write().await;
                match state.update_entity(&id, entity) {
                    Ok((id, message)) => {
                        let response = OperationResponse { id, message };
                        (::axum::http::StatusCode::OK, ::axum::Json(response)).into_response()
                    }
                    Err(e) => (::axum::http::StatusCode::INTERNAL_SERVER_ERROR, e).into_response(),
                }
            }

            /// Patch an existing entity (same as update for now)
            #[cfg_attr(feature = "openapi", ::utoipa::path(
                patch,
                path = "/{id}",
                params(
                    ("id" = String, Path, description = "Entity ID")
                ),
                request_body = Entity,
                responses(
                    (status = 200, description = "Entity patched successfully", body = OperationResponse),
                    (status = 500, description = "Internal server error", body = String)
                )
            ))]
            pub async fn patch_entity_by_id(
                ::axum::extract::State(stately): ::axum::extract::State<#stately_type>,
                ::axum::extract::Path(id): ::axum::extract::Path<String>,
                ::axum::Json(entity): ::axum::Json<Entity>,
            ) -> ::axum::response::Response {
                use ::axum::response::IntoResponse;
                let mut state = stately.state.write().await;
                // For now, patch is the same as update
                match state.update_entity(&id, entity) {
                    Ok((id, message)) => {
                        let response = OperationResponse { id, message };
                        (::axum::http::StatusCode::OK, ::axum::Json(response)).into_response()
                    }
                    Err(e) => (::axum::http::StatusCode::INTERNAL_SERVER_ERROR, e).into_response(),
                }
            }

            /// Remove an entity
            #[cfg_attr(feature = "openapi", ::utoipa::path(
                delete,
                path = "/{entry}/{id}",
                params(
                    ("entry" = StateEntry, Path, description = "Entity type"),
                    ("id" = String, Path, description = "Entity ID")
                ),
                responses(
                    (status = 200, description = "Entity removed successfully", body = String),
                    (status = 404, description = "Entity not found"),
                    (status = 500, description = "Internal server error", body = String)
                )
            ))]
            pub async fn remove_entity(
                ::axum::extract::State(stately): ::axum::extract::State<#stately_type>,
                ::axum::extract::Path((entry, id)): ::axum::extract::Path<(StateEntry, String)>,
            ) -> ::axum::response::Response {
                use ::axum::response::IntoResponse;
                let mut state = stately.state.write().await;
                match state.remove_entity(&id, entry) {
                    Ok(Some(message)) => (::axum::http::StatusCode::OK, message).into_response(),
                    Ok(None) => ::axum::http::StatusCode::NOT_FOUND.into_response(),
                    Err(e) => (::axum::http::StatusCode::INTERNAL_SERVER_ERROR, e).into_response(),
                }
            }

            /// Creates the Axum router with all entity CRUD endpoints
            pub fn router() -> ::axum::Router<#stately_type> {
                ::axum::Router::new()
                    .route("/", ::axum::routing::get(list_entities).put(create_entity))
                    .route("/{id}", ::axum::routing::get(get_entity_by_id).post(update_entity).patch(patch_entity_by_id))
                    .route("/{entry}/{id}", ::axum::routing::delete(remove_entity))
            }

            /// OpenAPI documentation
            #[cfg(feature = "openapi")]
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
                    schemas(Entity, StateEntry, OperationResponse)
                )
            )]
            pub struct ApiDoc;
        }
    };

    TokenStream::from(expanded)
}
