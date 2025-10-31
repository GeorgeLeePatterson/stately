# 🏰 Stately

[![Crates.io](https://img.shields.io/crates/v/stately.svg)](https://crates.io/crates/stately)
[![Documentation](https://docs.rs/stately/badge.svg)](https://docs.rs/stately)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../LICENSE)
[![Coverage](https://codecov.io/gh/GeorgeLeePatterson/stately/branch/main/graph/badge.svg)](https://codecov.io/gh/GeorgeLeePatterson/stately)

> Type-safe state management with entity relationships and CRUD operations

## Overview

Stately provides a framework for managing application configuration and state with built-in support for:

- 🔗 **Entity Relationships** - Reference entities inline or by ID
- 📝 **CRUD Operations** - Create, read, update, delete for all entity types
- 🔄 **Serialization** - Full serde support
- 📚 **OpenAPI Schemas** - Automatic schema generation
- 🆔 **Time-Sortable IDs** - UUID v7 for naturally ordered identifiers
- 🚀 **Web APIs** - Optional Axum integration with generated handlers

## Installation

Add to your `Cargo.toml`:

```toml
[dependencies]
stately = "0.1"
```

With Axum API generation:

```toml
[dependencies]
stately = { version = "0.1", features = ["axum"] }
```

## Quick Start

### Define Entities

Use the `#[stately::entity]` macro to define your domain entities:

```rust
use stately::prelude::*;

#[stately::entity]
#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct Pipeline {
    pub name: String,
    pub source: Link<SourceConfig>,
}

#[stately::entity]
#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct SourceConfig {
    pub name: String,
    pub url: String,
}
```

### Define State

Use the `#[stately::state]` macro to create your application state:

```rust
#[stately::state]
pub struct AppState {
    pipelines: Pipeline,
    sources: SourceConfig,
}
```

This generates:
- `StateEntry` enum for entity type discrimination
- `Entity` enum for type-erased entity access
- Collections with full CRUD operations
- Search and query methods

### Use the State

```rust
let mut state = AppState::new();

// Create entities
let source_id = state.sources.create(SourceConfig {
    name: "my-source".to_string(),
    url: "http://example.com".to_string(),
});

// Reference entities
let pipeline = Pipeline {
    name: "my-pipeline".to_string(),
    source: Link::create_ref(source_id.to_string()),
};

let pipeline_id = state.pipelines.create(pipeline);

// Query
let (id, entity) = state.get_entity(
    &pipeline_id.to_string(),
    StateEntry::Pipeline
).unwrap();

// List all
let summaries = state.list_entities(None);

// Search
let results = state.search_entities("my-pipeline");

// Update
state.pipelines.update(&pipeline_id.to_string(), updated_pipeline)?;

// Delete
state.pipelines.remove(&pipeline_id.to_string())?;
```

## Entity Relationships with `Link<T>`

The `Link<T>` type allows flexible entity references:

```rust
// Reference by ID
let link = Link::create_ref("source-id-123");

// Inline embedding
let link = Link::inline(SourceConfig {
    name: "inline-source".to_string(),
    url: "http://example.com".to_string(),
});

// Access
match &pipeline.source {
    Link::Ref(id) => println!("References source: {}", id),
    Link::Inline(source) => println!("Inline source: {}", source.name),
}
```

## Singleton Entities

For configuration that should have exactly one instance:

```rust
#[stately::entity(singleton, description = "Global settings")]
#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct Settings {
    pub max_connections: usize,
}

#[stately::state]
pub struct AppState {
    #[singleton]
    settings: Settings,
}
```

## Web API Generation (Axum)

Generate a complete REST API with OpenAPI documentation:

```rust
#[stately::state(api = ["axum"])]
pub struct AppState {
    pipelines: Pipeline,
}

#[tokio::main]
async fn main() {
    use std::sync::Arc;
    use tokio::sync::RwLock;

    let state = Arc::new(RwLock::new(AppState::new()));
    let axum_state = axum_api::StatelyState::new(state);

    let app = axum::Router::new()
        .nest("/api/v1/entity", axum_api::router())
        .with_state(axum_state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .unwrap();

    axum::serve(listener, app).await.unwrap();
}
```

### Generated API Routes

The `api = ["axum"]` attribute generates these endpoints:

- `GET /list` - List all entities across all collections
- `GET /list/:type` - List entities of a specific type
- `GET /search/:needle` - Search entities by name/description
- `GET /:id?type=<type>` - Get a specific entity by ID

### OpenAPI Documentation

Access the generated OpenAPI spec:

```rust
use utoipa::OpenApi;

let openapi = axum_api::ApiDoc::openapi();
let json = openapi.to_json().unwrap();
```

## Feature Flags

| Feature | Description | Default |
|---------|-------------|---------|
| `openapi` | Enable OpenAPI schema generation via `utoipa` | ✅ Yes |
| `axum` | Enable Axum web framework integration | ❌ No |

## Entity Attributes

The `#[stately::entity]` macro supports these attributes:

```rust
// Use a different field for the entity name
#[stately::entity(name_field = "title")]

// Mark as singleton (only one instance)
#[stately::entity(singleton)]

// Use a field for description
#[stately::entity(description_field = "info")]

// Use a static description
#[stately::entity(description = "A pipeline configuration")]
```

## Examples

See the [examples directory](../examples/):

- [`basic.rs`](../examples/basic.rs) - Core functionality demonstration
- [`axum_api.rs`](../examples/axum_api.rs) - Web API generation

Run examples:

```bash
cargo run --example basic
cargo run --example axum_api --features axum
```

## API Reference

### Core Types

- **`Collection<T>`** - A collection of entities with CRUD operations
- **`Singleton<T>`** - A single entity instance
- **`Link<T>`** - Reference to another entity (by ID or inline)
- **`EntityIdentifier`** - UUID v7 identifier for entities
- **`Summary`** - Lightweight entity summary for listings

### Traits

- **`StateEntity`** - Trait for all entity types (implemented by `#[stately::entity]`)
- **`StateCollection`** - Trait for entity collections (implemented by `#[stately::state]`)
- **`StatelyState`** - Trait for application state (implemented when using `api = ["axum"]`)

### Macros

- **`#[stately::entity]`** - Define an entity type
- **`#[stately::state]`** - Define application state with entity collections

## Architecture

Stately uses procedural macros to generate boilerplate at compile time:

1. **`#[stately::entity]`** implements the `StateEntity` trait
2. **`#[stately::state]`** generates:
   - Enum types for entity discrimination
   - Collection fields with type-safe accessors
   - CRUD operation methods
   - Optional web framework integration code

All generated code is type-safe and benefits from Rust's compile-time guarantees.

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](../LICENSE) for details.

## Links

- [Documentation](https://docs.rs/stately)
- [Crates.io](https://crates.io/crates/stately)
- [Repository](https://github.com/georgeleepatterson/stately)
