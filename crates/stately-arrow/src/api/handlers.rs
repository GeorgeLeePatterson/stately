use axum::Json;
use axum::extract::{Path, Query, State};
use tracing::debug;

use super::ViewerState;
use super::response::arrow_ipc_response;
use crate::error::Result;
use crate::{ConnectionMetadata, ListSummary, QueryRequest, QuerySession, StatQuery};

const IDENT: &str = "[arrow-ui::Viewer]";

/// List all available connectors
///
/// # Errors
/// - Internal server error
#[utoipa::path(
    get,
    path = "/connectors",
    tag = "arrow-ui",
    responses(
        (status = 200, description = "List of available connectors", body = Vec<ConnectionMetadata>),
        (status = 500, description = "Internal server error")
    )
)]
pub(super) async fn list_connectors<S>(
    State(state): State<ViewerState<S>>,
) -> Result<Json<Vec<ConnectionMetadata>>>
where
    S: QuerySession,
{
    let connections = state.query_context.list_connections().await?;
    debug!("{IDENT} Listed connectors: {connections:?}");
    Ok(Json(connections))
}

/// List all available connectors
///
/// # Errors
/// - Internal server error
#[utoipa::path(
    get,
    path = "/catalogs",
    tag = "arrow-ui",
    responses(
        (status = 200, description = "List of registered catalogs", body = Vec<String>),
        (status = 500, description = "Internal server error")
    )
)]
pub(super) async fn list_catalogs<S>(
    State(state): State<ViewerState<S>>,
) -> Result<Json<Vec<String>>>
where
    S: QuerySession,
{
    let catalogs = state.query_context.list_catalogs();
    debug!("{IDENT} Listed catalogs: {catalogs:?}");
    Ok(Json(catalogs))
}

/// List files available in a connector's object store
///
/// # Errors
/// - Connector not found
/// - Internal server error
#[utoipa::path(
    get,
    path = "/connectors/{connector_id}",
    tag = "arrow-ui",
    params(
        ("connector_id" = String, Path, description = "Connector ID"),
        StatQuery
    ),
    responses(
        (status = 200, description = "List of files", body = ListSummary),
        (status = 404, description = "Connector not found"),
        (status = 500, description = "Internal server error")
    )
)]
pub(super) async fn stat<S>(
    Query(params): Query<StatQuery>,
    Path(connector_id): Path<String>,
    State(state): State<ViewerState<S>>,
) -> Result<Json<ListSummary>>
where
    S: QuerySession,
{
    debug!("{IDENT} Listing files for connector: {connector_id}");
    Ok(Json(state.query_context.list_tables(&connector_id, &params).await?))
}

/// Register a connector. Useful when federating queries since registration is lazy
///
/// # Errors
/// - Connector not found
/// - Internal server error
#[utoipa::path(
    get,
    path = "/register/{connector_id}",
    tag = "arrow-ui",
    params(
        ("connector_id" = String, Path, description = "Connector ID"),
    ),
    responses(
        (status = 200, description = "Registered Connection", body = ConnectionMetadata),
        (status = 404, description = "Connector not found"),
        (status = 500, description = "Internal server error")
    )
)]
pub(super) async fn register<S>(
    Path(connector_id): Path<String>,
    State(state): State<ViewerState<S>>,
) -> Result<Json<ConnectionMetadata>>
where
    S: QuerySession,
{
    debug!("{IDENT} Registering connector: {connector_id}");
    Ok(Json(state.query_context.register(&connector_id).await?))
}

/// Execute a SQL query using URL tables
///
/// # Errors
/// - Connector not found
/// - Internal server error
#[utoipa::path(
    post,
    path = "/query",
    tag = "arrow-ui",
    request_body = QueryRequest,
    responses(
        (
            status = 200,
            description = "Query results as Arrow IPC stream",
            content_type = "application/vnd.apache.arrow.stream"
        ),
        (status = 400, description = "Invalid query"),
        (status = 404, description = "Connector not found"),
        (status = 500, description = "Internal server error")
    )
)]
pub(super) async fn execute_query<S>(
    State(state): State<ViewerState<S>>,
    Json(request): Json<QueryRequest>,
) -> Result<axum::response::Response>
where
    S: QuerySession,
{
    debug!(?request, "{IDENT} Executing query");
    let stream =
        state.query_context.execute_query(request.connector_id.as_deref(), &request.sql).await?;
    arrow_ipc_response(stream).await
}
