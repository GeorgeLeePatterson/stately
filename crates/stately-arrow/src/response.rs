//! Response types for stately-arrow API endpoints.

use std::collections::HashMap;

use serde::{Deserialize, Serialize};

/// Summary of items available in a connector.
///
/// The variant indicates what type of items were found based on the connector
/// type and search context.
#[non_exhaustive]
#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToResponse, utoipa::ToSchema)]
#[serde(tag = "type", content = "summary", rename_all = "snake_case")]
#[schema(rename_all = "snake_case")]
pub enum ListSummary {
    /// List of database names (for database connectors at root level).
    Databases(Vec<String>),
    /// List of tables with metadata (for database connectors within a database).
    Tables(Vec<TableSummary>),
    /// List of path prefixes (for object store connectors at root level).
    Paths(Vec<String>),
    /// List of files with metadata (for object store connectors within a path).
    Files(Vec<TableSummary>),
}

/// Response containing details from multiple connectors.
#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema, utoipa::ToResponse)]
pub struct ConnectionDetailsResponse {
    /// Map of connector IDs to their listing results.
    pub connections: HashMap<String, ListSummary>,
}

/// Summary information about a table or file.
#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToResponse, utoipa::ToSchema)]
pub struct TableSummary {
    /// Table or file name/path.
    pub name:       String,
    /// Number of rows (if known).
    pub rows:       Option<u64>,
    /// Size in bytes (if known).
    pub size_bytes: Option<u64>,
}
