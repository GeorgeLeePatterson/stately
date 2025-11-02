# 🏰 Stately

[![Crates.io](https://img.shields.io/crates/v/stately.svg)](https://crates.io/crates/stately)
[![Documentation](https://docs.rs/stately/badge.svg)](https://docs.rs/stately)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

> Type-safe state management with entity relationships and CRUD operations

Stately is a Rust framework for managing application configuration and state with built-in support for entity relationships, CRUD operations, serialization, and automatic API generation.

## ✨ Features

- **🎯 Type-Safe**: Compile-time guarantees for entity relationships and state operations
- **🔗 Entity Relationships**: Reference entities inline or by ID with `Link<T>`
- **📝 CRUD Operations**: Built-in create, read, update, delete for all entity types
- **🔄 Serialization**: Full serde support for JSON, YAML, etc.
- **📚 OpenAPI Schema**: Automatic schema generation with `utoipa`
- **🚀 Web Framework Integration**: Optional Axum API generation (more frameworks coming soon)
- **🆔 Time-Sortable IDs**: UUID v7 for naturally ordered entity identifiers
- **🔍 Search & Query**: Built-in entity search across collections

## 🚀 Quick Start

Add stately to your `Cargo.toml`:

```toml
[dependencies]
stately = "0.1"
```

For web API generation with Axum:

```toml
[dependencies]
stately = { version = "0.1", features = ["axum"] }
```

## 📖 Example

```rust
use stately::prelude::*;

// Define your entities
#[stately::entity]
#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct Pipeline {
    pub name: String,
    pub source: Link<SourceConfig>,
    pub sink: Link<SinkConfig>,
}

#[stately::entity]
#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct SourceConfig {
    pub name: String,
    pub url: String,
}

#[stately::entity]
#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct SinkConfig {
    pub name: String,
    pub destination: String,
}

// Define your application state
#[stately::state]
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
    let pipeline = Pipeline {
        name: "my-pipeline".to_string(),
        source: Link::create_ref(source_id.to_string()),
        sink: Link::create_ref(sink_id.to_string()),
    };

    let pipeline_id = state.pipelines.create(pipeline);

    // Query entities
    if let Some((id, entity)) = state.get_entity(&pipeline_id.to_string(), StateEntry::Pipeline) {
        println!("Found pipeline: {:?}", entity);
    }

    // List all entities
    let summaries = state.list_entities(None);
    for (entry, entities) in summaries {
        println!("{}: {} entities", entry.as_ref(), entities.len());
    }

    // Search across collections
    let results = state.search_entities("pipeline");
}
```

## 🌐 Axum API Generation

Generate complete REST APIs with OpenAPI documentation:

```rust
#[stately::state(openapi)]
pub struct State {
    pipelines: Pipeline,
    sources: SourceConfig,
}

#[stately::axum_api(State, openapi, components = [link_aliases::PipelineLink])]
pub struct AppState {}

#[tokio::main]
async fn main() {
    let app_state = AppState::new(State::new());

    let app = axum::Router::new()
        .nest("/api/v1/entity", AppState::router(app_state.clone()))
        .with_state(app_state);

    // Generated routes:
    // PUT    /api/v1/entity - Create entity
    // GET    /api/v1/entity - List all entities
    // GET    /api/v1/entity/{id}?type=<type> - Get entity by ID
    // POST   /api/v1/entity/{id} - Update entity
    // PATCH  /api/v1/entity/{id} - Patch entity
    // DELETE /api/v1/entity/{entry}/{id} - Delete entity
}
```

The `axum_api` macro generates:
- ✅ Complete REST API handlers as methods on your struct
- ✅ OpenAPI 3.0 documentation (with `openapi` parameter)
- ✅ Type-safe request/response types
- ✅ `router()` method and `AppState::openapi()` for docs

## 📚 Feature Flags

| Feature | Description | Default |
|---------|-------------|---------|
| `openapi` | OpenAPI schema generation with `utoipa` | ✅ |
| `axum` | Axum web framework integration (implies `openapi`) | ❌ |

## 🏗️ Architecture

Stately uses procedural macros to generate:

1. **`#[stately::entity]`** - Implements `StateEntity` trait for your types
2. **`#[stately::state]`** - Generates:
   - `StateEntry` enum (entity type discriminator)
   - `Entity` enum (type-erased entity wrapper)
   - Collection fields with CRUD operations
   - `link_aliases` module with type aliases for `Link<T>` (e.g., `PipelineLink`)
3. **`#[stately::axum_api(State, openapi)]`** - Generates (optional):
   - REST API handlers as methods on your struct
   - `router()` method for Axum integration
   - OpenAPI documentation via `::openapi()` method

### Generated Code

The `state` macro automatically generates a `link_aliases` module:

```rust
pub mod link_aliases {
    pub type PipelineLink = ::stately::Link<Pipeline>;
    pub type SourceLink = ::stately::Link<Source>;
    // ... one for each entity type
}
```

These aliases are useful for OpenAPI schemas and as type shortcuts in your code.

## 📝 Examples

See the [examples](examples/) directory:

- [`basic.rs`](examples/basic.rs) - Core CRUD operations and entity relationships
- [`axum_api.rs`](examples/axum_api.rs) - Web API generation with Axum

Run examples:

```bash
cargo run --example basic
cargo run --example axum_api --features axum
```

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.

## 🔗 Links

- [Documentation](https://docs.rs/stately)
- [Crates.io](https://crates.io/crates/stately)
- [Repository](https://github.com/georgeleepatterson/stately)
- [Issue Tracker](https://github.com/georgeleepatterson/stately/issues)
