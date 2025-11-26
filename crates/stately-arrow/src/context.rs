use std::sync::Arc;

use async_trait::async_trait;
use datafusion::dataframe::DataFrame;
use datafusion::execution::SendableRecordBatchStream;
use datafusion::execution::context::SessionContext;
use datafusion::prelude::SessionConfig;
use tracing::error;

use super::StatQuery;
use crate::ListSummary;
use crate::connectors::{Capability, ConnectionMetadata, ConnectorRegistry};
use crate::error::{Error, Result};

pub const DEFAULT_SESSION_CAPABILITIES: &[SessionCapability] =
    &[SessionCapability::ExecuteWithoutConnector];

/// Abstraction over a query-capable `DataFusion` session.
#[async_trait]
pub trait QuerySession: Send + Sync + Clone {
    /// Access the underlying `SessionContext` for registration or low-level control.
    fn as_session(&self) -> &SessionContext;

    fn capabilities(&self) -> &[SessionCapability];

    /// Execute SQL and return a `DataFrame` for streaming.
    async fn sql(&self, sql: &str) -> Result<DataFrame>;
}

#[async_trait]
impl QuerySession for SessionContext {
    fn as_session(&self) -> &SessionContext { self }

    fn capabilities(&self) -> &[SessionCapability] { DEFAULT_SESSION_CAPABILITIES }

    async fn sql(&self, sql: &str) -> Result<DataFrame> {
        SessionContext::sql(self, sql).await.map_err(Error::DataFusion)
    }
}

/// Session capabilities a `QuerySession` can expose to the `QueryContext`.
#[non_exhaustive]
#[derive(
    Debug, Clone, Copy, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize, utoipa::ToSchema,
)]
#[serde(rename_all = "snake_case")]
pub enum SessionCapability {
    /// Connector supports executing ad-hoc SQL queries through `DataFusion`.
    ExecuteWithoutConnector,
}

/// Query context for interactive data exploration.
#[derive(Clone)]
pub struct QueryContext<S = SessionContext>
where
    S: QuerySession,
{
    session:  S,
    registry: Arc<dyn ConnectorRegistry>,
}

impl QueryContext<SessionContext> {
    /// Create a new query context backed by the provided connector registry.
    pub fn new(registry: Arc<dyn ConnectorRegistry>) -> Self {
        let session =
            SessionContext::new_with_config(SessionConfig::default().with_information_schema(true))
                .enable_url_table();
        Self { session, registry }
    }
}

impl<S> QueryContext<S>
where
    S: QuerySession,
{
    /// Construct a query context from a custom session implementation.
    pub fn with_session(session: S, registry: Arc<dyn ConnectorRegistry>) -> Self {
        Self { session, registry }
    }

    /// Access the underlying `DataFusion` session.
    pub fn session(&self) -> &SessionContext { self.session.as_session() }

    /// List catalogs exposed by this connector.
    pub fn list_catalogs(&self) -> Vec<String> { self.session().catalog_names() }

    /// List tables/files for a connector, if supported.
    ///
    /// # Errors
    /// - If an error occurs while listing tables.
    pub async fn register(&self, connector_id: &str) -> Result<ConnectionMetadata> {
        let connector = self.registry.get(connector_id).await?;
        connector
            .prepare_session(self.session.as_session())
            .await
            .inspect_err(|error| error!(?error, connector_id, "Error preparing session"))?;
        Ok(connector.metadata().clone())
    }

    /// List available connectors.
    ///
    /// # Errors
    /// - If an error occurs while listing connectors.
    pub async fn list_connections(&self) -> Result<Vec<ConnectionMetadata>> {
        self.registry.list().await
    }

    /// List tables/files for a connector, if supported.
    ///
    /// # Errors
    /// - If an error occurs while listing tables.
    pub async fn list_tables(&self, connector_id: &str, params: &StatQuery) -> Result<ListSummary> {
        let connector = self
            .registry
            .get(connector_id)
            .await
            .inspect_err(|error| error!(?error, connector_id, "Error getting connection"))?;
        if !connector.metadata().has(Capability::List) {
            return Err(Error::UnsupportedConnector(
                "Connector does not support table listing".into(),
            ));
        }
        connector
            .prepare_session(self.session.as_session())
            .await
            .inspect_err(|error| error!(?error, connector_id, "Error preparing session"))?;
        connector.list(params.database.as_deref(), params.schema.as_deref()).await
    }

    /// Execute a SQL query through the provided connector.
    ///
    /// # Errors
    /// - If an error occurs while executing the query.
    pub async fn execute_query(
        &self,
        connector_id: Option<&str>,
        sql: &str,
    ) -> Result<SendableRecordBatchStream> {
        if let Some(connector_id) = connector_id {
            let connector = self.registry.get(connector_id).await.inspect_err(|error| {
                error!(?error, connector_id, "Error getting connection");
            })?;
            if !connector.metadata().has(Capability::ExecuteSql) {
                return Err(Error::UnsupportedConnector(
                    "Connector does not support SQL execution".into(),
                ));
            }

            connector
                .prepare_session(self.session.as_session())
                .await
                .inspect_err(|error| error!(?error, connector_id, "Error preparing session"))?;
        } else if !self.session.capabilities().contains(&SessionCapability::ExecuteWithoutConnector)
        {
            return Err(Error::UnsupportedSessionAction(
                "Query context does not support SQL without connector id".into(),
            ));
        }

        let dataframe = self
            .session
            .sql(sql)
            .await
            .inspect_err(|error| error!(?error, connector_id, "Error running sql"))?;

        // TODO: Remove !!! Return stream only

        let collected = dataframe.clone().collect().await.map_err(Error::DataFusion)?;
        if let Some(batch) = collected.first() {
            eprintln!(
                "
                    RecordBatch streaming:

                    {:?}
                    ",
                batch.schema()
            );
        }

        dataframe.execute_stream().await.map_err(Error::DataFusion)
    }
}
