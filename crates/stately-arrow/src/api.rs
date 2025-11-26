mod handlers;
pub mod openapi;
mod response;

use axum::Router;
use axum::routing::{get, post};
use datafusion::prelude::SessionContext;

use crate::{QueryContext, QuerySession};

/// Create the viewer API router
/// This can be mounted at any path (e.g., /api/v1/viewer)
pub fn router<S, Session>(state: S) -> Router<S>
where
    S: Send + Sync + Clone + 'static,
    ViewerState<Session>: axum::extract::FromRef<S>,
    Session: QuerySession + 'static,
{
    Router::new()
        .route("/connectors", get(handlers::list_connectors::<Session>))
        .route("/connectors/{connector_id}", get(handlers::stat::<Session>))
        .route("/register/{connector_id}", get(handlers::register::<Session>))
        .route("/catalogs", get(handlers::list_catalogs::<Session>))
        .route("/query", post(handlers::execute_query::<Session>))
        .with_state(state)
}

/// State required by the viewer API
///
/// Implement `FromRef` to allow `ViewerState` to be extracted from application API state.
/// This enables using `ViewerState` handlers with any router requiring state.
///
/// ```rust,ignore
/// use arrow_ui::database::clickhouse::QuerySessionContext;
///
/// pub struct ApiState {
///     pub query_context: arrow_ui::QueryContext<QuerySessionContext>,
/// }
///
/// impl axum::extract::FromRef<ApiState> for arrow_ui::api::ViewerState<QuerySessionContext> {
///     fn from_ref(state: &ApiState) -> Self { Self::new(state.query_context.clone()) }
/// }
///
/// pub struct Registry {
///     state:      Arc<RwLock<xeo4_state::State>>,
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
///     ApiState { queryContext }
/// }
/// ```
#[derive(Clone)]
pub struct ViewerState<S = SessionContext>
where
    S: QuerySession,
{
    pub query_context: QueryContext<S>,
}

impl<S> ViewerState<S>
where
    S: QuerySession,
{
    /// Create `ViewerState` from `QueryContext`
    pub fn new(query_context: QueryContext<S>) -> Self { Self { query_context } }
}
