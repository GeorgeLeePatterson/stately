//! Procedural macros for stately state management

use proc_macro::TokenStream;

mod axum_api;
mod entity;
mod state;

/// Implements the `HasName` trait for an entity struct.
///
/// This macro provides flexible name resolution for entities. The `StateEntity` trait
/// is automatically implemented by the `#[stately::state]` macro when the entity is
/// added to a state struct.
///
/// # Attributes
///
/// - `#[stately::entity]` - Uses the default "name" field
/// - `#[stately::entity(name_field = "field_name")]` - Uses a different field for the name
/// - `#[stately::entity(name_method = "method_name")]` - Calls a method to get the name
/// - `#[stately::entity(singleton)]` - For singleton entities, returns "default" as the name
///
/// # Examples
///
/// ```rust,ignore
/// // Default: uses the "name" field
/// #[stately::entity]
/// pub struct Pipeline {
///     pub name: String,
///     pub source: Link<SourceConfig>,
/// }
///
/// // Custom field name
/// #[stately::entity(name_field = "identifier")]
/// pub struct Config {
///     identifier: String,
/// }
///
/// // Custom method
/// #[stately::entity(name_method = "get_name")]
/// pub struct Task {
///     id: String,
/// }
/// impl Task {
///     fn get_name(&self) -> &str { &self.id }
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
