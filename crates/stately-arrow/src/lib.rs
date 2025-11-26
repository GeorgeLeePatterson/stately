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
pub mod types;

pub use api::QueryState;
pub use connectors::{Backend, Capability, ConnectionMetadata, ConnectorRegistry};
pub use context::{QueryContext, QuerySession, SessionCapability};
pub use error::{Error, Result};
pub use types::*;

fn default_connector_name() -> String {
    let id = uuid::Uuid::now_v7().to_string();
    format!("connection-{}", &id[..8])
}

// NOTE: This struct can be used or a customized structure can be used instead. This provides a
// simple default implementation.
/// Connector Stately `entity` type
#[stately::entity]
#[derive(
    Debug, Clone, PartialEq, Eq, Hash, serde::Deserialize, serde::Serialize, utoipa::ToSchema,
)]
pub struct Connector {
    /// Human-readable name for this connection.
    #[serde(default = "default_connector_name")]
    pub name:   String,
    pub config: Type,
}

#[derive(
    Debug, Clone, PartialEq, Hash, Eq, serde::Deserialize, serde::Serialize, utoipa::ToSchema,
)]
#[schema(as = ConnectorType)]
#[serde(rename_all = "snake_case")]
pub enum Type {
    #[cfg(feature = "object-store")]
    ObjectStore(Box<object_store::Config>),
    #[cfg(feature = "database")]
    Database(Box<database::Config>),
}
