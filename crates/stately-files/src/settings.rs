//! Directory configuration and constants for file storage.
//!
//! This module defines the directory structure used by stately-files and provides
//! a [`Dirs`] type for configuring cache and data directories.
//!
//! # Directory Structure
//!
//! ```text
//! {data_dir}/
//! └── uploads/
//!     └── {filename}/
//!         └── __versions__/
//!             └── {uuid}
//! ```
//!
//! # Default Paths
//!
//! Default paths are relative to the current working directory:
//! - **Cache**: `.cache`
//! - **Data**: `.data`
//!
//! Override these by providing a custom [`Dirs`] to [`FileState`](crate::state::FileState).

use std::path::PathBuf;
use std::sync::OnceLock;

use super::error::Result;

/// Files to ignore when listing directories.
pub const IGNORE_FILES: &[&str] = &[".DS_Store", ".git", ".env"];

/// Default cache directory path (relative to working directory).
pub const DEFAULT_CACHE_DIR: &str = ".cache";

/// Default data directory path (relative to working directory).
pub const DEFAULT_DATA_DIR: &str = ".data";

/// Subdirectory within data for uploaded files.
pub const UPLOAD_DIR: &str = "uploads";

/// Subdirectory within each uploaded file for version storage.
pub const VERSION_DIR: &str = "__versions__";

/// Global directory configuration.
///
/// Initialized lazily with defaults. Use [`FileState`](crate::state::FileState) to override
/// directories on a per-request basis.
static DIRS: OnceLock<Dirs> = OnceLock::new();

/// Application directory configuration.
///
/// Holds paths to the cache and data directories used by the file management system.
/// The data directory contains the uploads subdirectory where versioned files are stored.
///
/// # Examples
///
/// ```rust
/// use std::path::PathBuf;
/// use stately_files::Dirs;
///
/// // Use defaults
/// let dirs = Dirs::default();
///
/// // Custom directories
/// let dirs = Dirs::new(
///     PathBuf::from("/app/cache"),
///     PathBuf::from("/app/data"),
/// );
/// ```
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
    /// Initializes with defaults on first access. To use custom directories,
    /// pass a [`FileState`](crate::state::FileState) with your [`Dirs`] to the router.
    pub fn get() -> &'static Dirs { DIRS.get_or_init(Dirs::default) }

    /// Initializes the global directory configuration with custom values.
    ///
    /// Must be called before any handlers access [`Dirs::get()`].
    ///
    /// # Errors
    /// - Returns `Err` if already initialized.
    ///
    /// # Examples
    ///
    /// ```rust
    /// use stately_files::Dirs;
    ///
    /// // Call early in application startup
    /// // Dirs::init(Dirs::new("/app/cache".into(), "/app/data".into()));
    /// ```
    pub fn init(dirs: Dirs) -> std::result::Result<(), Dirs> { DIRS.set(dirs) }

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
        Self { cache: PathBuf::from(DEFAULT_CACHE_DIR), data: PathBuf::from(DEFAULT_DATA_DIR) }
    }
}
