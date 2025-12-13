//! TODO: Docs
//!
//! - Identify that a 'connector' is referring to the raw configuration while a 'connection' refers
//!   to metadata or information about a connector's connection to the underlying data store or
//!   presence in `DataFusion`.

pub mod api;
pub mod connectors;
pub mod context;
#[cfg(feature = "database")]
pub mod database;
pub mod error;
#[cfg(feature = "object-store")]
pub mod object_store;
pub mod registry;
pub mod types;

pub use api::QueryState;
pub use connectors::{Backend, BackendMetadata, Capability, ConnectionKind, ConnectionMetadata};
pub use context::{QueryContext, QuerySession, SessionCapability};
pub use error::{Error, Result};
pub use registry::ConnectorRegistry;
pub use types::*;
