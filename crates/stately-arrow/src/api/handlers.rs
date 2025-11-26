use axum::Json;
use axum::extract::{Path, Query, State};
use tracing::debug;

use super::QueryState;
use super::ipc::arrow_ipc_response;
use crate::error::Result;
use crate::{ConnectionDetailQuery, ConnectionMetadata, ListSummary, QueryRequest, QuerySession};

const IDENT: &str = "[stately-arrow]";

/// List all available connectors
///
/// # Errors
/// - Internal server error
#[utoipa::path(
    get,
    path = "/connectors",
    tag = "arrow",
    responses(
        (status = 200, description = "List of available connections", body = Vec<ConnectionMetadata>),
        (status = 500, description = "Internal server error")
    )
)]
pub(super) async fn list_connectors<S>(
    State(state): State<QueryState<S>>,
) -> Result<Json<Vec<ConnectionMetadata>>>
where
    S: QuerySession,
{
    let connectors = state.query_context.list_connectors().await?;
    debug!("{IDENT} Listed connectors: {connectors:?}");
    Ok(Json(connectors))
}

/// List all registered catalogs
///
/// # Errors
/// - Internal server error
#[utoipa::path(
    get,
    path = "/catalogs",
    tag = "arrow",
    responses(
        (status = 200, description = "List of registered catalogs", body = Vec<String>),
        (status = 500, description = "Internal server error")
    )
)]
pub(super) async fn list_catalogs<S>(
    State(state): State<QueryState<S>>,
) -> Result<Json<Vec<String>>>
where
    S: QuerySession,
{
    let catalogs = state.query_context.list_catalogs();
    debug!("{IDENT} Listed catalogs: {catalogs:?}");
    Ok(Json(catalogs))
}

/// List databases or tables/files available in a connector's underlying data store
///
/// # Errors
/// - Connector not found
/// - Internal server error
#[utoipa::path(
    get,
    path = "/connectors/{connector_id}",
    tag = "arrow",
    params(
        ("connector_id" = String, Path, description = "Connector ID"),
        ConnectionDetailQuery
    ),
    responses(
        (status = 200, description = "List of databases or tables/files", body = ListSummary),
        (status = 404, description = "Connector not found"),
        (status = 500, description = "Internal server error")
    )
)]
pub(super) async fn list<S>(
    Query(params): Query<ConnectionDetailQuery>,
    Path(connector_id): Path<String>,
    State(state): State<QueryState<S>>,
) -> Result<Json<ListSummary>>
where
    S: QuerySession,
{
    debug!("{IDENT} Listing files for connector: {connector_id}");
    Ok(Json(state.query_context.list(&connector_id, &params).await?))
}

/// Register a connector. Useful when federating queries since registration is lazy
///
/// # Errors
/// - Connector not found
/// - Internal server error
#[utoipa::path(
    get,
    path = "/register/{connector_id}",
    tag = "arrow",
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
    State(state): State<QueryState<S>>,
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
    tag = "arrow",
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
    State(state): State<QueryState<S>>,
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
