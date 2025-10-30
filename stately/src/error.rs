//! Error types for stately

use thiserror::Error;

/// Result type for stately operations
pub type Result<T> = std::result::Result<T, Error>;

/// Errors that can occur in stately operations
#[derive(Debug, Error)]
pub enum Error {
    /// Entity not found
    #[error("Entity not found: {0}")]
    NotFound(String),

    /// Entity already exists
    #[error("Entity already exists: {0}")]
    AlreadyExists(String),

    /// Serialization error
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    /// Invalid entity type
    #[error("Invalid entity type: {0}")]
    InvalidEntityType(String),

    /// Link resolution failed
    #[error("Failed to resolve link: {0}")]
    LinkResolution(String),

    /// Generic error
    #[error("{0}")]
    Generic(String),
}
