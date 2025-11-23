use std::path::PathBuf;
use std::sync::OnceLock;

use super::error::Result;

pub const IGNORE_FILES: &[&str] = &[".DS_Store", ".git", ".env"];

// Default app dirs
pub const DEFAULT_CACHE_PATH: &str = ".stately/cache/xeo4";
pub const DEFAULT_DATA_PATH: &str = ".stately/share/xeo4";

// TODO: Remove - Improve - the idea is to allow the user to set
static DIRS: OnceLock<Dirs> = OnceLock::new();

#[derive(Debug, Clone, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
pub struct Dirs {
    /// Cache directory path
    pub cache: PathBuf,
    /// Data directory path
    pub data:  PathBuf,
}

impl Dirs {
    pub fn new(cache: PathBuf, data: PathBuf) -> Self { Self { cache, data } }

    // TODO: Improve
    pub fn get() -> &'static Dirs { DIRS.get_or_init(Dirs::default) }

    /// Ensure the app's project directories exist
    ///
    /// # Errors
    /// - Returns an error if any of the directories cannot be created
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

// File uploads
pub const UPLOAD_DIR: &str = "uploads";
pub const VERSION_DIR: &str = "__versions__";
