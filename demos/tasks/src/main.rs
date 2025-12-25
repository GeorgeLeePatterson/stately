use std::net::SocketAddr;
use std::sync::Arc;

use tasks::{api, state};
use tokio::sync::RwLock;

#[tokio::main]
async fn main() {
    // Bring some derived types into scope
    use api::ResponseEvent;

    // Create channel to listen to entity events
    let (tx, mut rx) = tokio::sync::mpsc::channel(32);

    // Track task metrics
    let metrics = Arc::new(RwLock::new(state::TaskMetrics::default()));

    // Create api state
    let api_state = api::ApiState {
        metrics: Arc::clone(&metrics),
        state:   Arc::new(RwLock::new(state::State::new())),
    };

    // Create app router
    let app = api::router(&api_state, &tx);

    // Create a listener for events to update metrics
    let _handle = tokio::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                ResponseEvent::Created { .. } => metrics.write().await.tasks_created += 1,
                ResponseEvent::Deleted { .. } => metrics.write().await.tasks_removed += 1,
                ResponseEvent::Updated { .. } => { /* Ignore */ }
            }
        }
    });

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    eprintln!("Server running at http://{addr}");

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
    eprintln!("Server exited");
}
