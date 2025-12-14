//! Application state for stately-arrow API handlers.

use datafusion::prelude::SessionContext;

use crate::{QueryContext, QuerySession};

/// State required by the API handlers.
///
/// Wraps a [`QueryContext`] and can be extracted from your application state
/// using axum's `FromRef` pattern.
///
/// # Example
///
/// ```rust,ignore
/// use axum::extract::FromRef;
/// use stately_arrow::{QueryContext, QuerySession, QueryState};
///
/// #[derive(Clone)]
/// pub struct AppState {
///     pub query_context: QueryContext<MySession>,
///     pub other_field: String,
/// }
///
/// impl FromRef<AppState> for QueryState<MySession> {
///     fn from_ref(state: &AppState) -> Self {
///         Self::new(state.query_context.clone())
///     }
/// }
/// ```
#[derive(Clone)]
pub struct QueryState<S = SessionContext>
where
    S: QuerySession,
{
    /// The query context containing session and registry.
    pub query_context: QueryContext<S>,
}

impl<S> QueryState<S>
where
    S: QuerySession,
{
    /// Create a new `QueryState` from a `QueryContext`.
    pub fn new(query_context: QueryContext<S>) -> Self { Self { query_context } }
}
