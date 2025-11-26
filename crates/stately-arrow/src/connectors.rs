use std::sync::Arc;

use async_trait::async_trait;
use datafusion::execution::context::SessionContext;
use serde::Serialize;

use crate::ListSummary;
use crate::error::{Error, Result};

/// Registry responsible for supplying connectors to the viewer.
#[async_trait]
pub trait ConnectorRegistry: Send + Sync {
    async fn list(&self) -> Result<Vec<ConnectionMetadata>>;
    async fn get(&self, id: &str) -> Result<Arc<dyn Backend>>;
}

/// Runtime behaviour for a connector that can be queried via the viewer.
#[async_trait]
pub trait Backend: Send + Sync {
    fn metadata(&self) -> &ConnectionMetadata;

    /// Allow the connector to configure the session before queries run.
    async fn prepare_session(&self, _session: &SessionContext) -> Result<()> { Ok(()) }

    /// List tables/files/etc exposed by this connector.
    async fn list(&self, _database: Option<&str>, _schema: Option<&str>) -> Result<ListSummary> {
        Err(Error::UnsupportedConnector("Connector does not support table listing".into()))
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
///
/// This is the main entry point for connectors.
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash, serde::Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "snake_case")]
#[serde(untagged)]
pub enum ConnectionKind {
    ObjectStore,
    Database,
    #[schema(value_type = String)]
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

impl Serialize for ConnectionKind {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        self.as_ref().serialize(serializer)
    }
}

/// Static metadata describing a connector instance.
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
    pub id:           String,
    pub name:         String,
    /// The 'kind' of connector
    pub kind:         ConnectionKind,
    /// A list of capabilities the connector supports.
    pub capabilities: Vec<Capability>,
    /// The datafusion catalog the connector is registered in.
    pub catalog:      Option<String>,
}

impl ConnectionMetadata {
    /// Convenience helper to check whether a capability is present.
    pub fn has(&self, capability: Capability) -> bool { self.capabilities.contains(&capability) }
}
