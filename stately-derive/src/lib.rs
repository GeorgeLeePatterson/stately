//! Procedural macros for stately state management

use proc_macro::TokenStream;

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
