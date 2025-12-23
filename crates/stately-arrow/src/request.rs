//! Request types for stately-arrow API endpoints.

use std::collections::HashMap;

use serde::{Deserialize, Serialize};

/// Query parameters for searching connection contents.
#[derive(Debug, Clone, Serialize, Deserialize, utoipa::IntoParams, utoipa::ToSchema)]
pub struct ConnectionSearchQuery {
    /// Optional search term to filter results.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub search: Option<String>,
}

/// Type alias for search term strings.
pub type ConnectionSearchTerm = String;

/// Request to execute a SQL query.
#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct QueryRequest {
    /// ID of the connector to use. If not provided, the query runs against
    /// the session's default catalog (if supported).
    pub connector_id: Option<String>,

    /// SQL query to execute. Supports URL tables like `s3://bucket/path/*.parquet`.
    pub sql: String,
}

/// Request for fetching details from multiple connectors.
#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct ConnectionDetailsRequest {
    /// Map of connector IDs to their search parameters.
    pub connectors: HashMap<String, ConnectionSearchQuery>,

    /// If true, a failure in any connector fails the entire request.
    /// If false (default), failures are skipped and successful results returned.
    #[serde(default)]
    #[schema(default)]
    pub fail_on_error: bool,
}
