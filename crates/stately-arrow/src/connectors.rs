use async_trait::async_trait;
use datafusion::execution::context::SessionContext;

use crate::ListSummary;
use crate::error::{Error, Result};

/// Runtime behaviour for a connector that can be queried via the viewer.
#[async_trait]
pub trait Backend: Send + Sync {
    /// Represents the information about a particular connection instance.
    fn connection(&self) -> &ConnectionMetadata;

    /// Allow the connector to configure the session before queries run.
    async fn prepare_session(&self, _session: &SessionContext) -> Result<()> { Ok(()) }

    /// List tables/files/etc exposed by this connector.
    async fn list(&self, _database: Option<&str>) -> Result<ListSummary> {
        Err(Error::UnsupportedConnector("Connector does not support table listing".into()))
    }
}

/// Helper impl
impl std::fmt::Debug for &dyn Backend {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Backend").field("connection", self.connection()).finish()
    }
}

/// Static metadata describing a backend connection.
///
/// A backend is the underlying implementation of a connector/connection. For this reason, the
/// backend provides its capabilities, kind, and catalog.
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
    /// The 'kind' of connector
    pub kind:         ConnectionKind,
    /// A list of capabilities the connector supports.
    pub capabilities: Vec<Capability>,
}

// Builder-like impl since marked as 'non_exhaustive'. Use this to add new builder methods to
// provide easier construction when defining new 'backends'.
impl BackendMetadata {
    /// Default capabilities are "all" capabilities. Set the capabilities to change
    pub fn new(kind: ConnectionKind) -> Self {
        Self { kind, capabilities: vec![Capability::ExecuteSql, Capability::List] }
    }

    /// Set the capabilities of the backend
    #[must_use]
    pub fn with_capabilities(mut self, capabilities: Vec<Capability>) -> Self {
        self.capabilities = capabilities;
        self
    }
}

/// Runtime metadata describing a connector instance.
///
/// A connection refers to a connector in the context of the underlying query engine.
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
    pub id:       String,
    pub name:     String,
    /// The datafusion catalog the connector is registered in.
    pub catalog:  Option<String>,
    pub metadata: BackendMetadata,
}

impl ConnectionMetadata {
    /// Convenience helper to check whether a capability is present.
    pub fn has(&self, capability: Capability) -> bool {
        self.metadata.capabilities.contains(&capability)
    }
}

/// Capabilities a connector can expose to the viewer.
#[non_exhaustive]
#[derive(
    Debug, Clone, Copy, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize, utoipa::ToSchema,
)]
#[serde(rename_all = "snake_case")]
pub enum Capability {
    /// Connection supports executing ad-hoc SQL queries through `DataFusion`.
    ExecuteSql,
    /// Connection can enumerate available tables/files for browsing.
    List,
}

/// The types of connectors supported
#[non_exhaustive]
#[derive(
    Debug, Clone, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize, utoipa::ToSchema,
)]
#[serde(rename_all = "snake_case")]
pub enum ConnectionKind {
    ObjectStore,
    Database,
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
