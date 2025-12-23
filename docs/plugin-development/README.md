---
title: Plugin Development
description: Creating custom plugins for Stately
---

# Plugin Development

This guide covers creating custom plugins that extend Stately with new capabilities. Plugins are vertical - they span both backend (Rust) and frontend (TypeScript) to provide coordinated functionality.

## Plugin Architecture

A Stately plugin consists of:

```
my-plugin/
├── crates/
│   └── stately-my-plugin/     # Rust crate
│       ├── Cargo.toml
│       ├── src/
│       │   ├── lib.rs
│       │   ├── router.rs
│       │   ├── handlers.rs
│       │   └── ...
│       └── bin/
│           └── generate-openapi.rs
│
└── packages/
    └── my-plugin/             # TypeScript package
        ├── package.json
        ├── src/
        │   ├── index.ts
        │   ├── plugin.ts
        │   ├── schema.ts
        │   └── ...
        └── openapi.json       # Generated from Rust
```

## Development Guide

This page provides a complete guide to plugin development. The following topics are covered below:

### Backend Topics

- Creating the Rust crate
- Axum router integration
- FromRef pattern for state extraction
- OpenAPI generation for type codegen

### Frontend Topics

- Creating the TypeScript package
- Schema plugin for type system extensions
- UI plugin for component registration
- Component registry for field components

## Quick Start

### 1. Backend Crate

```rust
// src/lib.rs
pub mod router;
pub mod handlers;
pub mod state;

pub use router::router;
pub use state::MyPluginState;
```

```rust
// src/router.rs
use axum::{Router, routing::get};
use axum::extract::FromRef;

pub fn router<S>(state: S) -> Router<S>
where
    S: Clone + Send + Sync + 'static,
    MyPluginState: FromRef<S>,
{
    Router::new()
        .route("/my-endpoint", get(handlers::my_handler))
        .with_state(state)
}
```

```rust
// src/state.rs
#[derive(Clone)]
pub struct MyPluginState {
    pub config: MyConfig,
}
```

### 2. Generate OpenAPI

```rust
// bin/generate-openapi.rs
use utoipa::OpenApi;

#[derive(OpenApi)]
#[openapi(paths(handlers::my_handler), components(schemas(MyResponse)))]
struct ApiDoc;

fn main() {
    println!("{}", serde_json::to_string_pretty(&ApiDoc::openapi()).unwrap());
}
```

```bash
cargo run --bin generate-openapi > ../packages/my-plugin/openapi.json
```

### 3. Frontend Package

```typescript
// src/plugin.ts
import type { Schemas, PluginFactory, UiPluginFactory } from '@statelyjs/schema';
import { createOperations } from '@statelyjs/stately/api';
import type { MyPluginPaths } from './generated/types';
import { MY_OPERATIONS } from './api';

// Schema plugin - extends type system
export function myPlugin<S extends Schemas>(): PluginFactory<S> {
  return runtime => ({
    ...runtime,
    plugins: { ...runtime.plugins, myPlugin: {} },
  });
}

// UI plugin - registers components and API
export function myUiPlugin(options?: MyPluginOptions): UiPluginFactory {
  return runtime => {
    const { registry, client } = runtime;
    const pathPrefix = options?.api?.pathPrefix ?? '/my-plugin';
    
    // Create typed API client
    const api = createOperations<MyPluginPaths, typeof MY_OPERATIONS>(
      client,
      MY_OPERATIONS,
      pathPrefix,
    );
    
    // Register custom components (if any)
    // registry.components.set('myNodeType::edit', MyEditComponent);
    
    return {
      ...runtime,
      plugins: {
        ...runtime.plugins,
        myPlugin: { api, options },
      },
    };
  };
}
```

### 4. Integration

**Backend:**
```rust
impl FromRef<AppState> for MyPluginState {
    fn from_ref(state: &AppState) -> Self {
        MyPluginState { config: state.my_config.clone() }
    }
}

let app = Router::new()
    .nest("/my-plugin", my_plugin::router(state.clone()));
```

**Frontend:**
```typescript
const schema = stately(spec, schemas)
  .withPlugin(corePlugin())
  .withPlugin(myPlugin());

const runtime = statelyUi({ client, schema, core })
  .withPlugin(myUiPlugin({ api: { pathPrefix: '/my-plugin' } }));
```

## Key Patterns

### State Extraction

Use Axum's `FromRef` for flexible state composition:

```rust
pub struct MyPluginState { /* ... */ }

// Users implement this for their app state
impl FromRef<TheirAppState> for MyPluginState {
    fn from_ref(state: &TheirAppState) -> Self {
        // Extract plugin state from app state
    }
}
```

### Component Registration

Register components for custom node types:

```typescript
// Edit component for your node type
registry.components.set('myNodeType::edit', MyNodeEdit);

// View component
registry.components.set('myNodeType::view', MyNodeView);

// Transformer (modify props before rendering)
registry.transformers.set('string::edit::myTransform', myTransformer);
```

### Codegen Plugin

Transform schemas during code generation:

```typescript
export const myCodegenPlugin: CodegenPlugin = {
  name: 'my-plugin',
  transformNode(node, context) {
    if (matchesMyPattern(node)) {
      return { ...node, nodeType: 'myCustomType' };
    }
    return node;
  },
};
```

## Best Practices

1. **Keep backend and frontend in sync**: Generate TypeScript types from Rust OpenAPI
2. **Use FromRef for state**: Don't require specific app state types
3. **Provide sensible defaults**: Make configuration optional where possible
4. **Document integration**: Show users how to wire up both sides
5. **Export types**: Let users access your types for their own extensions

## Examples

Study the built-in plugins for patterns:

- [stately-files](https://github.com/georgeleepatterson/stately/tree/main/crates/stately-files) - File management
- [stately-arrow](https://github.com/georgeleepatterson/stately/tree/main/crates/stately-arrow) - Data connectivity
- [@statelyjs/files](https://github.com/georgeleepatterson/stately/tree/main/packages/files) - File UI
- [@statelyjs/arrow](https://github.com/georgeleepatterson/stately/tree/main/packages/arrow) - Data UI
