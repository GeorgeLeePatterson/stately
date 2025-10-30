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

#[stately::state(api = ["axum"])]
pub struct AppState {
    pipelines: Pipeline,
    sources:   Source,
}


#[tokio::main]
async fn main() {
    use std::sync::Arc;

    use tokio::sync::RwLock;

    // Create the state
    let state = Arc::new(RwLock::new(AppState::new()));

    // Create the axum state wrapper from the generated module
    let axum_state = axum_api::StatelyState::new(state.clone());

    // Get the router from the generated module
    let app: axum::Router =
        axum::Router::new().nest("/api/v1/entity", axum_api::router()).with_state(axum_state);

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
        let api_doc = axum_api::ApiDoc::openapi();
        println!("\n✓ OpenAPI documentation generated!");
        println!("  Paths: {}", api_doc.paths.paths.len());
        println!(
            "  Components: {}",
            api_doc.components.as_ref().map(|c| c.schemas.len()).unwrap_or(0)
        );
    }

    println!("\n✓ Example completed successfully!");
}
