use std::sync::Arc;

use async_trait::async_trait;

use crate::backend::{Backend, ConnectionMetadata};
use crate::error::Result;

/// Registry responsible for supplying connectors to the viewer.
#[async_trait]
pub trait ConnectorRegistry: Send + Sync {
    async fn get(&self, id: &str) -> Result<Arc<dyn Backend>>;
    async fn list(&self) -> Result<Vec<ConnectionMetadata>>;
    async fn registered(&self) -> Result<Vec<ConnectionMetadata>>;
}

// The following are provided for convenience, if using the state types directly

#[cfg(feature = "registry")]
pub mod generic {
    use std::collections::HashMap;
    use std::hash::RandomState;
    use std::sync::Arc;
    use std::time::{SystemTime, UNIX_EPOCH};

    use async_trait::async_trait;
    use serde::{Deserialize, Serialize};
    use tokio::sync::RwLock;

    use super::ConnectorRegistry;
    use crate::backend::{Backend, BackendMetadata, ConnectionKind, ConnectionMetadata};
    #[cfg(feature = "clickhouse")]
    use crate::database::Database as DatabaseType;
    #[cfg(feature = "clickhouse")]
    use crate::database::clickhouse::{CLICKHOUSE_CATALOG, ClickHouseBackend};
    use crate::error::{Error, Result};
    use crate::object_store::ObjectStoreBackend;

    fn default_connector_name() -> String {
        let id = uuid::Uuid::now_v7().to_string();
        format!("connection-{}", &id[..8])
    }

    // NOTE: This struct can be used or a customized structure can be used instead. This provides a
    // simple default implementation.
    /// Connector Stately `entity` type.
    ///
    /// Use this with [`Connectors`] and [`Registry`] to create a turnkey connector registry.
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
        ObjectStore(Box<crate::object_store::Config>),
        #[cfg(feature = "database")]
        Database(Box<crate::database::Config>),
    }

    /// Trait for state types that provide read-only access to connectors.
    ///
    /// Implement this trait on your state type to use the generic [`Registry`].
    ///
    /// # Example
    ///
    /// ```ignore
    /// use stately_arrow::registry::generic::{Connector, Connectors};
    ///
    /// #[stately::state]
    /// pub struct MyState {
    ///     pub connectors: Connector,
    ///     // ... other fields
    /// }
    ///
    /// impl Connectors for MyState {
    ///     fn iter(&self) -> impl Iterator<Item = (&str, &Connector)> {
    ///         self.connectors.iter().map(|(id, c)| (id.as_ref(), c))
    ///     }
    ///
    ///     fn get(&self, id: &str) -> Option<&Connector> {
    ///         self.connectors.get_by_name(id).map(|(_, c)| c)
    ///     }
    /// }
    /// ```
    pub trait Connectors {
        /// Returns an iterator over all (id, connector) pairs.
        fn iter(&self) -> impl Iterator<Item = (&str, &Connector)>;

        /// Gets a connector by ID or name.
        fn get(&self, id: &str) -> Option<&Connector>;
    }

    fn metadata_from_connector(id: String, connector: &Connector) -> ConnectionMetadata {
        let (metadata, catalog) = match &connector.config {
            Type::ObjectStore(c) => (ObjectStoreBackend::metadata(), Some(c.store.url())),
            #[cfg(feature = "database")]
            #[cfg_attr(not(feature = "clickhouse"), allow(unused))]
            Type::Database(c) => {
                #[allow(unused_mut)]
                let mut metadata =
                    BackendMetadata::new(ConnectionKind::Database).with_capabilities(vec![]);
                #[allow(unused_mut)]
                let mut catalog = None;

                #[cfg(feature = "clickhouse")]
                #[cfg_attr(feature = "clickhouse", allow(clippy::single_match))]
                match &c.driver {
                    DatabaseType::ClickHouse(_) => {
                        metadata = ClickHouseBackend::metadata();
                        catalog = Some(CLICKHOUSE_CATALOG.to_string());
                    }
                    #[allow(unreachable_patterns)]
                    _ => {}
                }

                (metadata, catalog)
            }
        };

        ConnectionMetadata { id, name: connector.name.clone(), catalog, metadata }
    }

    /// Generic registry options.
    ///
    /// Provided as a convenience if using state entity types directly, ie [`Connector`]
    #[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Default, Serialize, Deserialize)]
    pub struct RegistryOptions {
        /// Set the maximum lifetime that a connection should be kept around for.
        #[serde(skip_serializing_if = "Option::is_none")]
        pub max_lifetime:  Option<u64>,
        /// Set the maximum size any connector will use for its pool. Set to 0 to disable pooling.
        #[serde(skip_serializing_if = "Option::is_none")]
        pub max_pool_size: Option<u32>,
    }

    #[derive(Clone)]
    struct BackendEntry {
        registered_at: u64,
        connection:    ConnectionMetadata,
        backend:       Arc<dyn Backend>,
    }

    /// Generic registry implementation for state types implementing [`Connectors`].
    ///
    /// This provides a default [`ConnectorRegistry`] implementation for users who:
    /// - Use the provided [`Connector`] entity type in their stately state
    /// - Implement the [`Connectors`] trait on their state
    ///
    /// For custom connector types or more complex needs, implement [`ConnectorRegistry`] directly.
    pub struct Registry<S: Connectors + Send + Sync> {
        state:      Arc<RwLock<S>>,
        registered: Arc<RwLock<HashMap<u64, BackendEntry>>>,
        options:    RegistryOptions,
    }

    impl<S: Connectors + Send + Sync> Registry<S> {
        pub fn new(state: Arc<RwLock<S>>) -> Self {
            Self {
                state,
                registered: Arc::new(RwLock::new(HashMap::default())),
                options: RegistryOptions::default(),
            }
        }

        #[must_use]
        pub fn with_options(mut self, options: RegistryOptions) -> Self {
            self.options = options;
            self
        }
    }

    #[async_trait]
    impl<S: Connectors + Send + Sync + 'static> ConnectorRegistry for Registry<S> {
        async fn list(&self) -> Result<Vec<ConnectionMetadata>> {
            Ok(self
                .state
                .read()
                .await
                .iter()
                .map(|(id, conn)| metadata_from_connector(id.to_string(), conn))
                .collect())
        }

        async fn registered(&self) -> Result<Vec<ConnectionMetadata>> {
            Ok(self
                .registered
                .read()
                .await
                .values()
                .map(|entry| entry.connection.clone())
                .collect())
        }

        async fn get(&self, id: &str) -> Result<Arc<dyn Backend>> {
            use std::hash::BuildHasher;

            let connector = {
                self.state
                    .read()
                    .await
                    .get(id)
                    .cloned()
                    .ok_or_else(|| Error::ConnectionNotFound(id.to_string()))?
            };

            let key = RandomState::new().hash_one(&connector);
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .expect("Time went backwards")
                .as_secs();

            if let Some(BackendEntry { backend, .. }) = self
                .registered
                .read()
                .await
                .get(&key)
                .filter(|entry| {
                    // Keep using cached connection if not too old
                    entry.registered_at
                        >= (now
                            - self.options.max_lifetime.unwrap_or(60 * 30 /* 30 Minutes */))
                })
                .cloned()
            {
                tracing::debug!(key, name = connector.name, "Connector cached");
                return Ok(backend);
            }

            let metadata = metadata_from_connector(id.to_string(), &connector);
            let backend: Arc<dyn Backend> = match connector.config {
                Type::ObjectStore(config) => {
                    Arc::new(ObjectStoreBackend::try_new(id, &connector.name, &config)?)
                }
                #[cfg(feature = "database")]
                Type::Database(config) => {
                    let mut pool = config.pool;
                    // Ensure connection does not create a pool
                    let pool_disabled = self.options.max_pool_size.is_some_and(|p| p == 0);
                    if pool_disabled {
                        pool.pool_size = Some(1);
                    } else {
                        pool.pool_size = pool
                            .pool_size
                            .map(|s| self.options.max_pool_size.map_or(s, |m| s.min(m).max(1)))
                            .or(self.options.max_pool_size);
                    }

                    #[allow(unreachable_code)]
                    match config.driver {
                        #[cfg(feature = "clickhouse")]
                        DatabaseType::ClickHouse(clickhouse_conf) => {
                            let backend = ClickHouseBackend::try_new(
                                id,
                                &connector.name,
                                &config.options,
                                clickhouse_conf,
                                pool,
                            )
                            .await?;
                            Arc::new(backend)
                        }
                        #[allow(unreachable_patterns)]
                        _ => return Err(Error::UnsupportedConnector(id.to_string())),
                    }
                }
            };

            // Write to cache
            let mut connectors = self.registered.write().await;

            // Cleanup any connection there might be
            drop(connectors.remove(&key));
            tracing::debug!(
                key,
                name = connector.name,
                metadata = ?backend.connection(),
                "Connector not cached, creating",
            );

            // Insert
            drop(connectors.insert(key, BackendEntry {
                registered_at: now,
                connection:    metadata,
                backend:       Arc::clone(&backend),
            }));

            Ok(backend)
        }
    }
}
