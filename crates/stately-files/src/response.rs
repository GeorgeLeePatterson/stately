//! Response types for file management endpoints.

use serde::Serialize;
use utoipa::{ToResponse, ToSchema};

/// Response from file upload or save operations.
#[derive(Debug, Serialize, ToSchema, ToResponse)]
pub struct FileUploadResponse {
    /// Whether the operation was successful.
    pub success:   bool,
    /// Relative path from uploads directory (e.g., "config.json").
    pub path:      String,
    /// The UUID version identifier for this upload.
    pub uuid:      String,
    /// Full absolute path on the server filesystem.
    pub full_path: String,
}

/// Response from listing files in a directory.
#[derive(Debug, Serialize, ToSchema, ToResponse)]
pub struct FileListResponse {
    /// List of files and directories.
    pub files: Vec<FileInfo>,
}

/// Type of file system entry.
#[derive(Debug, Clone, Copy, Serialize, ToSchema)]
#[serde(rename_all = "snake_case")]
pub enum FileEntryType {
    /// A directory that may contain other files or directories.
    Directory,
    /// A regular file (not versioned).
    File,
    /// A versioned file with multiple versions stored.
    VersionedFile,
}

/// Information about a file or directory entry.
#[derive(Debug, Serialize, ToSchema)]
pub struct FileInfo {
    /// Entry name (filename or directory name).
    pub name:       String,
    /// Size in bytes. For versioned files, this is the size of the latest version.
    /// For directories, this is 0.
    pub size:       u64,
    /// Type of this entry.
    #[serde(rename = "type")]
    pub entry_type: FileEntryType,
    /// Creation timestamp as Unix epoch seconds.
    /// For versioned files, this is when the first version was created.
    pub created:    Option<u64>,
    /// Last modified timestamp as Unix epoch seconds.
    /// For versioned files, this is when the latest version was created.
    pub modified:   Option<u64>,
    /// List of all versions, sorted newest first.
    /// Only populated for versioned files.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub versions:   Option<Vec<FileVersion>>,
}

/// Information about a specific file version.
#[derive(Debug, Serialize, ToSchema)]
pub struct FileVersion {
    /// UUID v7 identifier for this version.
    pub uuid:    String,
    /// Size of this version in bytes.
    pub size:    u64,
    /// Creation timestamp as Unix epoch seconds.
    pub created: Option<u64>,
}
