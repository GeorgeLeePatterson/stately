#![expect(clippy::needless_for_each)]
use std::net::SocketAddr;

use axum::Router;
use serde::{Deserialize, Serialize};
use tower_http::cors::{Any, CorsLayer};

/// Example entity
///
/// Doc comments appear as descriptions in the UI. Only the first line is used as the description,
/// any additional doc comments will not be displayed on the UI.
#[stately::entity]
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, utoipa::ToSchema)]
pub struct Example {
    /// Example name
    pub name:  String,
    /// Example count
    pub count: usize,
}

#[stately::state(openapi)]
#[derive(Debug, Clone)]
pub struct State {
    examples: Example,
}

#[stately::axum_api(State, openapi(components = [Example]))]
#[derive(Clone)]
pub struct ApiState {}

#[tokio::main]
async fn main() {
    // ...Binary being run in codegen mode
    if let Some(output_dir) = std::env::args().nth(1) {
        let path = stately::codegen::generate_openapi::<ApiState>(&output_dir).unwrap();
        println!("OpenAPI spec written to {}", path.display());
        std::process::exit(0);
    }

    // ...Binary being run in api mode

    // Initialize state
    let mut state = State::new();

    // Create entity
    let entity_id =
        state.create_entity(Entity::Example(Example { name: "test".to_string(), count: 0 }));
    println!("Stately entity created successfully: {entity_id}");

    // Create and initialize api state
    let api_state = ApiState::new(state);

    // Create api routes, nesting stately under `/api/entity`
    let app = Router::new()
        .nest("/api/entity", ApiState::router::<ApiState>(api_state.clone()))
        .layer(CorsLayer::new().allow_headers(Any).allow_methods(Any).allow_origin(Any))
        .with_state(api_state);

    // Start axum server
    let addr = SocketAddr::from(([0, 0, 0, 0], 4000));
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    eprintln!("Server running at http://{addr}");

    axum::serve(listener, app).await.unwrap();
    println!("Server exiting!");

    std::process::exit(0);
}
