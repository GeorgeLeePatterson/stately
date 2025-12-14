//! Request types for file management endpoints.

use serde::Deserialize;
use utoipa::{IntoParams, ToSchema};

/// Request body for saving file content directly.
#[derive(Debug, Deserialize, ToSchema)]
pub struct FileSaveRequest {
    /// File content as string.
    pub content: String,
    /// Optional filename. Defaults to "unnamed.txt" if not provided.
    pub name:    Option<String>,
}

/// Query parameters for listing files.
#[derive(Debug, Deserialize, IntoParams, ToSchema)]
#[into_params(parameter_in = Query)]
pub struct FileListQuery {
    /// Path to list files from, relative to the uploads directory.
    /// If not provided, lists the root uploads directory.
    pub path: Option<String>,
}

/// Query parameters for downloading files.
#[derive(Debug, Deserialize, IntoParams, ToSchema)]
#[into_params(parameter_in = Query)]
pub struct FileDownloadQuery {
    /// Specific version UUID to download.
    /// If not provided, returns the latest version.
    pub version: Option<String>,
}
