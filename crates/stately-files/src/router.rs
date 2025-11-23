use axum::Router;
use axum::routing::{get, post};

use crate::api::FileState;

pub fn router<S>(state: S) -> Router<S>
where
    S: Send + Sync + Clone + 'static,
    FileState: axum::extract::FromRef<S>,
{
    Router::new()
        .route("/upload", post(super::handlers::upload))
        .route("/save", post(super::handlers::save))
        .route("/list", get(super::handlers::list))
        .with_state(state)
}
