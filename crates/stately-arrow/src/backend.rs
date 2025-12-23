//! Backend trait and metadata types for data source connectors.
//!
//! This module defines the core abstractions for integrating data sources with `DataFusion`:
//!
//! - [`Backend`]: Trait that data source implementations must implement to be queryable.
//! - [`BackendMetadata`]: Static metadata describing a backend's capabilities and kind.
//! - [`ConnectionMetadata`]: Runtime metadata for a specific connector instance.
//! - [`Capability`]: What operations a connector supports (SQL execution, listing).
//! - [`ConnectionKind`]: The type of data source (object store, database, etc.).

use async_trait::async_trait;
use datafusion::execution::context::SessionContext;

use crate::error::{Error, Result};
use crate::response::ListSummary;

/// Runtime behaviour for a connector that can be queried via the viewer.
///
/// Implement this trait to create a new data source backend. The backend is responsible
/// for preparing the `DataFusion` session and providing listing capabilities.
///
/// # Example
///
/// ```rust,ignore
/// use async_trait::async_trait;
/// use stately_arrow::{Backend, ConnectionMetadata, ListSummary, Result};
///
/// pub struct MyBackend {
///     metadata: ConnectionMetadata,
/// }
///
/// #[async_trait]
/// impl Backend for MyBackend {
///     fn connection(&self) -> &ConnectionMetadata {
///         &self.metadata
///     }
///
///     async fn prepare_session(&self, session: &SessionContext) -> Result<()> {
///         // Register catalogs, tables, or object stores
///         Ok(())
///     }
///
///     async fn list(&self, database: Option<&str>) -> Result<ListSummary> {
///         // Return available tables/files
///         Ok(ListSummary::Tables(vec![]))
///     }
/// }
/// ```
#[async_trait]
pub trait Backend: Send + Sync {
    /// Returns metadata about this connection instance.
    fn connection(&self) -> &ConnectionMetadata;

    /// Prepare the `DataFusion` session before queries run.
    ///
    /// Use this to register catalogs, schemas, tables, or object stores
    /// that queries against this connector will need.
    async fn prepare_session(&self, _session: &SessionContext) -> Result<()> { Ok(()) }

    /// List tables, files, or other queryable items exposed by this connector.
    ///
    /// The `database` parameter allows filtering by database/schema for
    /// database connectors, or by path prefix for object store connectors.
    async fn list(&self, _database: Option<&str>) -> Result<ListSummary> {
        Err(Error::UnsupportedConnector("Connector does not support table listing".into()))
    }
}

impl std::fmt::Debug for &dyn Backend {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Backend").field("connection", self.connection()).finish()
    }
}

/// Static metadata describing a backend implementation.
///
/// Backends provide this metadata to indicate their type and capabilities.
/// Use the builder methods to construct instances.
#[non_exhaustive]
#[derive(
    Debug,
    Clone,
    PartialEq,
    Eq,
    Hash,
    serde::Serialize,
    serde::Deserialize,
    utoipa::ToResponse,
    utoipa::ToSchema,
)]
pub struct BackendMetadata {
    /// The kind of data source this backend connects to.
    pub kind:         ConnectionKind,
    /// Capabilities this backend supports.
    pub capabilities: Vec<Capability>,
}

impl BackendMetadata {
    /// Create new backend metadata with default capabilities (`ExecuteSql` + `List`).
    pub fn new(kind: ConnectionKind) -> Self {
        Self { kind, capabilities: vec![Capability::ExecuteSql, Capability::List] }
    }

    /// Set the capabilities for this backend.
    #[must_use]
    pub fn with_capabilities(mut self, capabilities: Vec<Capability>) -> Self {
        self.capabilities = capabilities;
        self
    }
}

/// Runtime metadata describing a connector instance.
///
/// This combines the connector's identity with its backend metadata,
/// including the `DataFusion` catalog it's registered under.
#[derive(
    Debug,
    Clone,
    PartialEq,
    Eq,
    Hash,
    serde::Serialize,
    serde::Deserialize,
    utoipa::ToResponse,
    utoipa::ToSchema,
)]
pub struct ConnectionMetadata {
    /// Unique identifier for this connector.
    pub id:       String,
    /// Human-readable name.
    pub name:     String,
    /// The `DataFusion` catalog this connector is registered under.
    pub catalog:  Option<String>,
    /// Backend metadata (kind and capabilities).
    pub metadata: BackendMetadata,
}

impl ConnectionMetadata {
    /// Check if this connector has a specific capability.
    pub fn has(&self, capability: Capability) -> bool {
        self.metadata.capabilities.contains(&capability)
    }
}

/// Capabilities a connector can expose.
#[non_exhaustive]
#[derive(
    Debug, Clone, Copy, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize, utoipa::ToSchema,
)]
#[serde(rename_all = "snake_case")]
pub enum Capability {
    /// Connector supports executing ad-hoc SQL queries through `DataFusion`.
    ExecuteSql,
    /// Connector can enumerate available tables/files for browsing.
    List,
}

/// The type of data source a connector connects to.
#[non_exhaustive]
#[derive(
    Debug, Clone, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize, utoipa::ToSchema,
)]
#[serde(rename_all = "snake_case")]
pub enum ConnectionKind {
    /// Object storage (S3, GCS, Azure, local filesystem).
    ObjectStore,
    /// Relational database (`ClickHouse`, `PostgreSQL`, etc.).
    Database,
    /// Custom connector type.
    Other(String),
}

impl AsRef<str> for ConnectionKind {
    fn as_ref(&self) -> &str {
        match self {
            ConnectionKind::ObjectStore => "object_store",
            ConnectionKind::Database => "database",
            ConnectionKind::Other(kind) => kind,
        }
    }
}
