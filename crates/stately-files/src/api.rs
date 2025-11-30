#![expect(clippy::needless_for_each)]
use serde::{Deserialize, Serialize};

use super::path::{RelativePath, UserDefinedPath};
use super::types::{
    FileEntryType, FileInfo, FileListQuery, FileListResponse, FileSaveRequest, FileUploadResponse,
    FileVersion,
};
use crate::path::VersionedPath;
use crate::settings::Dirs;

// TODO:
//   * Discuss simple macro and trait below. Really not necessary, but may be helpful
#[derive(Debug, Clone, PartialEq, Hash, Serialize, Deserialize)]
pub struct FileState {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub base: Option<Dirs>,
}

/// Helper trait to leverage macro `from_ref` for `FromRef<S>` into`FileState`
pub trait FileStateExt<S> {
    fn as_file_state(other: &S) -> FileState;
}

/// Convenience macro for types that implement `FileStateExt` to implement `FromRef<S>`
#[macro_export]
macro_rules! from_ref {
    ($state:ty) => {
        impl ::axum::extract::FromRef<$state> for FileState {
            fn from_ref(st: &S) -> $crate::api::FileState {
                <$state as $crate::api::FileStateExt<$state>>::as_file_state(st)
            }
        }
    };
}

/// `OpenAPI` documentation
#[derive(utoipa::OpenApi, Clone, Copy)]
#[openapi(
    paths(
        super::handlers::upload,
        super::handlers::save_file,
        super::handlers::list_files,
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
pub struct OpenApiDoc;
