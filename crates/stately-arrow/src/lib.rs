//! Arrow-based data connectivity and query execution over HTTP APIs.
//!
//! This crate provides a flexible abstraction layer over `DataFusion `for building data query
//! services with support for multiple backend connectors.
//!
//! # Terminology
//!
//! - **Connector**: The raw configuration for a data source (credentials, endpoints, options).
//! - **Connection**: Runtime metadata about a connector's active presence in `DataFusion`,
//!   including its catalog name and capabilities.
//! - **Backend**: The implementation that bridges a connector configuration to `DataFusion`,
//!   handling session setup and query execution.
//!
//! # Core Abstractions
//!
//! - [`ConnectorRegistry`]: Trait for managing and retrieving connectors by ID.
//! - [`Backend`]: Trait for data source implementations that integrate with `DataFusion`.
//! - [`QueryContext`]: High-level query execution interface combining a session and registry.
//! - [`QuerySession`]: Abstraction over `DataFusion`'s `SessionContext` for custom implementations.
//!
//! # Feature Flags
//!
//! - `object-store`: Enables S3, GCS, Azure, and local filesystem backends.
//! - `database`: Enables base database connector types.
//! - `clickhouse`: Enables `ClickHouse` database backend (implies `database`).
//! - `registry`: Enables the generic registry implementation with stately integration.

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
#[cfg(feature = "registry")]
pub use registry::generic;
pub use types::*;
