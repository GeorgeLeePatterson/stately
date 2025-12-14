//! Application state for file management handlers.

use serde::{Deserialize, Serialize};

use crate::settings::Dirs;

/// State extracted by file handlers to access directory configuration.
///
/// Use with axum's `FromRef` to extract from your application state:
///
/// ```rust,ignore
/// use axum::extract::FromRef;
/// use stately_files::state::FileState;
///
/// #[derive(Clone)]
/// struct AppState {
///     dirs: Dirs,
///     // ... other fields
/// }
///
/// impl FromRef<AppState> for FileState {
///     fn from_ref(state: &AppState) -> Self {
///         FileState { base: Some(state.dirs.clone()) }
///     }
/// }
/// ```
#[derive(Debug, Clone, PartialEq, Hash, Serialize, Deserialize)]
pub struct FileState {
    /// Optional directory configuration override.
    /// If `None`, handlers use the global [`Dirs::get()`](crate::settings::Dirs::get) defaults.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub base: Option<Dirs>,
}

impl FileState {
    /// Creates a new `FileState` with custom directory configuration.
    pub fn new(dirs: Dirs) -> Self { Self { base: Some(dirs) } }

    /// Creates a `FileState` that uses global defaults.
    pub fn default_dirs() -> Self { Self { base: None } }
}

impl Default for FileState {
    fn default() -> Self { Self::default_dirs() }
}
