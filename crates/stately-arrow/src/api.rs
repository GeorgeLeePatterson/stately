//! HTTP API module for stately-arrow.
//!
//! This module provides the axum router and handlers for the Arrow query API.

pub mod handlers;
pub mod ipc;
pub mod openapi;

use axum::Router;
use axum::routing::{get, post};

use crate::QuerySession;
use crate::state::QueryState;

/// Create the stately-arrow API router.
///
/// Mount this router at any path (e.g., `/api/v1/arrow` or `/arrow`).
///
/// # Example
///
/// ```rust,ignore
/// use axum::Router;
/// use stately_arrow::{api, QueryContext, QueryState};
///
/// let query_context = QueryContext::new(registry);
/// let arrow_router = api::router(QueryState::new(query_context));
///
/// let app = Router::new().nest("/arrow", arrow_router);
/// ```
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
