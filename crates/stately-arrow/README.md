# Stately Arrow

Arrow-based data connectivity and query execution over HTTP APIs. This crate provides a flexible
abstraction layer over DataFusion for building data query services with support for multiple
backend connectors.

## Features

- **Connector Registry** - Manage multiple data source connections (object stores, databases)
- **Query Execution** - Execute SQL queries via DataFusion with Arrow IPC streaming responses
- **Axum Integration** - Ready-to-use HTTP handlers with OpenAPI documentation
- **Extensible Backends** - Implement custom connectors via the `Backend` trait

## Feature Flags

| Feature | Description |
|---------|-------------|
| `object-store` | S3, GCS, Azure, and local filesystem support |
| `database` | Base database connector types |
| `clickhouse` | ClickHouse database backend (enables `database`) |
| `registry` | Generic registry implementation with stately integration (enables `object-store`) |

## Usage

### Custom Registry Implementation

For full control, implement the `ConnectorRegistry` trait directly:

```rust,ignore
use std::sync::Arc;
use async_trait::async_trait;
use stately_arrow::{ConnectorRegistry, Backend, ConnectionMetadata, Result};

pub struct MyRegistry { /* ... */ }

#[async_trait]
impl ConnectorRegistry for MyRegistry {
    async fn get(&self, id: &str) -> Result<Arc<dyn Backend>> {
        // Return a backend for the given connector ID
    }

    async fn list(&self) -> Result<Vec<ConnectionMetadata>> {
        // List all available connectors
    }

    async fn registered(&self) -> Result<Vec<ConnectionMetadata>> {
        // List currently registered/cached connectors
    }
}
```

### Generic Registry (with `registry` feature)

For simpler setups using stately state management, use the provided generic registry:

```rust,ignore
use std::sync::Arc;
use tokio::sync::RwLock;
use stately_arrow::registry::generic::{Connector, Connectors, Registry, RegistryOptions};

// Define your state with a connectors collection
#[stately::state]
pub struct AppState {
    pub connectors: Connector,
    // ... other fields
}

// Implement the Connectors trait
impl Connectors for AppState {
    fn iter(&self) -> impl Iterator<Item = (&str, &Connector)> {
        self.connectors.iter().map(|(id, c)| (id.as_ref(), c))
    }

    fn get(&self, id: &str) -> Option<&Connector> {
        self.connectors.get_by_name(id).map(|(_, c)| c)
    }
}

// Create the registry
let state = Arc::new(RwLock::new(AppState::new()));
let registry = Registry::new(state)
    .with_options(RegistryOptions {
        max_lifetime: Some(60 * 30),  // 30 minutes
        max_pool_size: Some(4),
    });
```

### Setting Up the Query Context

```rust,ignore
use std::sync::Arc;
use stately_arrow::{QueryContext, QueryState, ConnectorRegistry};
use stately_arrow::database::clickhouse::QuerySessionContext;

// Create a session context (e.g., ClickHouse-backed)
let session = QuerySessionContext::default();

// Create the query context with your registry
let registry: Arc<dyn ConnectorRegistry> = Arc::new(my_registry);
let query_context = QueryContext::with_session(session, registry);

// Wrap in QueryState for Axum
let query_state = QueryState::new(query_context);
```

### Axum Router Integration

```rust,ignore
use axum::Router;
use stately_arrow::api;

// Add the query API routes to your router
let app = Router::new()
    .nest("/api/query", api::router())
    .with_state(app_state);
```

## API Endpoints

When using the provided Axum handlers:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/connectors` | List available connectors |
| `POST` | `/connectors` | Batch fetch connector details |
| `GET` | `/connectors/{id}` | List contents of a specific connector |
| `GET` | `/catalogs` | List DataFusion catalogs |
| `GET` | `/register` | List registered connectors |
| `GET` | `/register/{id}` | Register a connector |
| `POST` | `/query` | Execute SQL query (returns Arrow IPC stream) |

## Implementing a Custom Backend

```rust,ignore
use async_trait::async_trait;
use datafusion::execution::context::SessionContext;
use stately_arrow::{Backend, ConnectionMetadata, ListSummary, Result};

pub struct MyBackend {
    metadata: ConnectionMetadata,
}

#[async_trait]
impl Backend for MyBackend {
    fn connection(&self) -> &ConnectionMetadata {
        &self.metadata
    }

    async fn prepare_session(&self, session: &SessionContext) -> Result<()> {
        // Configure the DataFusion session (register tables, etc.)
        Ok(())
    }

    async fn list(&self, database: Option<&str>) -> Result<ListSummary> {
        // Return available tables/files
    }
}
```

## License

See the repository root for license information.
