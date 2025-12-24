//! The files in this module are to be used throughout `stately` configuration.
//!
//! TODO:
//!   * Docs - talk about how they aren't entities, but rather entity properties.
//!   * Note how this is the 'read' side of the equation. To get a file from configuration.
use std::path::{Path, PathBuf};

use crate::error::Result;
use crate::settings::{Dirs, UPLOAD_DIR, VERSION_DIR};

/// Wrapper for versioned file paths.
///
/// Represents a logical file name that resolves to the latest UUID-versioned
/// file in a directory (e.g., "config.json" → "uploads/config.json/{latest-uuid}").
#[derive(
    Clone, Debug, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize, utoipa::ToSchema,
)]
#[serde(transparent)]
pub struct VersionedPath(String);

impl VersionedPath {
    /// Creates a new versioned path.
    pub fn new(name: impl Into<String>) -> Self { Self(name.into()) }

    /// Returns the logical name of this versioned path.
    ///
    /// This is the directory name, not the UUID filename.
    pub fn logical(&self) -> &str { &self.0 }

    /// Resolves to the latest UUID-versioned file in the given base directory.
    ///
    /// # Errors
    /// Returns an error if the directory doesn't exist or contains no files.
    pub fn resolve(&self, base_dir: &Path) -> std::io::Result<PathBuf> {
        Self::find_latest(base_dir.join(&self.0).join(VERSION_DIR))
    }

    /// Finds the latest UUID-named file in a directory.
    ///
    /// Files are sorted lexicographically (UUID v7 is time-sortable).
    ///
    /// # Errors
    /// Returns an error if the directory cannot be read or contains no files.
    pub fn find_latest<P: AsRef<Path>>(dir: P) -> std::io::Result<PathBuf> {
        let dir_path = dir.as_ref();
        let mut entries: Vec<_> = std::fs::read_dir(dir_path)?
            .filter_map(std::io::Result::ok)
            .filter(|e| e.path().is_file())
            .collect();

        // UUID v7 is time-sortable lexicographically
        entries.sort_by_key(std::fs::DirEntry::file_name);

        entries.last().map(std::fs::DirEntry::path).ok_or_else(|| {
            std::io::Error::new(
                std::io::ErrorKind::NotFound,
                format!("No files found in directory: {}", dir_path.display()),
            )
        })
    }
}

/// Path relative to an app directory (upload, data, config, or cache).
///
/// Use this type in configuration when you need paths relative to app directories with optional
/// version resolution for uploaded files.
///
/// For paths that are just strings (e.g., user-provided absolute paths or URLs), use `String` or
/// path types directly instead.
#[derive(
    Clone, Debug, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize, utoipa::ToSchema,
)]
#[serde(tag = "dir", content = "path", rename_all = "lowercase")]
pub enum RelativePath {
    /// Path relative to the cache directory
    Cache(String),
    /// Path relative to the data directory (non-versioned files)
    Data(String),
    /// Path to uploaded file with version resolution support (in uploads/ directory)
    Upload(VersionedPath),
}

impl RelativePath {
    /// Resolves the relative path to a full absolute `PathBuf`.
    ///
    /// For `Upload` variant with `VersionedPath`, automatically resolves to the
    /// latest UUID-versioned file in the uploads directory.
    ///
    /// # Errors
    /// Returns an error if:
    /// - The path cannot be resolved
    /// - For versioned paths, if the directory doesn't exist or contains no files
    /// - File system operations fail
    pub fn get(&self, base: Option<&Dirs>) -> std::io::Result<PathBuf> {
        let dirs = base.unwrap_or(Dirs::get());
        match self {
            RelativePath::Cache(path) => Ok(dirs.cache.join(path)),
            RelativePath::Data(path) => Ok(dirs.data.join(path)),
            RelativePath::Upload(versioned) => {
                // Uploaded files are in data/{UPLOAD_DIR}/ with __versions__ subdirectories
                versioned.resolve(&dirs.data.join(UPLOAD_DIR))
            }
        }
    }
}

/// Path that can be either managed by the application or user-defined.
///
/// Use this type when a path could be either:
/// - An uploaded file managed by the app (with version resolution)
/// - A user-provided path on the filesystem
///
/// # Examples
/// ```rust,ignore
/// // Managed: uploads/config.json (resolved to latest UUID)
/// UserDefinedPath::Managed(RelativePath::Data(VersionedPath::new("uploads/config.json")))
///
/// // External: /usr/local/bin/script.sh
/// UserDefinedPath::External("/usr/local/bin/script.sh".to_string())
/// ```
#[derive(
    Clone, Debug, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize, utoipa::ToSchema,
)]
#[serde(untagged)]
pub enum UserDefinedPath {
    /// Application-managed path with optional version resolution
    Managed(RelativePath),
    /// User-provided external path (filesystem path or URL)
    External(String),
}

impl UserDefinedPath {
    /// Resolves the path to a full absolute `PathBuf`.
    ///
    /// For `Managed` paths, uses `RelativePath::get()` with automatic version resolution.
    /// For `External` paths, expands environment variables and tildes, then normalizes.
    ///
    /// # Errors
    /// Returns an error if:
    /// - Path resolution fails
    /// - For managed paths with versioning, if the directory doesn't exist or contains no files
    /// - Environment variable expansion fails
    /// - File system operations fail
    pub fn resolve(&self, base: Option<&Dirs>) -> Result<PathBuf> {
        match self {
            UserDefinedPath::Managed(rel_path) => Ok(rel_path.get(base)?),
            UserDefinedPath::External(path) => {
                let expanded = super::utils::try_env_expand(path)?;
                super::utils::normalize_path_to_cur_dir(expanded)
            }
        }
    }
}
