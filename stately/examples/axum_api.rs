#![expect(unused_crate_dependencies)]
//! Example demonstrating the axum API generation feature with all collection syntax permutations

// Test entities
#[stately::entity]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct Pipeline {
    pub name:        String,
    pub description: Option<String>,
}

#[stately::entity]
#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct Source {
    pub name: String,
    pub url:  String,
}

#[stately::entity]
#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct Sink {
    pub name:        String,
    pub destination: String,
}

#[stately::entity(singleton, description = "Global configuration")]
#[derive(Debug, Clone, Copy, PartialEq, serde::Serialize, serde::Deserialize, Default)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct Config {
    pub max_connections: usize,
    pub timeout_seconds: u64,
}

// Additional entities for demonstrating collection syntax variations
#[stately::entity]
#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct Task {
    pub name:   String,
    pub status: String,
}

#[stately::entity]
#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct Job {
    pub name:     String,
    pub priority: u32,
}

// Type alias for custom StateCollection demonstration
type TaskCache = stately::Collection<Task>;

// Test state demonstrating all collection syntax permutations
#[stately::state]
pub struct State {
    // Singleton
    #[singleton]
    pub config:     Config,
    // Case 1: Implicit collection (no attribute)
    pub pipelines:  Pipeline,
    // Case 2: Explicit collection (same as case 1, with variant to avoid collision)
    #[collection(variant = "ExplicitSource")]
    pub sources:    Source,
    // Case 3: Custom StateCollection type (using type alias)
    #[collection(TaskCache, variant = "CachedTask")]
    pub tasks:      Task,
    // Case 4: Variant override only (reusing Pipeline entity)
    #[collection(variant = "ArchivedPipeline")]
    pub archived:   Pipeline,
    // Case 5: Custom type + variant override (reusing Task entity and TaskCache type)
    #[collection(TaskCache, variant = "BackgroundTask")]
    pub background: Task,
    // Keep existing fields for backward compatibility with existing tests
    pub sinks:      Sink,
    pub jobs:       Job,
}

#[stately::axum_api(State)]
pub struct AppState {}

#[tokio::main]
async fn main() {
    // Create the state
    let state = State::new();

    // Create the app state wrapper
    let app_state = AppState::new(state);

    // Get the router from the generated api module
    let _app: axum::Router = axum::Router::new()
        .nest("/api/v1/entity", api::router(app_state.clone()))
        .with_state(app_state);

    println!("✓ Axum router created successfully!");
    println!("✓ Available routes:");
    println!("  GET  /api/v1/entity/list");
    println!("  GET  /api/v1/entity/list/:type");
    println!("  GET  /api/v1/entity/search/:needle");
    println!("  GET  /api/v1/entity/:id?type=<type>");

    // Print OpenAPI info
    #[cfg(feature = "openapi")]
    {
        use utoipa::OpenApi;
        let api_doc = api::ApiDoc::openapi();
        println!("\n✓ OpenAPI documentation generated!");
        println!("  Paths: {}", api_doc.paths.paths.len());
        println!("  Components: {}", api_doc.components.as_ref().map_or(0, |c| c.schemas.len()));
    }

    println!("\n✓ Example completed successfully!");
}
