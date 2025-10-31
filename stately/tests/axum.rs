#![expect(unused_crate_dependencies)]
use utoipa::OpenApi;

#[stately::entity]
#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize, Default)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct Pipeline {
    pub name:        String,
    pub description: Option<String>,
}

#[stately::entity]
#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize, Default)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct Source {
    pub name: String,
    pub url:  String,
}

#[stately::state(api = ["axum"])]
pub struct AppState {
    pipelines: Pipeline,
    sources:   Source,
}

#[tokio::test]
async fn test_axum() {
    use std::sync::Arc;

    use tokio::sync::RwLock;

    // Create the state
    let state = Arc::new(RwLock::new(AppState::new()));

    // Create the axum state wrapper from the generated module
    let axum_state = axum_api::StatelyState::new(Arc::clone(&state));

    // Get the router from the generated module
    let _app: axum::Router =
        axum::Router::new().nest("/api/v1/entity", axum_api::router()).with_state(axum_state);

    let api_doc = axum_api::ApiDoc::openapi();
    assert!(!api_doc.paths.paths.is_empty());
    assert!(api_doc.components.as_ref().map_or(0, |c| c.schemas.len()) > 0);
}
