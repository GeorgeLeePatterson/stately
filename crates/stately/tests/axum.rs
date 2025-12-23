#![expect(unused_crate_dependencies)]
// NOTE: This is a lint issue in the `utoipa` crate.
#![cfg_attr(feature = "openapi", allow(clippy::needless_for_each))]

use axum::body::Body;
use axum::response::Response;
use utoipa::OpenApi;

// Test entities
#[stately::entity]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct Pipeline {
    name:        String,
    description: Option<String>,
}

#[stately::entity]
#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct Source {
    name: String,
    url:  String,
}

#[stately::entity]
#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct Sink {
    name:        String,
    destination: String,
}

#[stately::entity(singleton, description = "Global configuration")]
#[derive(Debug, Clone, Copy, PartialEq, serde::Serialize, serde::Deserialize, Default)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct Config {
    max_connections: usize,
    timeout_seconds: u64,
}

// Additional entities for demonstrating collection syntax variations
#[stately::entity]
#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct Task {
    name:   String,
    status: String,
}

#[stately::entity]
#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct Job {
    name:     String,
    priority: u32,
}

// Type alias for custom StateCollection demonstration
type TaskCache = stately::Collection<Task>;

// Test state demonstrating all collection syntax permutations
#[stately::state(openapi)]
pub struct State {
    // Singleton
    #[singleton]
    config:     Config,
    // Case 1: Implicit collection (no attribute)
    pipelines:  Pipeline,
    // Case 2: Explicit collection (same as case 1, with variant to avoid collision)
    #[collection(variant = "ExplicitSource")]
    sources:    Source,
    // Case 3: Custom StateCollection type (using type alias)
    #[collection(TaskCache, variant = "CachedTask")]
    tasks:      Task,
    // Case 4: Variant override only (reusing Pipeline entity)
    #[collection(variant = "ArchivedPipeline")]
    archived:   Pipeline,
    // Case 5: Custom type + variant override (reusing Task entity and TaskCache type)
    #[collection(TaskCache, variant = "BackgroundTask")]
    background: Task,
    // Keep existing fields for backward compatibility with existing tests
    sinks:      Sink,
    jobs:       Job,
}

#[stately::axum_api(
    State,
    openapi(components = [
        link_aliases::PipelineLink,
        link_aliases::SourceLink,
        link_aliases::SinkLink
    ])
)]
pub struct AppState {}

// Helper function to deserialize a response
async fn response_body<T: serde::de::DeserializeOwned>(response: Response<Body>) -> T {
    let body = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let result: T = serde_json::from_slice(&body).unwrap();
    result
}

#[tokio::test]
async fn test_openapi_generation() {
    let api_doc = AppState::openapi();
    assert!(!api_doc.paths.paths.is_empty());
    assert!(api_doc.components.as_ref().map_or(0, |c| c.schemas.len()) > 0);
}

#[tokio::test]
async fn test_create_entity() {
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use tower::ServiceExt;

    let app_state = AppState::new(State::new());
    let app = axum::Router::new()
        .nest("/api/v1/entity", AppState::router(app_state.clone()))
        .with_state(app_state);

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

    let result = response_body::<OperationResponse>(response).await;
    assert!(result.id.is_uuid());
}

#[tokio::test]
async fn test_get_entities() {
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use tower::ServiceExt;

    let app_state = AppState::new(State::new());

    // Add a pipeline directly to state
    {
        let mut s = app_state.state.write().await;
        let pipeline = Pipeline {
            name:        "filtered-pipeline".to_string(),
            description: Some("Test".to_string()),
        };
        drop(s.create_entity(Entity::Pipeline(pipeline)));
    }

    let app = axum::Router::new()
        .nest("/api/v1/entity", AppState::router(app_state.clone()))
        .with_state(app_state);

    // Get all entities
    let request =
        Request::builder().method("GET").uri("/api/v1/entity").body(Body::empty()).unwrap();

    let response = app.clone().oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);

    // NOTE: EntitiesResponse is optimized for the UI. To Deserialize, use EntitiesMap directly.
    let result = response_body::<EntitiesMap>(response).await;
    assert!(result.entities.get(&StateEntry::Pipeline).unwrap().len() == 1);
}

#[tokio::test]
async fn test_list_entities() {
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use tower::ServiceExt;

    let app_state = AppState::new(State::new());

    // Add a pipeline directly to state
    {
        let mut s = app_state.state.write().await;
        let pipeline = Pipeline {
            name:        "filtered-pipeline".to_string(),
            description: Some("Test".to_string()),
        };
        drop(s.create_entity(Entity::Pipeline(pipeline)));
    }

    // Add a sink directly to state
    {
        let mut s = app_state.state.write().await;
        let sink =
            Sink { name: "filtered-pipeline".to_string(), destination: "Test".to_string() };
        drop(s.create_entity(Entity::Sink(sink)));
    }

    let app = axum::Router::new()
        .nest("/api/v1/entity", AppState::router(app_state.clone()))
        .with_state(app_state);

    // Get all entity summaries
    let request =
        Request::builder().method("GET").uri("/api/v1/entity/list").body(Body::empty()).unwrap();

    let response = app.clone().oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);

    let result = response_body::<ListResponse>(response).await;
    assert!(result.entities.get(&StateEntry::Pipeline).unwrap().len() == 1);

    // Get sink summaries
    let request = Request::builder()
        .method("GET")
        .uri("/api/v1/entity/list/sink")
        .body(Body::empty())
        .unwrap();

    let response = app.clone().oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);

    let result = response_body::<ListResponse>(response).await;
    assert!(result.entities.get(&StateEntry::Pipeline).is_none());
    assert!(result.entities.get(&StateEntry::Sink).unwrap().len() == 1);
}

#[tokio::test]
async fn test_event_middleware() {
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use tokio::sync::mpsc;
    use tower::ServiceExt;

    let (event_tx, mut event_rx) = mpsc::channel(100);

    let app_state = AppState::new(State::new());

    let app = axum::Router::new()
        .nest("/api/v1/entity", AppState::router(app_state.clone()))
        .layer(axum::middleware::from_fn(AppState::event_middleware::<ResponseEvent>(event_tx)))
        .with_state(app_state);

    // Test 1: Create entity - should emit Created event
    let pipeline = Entity::Pipeline(Pipeline {
        name:        "event-test-pipeline".to_string(),
        description: Some("Testing events".to_string()),
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
    let result: OperationResponse = serde_json::from_slice(&body).unwrap();
    let created_id = result.id.clone();

    // Verify Created event was emitted
    let event = event_rx.recv().await.expect("Should receive Created event");
    match event {
        ResponseEvent::Created { id, entity } => {
            assert_eq!(id, created_id);
            match entity {
                Entity::Pipeline(p) => {
                    assert_eq!(p.name, "event-test-pipeline");
                }
                _ => panic!("Expected Pipeline entity"),
            }
        }
        _ => panic!("Expected Created event, got {event:?}"),
    }

    // Test 2: Update entity - should emit Updated event
    let updated_pipeline = Entity::Pipeline(Pipeline {
        name:        "event-test-pipeline-updated".to_string(),
        description: Some("Updated description".to_string()),
    });

    let request = Request::builder()
        .method("POST")
        .uri(format!("/api/v1/entity/{created_id}"))
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_string(&updated_pipeline).unwrap()))
        .unwrap();

    let response = app.clone().oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);

    // Verify Updated event was emitted
    let event = event_rx.recv().await.expect("Should receive Updated event");
    match event {
        ResponseEvent::Updated { id, entity } => {
            assert_eq!(id, created_id);
            match entity {
                Entity::Pipeline(p) => {
                    assert_eq!(p.name, "event-test-pipeline-updated");
                }
                _ => panic!("Expected Pipeline entity"),
            }
        }
        _ => panic!("Expected Updated event, got {event:?}"),
    }

    // Test 3: Delete entity - should emit Deleted event
    let request = Request::builder()
        .method("DELETE")
        .uri(format!("/api/v1/entity/pipeline/{created_id}"))
        .body(Body::empty())
        .unwrap();

    let response = app.clone().oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);

    // Verify Deleted event was emitted
    let event = event_rx.recv().await.expect("Should receive Deleted event");
    match event {
        ResponseEvent::Deleted { id, entry } => {
            assert_eq!(id, created_id);
            assert_eq!(entry, StateEntry::Pipeline);
        }
        _ => panic!("Expected Deleted event, got {event:?}"),
    }

    // Verify no more events
    assert!(event_rx.try_recv().is_err(), "Should have no more events");
}

#[tokio::test]
async fn test_get_entity_by_id() {
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use tower::ServiceExt;

    let app_state = AppState::new(State::new());

    // Create a pipeline and get its ID
    let id = {
        let mut s = app_state.state.write().await;
        let pipeline = Pipeline {
            name:        "get-test-pipeline".to_string(),
            description: Some("Test".to_string()),
        };
        s.create_entity(Entity::Pipeline(pipeline))
    };

    let app = axum::Router::new()
        .nest("/api/v1/entity", AppState::router(app_state.clone()))
        .with_state(app_state);

    // Get entity by ID - need to specify type
    let request = Request::builder()
        .method("GET")
        .uri(format!("/api/v1/entity/{id}?type=pipeline"))
        .body(Body::empty())
        .unwrap();

    let response = app.clone().oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let result: GetEntityResponse = serde_json::from_slice(&body).unwrap();
    // Verify we got an entity back
    assert_eq!(result.id, id);
    match result.entity {
        Entity::Pipeline(p) => {
            assert_eq!(p.name, "get-test-pipeline");
        }
        _ => panic!("Expected Pipeline entity"),
    }
}

#[tokio::test]
async fn test_update_entity() {
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use tower::ServiceExt;

    let app_state = AppState::new(State::new());

    // Create a pipeline
    let id = {
        let mut s = app_state.state.write().await;
        let pipeline = Pipeline {
            name:        "update-test".to_string(),
            description: Some("Original".to_string()),
        };
        s.create_entity(Entity::Pipeline(pipeline))
    };

    let app = axum::Router::new()
        .nest("/api/v1/entity", AppState::router(app_state.clone()))
        .with_state(app_state);

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
    let result: OperationResponse = serde_json::from_slice(&body).unwrap();
    assert_eq!(result.id, id);
}

#[tokio::test]
async fn test_delete_entity() {
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use tower::ServiceExt;

    let app_state = AppState::new(State::new());

    // Create a pipeline
    let id = {
        let mut s = app_state.state.write().await;
        let pipeline = Pipeline {
            name:        "delete-test".to_string(),
            description: Some("Will be deleted".to_string()),
        };
        s.create_entity(Entity::Pipeline(pipeline))
    };

    let app = axum::Router::new()
        .nest("/api/v1/entity", AppState::router(app_state.clone()))
        .with_state(app_state);

    // Delete the pipeline
    let request = Request::builder()
        .method("DELETE")
        .uri(format!("/api/v1/entity/pipeline/{id}"))
        .body(Body::empty())
        .unwrap();

    let response = app.clone().oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);
}
