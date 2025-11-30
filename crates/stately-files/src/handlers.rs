use std::path::Path;

use axum::extract::{Multipart, Query, State};
use axum::response::Json;
use tokio::fs;
use tokio::io::AsyncWriteExt;

use super::api::FileState;
use super::error::{Error, Result};
use super::types::{FileListQuery, FileListResponse, FileSaveRequest, FileUploadResponse};
use super::utils;
use crate::settings::{Dirs, IGNORE_FILES, UPLOAD_DIR, VERSION_DIR};
use crate::types::{FileEntryType, FileInfo, FileVersion};

// TODO: Remove
//   * Upload is for managed files, add handler for uploading *anywhere*
//   * Add 'read' apis, to get content, multipart if large.

/// Upload a file to the data directory
///
/// Files are stored in a versioned structure:
/// `data/uploads/{name}/{uuid}`
///
/// This allows automatic versioning without conflicts.
///
/// # Errors
/// - `Error::BadRequest` if the file name is invalid
/// - `Error::Internal` if the file could not be saved
#[utoipa::path(
    post,
    path = "/upload",
    request_body(content = String, content_type = "multipart/form-data"),
    responses(
        (status = 200, description = "File uploaded successfully", body = FileUploadResponse),
        (status = 400, description = "Bad request"),
        (status = 500, description = "Internal server error")
    ),
    tag = "files"
)]
pub async fn upload(
    State(state): State<FileState>,
    mut multipart: Multipart,
) -> Result<Json<FileUploadResponse>> {
    let mut file_name: Option<String> = None;
    let mut file_data: Option<Vec<u8>> = None;

    // Parse multipart form data
    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|_e| Error::BadRequest("Invalid multipart data".to_string()))?
    {
        match field.name().unwrap_or("") {
            "file" => {
                file_name = field.file_name().map(ToString::to_string);
                file_data = Some(
                    field
                        .bytes()
                        .await
                        .map_err(|e| Error::BadRequest(format!("Failed to read file data: {e:?}")))?
                        .to_vec(),
                );
            }
            "name" => {
                file_name =
                    Some(field.text().await.map_err(|e| {
                        Error::BadRequest(format!("Failed to read name field: {e:?}"))
                    })?);
            }
            _ => {}
        }
    }

    let Some(data) = file_data else {
        return Err(Error::BadRequest("No file provided".to_string()));
    };

    // Sanitize filename - remove path separators and dangerous characters
    let sanitized_name =
        utils::sanitize_filename(&file_name.unwrap_or_else(|| "unnamed".to_string()));

    save(&sanitized_name, &data, state.base.as_ref()).await
}

/// Save file content directly (without multipart upload)
///
/// This endpoint allows saving file content from a text input.
///
/// # Errors
/// - `Error::BadRequest` if the file name is invalid
/// - `Error::Internal` if the file could not be saved
#[utoipa::path(
    post,
    path = "/save",
    request_body = FileSaveRequest,
    responses(
        (status = 200, description = "File saved successfully", body = FileUploadResponse),
        (status = 400, description = "Bad request"),
        (status = 500, description = "Internal server error")
    ),
    tag = "files"
)]
pub async fn save_file(
    State(state): State<FileState>,
    Json(request): Json<FileSaveRequest>,
) -> Result<Json<FileUploadResponse>> {
    let name = request.name.unwrap_or_else(|| "unnamed.txt".to_string());
    let sanitized_name = utils::sanitize_filename(&name);
    save(&sanitized_name, request.content.as_bytes(), state.base.as_ref()).await
}

/// List files and directories
///
/// Lists all files and directories in the specified path (or root data directory if no path
/// specified). Returns both files and directories with a flag indicating which is which.
///
/// Versioned files are stored as: `{filename}/__versions__/{uuid}`
/// The UI is responsible for aggregating versions for display.
///
/// # Errors
/// - `Error::BadRequest` if the path is invalid
/// - `Error::Internal` if the files could not be listed
#[utoipa::path(
    get,
    path = "/list",
    params(
        ("path" = Option<String>, Query, description = "Optional path relative to data directory (e.g., 'uploads'). Defaults to root data directory if not specified.")
    ),
    responses(
        (status = 200, description = "Files and directories listed successfully", body = FileListResponse),
        (status = 400, description = "Bad request"),
        (status = 500, description = "Internal server error")
    ),
    tag = "files"
)]
pub async fn list_files(
    State(state): State<FileState>,
    Query(params): Query<FileListQuery>,
) -> Result<Json<FileListResponse>> {
    let base_dir = state.base.as_ref().unwrap_or(Dirs::get()).data.clone().join(UPLOAD_DIR);

    let target_dir = if let Some(path) = params.path {
        // Sanitize and resolve the path
        let sanitized = utils::sanitize_path(&path);
        base_dir.join(sanitized)

    // Default to root data directory if no path specified
    } else {
        base_dir
    };

    // Ensure the directory exists
    if !target_dir.exists() {
        return Ok(Json(FileListResponse { files: vec![] }));
    }

    Ok(Json(FileListResponse { files: collect_files(target_dir).await? }))
}

async fn collect_files(target_dir: impl AsRef<Path>) -> Result<Vec<FileInfo>> {
    let mut files = Vec::new();

    // PASS 1: Collect all entries
    let mut entries_vec = Vec::new();
    let mut entries = fs::read_dir(target_dir.as_ref())
        .await
        .map_err(utils::map_file_err("Failed to read directory"))?;

    while let Some(entry) = entries
        .next_entry()
        .await
        .map_err(utils::map_file_err("Failed to read directory entry"))?
    {
        entries_vec.push(entry);
    }

    // PASS 2: Classify and process each entry
    for (name, entry) in entries_vec
        .into_iter()
        .map(|e| (e.file_name().to_string_lossy().to_string(), e))
        .filter(|(name, _)| !IGNORE_FILES.iter().any(|i| name.starts_with(i)))
    {
        let metadata =
            entry.metadata().await.map_err(utils::map_file_err("Failed to read file metadata"))?;

        let path = entry.path();
        // info!("Found entry: {name} (file: {}, dir: {})", metadata.is_file(), metadata.is_dir());

        if metadata.is_file() {
            // Regular file
            let size = metadata.len();
            let created = utils::get_created_time(&metadata);
            let modified = utils::get_modified_time(&metadata);
            // info!("Adding file: {name} (size: {size} bytes)");
            files.push(FileInfo {
                name,
                size,
                entry_type: FileEntryType::File,
                created,
                modified,
                versions: None,
            });
        } else if metadata.is_dir() {
            // Check if versioned file (has __versions__ subdirectory)
            let versions_path = path.join(VERSION_DIR);

            if fs::try_exists(&versions_path).await.unwrap_or(false) {
                // info!("Found versioned file: {name}");

                // Read all versions
                let mut versions = Vec::new();
                let mut versions_dir = fs::read_dir(&versions_path)
                    .await
                    .map_err(utils::map_file_err("Failed to read version dir"))?;
                while let Some(version_entry) = versions_dir
                    .next_entry()
                    .await
                    .map_err(utils::map_file_err("Failed to get entry for version"))?
                {
                    let version_meta = version_entry
                        .metadata()
                        .await
                        .map_err(utils::map_file_err("Failed to get metadata for version"))?;
                    if version_meta.is_file() {
                        versions.push(FileVersion {
                            uuid:    version_entry.file_name().to_string_lossy().to_string(),
                            size:    version_meta.len(),
                            created: utils::get_created_time(&version_meta),
                        });
                    }
                }
                // info!("Adding versioned file: {name} ({} versions)", versions.len());

                // Sort newest first (UUID v7 is time-sortable)
                versions.sort_by(|a, b| b.uuid.cmp(&a.uuid));

                // Initialize FileInfo for updates
                let mut version = FileInfo {
                    name,
                    size: 0,
                    entry_type: FileEntryType::VersionedFile,
                    created: None,
                    modified: None,
                    versions: None,
                };

                // Calculate metadata from versions
                if !versions.is_empty() {
                    version.size = versions.first().map_or(0, |v| v.size);
                    version.modified = versions.first().and_then(|v| v.created);
                    version.created = versions.last().and_then(|v| v.created);
                    version.versions = Some(versions);
                }

                files.push(version);
            } else {
                // Regular directory
                // info!("Adding directory: {name}");
                files.push(FileInfo {
                    name,
                    size: 0,
                    entry_type: FileEntryType::Directory,
                    created: None,
                    modified: None,
                    versions: None,
                });
            }
        }
    }

    // Sort by name
    files.sort_by(|a, b| b.name.cmp(&a.name));

    Ok(files)
}

/// Save file with UUID-based versioning
///
/// Files are stored as: uploads/{name}/__versions__/{uuid}
async fn save(name: &str, data: &[u8], base: Option<&Dirs>) -> Result<Json<FileUploadResponse>> {
    let (uuid, file_dir, file_path) = utils::create_versioned_filepath(name, base);

    // Create directory if it doesn't exist
    fs::create_dir_all(&file_dir)
        .await
        .map_err(utils::map_file_err("Failed to create upload directory"))?;

    // Write file
    let mut file =
        fs::File::create(&file_path).await.map_err(utils::map_file_err("Failed to create file"))?;
    file.write_all(data).await.map_err(utils::map_file_err("Failed to write file"))?;
    file.flush().await.map_err(utils::map_file_err("Failed to flush file"))?;
    // info!("File saved: {file_path:?}");

    Ok(Json(FileUploadResponse {
        uuid:      uuid.to_string(),
        success:   true,
        path:      name.to_string(),
        full_path: file_path.to_string_lossy().to_string(),
    }))
}
