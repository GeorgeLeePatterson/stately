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
        .route("/save", post(super::handlers::save_file))
        .route("/list", get(super::handlers::list_files))
        // Download endpoints - catch-all paths for nested file paths
        .route("/file/cache/*path", get(super::handlers::download_cache))
        .route("/file/data/*path", get(super::handlers::download_data))
        .route("/file/upload/*path", get(super::handlers::download_upload))
        .with_state(state)
}
