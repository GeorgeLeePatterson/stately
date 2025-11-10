use axum::Router;
use axum::routing::{get, post};

use crate::api::FileState;

pub fn router() -> Router<FileState> {
    Router::new()
        .route("/upload", post(super::handlers::upload))
        .route("/save", post(super::handlers::save))
        .route("/list", get(super::handlers::list))
}
