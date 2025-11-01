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
//! #[stately::state(api = ["axum"])]
//! pub struct AppState {
//!     pipelines: Pipeline,
//! }
//!
//! #[tokio::main]
//! async fn main() {
//!     use std::sync::Arc;
//!     use tokio::sync::RwLock;
//!
//!     let state = Arc::new(RwLock::new(AppState::new()));
//!     let axum_state = axum_api::StatelyState::new(state);
//!
//!     let app = axum::Router::new()
//!         .nest("/api/v1/entity", axum_api::router())
//!         .with_state(axum_state);
//!
//!     // Routes automatically generated:
//!     // GET /api/v1/entity/list
//!     // GET /api/v1/entity/list/:type
//!     // GET /api/v1/entity/search/:needle
//!     // GET /api/v1/entity/:id?type=<type>
//! }
//! ```
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
