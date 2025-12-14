//! Arrow-based data connectivity and query execution over HTTP APIs.
//!
//! This crate provides a flexible abstraction layer over `DataFusion` for building data query
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
//! # API Endpoints
//!
//! The [`api::router`] function provides these endpoints:
//!
//! | Method | Path | Description |
//! |--------|------|-------------|
//! | `GET` | `/connectors` | List available connectors |
//! | `POST` | `/connectors` | Get details for multiple connectors |
//! | `GET` | `/connectors/{id}` | Get connector details |
//! | `GET` | `/register` | List registered connections |
//! | `GET` | `/register/{id}` | Register a connector |
//! | `GET` | `/catalogs` | List `DataFusion` catalogs |
//! | `POST` | `/query` | Execute SQL query (streaming Arrow IPC) |
//!
//! # Feature Flags
//!
//! - `object-store`: Enables S3, GCS, Azure, and local filesystem backends.
//! - `database`: Enables base database connector types.
//! - `clickhouse`: Enables `ClickHouse` database backend (implies `database`).
//! - `registry`: Enables the generic registry implementation with stately integration.
//! - `strum`: Enables `AsRefStr` derives for enum types.
//!
//! # Example
//!
//! ```rust,ignore
//! use std::sync::Arc;
//! use axum::Router;
//! use stately_arrow::{api, QueryContext, QueryState};
//!
//! // Create a registry (implement ConnectorRegistry or use generic::Registry)
//! let registry: Arc<dyn ConnectorRegistry> = create_registry();
//!
//! // Create query context
//! let query_context = QueryContext::new(registry);
//!
//! // Create the router
//! let arrow_router = api::router(QueryState::new(query_context));
//!
//! // Mount under /arrow
//! let app = Router::new().nest("/arrow", arrow_router);
//! ```

pub mod api;
pub mod backend;
pub mod context;
#[cfg(feature = "database")]
pub mod database;
pub mod error;
#[cfg(feature = "object-store")]
pub mod object_store;
pub mod registry;
pub mod request;
pub mod response;
pub mod state;

// Re-export commonly used types at crate root
pub use api::openapi::OpenApiDoc;
pub use backend::{Backend, BackendMetadata, Capability, ConnectionKind, ConnectionMetadata};
pub use context::{QueryContext, QuerySession, SessionCapability};
pub use error::{Error, Result};
pub use registry::ConnectorRegistry;
#[cfg(feature = "registry")]
pub use registry::generic;
pub use request::{
    ConnectionDetailsRequest, ConnectionSearchQuery, ConnectionSearchTerm, QueryRequest,
};
pub use response::{ConnectionDetailsResponse, ListSummary, TableSummary};
pub use state::QueryState;
