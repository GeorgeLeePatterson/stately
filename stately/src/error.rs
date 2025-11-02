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

    /// Entity not found
    #[error("Illegal Operation: {0}")]
    IllegalOperation(String),

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

#[cfg(feature = "axum")]
mod axum_impl {
    use axum::Json;
    use axum::http::StatusCode;
    use axum::response::{IntoResponse, Response};
    use serde_json::json;

    use super::*;

    impl IntoResponse for Error {
        fn into_response(self) -> Response {
            let (status, message) = match &self {
                Error::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
                Error::IllegalOperation(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
                _ => (StatusCode::INTERNAL_SERVER_ERROR, self.to_string()),
            };
            let body = Json(json!({
                "error": message,
                "status": status.as_u16()
            }));
            (status, body).into_response()
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[tokio::test]
        async fn test_error_into_response() {
            let error = Error::NotFound("Not found".to_string());
            let response = error.into_response();
            assert_eq!(response.status(), StatusCode::NOT_FOUND);
            let body = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
            let body: serde_json::Value = serde_json::from_reader(&*body).unwrap();
            assert_eq!(body["error"], "Not found");
            assert_eq!(body["status"], 404);
        }
    }
}
