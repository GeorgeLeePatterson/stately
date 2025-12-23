---
title: Backend Development
description: Building Stately backends with Rust
---

# Backend Development

This section covers building Stately backends with Rust, including entity definitions, state management, API generation, and plugin integration.

## Core Crates

| Crate | Description | API Reference |
|-------|-------------|---------------|
| `stately` | Core types, traits, and collections | [docs.rs/stately](https://docs.rs/stately) |
| `stately-derive` | Procedural macros for code generation | [docs.rs/stately-derive](https://docs.rs/stately-derive) |

## Plugin Crates

| Crate | Description | API Reference |
|-------|-------------|---------------|
| `stately-files` | File upload and versioning | [docs.rs/stately-files](https://docs.rs/stately-files) |
| `stately-arrow` | Data connectivity and SQL queries | [docs.rs/stately-arrow](https://docs.rs/stately-arrow) |

## Macros

The `stately-derive` crate provides three main macros:

- `#[stately::entity]` - Define entities with name traits
- `#[stately::state]` - Generate state management infrastructure
- `#[stately::axum_api]` - Generate HTTP API handlers

See [Entities and State](../concepts/entities-and-state.md) for detailed usage.

## Core Types

- `EntityId` - UUID v7 identifiers
- `Link<T>` - Entity relationships (see [Links](../concepts/links.md))
- `Collection<T>` - Entity collections
- `Singleton<T>` - Single-instance containers

## Quick Reference

### Minimal Entity

```rust
use serde::{Deserialize, Serialize};

#[stately::entity]
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct MyEntity {
    pub name: String,
}
```

### Minimal State

```rust
#[stately::state(openapi)]
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct AppState {
    my_entities: MyEntity,
}
```

### Minimal API

```rust
use std::sync::Arc;
use tokio::sync::RwLock;

#[stately::axum_api(AppState, openapi)]
#[derive(Clone)]
pub struct ApiState {
    #[state]
    pub app: Arc<RwLock<AppState>>,
}

impl ApiState {
    pub fn router(self) -> Router<Self> {
        Self::router(self)
    }
}
```

## Feature Flags

| Feature | Default | Description |
|---------|---------|-------------|
| `openapi` | Yes | OpenAPI schema generation |
| `axum` | No | Axum framework integration |

Enable features in `Cargo.toml`:

```toml
[dependencies]
stately = { version = "0.3", features = ["axum"] }
```

## Next Steps

- [Entities and State](../concepts/entities-and-state.md) - Learn about defining entities
- [Links](../concepts/links.md) - Entity relationships
- [Quick Start](../getting-started/quick-start.md) - Build a complete example
