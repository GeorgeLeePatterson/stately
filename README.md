# 🏰 Stately

[![Crates.io](https://img.shields.io/crates/v/stately.svg)](https://crates.io/crates/stately)
[![Documentation](https://docs.rs/stately/badge.svg)](https://docs.rs/stately)
[![npm](https://img.shields.io/npm/v/@statelyjs/stately)](https://www.npmjs.com/package/@statelyjs/stately)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](https://github.com/georgeleepatterson/stately/blob/main/LICENSE)

> Full-stack type-safe state management with auto-generated UI and a plugin architecture

Stately is a full-stack framework for building data-driven applications. The Rust backend provides type-safe entity management, CRUD operations, and automatic API generation. The TypeScript frontend automatically generates React interfaces from OpenAPI schemas. Both sides support a plugin architecture for extensibility.

## Features

### Backend (Rust)
- **Type-Safe Entities**: Compile-time guarantees for entity relationships and state operations
- **Entity Relationships**: Reference entities inline or by ID with `Link<T>`
- **CRUD Operations**: Built-in create, read, update, delete for all entity types
- **OpenAPI Generation**: Automatic schema generation with `utoipa`
- **Web Framework Integration**: Axum API generation with event middleware
- **Plugin Architecture**: Extend with custom backends (files, arrow/SQL, auth, etc.)

### Frontend (TypeScript/React)
- **Schema-Driven**: Types and components generated from OpenAPI specs
- **Plugin System**: Composable UI plugins that mirror backend capabilities
- **Full CRUD Views**: Entity listing, creation, editing out of the box
- **Customizable**: Built on shadcn/ui, fully themeable

## Architecture Overview

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           YOUR APPLICATION                                │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                        FRONTEND (React)                             │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │                                                                     │  │
│  │  @statelyjs/ui      → Layout, theme, plugin runtime, registry       │  │
│  │  @statelyjs/schema  → Type definitions, schema parsing, validation  │  │
│  │  @statelyjs/stately → Core plugin (entity CRUD) + codegen CLI       │  │
│  │                                                                     │  │
│  │  PLUGINS:                                                           │  │
│  │  @statelyjs/files   → File browser UI (pairs with stately-files)    │  │
│  │  @statelyjs/arrow   → SQL query UI (pairs with stately-arrow)       │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                    │                                      │
│                              OpenAPI Spec                                 │
│                                    │                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                        BACKEND (Rust)                               │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │                                                                     │  │
│  │  stately         → Core state management, entity macros             │  │
│  │  stately-derive  → Procedural macros (#[entity], #[state], etc.)    │  │
│  │                                                                     │  │
│  │  PLUGINS:                                                           │  │
│  │  stately-files   → File system browsing, uploads, downloads         │  │
│  │  stately-arrow   → SQL queries via DataFusion, Arrow IPC streaming  │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Backend Setup

```toml
# Cargo.toml
[dependencies]
stately = { version = "0.*", features = ["axum"] }

# Optional plugins
stately-files = "0.*"
stately-arrow = { version = "0.*", features = ["clickhouse"] }
```

```rust
use stately::prelude::*;

// Define entities
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

// Define state with collections
#[stately::state(openapi)]
pub struct State {
    pipelines: Pipeline,
    sources: SourceConfig,
}

// Generate API
#[stately::axum_api(State, openapi)]
pub struct ApiState {}
```

See [`crates/stately`](https://github.com/GeorgeLeePatterson/stately/tree/main/crates/stately) for complete backend documentation.

### Frontend Setup

```bash
# Install packages
pnpm add @statelyjs/stately @statelyjs/ui @tanstack/react-query

# Generate types from your backend's OpenAPI spec
pnpm exec stately ./openapi.json -o ./src/generated
```

```typescript
// src/lib/stately.ts
import { statelyUi, statelyUiProvider, useStatelyUi } from '@statelyjs/stately';
import { type DefineConfig, type Schemas, stately } from '@statelyjs/stately/schema';
import { PARSED_SCHEMAS, type ParsedSchema } from './generated/schemas';
import type { components, operations, paths } from './generated/types';
import openapiDoc from '../openapi.json';
import { api } from './api/client';

// Define your schema types
export type AppSchemas = Schemas<DefineConfig<components, paths, operations, ParsedSchema>>;

// Create schema runtime
export const appSchema = stately<AppSchemas>(openapiDoc, PARSED_SCHEMAS, {
  // Enable lazy loading for code-split schemas
  runtimeSchemas: () => import('./generated/schemas.runtime').then(m => m.RUNTIME_SCHEMAS),
});

// Create UI runtime
export const appStatelyUi = statelyUi<AppSchemas>({
  client: api,
  schema: appSchema,
  core: { api: { pathPrefix: '/entity' } },
  options: {
    api: { pathPrefix: '/api/v1' },
  },
});

// Export typed hooks and provider
export const useAppStatelyUi = useStatelyUi<AppSchemas>;
export const AppStatelyUiProvider = statelyUiProvider<AppSchemas>();
```

> **Working Example**: See the [`demos/tasks`](https://github.com/GeorgeLeePatterson/stately/tree/main/demos/tasks) application for a complete working example that follows this setup.

> See [`packages/stately`](https://github.com/GeorgeLeePatterson/stately/tree/main/packages/stately) for complete frontend documentation.

## Packages

### Rust Crates

| Crate | Description |
|-------|-------------|
| [`stately`](https://github.com/GeorgeLeePatterson/stately/tree/main/crates/stately) | Core library - entity macros, state management, Axum integration |
| [`stately-derive`](https://github.com/GeorgeLeePatterson/stately/tree/main/crates/stately-derive) | Procedural macros (re-exported by `stately`) |
| [`stately-files`](https://github.com/GeorgeLeePatterson/stately/tree/main/crates/stately-files) | File system plugin - browsing, upload, download |
| [`stately-arrow`](https://github.com/GeorgeLeePatterson/stately/tree/main/crates/stately-arrow) | SQL query plugin - DataFusion, Arrow IPC streaming |

### TypeScript Packages

| Package | Description |
|---------|-------------|
| [`@statelyjs/stately`](https://github.com/GeorgeLeePatterson/stately/tree/main/packages/stately) | Main package. Core plugin (entity CRUD) + codegen CLI |
| [`@statelyjs/ui`](https://github.com/GeorgeLeePatterson/stately/tree/main/packages/ui) | Base React components, layout, theme, plugin runtime |
| [`@statelyjs/schema`](https://github.com/GeorgeLeePatterson/stately/tree/main/packages/schema) | Lower level schema type definitions, parsing, validation |
| [`@statelyjs/files`](https://github.com/GeorgeLeePatterson/stately/tree/main/packages/files) | File browser UI plugin |
| [`@statelyjs/arrow`](https://github.com/GeorgeLeePatterson/stately/tree/main/packages/arrow) | SQL query UI plugin with Arrow IPC streaming |

## Plugin Architecture

Stately is designed around a plugin architecture. The "core" functionality (entity CRUD) is itself a plugin, demonstrating the pattern for extension.

### For Users

Install backend and frontend plugins that pair together:

```rust
// Backend: Cargo.toml
stately-files = "0.*"
stately-arrow = "0.*"
```

```typescript
// Frontend: Add plugins to your runtime
import { filesPlugin, filesUiPlugin } from '@statelyjs/files';
import { arrowPlugin, arrowUiPlugin } from '@statelyjs/arrow';

const schema = stately<AppSchemas>(openapiDoc, PARSED_SCHEMAS)
  .withPlugin(filesPlugin())
  .withPlugin(arrowPlugin());

const ui = statelyUi<AppSchemas>({ ... })
  .withPlugin(filesUiPlugin({ api: { pathPrefix: '/files' } }))
  .withPlugin(arrowUiPlugin({ api: { pathPrefix: '/arrow' } }));
```

### For Plugin Authors

See the existing plugins as examples:
- **Files**: [`crates/stately-files`](https://github.com/GeorgeLeePatterson/stately/tree/main/crates/stately-files) + [`packages/files`](https://github.com/GeorgeLeePatterson/stately/tree/main/packages/files)
- **Arrow**: [`crates/stately-arrow`](https://github.com/GeorgeLeePatterson/stately/tree/main/crates/stately-arrow) + [`packages/arrow`](https://github.com/GeorgeLeePatterson/stately/tree/main/packages/arrow)

Key concepts:
1. Backend plugins expose Axum routers and OpenAPI schemas
2. Frontend plugins implement `SchemaPlugin` (for types) and `UiPlugin` (for components)
3. Use `pnpm codegen` after backend changes to regenerate frontend types

## Development

```bash
# Clone the repository
git clone https://github.com/georgeleepatterson/stately
cd stately

# Backend development
cargo build
cargo test
cargo run --example basic

# Frontend development
pnpm install
pnpm build
pnpm test
```

## Examples

| Example | Description |
|---------|-------------|
| [`demos/tasks`](https://github.com/GeorgeLeePatterson/stately/tree/main/demos/tasks) | Complete full-stack task management app demonstrating frontend setup |
| [`crates/stately/examples`](https://github.com/GeorgeLeePatterson/stately/tree/main/crates/stately/examples) | Rust examples for backend entity definitions and Axum integration |

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](https://github.com/georgeleepatterson/stately/blob/main/CONTRIBUTING.md) for guidelines.

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](https://github.com/georgeleepatterson/stately/blob/main/LICENSE) for details.

## Links

- [Rust Documentation](https://docs.rs/stately)
- [Crates.io](https://crates.io/crates/stately)
- [npm](https://www.npmjs.com/package/@statelyjs/stately)
- [Repository](https://github.com/georgeleepatterson/stately)
- [Issue Tracker](https://github.com/georgeleepatterson/stately/issues)
