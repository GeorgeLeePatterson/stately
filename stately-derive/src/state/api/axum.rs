//! Axum-specific API code generation

use proc_macro2::TokenStream;
use quote::quote;

/// Generate axum-specific code for the state
pub fn generate(state_name: &syn::Ident, vis: &syn::Visibility) -> TokenStream {
    quote! {
        // Re-export necessary types
        pub use super::{Entity, StateEntry, #state_name};

        /// Response for entity summary list queries
        #[derive(::serde::Serialize)]
        #[cfg_attr(feature = "openapi", derive(::utoipa::ToSchema))]
        #vis struct ListResponse {
            pub success: bool,
            #[cfg_attr(feature = "openapi", schema(value_type = HashMap<String, Vec<::stately::Summary>>))]
            pub entities: ::hashbrown::HashMap<StateEntry, Vec<::stately::Summary>>,
        }

        /// Response for full entity queries
        #[derive(::serde::Serialize)]
        #[cfg_attr(feature = "openapi", derive(::utoipa::ToSchema))]
        #vis struct EntitiesResponse {
            pub success: bool,
            #[cfg_attr(feature = "openapi", schema(value_type = HashMap<String, HashMap<String, Entity>>))]
            pub entities: ::hashbrown::HashMap<StateEntry, ::hashbrown::HashMap<::stately::EntityIdentifier, Entity>>,
        }

        /// Response for single entity get
        #[derive(::serde::Serialize)]
        #[cfg_attr(feature = "openapi", derive(::utoipa::ToSchema))]
        #vis struct EntityResponse {
            pub success: bool,
            pub id: String,
            pub entity: Entity,
        }

        /// Query parameters for getting a single entity
        #[derive(::serde::Deserialize)]
        #[cfg_attr(feature = "openapi", derive(::utoipa::IntoParams))]
        struct GetEntityQuery {
            #[serde(rename = "type")]
            entity_type: StateEntry,
        }

        /// Wrapper around stately state for axum integration
        #[derive(Clone)]
        pub struct StatelyState {
            pub state: ::std::sync::Arc<::tokio::sync::RwLock<#state_name>>,
        }

        impl StatelyState {
            /// Creates a new StatelyState wrapper
            pub fn new(state: ::std::sync::Arc<::tokio::sync::RwLock<#state_name>>) -> Self {
                Self { state }
            }
        }

        /// List all entities across all collections
        #[::utoipa::path(
            get,
            path = "/list",
            tag = "entity",
            responses(
                (status = 200, description = "List all entities", body = ListResponse)
            )
        )]
        pub async fn list_all_entities(
            ::axum::extract::State(stately_state): ::axum::extract::State<StatelyState>,
        ) -> ::axum::Json<ListResponse> {
            let entities = { stately_state.state.read().await.list_entities(None) };
            ::axum::Json(ListResponse { success: true, entities })
        }

        /// Get a single entity by ID and type
        #[::utoipa::path(
            get,
            path = "/{id}",
            tag = "entity",
            responses(
                (status = 200, description = "Single entity retrieved successfully", body = EntityResponse),
                (status = 404, description = "Entity not found")
            ),
            params(
                ("id" = String, Path, description = "Entity ID")
            )
        )]
        pub async fn get_entity_by_id(
            ::axum::extract::State(stately_state): ::axum::extract::State<StatelyState>,
            ::axum::extract::Path(id): ::axum::extract::Path<String>,
            ::axum::extract::Query(query): ::axum::extract::Query<GetEntityQuery>,
        ) -> ::std::result::Result<::axum::Json<EntityResponse>, ::axum::http::StatusCode> {
            let entity_type = query.entity_type;
            let result = { stately_state.state.read().await.get_entity(&id, entity_type) };

            match result {
                Some((retrieved_id, entity)) => Ok(::axum::Json(EntityResponse {
                    success: true,
                    id: retrieved_id.to_string(),
                    entity,
                })),
                None => Err(::axum::http::StatusCode::NOT_FOUND),
            }
        }

        /// List entities of a specific type
        #[::utoipa::path(
            get,
            path = "/list/{type}",
            tag = "entity",
            responses(
                (status = 200, description = "List of entities by type", body = ListResponse),
                (status = 400, description = "Invalid entity type")
            ),
            params(
                ("type" = String, Path, description = "Entity type to list")
            )
        )]
        pub async fn list_entities(
            ::axum::extract::State(stately_state): ::axum::extract::State<StatelyState>,
            ::axum::extract::Path(entity_type): ::axum::extract::Path<String>,
        ) -> ::std::result::Result<::axum::Json<ListResponse>, ::axum::http::StatusCode> {
            let entity_type = entity_type
                .parse::<StateEntry>()
                .map_err(|_| ::axum::http::StatusCode::BAD_REQUEST)?;

            let entities = { stately_state.state.read().await.list_entities(Some(entity_type)) };

            Ok(::axum::Json(ListResponse { success: true, entities }))
        }

        /// Search entities across all collections
        #[::utoipa::path(
            get,
            path = "/search/{needle}",
            tag = "entity",
            responses(
                (status = 200, description = "Search results", body = EntitiesResponse)
            ),
            params(
                ("needle" = String, Path, description = "Search string")
            )
        )]
        pub async fn search_entities(
            ::axum::extract::State(stately_state): ::axum::extract::State<StatelyState>,
            ::axum::extract::Path(needle): ::axum::extract::Path<String>,
        ) -> ::axum::Json<EntitiesResponse> {
            let entities = { stately_state.state.read().await.search_entities(&needle) };
            ::axum::Json(EntitiesResponse { success: true, entities })
        }

        /// Creates an axum router with CRUD endpoints for stately entities.
        ///
        /// # Example
        ///
        /// ```rust,ignore
        /// let app = axum::Router::new()
        ///     .nest("/api/v1/entity", axum_api::router())
        ///     .with_state(axum_api::StatelyState::new(state));
        /// ```
        #vis fn router() -> ::axum::Router<StatelyState> {
            ::axum::Router::new()
                .route("/list", ::axum::routing::get(list_all_entities))
                .route("/list/{type}", ::axum::routing::get(list_entities))
                .route("/search/{needle}", ::axum::routing::get(search_entities))
                .route("/{id}", ::axum::routing::get(get_entity_by_id))
        }

        /// OpenAPI documentation for the generated API
        #[allow(clippy::needless_for_each)]
        #[cfg(feature = "openapi")]
        #[derive(::utoipa::OpenApi)]
        #[openapi(
            paths(
                list_all_entities,
                get_entity_by_id,
                list_entities,
                search_entities
            ),
            components(
                schemas(Entity, StateEntry, ListResponse, EntitiesResponse, EntityResponse, ::stately::Summary)
            ),
            tags(
                (name = "entity", description = "Entity management endpoints")
            )
        )]
        #vis struct ApiDoc;
    }
}
