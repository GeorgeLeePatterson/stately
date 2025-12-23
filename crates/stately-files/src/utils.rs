use std::path::{Path, PathBuf};

use uuid::Uuid;

use super::error::{Error, Result};
use crate::settings::{Dirs, UPLOAD_DIR, VERSION_DIR};

/// Create directory structure: `uploads/{name}/__versions__/{uuid}`
pub fn create_versioned_filepath(name: &str, base: Option<&Dirs>) -> (Uuid, PathBuf, PathBuf) {
    let uuid = Uuid::now_v7();
    let file_dir = base.unwrap_or(Dirs::get()).data.join(UPLOAD_DIR).join(name).join(VERSION_DIR);
    let file_path = file_dir.join(uuid.to_string());
    (uuid, file_dir, file_path)
}

/// Sanitize filename to prevent path traversal attacks while preserving directory structure
///
/// Allows forward slashes for nested paths but filters out:
/// - Null bytes
/// - Empty segments
/// - Parent directory references (..)
/// - Backslashes (converts to forward slash for consistency)
pub fn sanitize_filename(name: &str) -> String {
    // First normalize backslashes to forward slashes
    let normalized = name.replace('\\', "/");

    // Split on forward slashes, filter dangerous parts, and rejoin
    normalized
        .split('/')
        .filter(|s| !s.is_empty() && *s != ".." && !s.contains('\0'))
        .collect::<Vec<_>>()
        .join("/")
}

/// Sanitize path to prevent path traversal
pub fn sanitize_path(path: &str) -> PathBuf {
    path.split('/').filter(|s| !s.is_empty() && *s != "..").collect::<PathBuf>()
}

/// Extract creation timestamp from metadata
pub fn get_created_time(metadata: &std::fs::Metadata) -> Option<u64> {
    metadata
        .created()
        .ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs())
}

/// Extract creation timestamp from metadata
pub fn get_modified_time(metadata: &std::fs::Metadata) -> Option<u64> {
    metadata
        .modified()
        .ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs())
}

/// Helper function to normalize relative paths to current directory
///
/// # Errors
/// - Returns an error if the current directory cannot be determined
pub fn normalize_path_to_cur_dir<P: AsRef<Path>>(path: P) -> Result<PathBuf> {
    Ok(if path.as_ref().is_relative() {
        std::env::current_dir().map(|c| c.join(path.as_ref()))?
    } else {
        path.as_ref().to_path_buf()
    })
}

/// Helper function to expand env variables and tildes in a path string
///
/// # Errors
/// - Returns an error if the path is not file, returns Ok if the path is a directory.
pub fn try_env_expand<P: AsRef<str>>(path: P) -> Result<PathBuf> {
    Ok(PathBuf::from(shellexpand::tilde(&shellexpand::env(&path)?).as_ref()))
}

/// Simple helper to map file errors
pub fn map_file_err(msg: &str) -> impl FnOnce(std::io::Error) -> Error {
    move |err: std::io::Error| Error::Internal(format!("{msg}: {err}"))
}
