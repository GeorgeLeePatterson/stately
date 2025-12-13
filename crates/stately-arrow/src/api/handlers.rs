use std::collections::HashMap;

use axum::Json;
use axum::extract::{Path, Query, State};
use tracing::debug;

use super::QueryState;
use super::ipc::arrow_ipc_response;
use crate::error::Result;
use crate::{
    ConnectionDetailsRequest, ConnectionDetailsResponse, ConnectionMetadata, ConnectionSearchQuery,
    ListSummary, QueryRequest, QuerySession,
};

pub(super) const IDENT: &str = "[stately-arrow]";

/// List all available connectors
///
/// # Errors
/// - Internal server error
#[utoipa::path(
    get,
    path = "/connectors",
    tag = "arrow",
    responses(
        (
            status = 200,
            description = "List of available connections",
            body = Vec<ConnectionMetadata>
        ),
        (status = 500, description = "Internal server error", body = stately::ApiError)
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

/// List all catalogs in `Datafusion`
///
/// # Errors
/// - Internal server error
#[utoipa::path(
    get,
    path = "/catalogs",
    tag = "arrow",
    responses(
        (status = 200, description = "List of registered catalogs", body = Vec<String>),
        (status = 500, description = "Internal server error", body = stately::ApiError)
    )
)]
pub(super) async fn list_catalogs<S>(
    State(state): State<QueryState<S>>,
) -> Result<Json<Vec<String>>>
where
    S: QuerySession,
{
    let catalogs = state.query_context.list_catalogs().await;
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
        ConnectionSearchQuery
    ),
    responses(
        (status = 200, description = "List of databases or tables/files", body = ListSummary),
        (status = 404, description = "Connector not found", body = stately::ApiError),
        (status = 500, description = "Internal server error", body = stately::ApiError)
    )
)]
pub(super) async fn connector_list<S>(
    Query(params): Query<ConnectionSearchQuery>,
    Path(connector_id): Path<String>,
    State(state): State<QueryState<S>>,
) -> Result<Json<ListSummary>>
where
    S: QuerySession,
{
    debug!("{IDENT} Listing details for connector '{connector_id}' w/ search {params:?}");
    Ok(Json(state.query_context.list(&connector_id, params.search.as_deref()).await?))
}

/// List databases or tables/files available in a set of connectors's underlying data stores
///
/// # Errors
/// - Connector not found
/// - Internal server error
#[utoipa::path(
    post,
    path = "/connectors",
    tag = "arrow",
    request_body = ConnectionDetailsRequest,
    responses(
        (
            status = 200,
            description = "List of databases or tables/files keyed by connection",
            body = ConnectionDetailsResponse
        ),
        (status = 404, description = "Connector not found", body = stately::ApiError),
        (status = 500, description = "Internal server error", body = stately::ApiError)
    )
)]
pub(super) async fn connector_list_many<S>(
    State(state): State<QueryState<S>>,
    Json(request): Json<ConnectionDetailsRequest>,
) -> Result<Json<ConnectionDetailsResponse>>
where
    S: QuerySession,
{
    let keys = request.connectors.keys();
    debug!("{IDENT} Listing details for connectors: {keys:?}");
    let mut connections = HashMap::default();
    for (connector_id, params) in request.connectors {
        let term = params.search;
        let result = match state.query_context.list(&connector_id, term.as_deref()).await {
            Ok(r) => r,
            Err(e) => {
                tracing::error!("Failed to list connector details for {connector_id}: {e:?}");
                if request.fail_on_error {
                    return Err(e);
                }
                continue;
            }
        };
        tracing::debug!("Listed connector details for {connector_id}: {result:?}");
        drop(connections.insert(connector_id, result));
    }
    Ok(Json(ConnectionDetailsResponse { connections }))
}

/// List all registered connections
///
/// # Errors
/// - Internal server error
#[utoipa::path(
    get,
    path = "/register",
    tag = "arrow",
    responses(
        (
            status = 200,
            description = "List of registered connections",
            body = Vec<ConnectionMetadata>
        ),
        (status = 500, description = "Internal server error", body = stately::ApiError)
    )
)]
pub(super) async fn list_registered<S>(
    State(state): State<QueryState<S>>,
) -> Result<Json<Vec<ConnectionMetadata>>>
where
    S: QuerySession,
{
    let registered = state.query_context.list_registered().await?;
    debug!("{IDENT} Listed registered connections: {registered:?}");
    Ok(Json(registered))
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
    params(("connector_id" = String, Path, description = "Connector ID")),
    responses(
        (status = 200, description = "Registered Connections", body = Vec<ConnectionMetadata>),
        (status = 404, description = "Connector not found", body = stately::ApiError),
        (status = 500, description = "Internal server error", body = stately::ApiError)
    )
)]
pub(super) async fn register<S>(
    Path(connector_id): Path<String>,
    State(state): State<QueryState<S>>,
) -> Result<Json<Vec<ConnectionMetadata>>>
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
        (status = 400, description = "Invalid query", body = stately::ApiError),
        (status = 404, description = "Connector not found", body = stately::ApiError),
        (status = 500, description = "Internal server error", body = stately::ApiError)
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
    let stream = state
        .query_context
        .execute_query(request.connector_id.as_deref(), &request.sql)
        .await
        .inspect_err(|error| tracing::error!("{IDENT} Error executing query: {error:?}"))?;
    arrow_ipc_response(stream).await
}
