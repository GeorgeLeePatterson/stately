# Stately Arrow

TODO: Introduces a new `entity` type, connection configurations.

# Example


```rust,ignore
use arrow_ui::database::clickhouse::QuerySessionContext;

pub struct ApiState {
    pub query_context: arrow_ui::QueryContext<QuerySessionContext>,
}

impl axum::extract::FromRef<ApiState> for arrow_ui::api::ViewerState<QuerySessionContext> {
    fn from_ref(state: &ApiState) -> Self { Self::new(state.query_context.clone()) }
}

pub struct Registry {
    state:      Arc<RwLock<xeo4_state::State>>,
    registered: Arc<RwLock<BackendCache>>,
    options:    RegistryOptions,
}

impl Registry {
    pub fn new(state: Arc<RwLock<StatelyState>>) -> Self {
        Self {
            state,
            registered: Arc::new(RwLock::new(FxHashMap::default())),
            options: RegistryOptions::default(),
        }
    }
    
    #[must_use]
    pub fn with_options(mut self, options: RegistryOptions) -> Self {
        self.options = options;
        self
    }
}

fn create_api_state() -> ApiState {
    // Create query context with `ClickHouse`
    let session = QuerySessionContext::default();
    
    // Create registry with options
    let opts = RegistryOptions { max_lifetime: None, max_pool_size: Some(2) };
    let registry: Arc<dyn arrow_ui::ConnectorRegistry> =
        Arc::new(xeo4_query::Registry::new(Arc::clone(&state)).with_options(opts));
    
    // Create query context with registry
    let query_context = arrow_ui::QueryContext::with_session(session, registry);
    
    // Finally, create ApiState
    ApiState { queryContext }
}
```
