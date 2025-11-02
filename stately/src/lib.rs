#![cfg_attr(
    feature = "axum",
    allow(unused_crate_dependencies, reason = "axum and tokio used only in generated code")
)]
//! # Stately
//!
//! Type-safe state management with entity relationships and CRUD operations.
//!
//! ## Overview
//!
//! Stately is a framework for managing application configuration and state with built-in support
//! for:
//!
//! - 🔗 **Entity Relationships** - Reference entities inline or by ID using [`Link<T>`]
//! - 📝 **CRUD Operations** - Full create, read, update, delete for all entity types
//! - 🔄 **Serialization** - Complete serde support for JSON, YAML, and more
//! - 📚 **`OpenAPI` Schemas** - Automatic schema generation with `utoipa`
//! - 🆔 **Time-Sortable IDs** - UUID v7 for naturally ordered entity identifiers
//! - 🚀 **Web APIs** - Optional Axum integration with generated REST handlers
//! - 🔍 **Search & Query** - Built-in entity search across collections
//!
//! ## Quick Start
//!
//! Define your entities using the [`entity`] macro:
//!
//! ```rust,ignore
//! use stately::prelude::*;
//!
//! #[stately::entity]
//! #[derive(Clone, serde::Serialize, serde::Deserialize)]
//! pub struct Pipeline {
//!     pub name: String,
//!     pub source: Link<SourceConfig>,
//!     pub sink: Link<SinkConfig>,
//! }
//!
//! #[stately::entity]
//! #[derive(Clone, serde::Serialize, serde::Deserialize)]
//! pub struct SourceConfig {
//!     pub name: String,
//!     pub url: String,
//! }
//!
//! #[stately::entity]
//! #[derive(Clone, serde::Serialize, serde::Deserialize)]
//! pub struct SinkConfig {
//!     pub name: String,
//!     pub destination: String,
//! }
//! ```
//!
//! Create your application state using the [`state`] macro:
//!
//! ```rust,ignore
//! #[stately::state]
//! pub struct AppState {
//!     pipelines: Pipeline,
//!     sources: SourceConfig,
//!     sinks: SinkConfig,
//! }
//! ```
//!
//! The `state` macro generates:
//! - `StateEntry` enum - discriminator for entity types
//! - `Entity` enum - type-erased wrapper for all entities
//! - `link_aliases` module - type aliases like `PipelineLink = Link<Pipeline>`
//!
//! Use your state with full type safety:
//!
//! ```rust,ignore
//! let mut state = AppState::new();
//!
//! // Create entities
//! let source_id = state.sources.create(SourceConfig {
//!     name: "my-source".to_string(),
//!     url: "http://example.com/data".to_string(),
//! });
//!
//! // Reference entities by ID
//! let pipeline = Pipeline {
//!     name: "my-pipeline".to_string(),
//!     source: Link::create_ref(source_id.to_string()),
//!     sink: Link::create_ref(sink_id.to_string()),
//! };
//!
//! let pipeline_id = state.pipelines.create(pipeline);
//!
//! // Query entities
//! let (id, entity) = state.get_entity(&pipeline_id.to_string(), StateEntry::Pipeline).unwrap();
//!
//! // List all entities
//! let summaries = state.list_entities(None);
//!
//! // Search entities
//! let results = state.search_entities("pipeline");
//!
//! // Update entities
//! state.pipelines.update(&pipeline_id.to_string(), updated_pipeline)?;
//!
//! // Delete entities
//! state.pipelines.remove(&pipeline_id.to_string())?;
//! ```
//!
//! ## Web API Generation
//!
//! Generate complete REST APIs with `OpenAPI` documentation using the `axum` feature:
//!
//! ```rust,ignore
//! #[stately::state(openapi)]
//! pub struct State {
//!     pipelines: Pipeline,
//! }
//!
//! #[stately::axum_api(State, openapi, components = [link_aliases::PipelineLink])]
//! pub struct AppState {}
//!
//! #[tokio::main]
//! async fn main() {
//!     let app_state = AppState::new(State::new());
//!
//!     let app = axum::Router::new()
//!         .nest("/api/v1/entity", AppState::router(app_state.clone()))
//!         .with_state(app_state);
//!
//!     // Routes automatically generated:
//!     // PUT    /api/v1/entity - Create entity
//!     // GET    /api/v1/entity - List entities
//!     // GET    /api/v1/entity/{id}?type=<type> - Get entity
//!     // POST   /api/v1/entity/{id} - Update entity
//!     // PATCH  /api/v1/entity/{id} - Patch entity
//!     // DELETE /api/v1/entity/{entry}/{id} - Delete entity
//!
//!     // OpenAPI spec available at:
//!     let openapi = AppState::openapi();
//! }
//! ```
//!
//! The `axum_api` macro generates:
//! - Handler methods on your struct (`create_entity`, `list_entities`, etc.)
//! - `router()` method returning configured Axum router
//! - `StatelyState` wrapper for `Arc<RwLock<T>>` integration
//! - `OpenAPI` documentation when `openapi` parameter is specified
//!
//! ## Generated Code Reference
//!
//! ### What the `state` Macro Generates
//!
//! When you use `#[stately::state]` on your struct, the macro generates:
//!
//! 1. **`StateEntry` enum** - Used to specify entity types in queries: ```rust,ignore pub enum
//!    StateEntry { Pipeline, Source, Sink, } ```
//!
//! 2. **`Entity` enum** - Type-erased wrapper for all entity types: ```rust,ignore pub enum Entity
//!    { Pipeline(Pipeline), Source(SourceConfig), Sink(SinkConfig), } ```
//!
//! 3. **`link_aliases` module** - Convenient type aliases for `Link<T>`: ```rust,ignore pub mod
//!    link_aliases { pub type PipelineLink = ::stately::Link<Pipeline>; pub type SourceLink =
//!    ::stately::Link<SourceConfig>; pub type SinkLink = ::stately::Link<SinkConfig>; } ```
//!
//! ### What the `axum_api` Macro Generates
//!
//! When you use `#[stately::axum_api(State)]`, the macro generates:
//!
//! 1. **`StatelyState` wrapper** - `Arc<RwLock<T>>` wrapper for Axum: ```rust,ignore pub struct
//!    StatelyState { pub state: Arc<tokio::sync::RwLock<State>>, } ```
//!
//! 2. **Handler methods** - REST API handlers as methods on your struct:
//!    - `create_entity()`, `list_entities()`, `get_entity_by_id()`
//!    - `update_entity()`, `patch_entity_by_id()`, `remove_entity()`
//!
//! 3. **`router()` method** - Returns configured Axum router with all routes
//!
//! 4. **`OpenAPI` trait** (when `openapi` parameter used) - Implements `utoipa::OpenApi`
//!
//! ## Feature Flags
//!
//! - `openapi` (default) - Enable `OpenAPI` schema generation via `utoipa`
//! - `axum` - Enable Axum web framework integration (implies `openapi`)
//!
//! ## Examples
//!
//! See the [examples directory](https://github.com/georgeleepatterson/stately/tree/main/examples) for:
//!
//! - `basic.rs` - Core CRUD operations and entity relationships
//! - `axum_api.rs` - Web API generation with Axum

pub mod collection;
pub mod entity;
pub mod error;
pub mod link;
pub mod traits;

// Re-export dependencies that are used in generated code
// Re-export derive macros
// Re-export key types
pub use collection::{Collection, Singleton};
pub use entity::{EntityId, Summary};
pub use error::{Error, Result};
pub use hashbrown;
pub use link::Link;
#[cfg(feature = "axum")]
pub use stately_derive::axum_api;
pub use stately_derive::{entity, state};
#[cfg(feature = "axum")]
pub use tokio;
pub use traits::{StateCollection, StateEntity};

/// Prelude module for convenient imports
pub mod prelude {
    pub use crate::collection::{Collection, Singleton};
    pub use crate::entity::{EntityId, Summary};
    pub use crate::link::Link;
    pub use crate::traits::{StateCollection, StateEntity};
    pub use crate::{Error, Result, entity, state};
}
