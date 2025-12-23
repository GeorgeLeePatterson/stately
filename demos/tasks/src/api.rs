use std::sync::Arc;

use axum::extract::{FromRef, State};
use axum::{Json, Router};
use tokio::sync::RwLock;
use tower_http::cors::{Any, CorsLayer};

use crate::state::{Entity, State as AppState, StateEntry, Task, TaskMetrics, TaskStatus};

/// Create API state used across all endpoints
#[derive(Clone)]
pub struct ApiState {
    pub state:   Arc<RwLock<AppState>>,
    // Define any other properties needed in endpoints
    pub metrics: Arc<RwLock<TaskMetrics>>,
}

/// API state wrapper
#[stately::axum_api(AppState, openapi(
    server = "/api/v1/entity",
    components = [Task, TaskStatus, TaskMetrics],
    paths = [metrics]
))]
#[derive(Clone)]
pub struct EntityState {}

// Derive `FromRef` for `ApiState` to `EntityState`
impl FromRef<ApiState> for EntityState {
    fn from_ref(state: &ApiState) -> Self { EntityState::new_from_state(Arc::clone(&state.state)) }
}

/// Build the application router
pub fn router(state: &ApiState, tx: &tokio::sync::mpsc::Sender<ResponseEvent>) -> Router {
    Router::new()
        .route("/api/v1/metrics", axum::routing::get(metrics))
        .nest(
            "/api/v1/entity",
            EntityState::router(state.clone()).layer(axum::middleware::from_fn(
                EntityState::event_middleware::<ResponseEvent>(tx.clone()),
            )),
        )
        .layer(CorsLayer::new().allow_headers(Any).allow_methods(Any).allow_origin(Any))
        .with_state(state.clone())
}

/// Simple function to retrieve task metrics
#[utoipa::path(
    get,
    path = "/metrics",
    tag = "metrics",
    responses((status = 200, description = "Current task metrics", body = TaskMetrics))
)]
pub async fn metrics(State(state): State<ApiState>) -> Json<TaskMetrics> {
    Json(*state.metrics.read().await)
}
