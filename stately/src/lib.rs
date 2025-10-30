//! # Stately
//!
//! Type-safe state management with entity relationships and CRUD operations.
//!
//! ## Overview
//!
//! Stately provides a framework for managing application configuration and state
//! with built-in support for:
//! - Entity relationships (inline or by reference)
//! - CRUD operations
//! - Serialization/deserialization
//! - `OpenAPI` schema generation
//! - Time-sortable entity IDs (UUID v7)
//!
//! ## Example
//!
//! ```rust,ignore
//! use stately::prelude::*;
//!
//! #[stately::entity]
//! pub struct Pipeline {
//!     pub name: String,
//!     pub source: Link<SourceConfig>,
//!     pub sink: Link<SinkConfig>,
//! }
//!
//! #[stately::entity]
//! pub struct SourceConfig {
//!     pub name: String,
//!     pub url: String,
//! }
//!
//! #[stately::entity]
//! pub struct SinkConfig {
//!     pub name: String,
//!     pub destination: String,
//! }
//!
//! #[stately::state]
//! pub struct AppState {
//!     pipelines: Pipeline,
//!     sources: SourceConfig,
//!     sinks: SinkConfig,
//! }
//! ```

pub mod collection;
pub mod entity;
pub mod error;
pub mod id;
pub mod link;
pub mod traits;

// Re-export derive macros
// Re-export key types
pub use collection::{Collection, Singleton};
pub use entity::{EntityIdentifier, Summary};
pub use error::{Error, Result};
pub use link::Link;
pub use stately_derive::{entity, state};
#[cfg(feature = "axum")]
pub use traits::StatelyState;
pub use traits::{StateCollection, StateEntity};

/// Prelude module for convenient imports
pub mod prelude {
    pub use crate::collection::{Collection, Singleton};
    pub use crate::entity::{EntityIdentifier, Summary};
    pub use crate::link::Link;
    pub use crate::traits::{StateCollection, StateEntity};
    pub use crate::{Error, Result, entity, state};
}
