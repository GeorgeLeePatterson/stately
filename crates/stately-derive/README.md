# 🏰 Stately Derive

[![Crates.io](https://img.shields.io/crates/v/stately-derive.svg)](https://crates.io/crates/stately-derive)
[![Documentation](https://docs.rs/stately-derive/badge.svg)](https://docs.rs/stately-derive)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../LICENSE)

> Procedural macros for the Stately state management framework

This crate provides the procedural macros used by [stately](https://crates.io/crates/stately). You typically don't need to depend on this crate directly - it's re-exported by the main `stately` crate.

## Macros

### `#[stately::entity]`

Derives the `StateEntity` trait for a struct, enabling it to be managed by Stately.

```rust
#[stately::entity]
#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct Pipeline {
    pub name: String,
}
```

**Attributes:**
- `#[stately(singleton)]` - Mark as singleton entity
- `#[stately(name_field = "field_name")]` - Use different field for name
- `#[stately(description_field = "field_name")]` - Use field for description
- `#[stately(description = "text")]` - Static description

### `#[stately::state]`

Generates application state with entity collections and CRUD operations.

```rust
#[stately::state]
pub struct AppState {
    pipelines: Pipeline,
    sources: SourceConfig,
}
```

**API Generation:**

```rust
#[stately::state(api = ["axum"])]
pub struct AppState {
    pipelines: Pipeline,
}
```

Generates:
- REST API handlers
- OpenAPI documentation
- Type-safe request/response types
- Router and state wrappers

## Documentation

For complete documentation and examples, see the [stately](https://docs.rs/stately) crate.

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](../../LICENSE) for details.
