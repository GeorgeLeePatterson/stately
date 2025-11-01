#![expect(unused_crate_dependencies)]
//! Example demonstrating the axum API generation feature

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

#[tokio::main]
async fn main() {
    // Create the state
    let state = State::new();

    // Create the axum state wrapper
    let stately_state = StatelyState::new(state);

    // Get the router from the generated api module
    let _app: axum::Router =
        axum::Router::new().nest("/api/v1/entity", api::router()).with_state(stately_state);

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
