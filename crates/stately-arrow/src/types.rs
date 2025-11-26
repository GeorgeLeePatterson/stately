use serde::{Deserialize, Serialize};

#[derive(Deserialize, utoipa::IntoParams, utoipa::ToSchema)]
pub struct StatQuery {
    pub catalog:  Option<String>,
    pub database: Option<String>,
    pub schema:   Option<String>,
}

/// Request to execute a SQL query
#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct QueryRequest {
    /// ID of the connector to use
    pub connector_id: Option<String>,

    /// SQL query to execute (can use URL tables like `s3://bucket/path/*.parquet`)
    pub sql: String,
}

/// Summaries provided by listing
#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToResponse, utoipa::ToSchema)]
#[serde(tag = "type", content = "summary", rename_all = "snake_case")]
#[schema(rename_all = "snake_case")]
pub enum ListSummary {
    Databases(Vec<String>),
    Files(Vec<TableSummary>),
    Tables(Vec<TableSummary>),
}

/// Lightweight description of a table/file exposed by a connector.
#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToResponse, utoipa::ToSchema)]
pub struct TableSummary {
    pub name:       String,
    pub rows:       Option<u64>,
    pub size_bytes: Option<u64>,
}
