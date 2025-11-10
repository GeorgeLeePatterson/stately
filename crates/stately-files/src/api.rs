#![expect(clippy::needless_for_each)]
use serde::{Deserialize, Serialize};

use super::entity::{RelativePath, UserDefinedPath};
use super::types::{
    FileEntryType, FileInfo, FileListQuery, FileListResponse, FileSaveRequest, FileUploadResponse,
    FileVersion,
};
use crate::entity::VersionedPath;
use crate::settings::Dirs;

// TODO:
//   * Add Convenience trait to blanket impl FromRef<S> for FilesState
//   * Illustrate a FromRef<S> example
#[derive(Debug, Clone, PartialEq, Hash, Serialize, Deserialize)]
pub struct FileState {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub base: Option<Dirs>,
}

/// `OpenAPI` documentation
#[derive(utoipa::OpenApi, Clone, Copy)]
#[openapi(
    paths(
        super::handlers::upload,
        super::handlers::save,
        super::handlers::list,
    ),
    components(
        responses(
            FileListResponse,
            FileUploadResponse,
        ),
        schemas(
            FileListResponse,
            FileUploadResponse,
            FileEntryType,
            FileInfo,
            FileListQuery,
            FileSaveRequest,
            FileVersion,
            FileEntryType,

            UserDefinedPath,
            RelativePath,
            VersionedPath,
        )
    ),
    tags(
        (name = "files", description = "File management endpoints"),
    )
)]
pub struct OpenApi;
