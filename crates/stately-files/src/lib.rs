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
//! data/uploads/{filename}/__versions__/{uuid}
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
//! | `GET` | `/file/cache/*path` | Download from cache |
//! | `GET` | `/file/data/*path` | Download from data |
//! | `GET` | `/file/upload/*path` | Download uploaded file |

pub mod api;
pub mod error;
pub mod handlers;
pub mod path;
pub mod router;
pub mod settings;
pub mod types;
pub mod utils;
