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

#[stately::state]
pub struct State {
    pipelines: Pipeline,
    sources:   Source,
}

#[stately::axum_api]
pub struct AppState {
    state: StatelyState,
}

#[tokio::test]
async fn test_openapi_generation() {
    let api_doc = api::ApiDoc::openapi();
    assert!(!api_doc.paths.paths.is_empty());
    assert!(api_doc.components.as_ref().map_or(0, |c| c.schemas.len()) > 0);
}

#[tokio::test]
async fn test_create_entity() {
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use tower::ServiceExt;

    let stately_state = StatelyState::new(State::new());
    let app = axum::Router::new().nest("/api/v1/entity", api::router()).with_state(stately_state);

    // Create a pipeline
    let pipeline = Entity::Pipeline(Pipeline {
        name:        "test-pipeline".to_string(),
        description: Some("Test pipeline description".to_string()),
    });

    let request = Request::builder()
        .method("PUT")
        .uri("/api/v1/entity")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_string(&pipeline).unwrap()))
        .unwrap();

    let response = app.clone().oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let result: api::OperationResponse = serde_json::from_slice(&body).unwrap();
    assert!(result.id.is_uuid());
}

#[tokio::test]
async fn test_list_entities() {
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use tower::ServiceExt;

    let stately_state = StatelyState::new(State::new());

    // Add a pipeline directly to state
    {
        let mut s = stately_state.state.write().await;
        let pipeline = Pipeline {
            name:        "filtered-pipeline".to_string(),
            description: Some("Test".to_string()),
        };
        drop(s.create_entity(Entity::Pipeline(pipeline)).unwrap());
    }

    let app = axum::Router::new().nest("/api/v1/entity", api::router()).with_state(stately_state);

    // Get all entities
    let request =
        Request::builder().method("GET").uri("/api/v1/entity").body(Body::empty()).unwrap();

    let response = app.clone().oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);
}

#[tokio::test]
async fn test_get_entity_by_id() {
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use tower::ServiceExt;

    let stately_state = StatelyState::new(State::new());

    // Create a pipeline and get its ID
    let id = {
        let mut s = stately_state.state.write().await;
        let pipeline = Pipeline {
            name:        "get-test-pipeline".to_string(),
            description: Some("Test".to_string()),
        };
        let (id, _) = s.create_entity(Entity::Pipeline(pipeline)).unwrap();
        id
    };

    let app = axum::Router::new().nest("/api/v1/entity", api::router()).with_state(stately_state);

    // Get entity by ID - need to specify type
    let request = Request::builder()
        .method("GET")
        .uri(format!("/api/v1/entity/{id}?type=pipeline"))
        .body(Body::empty())
        .unwrap();

    let response = app.clone().oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let result: Entity = serde_json::from_slice(&body).unwrap();
    // Verify we got an entity back
    match result {
        Entity::Pipeline(p) => {
            assert_eq!(p.name, "get-test-pipeline");
        }
        Entity::Source(_) => panic!("Expected Pipeline entity"),
    }
}

#[tokio::test]
async fn test_update_entity() {
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use tower::ServiceExt;

    let stately_state = StatelyState::new(State::new());

    // Create a pipeline
    let id = {
        let mut s = stately_state.state.write().await;
        let pipeline = Pipeline {
            name:        "update-test".to_string(),
            description: Some("Original".to_string()),
        };
        let (id, _) = s.create_entity(Entity::Pipeline(pipeline)).unwrap();
        id
    };

    let app = axum::Router::new().nest("/api/v1/entity", api::router()).with_state(stately_state);

    // Update the pipeline
    let updated_pipeline = Entity::Pipeline(Pipeline {
        name:        "update-test-updated".to_string(),
        description: Some("Updated description".to_string()),
    });

    let request = Request::builder()
        .method("POST")
        .uri(format!("/api/v1/entity/{id}"))
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_string(&updated_pipeline).unwrap()))
        .unwrap();

    let response = app.clone().oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let result: api::OperationResponse = serde_json::from_slice(&body).unwrap();
    assert_eq!(result.id, id);
}

#[tokio::test]
async fn test_delete_entity() {
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use tower::ServiceExt;

    let stately_state = StatelyState::new(State::new());

    // Create a pipeline
    let id = {
        let mut s = stately_state.state.write().await;
        let pipeline = Pipeline {
            name:        "delete-test".to_string(),
            description: Some("Will be deleted".to_string()),
        };
        let (id, _) = s.create_entity(Entity::Pipeline(pipeline)).unwrap();
        id
    };

    let app = axum::Router::new().nest("/api/v1/entity", api::router()).with_state(stately_state);

    // Delete the pipeline
    let request = Request::builder()
        .method("DELETE")
        .uri(format!("/api/v1/entity/pipeline/{id}"))
        .body(Body::empty())
        .unwrap();

    let response = app.clone().oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);
}
