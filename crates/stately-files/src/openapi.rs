#![expect(clippy::needless_for_each)]
//! `OpenAPI` documentation for stately-files endpoints.

use super::path::{RelativePath, UserDefinedPath};
use super::request::{FileDownloadQuery, FileListQuery, FileSaveRequest};
use super::response::{FileInfo, FileListResponse, FileUploadResponse, FileVersion};
use crate::path::VersionedPath;

/// `OpenAPI` documentation for file management endpoints.
#[derive(utoipa::OpenApi, Clone, Copy)]
#[openapi(
    paths(
        super::handlers::upload,
        super::handlers::save_file,
        super::handlers::list_files,
        super::handlers::download_cache,
        super::handlers::download_data,
        super::handlers::download_upload,
    ),
    components(
        responses(
            FileListResponse,
            FileUploadResponse,
            stately::ApiError,
        ),
        schemas(
            FileListResponse,
            FileUploadResponse,
            FileInfo,
            FileListQuery,
            FileDownloadQuery,
            FileSaveRequest,
            FileVersion,
            UserDefinedPath,
            RelativePath,
            VersionedPath,
        )
    ),
    tags((name = "files", description = "File management endpoints"))
)]
pub struct OpenApiDoc;
