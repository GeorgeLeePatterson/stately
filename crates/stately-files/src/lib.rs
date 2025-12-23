//! File upload, versioning, and download management for stately applications.
//!
//! This crate provides HTTP endpoints and path types for managing files with automatic
//! UUID-based versioning, enabling entities to reference uploaded and stored files.
//!
//! # Features
//!
//! - **File Uploads**: Multipart form and JSON-based uploads with automatic versioning
//! - **File Downloads**: Streaming downloads with content-type detection
//! - **Path Types**: Configuration property types for referencing files in entities
//! - **Version Resolution**: Automatic latest-version resolution for uploaded files
//!
//! # Storage Structure
//!
//! Uploaded files are stored with automatic versioning:
//!
//! ```text
//! {data_dir}/uploads/{filename}/__versions__/{uuid}
//! ```
//!
//! UUID v7 identifiers are time-sortable, so the latest version is the lexicographically
//! largest UUID in the directory.
//!
//! # Path Types
//!
//! Use these types in entity configurations to reference files:
//!
//! - [`path::VersionedPath`]: Logical filename that resolves to latest version
//! - [`path::RelativePath`]: Path relative to cache, data, or uploads directory
//! - [`path::UserDefinedPath`]: Union of managed or external (user-provided) paths
//!
//! # API Endpoints
//!
//! The [`router::router`] function provides these endpoints:
//!
//! | Method | Path | Description |
//! |--------|------|-------------|
//! | `POST` | `/upload` | Upload via multipart form |
//! | `POST` | `/save` | Save from JSON body |
//! | `GET` | `/list` | List files and directories |
//! | `GET` | `/file/cache/{path}` | Download from cache |
//! | `GET` | `/file/data/{path}` | Download from data |
//! | `GET` | `/file/upload/{path}` | Download uploaded file |
//!
//! # Usage
//!
//! ```rust,ignore
//! use axum::Router;
//! use stately_files::{router, state::FileState, settings::Dirs};
//!
//! // Create app state with custom directories
//! let dirs = Dirs::new(
//!     "/app/cache".into(),
//!     "/app/data".into(),
//! );
//!
//! // Mount the files router
//! let app = Router::new()
//!     .nest("/files", router::router(FileState::new(dirs)));
//! ```

pub mod error;
pub mod handlers;
pub mod openapi;
pub mod path;
pub mod request;
pub mod response;
pub mod router;
pub mod settings;
pub mod state;
pub mod utils;

// Re-export commonly used types at crate root
pub use openapi::OpenApiDoc;
pub use path::{RelativePath, UserDefinedPath, VersionedPath};
pub use request::{FileDownloadQuery, FileListQuery, FileSaveRequest};
pub use response::{FileEntryType, FileInfo, FileListResponse, FileUploadResponse, FileVersion};
pub use settings::Dirs;
pub use state::FileState;
