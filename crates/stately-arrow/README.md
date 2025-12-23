# stately-arrow

[![Crates.io](https://img.shields.io/crates/v/stately-arrow.svg)](https://crates.io/crates/stately-arrow)
[![Documentation](https://docs.rs/stately-arrow/badge.svg)](https://docs.rs/stately-arrow)
[![npm](https://img.shields.io/npm/v/@statelyjs/arrow)](https://www.npmjs.com/package/@statelyjs/arrow)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../LICENSE)

Arrow-based data connectivity and query execution over HTTP APIs.

## Overview

This crate provides a flexible abstraction layer over DataFusion for building data query services with support for multiple backend connectors. It's designed to be mounted as an axum router and pairs with the [`@statelyjs/arrow`](../../packages/arrow/README.md) frontend plugin.

## Features

- **Multi-Backend Support** - Connect to object stores (S3, GCS, Azure) and databases (ClickHouse)
- **Streaming Queries** - Execute SQL with Arrow IPC streaming responses
- **Connector Registry** - Manage and register data source connectors
- **DataFusion Integration** - Leverage DataFusion's query engine with URL tables

## Install

Add to your `Cargo.toml`:

```toml
[dependencies]
stately-arrow = { path = "../stately-arrow", features = ["clickhouse", "object-store", "registry"] }
```

### Feature Flags

| Feature | Description |
|---------|-------------|
| `object-store` | S3, GCS, Azure, and local filesystem backends |
| `database` | Base database connector types |
| `clickhouse` | ClickHouse database backend (implies `database`) |
| `registry` | Generic registry implementation with stately integration |
| `strum` | `AsRefStr` derives for enum types |

## Quick Start

```rust
use std::sync::Arc;
use axum::Router;
use stately_arrow::{api, QueryContext, QueryState, ConnectorRegistry};

#[tokio::main]
async fn main() {
    // Create a registry (implement ConnectorRegistry or use generic::Registry)
    let registry: Arc<dyn ConnectorRegistry> = create_your_registry();

    // Create query context
    let query_context = QueryContext::new(registry);

    // Create the router
    let arrow_router = api::router(QueryState::new(query_context));

    // Mount under /arrow
    let app = Router::new().nest("/arrow", arrow_router);

    // Start server...
}
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/connectors` | List available connectors |
| `POST` | `/connectors` | Get details for multiple connectors |
| `GET` | `/connectors/{id}` | Get connector details (tables/files) |
| `GET` | `/register` | List registered connections |
| `GET` | `/register/{id}` | Register a connector with DataFusion |
| `GET` | `/catalogs` | List DataFusion catalogs |
| `POST` | `/query` | Execute SQL query (streaming Arrow IPC) |

### Execute Query

```bash
curl -X POST http://localhost:3000/arrow/query \
  -H "Content-Type: application/json" \
  -d '{"connector_id": "my-s3-bucket", "sql": "SELECT * FROM data.parquet LIMIT 10"}'
```

The response is an Arrow IPC stream (`application/vnd.apache.arrow.stream`).

### List Connector Contents

```bash
# List databases/paths
curl "http://localhost:3000/arrow/connectors/my-connector"

# Search within a database/path
curl "http://localhost:3000/arrow/connectors/my-connector?search=users"
```

## Core Abstractions

### Backend

Implement `Backend` to create a new data source connector:

```rust
use async_trait::async_trait;
use stately_arrow::{Backend, ConnectionMetadata, ListSummary, Result};
use datafusion::execution::context::SessionContext;

pub struct MyBackend {
    metadata: ConnectionMetadata,
}

#[async_trait]
impl Backend for MyBackend {
    fn connection(&self) -> &ConnectionMetadata {
        &self.metadata
    }

    async fn prepare_session(&self, session: &SessionContext) -> Result<()> {
        // Register catalogs, tables, or object stores
        Ok(())
    }

    async fn list(&self, database: Option<&str>) -> Result<ListSummary> {
        // Return available tables/files
        Ok(ListSummary::Tables(vec![]))
    }
}
```

### ConnectorRegistry

Implement `ConnectorRegistry` to manage your connectors:

```rust
use async_trait::async_trait;
use stately_arrow::{Backend, ConnectorRegistry, ConnectionMetadata, Result};

#[async_trait]
impl ConnectorRegistry for MyRegistry {
    async fn get(&self, id: &str) -> Result<Arc<dyn Backend>> {
        // Return the backend for this connector ID
    }

    async fn list(&self) -> Result<Vec<ConnectionMetadata>> {
        // Return all available connectors
    }

    async fn registered(&self) -> Result<Vec<ConnectionMetadata>> {
        // Return currently registered connectors
    }
}
```

### QuerySession

Implement `QuerySession` for custom DataFusion session behavior:

```rust
use async_trait::async_trait;
use datafusion::prelude::{DataFrame, SessionContext};
use stately_arrow::{QuerySession, SessionCapability, Result};

#[derive(Clone)]
pub struct MySession {
    inner: SessionContext,
}

#[async_trait]
impl QuerySession for MySession {
    fn as_session(&self) -> &SessionContext {
        &self.inner
    }

    fn capabilities(&self) -> &[SessionCapability] {
        &[SessionCapability::ExecuteWithoutConnector]
    }

    async fn sql(&self, sql: &str) -> Result<DataFrame> {
        // Custom SQL execution
        self.inner.sql(sql).await.map_err(Into::into)
    }
}
```

## Built-in Backends

### Object Store

Connect to S3, GCS, Azure, or local filesystem:

```rust
use stately_arrow::object_store::{Config, ObjectStore, ObjectStoreFormat};

let config = Config {
    format: ObjectStoreFormat::Parquet(None),
    store: ObjectStore::Aws(ObjectStoreOptions {
        bucket: "my-bucket".into(),
        from_env: true,  // Use AWS_* environment variables
        ..Default::default()
    }),
};
```

Credentials are resolved from environment variables:
- **AWS**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
- **GCP**: `GOOGLE_SERVICE_ACCOUNT` or application default credentials
- **Azure**: `AZURE_STORAGE_ACCOUNT_NAME`, `AZURE_STORAGE_ACCOUNT_KEY`

### ClickHouse

Connect to ClickHouse databases (requires `clickhouse` feature):

```rust
use stately_arrow::database::{Config, ConnectionOptions, Database};
use stately_arrow::database::clickhouse::ClickHouseConfig;

let config = Config {
    options: ConnectionOptions {
        endpoint: "http://localhost:8123".into(),
        username: "default".into(),
        password: Some("password".into()),
        tls: None,
        check: true,
    },
    driver: Database::ClickHouse(Some(ClickHouseConfig::default())),
    pool: Default::default(),
};
```

## Generic Registry

Use the built-in generic registry with stately state (requires `registry` feature):

```rust
use stately_arrow::generic::{Connector, Connectors, Registry};

// Implement Connectors trait on your state type
impl Connectors for MyState {
    fn iter(&self) -> impl Iterator<Item = (&str, &Connector)> {
        self.connectors.iter()
    }

    fn get(&self, id: &str) -> Option<&Connector> {
        self.connectors.get(id)
    }
}

// Create registry from state
let registry = Registry::new(Arc::new(RwLock::new(state)));
```

## OpenAPI

Generate the OpenAPI spec for frontend codegen:

```bash
cargo run --bin generate-openapi --all-features -- ./packages/arrow/src/generated
```

The spec includes conditional schemas based on enabled features.

## Module Structure

```
stately-arrow/
├── api.rs              # Router factory
├── api/
│   ├── handlers.rs     # HTTP handlers
│   ├── ipc.rs          # Arrow IPC streaming
│   └── openapi.rs      # OpenAPI documentation
├── backend.rs          # Backend trait + metadata types
├── context.rs          # QueryContext + QuerySession
├── database.rs         # Database connector types
├── database/
│   └── clickhouse.rs   # ClickHouse backend
├── error.rs            # Error types
├── object_store.rs     # Object store backend
├── registry.rs         # ConnectorRegistry trait + generic impl
├── request.rs          # Request DTOs
├── response.rs         # Response DTOs
└── state.rs            # QueryState extractor
```

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](../../LICENSE) for details.
