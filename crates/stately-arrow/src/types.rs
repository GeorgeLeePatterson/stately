use std::collections::HashMap;

use serde::{Deserialize, Serialize};

/// Type alias for readability. Corresponds to a search term for a connection.
pub type ConnectionSearchTerm = String;

/// Query param for searching connections
#[derive(Debug, Clone, Serialize, Deserialize, utoipa::IntoParams, utoipa::ToSchema)]
pub struct ConnectionSearchQuery {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub search: Option<String>,
}

/// Request to execute a SQL query
#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct QueryRequest {
    /// ID of the connector to use
    pub connector_id: Option<String>,

    /// SQL query to execute (can use URL tables like `s3://bucket/path/*.parquet`)
    pub sql: String,
}

/// Request for multiple connection details
#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct ConnectionDetailsRequest {
    /// IDs -> searches of each connector to list
    pub connectors:    HashMap<String, ConnectionSearchQuery>,
    /// Whether one failure should fail the entire request
    #[serde(default)]
    #[schema(default)]
    pub fail_on_error: bool,
}

/// Summaries provided by listing
#[non_exhaustive]
#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToResponse, utoipa::ToSchema)]
#[serde(tag = "type", content = "summary", rename_all = "snake_case")]
#[schema(rename_all = "snake_case")]
pub enum ListSummary {
    // Database related
    Databases(Vec<String>),
    Tables(Vec<TableSummary>),
    // Object store related
    Paths(Vec<String>),
    Files(Vec<TableSummary>),
}

/// Response to execute a SQL query
#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema, utoipa::ToResponse)]
pub struct ConnectionDetailsResponse {
    /// IDs -> `ListSummary` of each connector to list
    pub connections: HashMap<String, ListSummary>,
    // TODO: Return error is fail_on_error is false, the default
}

/// Lightweight description of a table/file exposed by a connector.
#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToResponse, utoipa::ToSchema)]
pub struct TableSummary {
    pub name:       String,
    pub rows:       Option<u64>,
    pub size_bytes: Option<u64>,
}
