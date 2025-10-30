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
#[stately::state(api = ["axum"])]
pub struct AppState {
    pipelines: Pipeline,
    sources: SourceConfig,
}

#[tokio::main]
async fn main() {
    let state = Arc::new(RwLock::new(AppState::new()));
    let axum_state = axum_api::StatelyState::new(state.clone());

    let app = axum::Router::new()
        .nest("/api/v1/entity", axum_api::router())
        .with_state(axum_state);

    // Generated routes:
    // GET  /api/v1/entity/list
    // GET  /api/v1/entity/list/:type
    // GET  /api/v1/entity/search/:needle
    // GET  /api/v1/entity/:id?type=<type>
}
```

The `api = ["axum"]` attribute generates:
- ✅ Complete REST API handlers
- ✅ OpenAPI 3.0 documentation
- ✅ Type-safe request/response types
- ✅ Ready-to-use `Router` and `ApiDoc`

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
   - Optional web API code (handlers, routes, OpenAPI docs)

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
