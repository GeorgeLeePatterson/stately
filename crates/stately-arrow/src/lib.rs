pub mod api;
pub mod connectors;
pub mod context;
#[cfg(feature = "database")]
pub mod database;
pub mod error;
#[cfg(feature = "object-store")]
pub mod object_store;
pub mod types;

pub use api::ViewerState;
pub use connectors::{Backend, Capability, ConnectionMetadata, ConnectorRegistry};
pub use context::{QueryContext, QuerySession, SessionCapability};
pub use error::{Error, Result};
pub use types::*;

fn default_connection_name() -> String {
    let id = uuid::Uuid::now_v7().to_string();
    format!("connection-{}", &id[..8])
}

/// Connection Stately `entity` type.
///
/// This struct can be used or one can be customized
#[stately::entity]
#[derive(
    Debug, Clone, PartialEq, Eq, Hash, serde::Deserialize, serde::Serialize, utoipa::ToSchema,
)]
pub struct Connection {
    /// Human-readable name for this connection.
    #[serde(default = "default_connection_name")]
    pub name:   String,
    pub config: Type,
}

#[derive(
    Debug, Clone, PartialEq, Hash, Eq, serde::Deserialize, serde::Serialize, utoipa::ToSchema,
)]
#[schema(as = ConnectionType)]
#[serde(rename_all = "snake_case")]
pub enum Type {
    #[cfg(feature = "object-store")]
    ObjectStore(Box<object_store::Config>),
    #[cfg(feature = "database")]
    Database(Box<database::Config>),
}
