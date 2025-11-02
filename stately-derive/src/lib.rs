//! Procedural macros for stately state management

use proc_macro::TokenStream;

mod axum_api;
mod entity;
mod state;

/// Derives the `StateEntity` trait for a struct.
///
/// # Attributes
///
/// - `#[stately(singleton)]` - Marks this as a singleton entity
/// - `#[stately(name_field = "field_name")]` - Uses a different field for the name (default:
///   "name")
/// - `#[stately(description_field = "field_name")]` - Uses a specific field for description
/// - `#[stately(description = "text")]` - Uses a static description
///
/// # Example
///
/// ```rust,ignore
/// #[stately::entity]
/// pub struct Pipeline {
///     pub name: String,
///     pub source: Link<SourceConfig>,
/// }
/// ```
#[proc_macro_attribute]
pub fn entity(attr: TokenStream, item: TokenStream) -> TokenStream { entity::entity(attr, item) }

/// Generates application state with entity collections.
///
/// # Syntax
///
/// ```rust,ignore
/// #[stately::state]
/// pub struct AppState {
///     // Regular collections (many entities)
///     pipelines: Pipeline,
///     sources: SourceConfig,
///
///     // Singletons (one entity)
///     #[singleton]
///     parse_settings: BufferSettings,
/// }
/// ```
///
/// # API Generation
///
/// Optionally generate web API code by specifying the `api` attribute:
///
/// ```rust,ignore
/// #[stately::state(api = ["axum"])]
/// pub struct AppState {
///     pipelines: Pipeline,
/// }
/// ```
///
/// This generates a namespaced module (e.g., `axum_api`) with:
/// - Concrete response types with OpenAPI schemas
/// - Handler functions with OpenAPI path annotations
/// - A router function
/// - An OpenAPI documentation struct
///
/// # Generated Code
///
/// This generates:
/// - `StateEntry` enum with variants for each entity type
/// - `Entity` enum wrapping each entity for type erasure
/// - The state struct with collection fields
/// - CRUD operation methods
/// - (Optional) API-specific modules for web frameworks
#[proc_macro_attribute]
pub fn state(attr: TokenStream, item: TokenStream) -> TokenStream { state::state(attr, item) }

/// Generates Axum API integration for a state wrapper struct.
///
/// This macro allows you to create custom API state structs that wrap your stately state
/// along with additional dependencies (database pools, config, etc.).
///
/// # Requirements
///
/// - The struct must have exactly one field marked with `#[state]`
/// - That field must be of type `Arc<RwLock<YourStateType>>`
/// - Pass the state type name as the attribute argument
///
/// # Example
///
/// ```rust,ignore
/// use std::sync::Arc;
/// use tokio::sync::RwLock;
/// use stately_derive::{state, axum_api};
///
/// #[state]
/// pub struct AppState {
///     pipelines: Pipeline,
/// }
///
/// #[axum_api(AppState)]
/// pub struct ApiState {
///     #[state]
///     pub app: Arc<RwLock<AppState>>,
///
///     // Your additional dependencies
///     pub db_pool: PgPool,
///     pub config: Config,
/// }
///
/// // Use the generated API
/// use api::{router, ApiDoc};
///
/// let api_state = ApiState {
///     app: Arc::new(RwLock::new(AppState::new())),
///     db_pool: pool,
///     config: cfg,
/// };
///
/// let app = router().with_state(api_state);
/// ```
///
/// # Generated Code
///
/// This generates:
/// - A `Clone` implementation for the struct
/// - An `api` module containing:
///   - Response types (`ListResponse`, `EntityResponse`, `OperationResponse`, etc.)
///   - Handler functions for all CRUD operations
///   - `router()` function returning `Router<YourStructName>`
///   - `ApiDoc` struct for OpenAPI documentation
///
/// You can create multiple API structs for different purposes (public API, admin API, etc.),
/// each with their own `api` module.
#[proc_macro_attribute]
pub fn axum_api(attr: TokenStream, item: TokenStream) -> TokenStream {
    axum_api::generate(attr, item)
}
