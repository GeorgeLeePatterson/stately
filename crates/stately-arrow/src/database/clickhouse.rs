// TODO: Remove - Docs
use std::collections::BTreeMap;
use std::hash::{BuildHasher, Hash, RandomState};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, LazyLock};
use std::time::Duration;

use async_trait::async_trait;
use clickhouse_datafusion::prelude::clickhouse_arrow::{
    ArrowClient, ArrowFormat, ArrowOptions, ClientBuilder, CompressionMethod, ConnectionManager,
    ConnectionPool, bb8,
};
use clickhouse_datafusion::{ClickHouseBuilder, ClickHouseSessionContext};
use datafusion::error::DataFusionError;
use datafusion::execution::context::SessionContext;
use datafusion::prelude::{DataFrame, SessionConfig};
use serde::{Deserialize, Serialize};
use tracing::debug;

use super::{ConnectionOptions, PoolOptions, Secret};
use crate::backend::{Backend, BackendMetadata, Capability, ConnectionKind, ConnectionMetadata};
use crate::context::{DEFAULT_SESSION_CAPABILITIES, QuerySession, SessionCapability};
use crate::error::{Error, Result};
use crate::response::{ListSummary, TableSummary};

static CLICKHOUSE_METADATA: LazyLock<BackendMetadata> = LazyLock::new(|| BackendMetadata {
    kind:         ConnectionKind::Database,
    capabilities: vec![Capability::ExecuteSql, Capability::List],
});

pub const CLICKHOUSE_CATALOG: &str = "clickhouse";

/// Additional ClickHouse-specific configuration.
#[derive(Debug, Default, Clone, PartialEq, Eq, Hash, Deserialize, Serialize, utoipa::ToSchema)]
pub struct ClickHouseConfig {
    #[serde(default)]
    pub settings:    BTreeMap<String, String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub compression: Option<ClickHouseCompression>,
}

/// Compression options for `ClickHouse` tables.
#[derive(
    Debug, Default, Clone, Copy, PartialEq, Eq, Hash, Deserialize, Serialize, utoipa::ToSchema,
)]
#[serde(rename_all = "snake_case")]
pub enum ClickHouseCompression {
    None,
    #[default]
    Lz4,
    Zstd,
}

/// Wrapper for `ClickHouseSessionContext` to allow implementing `QuerySession` with `ClickHouse`
/// capabilities. This is needed in order to allow function pushdown and `ClickHouse` semantics
/// during `DataFusion` query execution.
#[derive(Clone)]
pub struct QuerySessionContext(ClickHouseSessionContext);

impl QuerySessionContext {
    /// Create a new `QuerySessionContext` wrapped with `ClickHouse` capabilities.
    ///
    /// NOTE: The settings applied below are due to [arrow-js](https://github.com/apache/arrow-js)
    ///       missing support for "View" types.
    ///
    /// Once a PR is merged that enables support, those settings can be removed.
    /// The PR currently tracking this is [#311](https://github.com/apache/arrow-js/pull/311)
    pub fn new() -> Self {
        let config = SessionConfig::default()
            .with_information_schema(true)
            // Binary is not very useful to the UI
            .set_bool("datafusion.execution.parquet.binary_as_string", true);
        let session = SessionContext::new_with_config(config);
        Self(
            ClickHouseSessionContext::from(session)
                .with_session_transform(SessionContext::enable_url_table),
        )
    }
}

impl Default for QuerySessionContext {
    fn default() -> Self { Self::new() }
}

#[async_trait]
impl QuerySession for QuerySessionContext {
    fn as_session(&self) -> &SessionContext { self.0.session_context() }

    fn capabilities(&self) -> &[SessionCapability] { DEFAULT_SESSION_CAPABILITIES }

    async fn sql(&self, sql: &str) -> Result<DataFrame> {
        self.0.sql(sql).await.map_err(Error::DataFusion)
    }
}

/// Backend implementation for `ClickHouse` connectors.
pub struct ClickHouseBackend {
    key:        String,
    metadata:   ConnectionMetadata,
    endpoint:   String,
    /// An `ArrowConnectionManager` is stored so that the underlying connection can be used while
    /// at the same time allowing registration into `DataFusion`.
    pool:       ConnectionPool<ArrowFormat>,
    registered: Arc<AtomicBool>,
}

impl ClickHouseBackend {
    /// Create a new `ClickHouseBackend`.
    ///
    /// # Errors
    /// - Returns an error if the connection pool cannot be created.
    pub async fn try_new(
        id: impl Into<String>,
        name: impl Into<String>,
        options: &ConnectionOptions,
        config: Option<ClickHouseConfig>,
        connect: PoolOptions,
    ) -> Result<Self> {
        let metadata = ConnectionMetadata {
            id:       id.into(),
            name:     name.into(),
            catalog:  Some(CLICKHOUSE_CATALOG.to_string()),
            metadata: CLICKHOUSE_METADATA.clone(),
        };

        let key = RandomState::new().hash_one(&metadata).to_string();
        let endpoint = options.endpoint.clone();
        let config = config.unwrap_or_default();
        let builder = create_client_builder("", options, &config);
        let manager = ConnectionManager::try_new_with_builder(builder)
            .await
            .map_err(Error::ClickHouseArrow)?;
        let pool_size = connect.pool_size.unwrap_or(1);
        let timeout = connect.connect_timeout.map_or(30, u64::from);
        let pool = bb8::Builder::new()
            .max_size(pool_size)
            .min_idle(pool_size)
            .test_on_check_out(true)
            .max_lifetime(Duration::from_secs(60 * 60 * 2))
            .idle_timeout(Duration::from_secs(60 * 60 * 2))
            .connection_timeout(Duration::from_secs(timeout))
            .retry_connection(false)
            .queue_strategy(bb8::QueueStrategy::Fifo)
            .build(manager)
            .await
            .map_err(|e| DataFusionError::External(e.into()))
            .map_err(Error::ClickHouseDatafusion)?;

        Ok(Self { key, metadata, endpoint, pool, registered: Arc::new(AtomicBool::new(false)) })
    }

    pub fn metadata() -> BackendMetadata { CLICKHOUSE_METADATA.clone() }
}

#[async_trait]
impl Backend for ClickHouseBackend {
    fn connection(&self) -> &ConnectionMetadata { &self.metadata }

    async fn prepare_session(&self, session: &SessionContext) -> Result<()> {
        if self.registered.load(Ordering::Acquire) {
            debug!("ClickHouse already registered, skipping registration");
            return Ok(());
        }

        let pool = self.pool.clone();
        let _clickhouse = ClickHouseBuilder::build_catalog_from_pool(
            session,
            &self.endpoint,
            Some(CLICKHOUSE_CATALOG),
            &self.key,
            pool,
        )
        .await
        .map_err(Error::ClickHouseDatafusion)?
        .build(session)
        .await
        .map_err(Error::ClickHouseDatafusion)?;

        // Flag that connection has been registered
        self.registered.store(true, Ordering::Release);

        Ok(())
    }

    async fn list(&self, database: Option<&str>) -> Result<ListSummary> {
        if database.is_some_and(|d| !d.is_empty()) {
            self.pool
                .get()
                .await
                .map_err(|e| DataFusionError::External(e.into()))
                .map_err(Error::ClickHouseDatafusion)?
                .fetch_tables(database, None)
                .await
                .map_err(Error::from)
                .map(|name| {
                    name.into_iter()
                        .map(|name| TableSummary { name, rows: None, size_bytes: None })
                        .collect()
                })
                .map(ListSummary::Tables)
                .inspect(|result| {
                    tracing::debug!("------> ClickHouse list w/ database: {result:?}");
                })
        } else {
            self.pool
                .get()
                .await
                .map_err(|e| DataFusionError::External(e.into()))
                .map_err(Error::ClickHouseDatafusion)?
                .fetch_schemas(None)
                .await
                .map_err(Error::from)
                .map(ListSummary::Databases)
                .inspect(|result| {
                    tracing::debug!("------> ClickHouse list w/o database: {result:?}");
                })
        }
    }
}

/// Create a `ClickHouse` client builder, Arrow format.
pub fn create_client_builder(
    catalog: &str,
    options: &ConnectionOptions,
    config: &ClickHouseConfig,
) -> ClientBuilder {
    let catalog = if catalog.is_empty() { "default" } else { catalog };
    ArrowClient::builder()
        .with_database(catalog)
        .with_endpoint(&options.endpoint)
        .with_username(&options.username)
        .with_password(options.password.as_ref().map(Secret::get).unwrap_or_default())
        .with_settings(config.settings.clone())
        .with_compression(match config.compression.unwrap_or_default() {
            ClickHouseCompression::None => CompressionMethod::None,
            ClickHouseCompression::Lz4 => CompressionMethod::LZ4,
            ClickHouseCompression::Zstd => CompressionMethod::ZSTD,
        })
        .with_tls(options.tls.as_ref().is_some_and(|tls| tls.enable))
        // Ensure strings are Utf8 encoded for UI.
        .with_arrow_options(ArrowOptions::default().with_strings_as_strings(true))
}
