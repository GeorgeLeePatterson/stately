//! Directory configuration and constants for file storage.
//!
//! This module defines the directory structure used by stately-files and provides
//! a [`Dirs`] type for configuring cache and data directories.
//!
//! # Directory Structure
//!
//! ```text
//! {data}/
//! └── uploads/
//!     └── {filename}/
//!         └── __versions__/
//!             └── {uuid}
//! ```
//!
//! # Default Paths
//!
//! - **Cache**: `.stately/cache/xeo4`
//! - **Data**: `.stately/share/xeo4`

use std::path::PathBuf;
use std::sync::OnceLock;

use super::error::Result;

/// Files to ignore when listing directories.
pub const IGNORE_FILES: &[&str] = &[".DS_Store", ".git", ".env"];

/// Default cache directory path.
pub const DEFAULT_CACHE_PATH: &str = ".stately/cache/xeo4";

/// Default data directory path.
pub const DEFAULT_DATA_PATH: &str = ".stately/share/xeo4";

/// Subdirectory within data for uploaded files.
pub const UPLOAD_DIR: &str = "uploads";

/// Subdirectory within each uploaded file for version storage.
pub const VERSION_DIR: &str = "__versions__";

/// Global directory configuration.
///
/// Initialized lazily with defaults. Use [`FileState`](crate::api::FileState) to override
/// directories on a per-request basis.
static DIRS: OnceLock<Dirs> = OnceLock::new();

/// Application directory configuration.
///
/// Holds paths to the cache and data directories used by the file management system.
/// The data directory contains the uploads subdirectory where versioned files are stored.
#[derive(Debug, Clone, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
pub struct Dirs {
    /// Cache directory for temporary files.
    pub cache: PathBuf,
    /// Data directory for persistent storage (includes uploads).
    pub data:  PathBuf,
}

impl Dirs {
    /// Creates a new directory configuration.
    pub fn new(cache: PathBuf, data: PathBuf) -> Self { Self { cache, data } }

    /// Returns the global directory configuration.
    ///
    /// Initializes with defaults on first access.
    pub fn get() -> &'static Dirs { DIRS.get_or_init(Dirs::default) }

    /// Ensures the configured directories exist, creating them if necessary.
    ///
    /// # Errors
    ///
    /// Returns an error if the data directory cannot be created. Cache directory
    /// creation failures are silently ignored.
    pub fn ensure_exists(&self) -> Result<()> {
        let create = |dir: &PathBuf, fail: bool| -> Result<()> {
            match std::fs::create_dir_all(dir) {
                Err(e) if e.kind() == std::io::ErrorKind::AlreadyExists => (),
                Err(e) if fail => Err(e)?,
                _ => (),
            }
            Ok(())
        };
        create(&self.cache, false)?;
        create(&self.data, true)?;
        Ok(())
    }
}

impl Default for Dirs {
    fn default() -> Self {
        let cache = PathBuf::from(DEFAULT_CACHE_PATH);
        let data = PathBuf::from(DEFAULT_DATA_PATH);
        Self { cache, data }
    }
}
