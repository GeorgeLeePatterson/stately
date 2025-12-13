pub mod handlers;
pub mod ipc;
pub mod openapi;

use axum::Router;
use axum::routing::{get, post};
use datafusion::prelude::SessionContext;

use crate::{QueryContext, QuerySession};

/// Create the `stately-arrow` API router
///
/// This can be mounted at any path (e.g., /api/v1/arrow)
pub fn router<S, Session>(state: S) -> Router<S>
where
    S: Send + Sync + Clone + 'static,
    QueryState<Session>: axum::extract::FromRef<S>,
    Session: QuerySession + 'static,
{
    Router::new()
        .route(
            "/connectors",
            get(handlers::list_connectors::<Session>)
                .post(handlers::connector_list_many::<Session>),
        )
        .route("/connectors/{connector_id}", get(handlers::connector_list::<Session>))
        .route("/register", get(handlers::list_registered::<Session>))
        .route("/register/{connector_id}", get(handlers::register::<Session>))
        .route("/catalogs", get(handlers::list_catalogs::<Session>))
        .route("/query", post(handlers::execute_query::<Session>))
        .with_state(state)
}

/// State required by the API handlers
///
/// Implement `FromRef` to allow `QueryState` to be extracted from application API state.
/// This enables using `QueryState` handlers with any router requiring state.
///
/// ```rust,ignore
/// use stately_arrow::database::clickhouse::QuerySessionContext;
///
/// pub struct ApiState {
///     pub query_context: stately_arrow::QueryContext<QuerySessionContext>,
///     pub other_state: String,
/// }
///
/// impl axum::extract::FromRef<ApiState> for stately_arrow::api::QueryState<QuerySessionContext> {
///     fn from_ref(state: &ApiState) -> Self { Self::new(state.query_context.clone()) }
/// }
///
/// pub struct Registry {
///     state:      Arc<RwLock<StatelyState>>,
///     registered: Arc<RwLock<BackendCache>>,
///     options:    RegistryOptions,
/// }
///
/// impl Registry {
///     pub fn new(state: Arc<RwLock<StatelyState>>) -> Self {
///         Self {
///             state,
///             registered: Arc::new(RwLock::new(FxHashMap::default())),
///             options: RegistryOptions::default(),
///         }
///     }
///
///     #[must_use]
///     pub fn with_options(mut self, options: RegistryOptions) -> Self {
///         self.options = options;
///         self
///     }
/// }
///
///
/// fn create_api_state() -> ApiState {
///     // Create query context with `ClickHouse`
///     let session = QuerySessionContext::default();
///
///     let opts = RegistryOptions { max_lifetime: None, max_pool_size: Some(2) };
///     let registry: Arc<dyn arrow_ui::ConnectorRegistry> =
///         Arc::new(xeo4_query::Registry::new(Arc::clone(&state)).with_options(opts));
///     let query_context = arrow_ui::QueryContext::with_session(session, registry);
///
///     ApiState { queryContext, other_state: "Other".to_string() }
/// }
/// ```
#[derive(Clone)]
pub struct QueryState<S = SessionContext>
where
    S: QuerySession,
{
    pub query_context: QueryContext<S>,
}

impl<S> QueryState<S>
where
    S: QuerySession,
{
    /// Create `QueryState` from `QueryContext`
    pub fn new(query_context: QueryContext<S>) -> Self { Self { query_context } }
}
