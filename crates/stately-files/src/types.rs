use serde::{Deserialize, Serialize};
use utoipa::{ToResponse, ToSchema};

#[derive(Debug, Deserialize, ToSchema)]
pub struct FileSaveRequest {
    /// File content as string
    pub content: String,
    /// Optional filename
    pub name:    Option<String>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct FileListQuery {
    /// Optional path to list files from (relative to data directory)
    pub path: Option<String>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct FileDownloadQuery {
    /// Optional specific version UUID. If not provided, returns the latest version.
    pub version: Option<String>,
}

#[derive(Debug, Serialize, ToSchema, ToResponse)]
pub struct FileUploadResponse {
    /// Whether the operation was successful
    pub success:   bool,
    /// Relative path from data directory (e.g., "uploads/config.json")
    pub path:      String,
    /// The UUID version identifier
    pub uuid:      String,
    /// Full absolute path on the server
    pub full_path: String,
}

#[derive(Debug, Serialize, ToSchema, ToResponse)]
pub struct FileListResponse {
    /// List of files
    pub files: Vec<FileInfo>,
}

// TODO: Docs
#[derive(Debug, Clone, Copy, Serialize, ToSchema)]
#[serde(rename_all = "snake_case")]
pub enum FileEntryType {
    Directory,
    File,
    VersionedFile,
}

// TODO: Docs - File info returned from list
#[derive(Debug, Serialize, ToSchema)]
pub struct FileInfo {
    /// File name (relative path from target directory)
    pub name:       String,
    /// File size in bytes
    pub size:       u64,
    /// Entry type: `directory`, `file`, or `versioned_file`
    #[serde(rename = "type")]
    pub entry_type: FileEntryType,
    /// Creation timestamp (Unix epoch seconds) - oldest version for versioned files
    pub created:    Option<u64>,
    /// Last modified timestamp (Unix epoch seconds) - newest version for versioned files
    pub modified:   Option<u64>,
    /// List of all versions (only populated for versioned files)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub versions:   Option<Vec<FileVersion>>,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct FileVersion {
    /// UUID identifier for this version
    pub uuid:    String,
    /// Size of this specific version in bytes
    pub size:    u64,
    /// Creation timestamp (Unix epoch seconds)
    pub created: Option<u64>,
}
