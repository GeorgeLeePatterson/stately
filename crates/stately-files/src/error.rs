pub type Result<T> = std::result::Result<T, Error>;

#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Env(#[from] shellexpand::LookupError<std::env::VarError>),
    #[error("Api error: {0}")]
    Internal(String),
    #[error("Bad request: {0}")]
    BadRequest(String),
    #[error("Not found: {0}")]
    NotFound(String),
}

impl axum::response::IntoResponse for Error {
    fn into_response(self) -> axum::response::Response {
        let (status, message) = match &self {
            Error::NotFound(msg) => (axum::http::StatusCode::NOT_FOUND, msg.clone()),
            Error::BadRequest(msg) => (axum::http::StatusCode::BAD_REQUEST, msg.clone()),
            _ => (axum::http::StatusCode::INTERNAL_SERVER_ERROR, self.to_string()),
        };
        let body = axum::Json(serde_json::json!({
            "error": message,
            "status": status.as_u16()
        }));
        (status, body).into_response()
    }
}
