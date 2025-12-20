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
//! - 🌍 **Foreign Types** - Use types from external crates in your state
//!
//! ## Quick Start
//!
//! Define your entities using the [`macro@entity`] macro. It's not strictly necessary, but
//! conviently implements the [`HasName`] trait:
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
//
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
//! ## Foreign Type Support
//!
//! Use types from external crates in your state with the `#[collection(foreign)]` attribute.
//! When you mark a collection as `foreign`, the `#[stately::state]` macro generates a
//! [`ForeignEntity`](`crate::demo::ForeignEntity`) trait in your crate that you implement on the
//! external type:
//!
//! ```rust,ignore
//! use serde_json::Value;
//!
//! #[stately::state]
//! pub struct AppState {
//!     #[collection(foreign, variant = "JsonConfig")]
//!     json_configs: Value,
//! }
//!
//! // The macro generates this trait in your crate:
//! // pub trait ForeignEntity: Clone + Serialize + for<'de> Deserialize<'de> {
//! //     fn name(&self) -> &str;
//! //     fn description(&self) -> Option<&str> { None }
//! //     fn summary(&self, id: EntityId) -> Summary { ... }
//! // }
//!
//! // Now you can implement it on the external type
//! impl ForeignEntity for Value {
//!     fn name(&self) -> &str {
//!         self.get("name").and_then(|v| v.as_str()).unwrap_or("unnamed")
//!     }
//!
//!     fn description(&self) -> Option<&str> {
//!         self.get("description").and_then(|v| v.as_str())
//!     }
//! }
//!
//! // Use like any other entity
//! let mut state = AppState::new();
//! let config = serde_json::json!({"name": "my-config"});
//! let id = state.json_configs.create(config);
//! ```
//!
//! Because [`ForeignEntity`](`crate::demo::ForeignEntity`) is generated in your crate, you can
//! implement it on types from external crates without violating Rust's orphan rules. The macro
//! creates wrapper types that delegate to your `ForeignEntity` implementation.
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
//! #[stately::axum_api(State, openapi(components = [link_aliases::PipelineLink]))]
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
//! ### Event-Driven Persistence
//!
//! The `axum_api` macro generates a [`ResponseEvent`](`crate::demo::ResponseEvent`) enum and
//! middleware for crud events. The middleware is generic and can convert to your own event types:
//!
//! ```rust,ignore
//! use tokio::sync::mpsc;
//!
//! #[tokio::main]
//! async fn main() {
//!     let (event_tx, mut event_rx) = mpsc::channel(100);
//!
//!     let app_state = AppState::new(State::new());
//!
//!     enum MyEvent {
//!         Api(ResponseEvent),
//!         // ... other variants
//!     }
//!
//!     impl From<ResponseEvent> for MyEvent {
//!         fn from(event: ResponseEvent) -> Self { MyEvent::Api(event) }
//!     }
//!
//!     // Attach event middleware - handlers emit events after state updates
//!     let app = axum::Router::new()
//!         .nest("/api/v1/entity", AppState::router(app_state.clone()))
//!         .layer(axum::middleware::from_fn(AppState::event_middleware(event_tx)))
//!         .layer(axum::middleware::from_fn(AppState::event_middleware::<MyEvent>(event_tx)))
//!         .with_state(app_state);
//!
//!     // Handle events in background task
//!     tokio::spawn(async move {
//!         while let Some(event) = event_rx.recv().await {
//!             match event {
//!                 ResponseEvent::Created { id, entity } => { /* Persist to database */ }
//!                 ResponseEvent::Updated { id, entity } => { /* Persist to database */ }
//!                 ResponseEvent::Deleted { id, entry } => { /* Persist to database */ }
//!             }
//!         }
//!     });
//! }
//! ```
//!
//! ## Generated Code Reference
//!
//! To see a comprehensive demonstration of the code generated by the macros, refer to the
//! [`mod@demo`] module. It is derived from the [doc_expand example](https://github.com/georgeleepatterson/stately/tree/main/crates/stately/examples/doc_expand.rs)
//!
//! ### What the `state` Macro Generates
//!
//! When you use `#[stately::state]` on your struct, the macro generates:
//!
//! 1. **[`StateEntry`](`demo::StateEntry`) enum** - Used to specify entity types in queries
//! 2. **[`Entity`](`demo::Entity`) enum** - Type-erased wrapper for all entity types
//! 3. **[`link_aliases`](`demo::link_aliases`) module** - Convenient type aliases for [`Link<T>`]
//! 4. **[`ForeignEntity`](`demo::ForeignEntity`) trait** - Trait for entities in external crates.
//!
//! ### What the `axum_api` Macro Generates
//!
//! When you use `#[stately::axum_api(State)]`, the macro generates:
//!
//! 1. **Handler methods** - REST API handlers as methods on your struct:
//!    - [`create_entity()`](`demo::create_entity`), [`update_entity()`](`demo::update_entity`),
//!      [`patch_entity_by_id()`](`demo::patch_entity_by_id`),
//!      [`remove_entity()`](`demo::remove_entity`)
//!    - [`list_entities()`](`demo::list_entities`), [`get_entities()`](`demo::get_entities`),
//!      [`get_entity_by_id()`](`demo::get_entity_by_id`)
//! 2. **[`ApiState::router()`](`crate::demo::ApiState::router`)** - Returns Axum router with all
//!    routes configured
//! 3. **[`ResponseEvent`](`demo::ResponseEvent`) enum** - Events emitted after CRUD operations:
//! 4. **[`ApiState::event_middleware()`](`crate::demo::ApiState::event_middleware`) method** -
//!    Generic middleware for crud
//! 5. **`OpenAPI` trait** (when `openapi` parameter used) - Implements [`utoipa::OpenApi`]
//!
//! ## Feature Flags
//!
//! - `openapi` (default) - Enable `OpenAPI` schema generation via `utoipa`
//! - `axum` - Enable Axum web framework integration (implies `openapi`)
//!
//! ## Examples
//!
//! See the [examples directory](https://github.com/georgeleepatterson/crates/stately/tree/main/examples) for:
//!
//! - `basic.rs` - Core CRUD operations and entity relationships
//! - `axum_api.rs` - Web API generation with Axum
//! - `doc_expand.rs` - Example used to generate [`mod@demo`] for reference

#[cfg(feature = "openapi")]
pub mod codegen;
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
#[cfg(feature = "axum")]
pub use error::ApiError;
pub use error::{Error, Result};
pub use hashbrown;
pub use link::Link;
#[cfg(feature = "axum")]
pub use stately_derive::axum_api;
pub use stately_derive::{entity, state};
#[cfg(feature = "axum")]
pub use tokio;
pub use traits::{HasName, StateCollection, StateEntity};

/// Prelude module for convenient imports
pub mod prelude {
    pub use crate::collection::{Collection, Singleton};
    pub use crate::entity::{EntityId, Summary};
    #[cfg(feature = "axum")]
    pub use crate::error::ApiError;
    pub use crate::link::Link;
    pub use crate::traits::{StateCollection, StateEntity};
    pub use crate::{Error, Result, entity, state};
}

// Include generated code examples for documentation
#[cfg(all(doc, feature = "axum"))]
pub mod demo;

// Silence unused_crate_dependencies lint for dev/optional dependencies
#[cfg(all(test, not(feature = "axum")))]
use tokio as _;
#[cfg(test)]
use tower as _;
#[cfg(feature = "axum")]
use tower_http as _;
