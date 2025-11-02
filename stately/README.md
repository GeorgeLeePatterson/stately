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
- 📚 **OpenAPI Schemas** - Automatic schema generatio with `utoipa`n
- 🆔 **Time-Sortable IDs** - UUID v7 for naturally ordered identifiers
- 🚀 **Web APIs** - Optional Axum integration with generated handlers (more frameworks coming soon)
- **🔍 Search & Query**: Built-in entity search across collections

Stately does not provide the configuration and structures that comprise the state. Instead it provides an ultra-thin container management strategy that provides seamless integration with [@stately/ui](stately-ui).

## Installation

Add to your `Cargo.toml`:

```toml
[dependencies]
stately = "0.2.1"
```

With Axum API generation:

```toml
[dependencies]
stately = { version = "0.2.1", features = ["axum"] }
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

Use the `#[collection(...)]` attributes to configure the application state properties:

```rust
// Can be a struct that implements `StateCollection`. This type alias is for simplicity.
type CustomStateCollectionImpl = Collection<SourceConfig>;

#[stately::state]
pub struct AppState {
    #[collection] // Default, same as omitting
    pipelines: Pipeline,
    #[collection(CustomStateCollectionImpl)]
    sources: SourceConfig,
    // Rename the generated variants to prevent collision with `sources` above
    #[collection(CustomStateCollectionImpl, variant = "CachedSourceConfig")]
    sources_cached: SourceConfig,
}
```

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
let (id, entity) = state.get_entity(&pipeline_id.to_string(), StateEntry::Pipeline).unwrap();

// List all
let summaries = state.list_entities(None);

// Search
let results = state.search_entities("my-pipeline");

// Update
state.pipelines.update(&pipeline_id.to_string(), updated_pipeline)?;

// Delete
state.pipelines.remove(&pipeline_id.to_string())?;
```

## 📖 Examples

```rust
use stately::prelude::*;

// Define your entities
#[stately::entity]
#[derive(Clone, serde::Serialize, serde::Deserialize, utoipa::ToSchema)]
pub struct Pipeline {
    pub name: String,
    pub source: Link<SourceConfig>,
    pub sink: Link<SinkConfig>,
}

#[stately::entity]
#[derive(Clone, serde::Serialize, serde::Deserialize, utoipa::ToSchema)]
pub struct SourceConfig {
    pub name: String,
    pub url: String,
}

#[stately::entity]
#[derive(Clone, serde::Serialize, serde::Deserialize, utoipa::ToSchema)]
pub struct SinkConfig {
    pub name: String,
    pub destination: String,
}

// Define your application state
#[stately::state(openapi)]
#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct AppState {
    pipelines: Pipeline,
    sources: SourceConfig,
    sinks: SinkConfig,
}

fn main() {
    let mut state = AppState::new();

    // Create entities
    let source_id = state.sources.create(SourceConfig {
        name: "my-source".to_string(),
        url: "http://example.com/data".to_string(),
    });

    let sink_id = state.sinks.create(SinkConfig {
        name: "my-sink".to_string(),
        destination: "s3://my-bucket/output".to_string(),
    });

    // Create a pipeline referencing the source and sink
    let mut pipeline = Pipeline {
        name: "my-pipeline".to_string(),
        source: Link::create_ref(source_id.to_string()),
        sink: Link::create_ref(sink_id.to_string()),
    };

    let pipeline_id = state.pipelines.create(pipeline.clone());

    // Query entities
    if let Some((id, entity)) = state.get_entity(&pipeline_id.to_string(), StateEntry::Pipeline) {
        println!("Found pipeline: {:?}", entity);
    }

    // List all entities
    let summaries = state.list_entities(None);
    for (entry, entities) in summaries {
        println!("{}: {} entities", entry.as_ref(), entities.len());
    }

    // Update
    pipeline.name = "my-pipeline-updated".to_string();
    state.pipelines.update(&pipeline_id.to_string(), pipeline)?;

    // Delete
    state.pipelines.remove(&pipeline_id.to_string())?;

    // Search across collections
    let results = state.search_entities("pipeline");
}
```

See the [examples](examples/) directory:

- [`basic.rs`](examples/basic.rs) - Core CRUD operations and entity relationships
- [`axum_api.rs`](examples/axum_api.rs) - Web API generation with Axum

Run examples:

```bash
cargo run --example basic
cargo run --example axum_api --features axum
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

## 🌐 Web API Generation (Axum)

Generate a complete REST API with OpenAPI documentation:

```rust
#[stately::state(openapi)]
pub struct State {
    pipelines: Pipeline,
}

#[stately::axum_api(State, openapi, components = [link_aliases::PipelineLink])]
pub struct ApiState {}

// Now in scope:
// - Trait implementations
// - All endpoints, response, request, and query types and ResponseEvent enum
// - `link_aliases` module
// - `impl AppState` with all state methods

#[tokio::main]
async fn main() {
    let app_state = ApiState::new(State::new());

    let app = axum::Router::new()
        .nest("/api/v1/entity", ApiState::router(app_state.clone()))
        .with_state(app_state);

    // Generated routes:
    // PUT    /api/v1/entity - Create entity
    // GET    /api/v1/entity - List all entities by StateEntry
    // GET    /api/v1/entity/list - List all entities as summaries
    // GET    /api/v1/entity/list/{type} - List all entities filtered by type as summaries
    // GET    /api/v1/entity/{id}?type=<type> - Get entity by ID
    // POST   /api/v1/entity/{id} - Update entity
    // PATCH  /api/v1/entity/{id} - Patch entity
    // DELETE /api/v1/entity/{entry}/{id} - Delete entity

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .unwrap();

    axum::serve(listener, app).await.unwrap();
}
```

### Event Middleware for Persistence

The `axum_api` macro generates a `ResponseEvent` enum and `event_middleware()` method for integrating with databases:

```rust
use tokio::sync::mpsc;

// Your event enum that wraps ResponseEvent
pub enum ApiEvent {
    StateEvent(ResponseEvent),
}

// Implement From<ResponseEvent> for ApiEvent
impl From<ResponseEvent> for ApiEvent {
    fn from(event: ResponseEvent) -> Self {
        ApiEvent::StateEvent(event)
    }
}

let (event_tx, mut event_rx) = mpsc::channel(100);

let app = axum::Router::new()
    .nest("/api/v1/entity", ApiState::router(app_state.clone()))
    .layer(axum::middleware::from_fn(
        ApiState::event_middleware::<ApiEvent>(event_tx)
    ))
    .with_state(app_state);

// Background task to handle events
tokio::spawn(async move {
    while let Some(ApiEvent::StateEvent(event)) = event_rx.recv().await {
        match event {
            // Persist to database after state update
            ResponseEvent::Created { id, entity } => db.insert(id, entity).await,
            ResponseEvent::Updated { id, entity } => db.update(id, entity).await,
            ResponseEvent::Deleted { id, entry } => db.delete(id, entry).await,
        }
    }
});
```

The `axum_api` macro generates:
- ✅ Complete REST API handlers as methods on your struct
- ✅ OpenAPI 3.0 documentation (with `openapi` parameter)
- ✅ Type-safe request/response types
- ✅ `router()` method and `ApiState::openapi()` for docs
- ✅ `ResponseEvent` enum and `event_middleware()` for event-driven persistence

### Macro Parameters

- **`#[stately::state(openapi)]`** - Enables OpenAPI schema generation for entities
- **`#[stately::axum_api(State, openapi, components = [...])]`**
  - First parameter: The state type name
  - `openapi`: Enable OpenAPI documentation generation
  - `components = [...]`: Additional types to include in OpenAPI schemas (e.g., Link types)

### Generated API Routes

The `axum_api` macro generates these endpoints:

- `PUT /` - Create a new entity
- `GET /` - Get all entities
- `GET /list` - List all entities by summary
- `GET /list/{type}` - List all entities filtered by type by summary
- `GET /{id}?type=<type>` - Get entity by ID and type
- `POST /{id}` - Update an existing entity
- `PATCH /{id}` - Patch an existing entity
- `DELETE /{entry}/{id}` - Delete an entity

### OpenAPI Documentation

Access the generated OpenAPI spec:

```rust
use utoipa::OpenApi;

#[stately::state(openapi)]
pub struct State {
    pipelines: Pipeline,
}

#[stately::axum_api(State, openapi, components = [link_aliases::PipelineLink])]
pub struct ApiState {}

let openapi = ApiState::openapi();
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

- [`basic.rs`](examples/basic.rs) - Core functionality demonstration
- [`axum_api.rs`](examples/axum_api.rs) - Web API generation

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
- **`EntityId`** - UUID v7 identifier for entities
- **`Summary`** - Lightweight entity summary for listings

### Traits

- **`StateEntity`** - Trait for all entity types (implemented by `#[stately::entity]`)
- **`StateCollection`** - Trait for entity collections (implemented by `#[stately::state]`)

### Macros

- **`#[stately::entity]`** - Define an entity type
- **`#[stately::state]`** - Define application state with entity collections

## Architecture

Stately uses procedural macros to generate boilerplate at compile time:

1. **`#[stately::entity]`** implements the `StateEntity` trait
2. **`#[stately::state]`** generates:
   - `StateEntry` enum for entity type discrimination
   - `Entity` enum for type-erased entity wrapper
   - Collection fields with type-safe accessors
   - CRUD operation methods
   - `link_aliases` module with `Link<T>` type aliases
3. **`#[stately::axum_api(State, ...)]`** generates (optional):
   - REST API handler methods on your struct
   - `router()` method for Axum integration
   - OpenAPI documentation (when `openapi` parameter is used)
   - `ResponseEvent` enum for CRUD operations
   - `event_middleware()` method for event streaming

All generated code is type-safe and benefits from Rust's compile-time guarantees.

### Generated Code

**`link_aliases` Module** (from `#[stately::state]`):

```rust
pub mod link_aliases {
    pub type PipelineLink = ::stately::Link<Pipeline>;
    pub type SourceLink = ::stately::Link<Source>;
    // ... one type alias for each entity in your state
}
```

**`ResponseEvent` Enum** (from `#[stately::axum_api]`):

```rust
pub enum ResponseEvent {
    Created { id: EntityId, entity: Entity },
    Updated { id: EntityId, entity: Entity },
    Deleted { id: EntityId, entry: StateEntry },
}
```

These enable type-safe event-driven architectures for persistence, logging, and system integration.

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](../LICENSE) for details.

## Links

- [Documentation](https://docs.rs/stately)
- [Crates.io](https://crates.io/crates/stately)
- [Repository](https://github.com/georgeleepatterson/stately)
