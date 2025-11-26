use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};

pub type Result<T, E = Error> = std::result::Result<T, E>;

#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[error("Internal error: {0}")]
    Internal(String),

    #[error("Connection not found: {0}")]
    ConnectionNotFound(String),

    #[error("Unsupported connector type: {0}")]
    UnsupportedConnector(String),

    #[error("Session action unsupported: {0}")]
    UnsupportedSessionAction(String),

    #[error("DataFusion error: {0}")]
    DataFusion(#[from] datafusion::error::DataFusionError),

    #[error("Arrow error: {0}")]
    Arrow(#[from] arrow::error::ArrowError),

    #[cfg(feature = "object-store")]
    #[error("Object store error: {0}")]
    ObjectStore(#[from] object_store::Error),

    #[cfg(feature = "object-store")]
    #[error("Object store error during create: {0}")]
    ObjectStoreCreate(String),

    #[cfg(feature = "clickhouse")]
    #[error("ClickHouse DataFusion error: {0}")]
    ClickHouseDatafusion(datafusion::error::DataFusionError),

    #[cfg(feature = "clickhouse")]
    #[error("ClickHouse Arrow error: {0}")]
    ClickHouseArrow(#[from] clickhouse_datafusion::prelude::clickhouse_arrow::Error),
}

impl IntoResponse for Error {
    fn into_response(self) -> Response {
        let (status, message) = match &self {
            Error::ConnectionNotFound(_) => (StatusCode::NOT_FOUND, self.to_string()),
            Error::UnsupportedSessionAction(_)
            | Error::UnsupportedConnector(_)
            | Error::DataFusion(_) => (StatusCode::BAD_REQUEST, self.to_string()),
            #[cfg(feature = "object-store")]
            Error::ObjectStore(_) | Error::ObjectStoreCreate(_) => {
                (StatusCode::BAD_REQUEST, self.to_string())
            }
            #[cfg(feature = "clickhouse")]
            Error::ClickHouseDatafusion(_) => (StatusCode::BAD_REQUEST, self.to_string()),
            #[cfg(feature = "clickhouse")]
            Error::ClickHouseArrow(_) => (StatusCode::BAD_REQUEST, self.to_string()),
            Error::Arrow(_) | Error::Internal(_) => {
                (StatusCode::INTERNAL_SERVER_ERROR, self.to_string())
            }
        };

        let body = serde_json::json!({
            "error": message,
            "status": status.as_u16()
        });

        (status, axum::Json(body)).into_response()
    }
}
