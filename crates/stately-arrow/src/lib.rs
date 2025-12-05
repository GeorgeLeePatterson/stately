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
pub use connectors::{Backend, BackendMetadata, Capability, ConnectionMetadata, ConnectorRegistry};
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

#[allow(missing_copy_implementations)] // This will grow, so Copy is a breaking change
#[non_exhaustive]
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

// TODO: Provide default implementation like below
//

// static IDENT: LazyLock<String> = LazyLock::new(|| identifier("Query::Viewer"));

// #[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Default, Serialize, Deserialize)]
// pub struct RegistryOptions {
//     /// Set the maximum lifetime that a connection should be kept around for.
//     #[serde(skip_serializing_if = "Option::is_none")]
//     pub max_lifetime:  Option<u64>,
//     /// Set the maximum size any connector will use for its pool. Set to 0 to disable pooling.
//     #[serde(skip_serializing_if = "Option::is_none")]
//     pub max_pool_size: Option<u32>,
// }

// fn metadata_from_connection(id: String, connection: &Connection) -> ConnectionMetadata {
//     let (metadata, catalog) = match &connection.config {
//         Type::ObjectStore(c) => (ObjectStoreBackend::metadata(), Some(c.store.url())),
//         Type::Database(c) => {
//             let metadata = match c.connection.driver {
//                 DatabaseType::ClickHouse(_) => ClickHouseBackend::metadata(),
//                 _ => BackendMetadata::new(ConnectionKind::Database).with_capabilities(vec![]),
//             };
//             (metadata, Some(CLICKHOUSE_CATALOG.to_string()))
//         }
//         Type::Debug(_) => (
//
// BackendMetadata::new(ConnectionKind::Other("debug".into())).with_capabilities(vec![]),
//             None,
//         ),
//     };

//     ConnectionMetadata { id, name: connection.name.clone(), catalog, metadata }
// }

// type ConnectionKey = u64;
// type ConnectorStartTime = u64;
// type BackendCache = FxHashMap<ConnectionKey, (ConnectorStartTime, Arc<dyn Backend>)>;

// pub struct Registry {
//     state:      Arc<RwLock<xeo4_state::State>>,
//     registered: Arc<RwLock<BackendCache>>,
//     options:    RegistryOptions,
// }

// impl Registry {
//     pub fn new(state: Arc<RwLock<xeo4_state::State>>) -> Self {
//         Self {
//             state,
//             registered: Arc::new(RwLock::new(FxHashMap::default())),
//             options: RegistryOptions::default(),
//         }
//     }

//     #[must_use]
//     pub fn with_options(mut self, options: RegistryOptions) -> Self {
//         self.options = options;
//         self
//     }
// }

// #[async_trait]
// impl ConnectorRegistry for Registry {
//     async fn list(&self) -> Result<Vec<ConnectionMetadata>> {
//         Ok(self
//             .state
//             .read()
//             .await
//             .connections
//             .iter()
//             .filter(|(_, conn)| !matches!(conn.config, Type::Debug(_)))
//             .map(|(id, conn)| metadata_from_connection(id.to_string(), conn))
//             .collect())
//     }

//     async fn get(&self, id: &str) -> Result<Arc<dyn Backend>> {
//         use std::hash::BuildHasher;

//         let connection = {
//             self.state
//                 .read()
//                 .await
//                 .connections
//                 // TODO: Remove - Not sure if this will work
//                 .get_by_name(id)
//                 .map(|(_, conn)| conn.clone())
//                 .ok_or_else(|| Error::ConnectionNotFound(id.to_string()))?
//         };

//         let key = HashBuilder::default().hash_one(&connection);
//         let now =
//             SystemTime::now().duration_since(UNIX_EPOCH).expect("Time went backwards").as_secs();

//         if let Some((_, c)) = self
//             .registered
//             .read()
//             .await
//             .get(&key)
//             .filter(|(t, _)| {
//                 // Create a new connection if too old
//                 *t >= (now - self.options.max_lifetime.unwrap_or(60 * 30 /* 30 Minutes */))
//             })
//             .cloned()
//         {
//             debug!(key, name = connection.name, "{} Connector cached", *IDENT);
//             return Ok(c);
//         }

//         let backend = match connection.config {
//             Type::ObjectStore(config) => {
//                 Arc::new(ObjectStoreBackend::try_new(id, &connection.name, &config)?)
//                     as Arc<dyn Backend>
//             }
//             Type::Database(config) => {
//                 let mut options = config.connection;
//                 // Ensure connection does not create a pool
//                 let pool_disabled = self.options.max_pool_size.is_some_and(|p| p == 0);
//                 if pool_disabled {
//                     options.pool.pool_size = Some(1);
//                 } else {
//                     options.pool.pool_size = options
//                         .pool
//                         .pool_size
//                         .map(|s| self.options.max_pool_size.map_or(s, |m| s.min(m).max(1)))
//                         .or(self.options.max_pool_size);
//                 }

//                 match options.driver {
//                     DatabaseType::ClickHouse(clickhouse_conf) => {
//                         let backend = ClickHouseBackend::try_new(
//                             id,
//                             &connection.name,
//                             &options.options,
//                             clickhouse_conf,
//                             options.pool,
//                         )
//                         .await?;
//                         Arc::new(backend) as Arc<dyn Backend>
//                     }
//                     _ => return Err(Error::UnsupportedConnector(id.to_string())),
//                 }
//             }
//             Type::Debug(_) => return Err(Error::UnsupportedConnector(id.to_string())),
//         };

//         // Write to cache
//         let mut connectors = self.registered.write().await;

//         // Cleanup any connection there might be
//         drop(connectors.remove(&key));
//         debug!(
//             key,
//             name = connection.name,
//             metadata = ?backend.connection(),
//             "{} Connector not cached, creating",
//             *IDENT
//         );
//         // Insert
//         drop(connectors.insert(key, (now, Arc::clone(&backend))));
//         Ok(backend)
//     }
// }
