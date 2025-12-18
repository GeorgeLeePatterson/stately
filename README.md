# 🏰 Stately

[![Crates.io](https://img.shields.io/crates/v/stately.svg)](https://crates.io/crates/stately)
[![Documentation](https://docs.rs/stately/badge.svg)](https://docs.rs/stately)
[![npm](https://img.shields.io/npm/v/@statelyjs/ui)](https://www.npmjs.com/package/@statelyjs/ui)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

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
┌─────────────────────────────────────────────────────────────────────────┐
│                           YOUR APPLICATION                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                        FRONTEND (React)                              ││
│  ├─────────────────────────────────────────────────────────────────────┤│
│  │                                                                      ││
│  │  @statelyjs/ui                                                         ││
│  │  ├── base/     → Layout, theme, plugin runtime, registry            ││
│  │  └── core/     → Entity CRUD views, hooks, schema integration       ││
│  │                                                                      ││
│  │  @statelyjs/schema  → Type definitions, schema parsing, validation    ││
│  │  @statelyjs/codegen → Generate types from OpenAPI spec                ││
│  │                                                                      ││
│  │  PLUGINS:                                                            ││
│  │  @statelyjs/files   → File browser UI (pairs with stately-files)      ││
│  │  @statelyjs/arrow   → SQL query UI (pairs with stately-arrow)         ││
│  │                                                                      ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                    │                                     │
│                              OpenAPI Spec                                │
│                                    │                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                        BACKEND (Rust)                                ││
│  ├─────────────────────────────────────────────────────────────────────┤│
│  │                                                                      ││
│  │  stately         → Core state management, entity macros             ││
│  │  stately-derive  → Procedural macros (#[entity], #[state], etc.)    ││
│  │                                                                      ││
│  │  PLUGINS:                                                            ││
│  │  stately-files   → File system browsing, uploads, downloads         ││
│  │  stately-arrow   → SQL queries via DataFusion, Arrow IPC streaming  ││
│  │                                                                      ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Backend Setup

```toml
# Cargo.toml
[dependencies]
stately = { version = "0.3", features = ["axum"] }

# Optional plugins
stately-files = "0.1"
stately-arrow = { version = "0.1", features = ["clickhouse"] }
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

See [`crates/stately`](crates/stately) for complete backend documentation.

### Frontend Setup

```bash
# Install packages
pnpm add @statelyjs/ui @statelyjs/schema @tanstack/react-query @tanstack/react-router

# Install codegen (dev dependency)
pnpm add -D @statelyjs/codegen

# Generate types from your backend's OpenAPI spec
pnpm exec @statelyjs/codegen ./openapi.json ./src/generated
```

```typescript
// src/lib/stately-integration.ts
import { stately } from '@statelyjs/ui/schema';
import { statelyUi, statelyUiProvider, useStatelyUi } from '@statelyjs/ui';
import type { DefineConfig, Schemas } from '@statelyjs/ui/schema';
import { PARSED_SCHEMAS } from './generated/schemas';
import type { components, operations, paths } from './generated/types';
import openapiDoc from '../openapi.json';
import { api } from './api/client';

// Define your schema types
export type AppSchemas = Schemas<
  DefineConfig<components, DefinePaths<paths>, DefineOperations<operations>, typeof PARSED_SCHEMAS>
>;

// Create schema runtime
export const appSchema = stately<AppSchemas>(openapiDoc, PARSED_SCHEMAS);

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

See [`packages/ui`](packages/ui) for complete frontend documentation.

## Packages

### Rust Crates

| Crate | Description |
|-------|-------------|
| [`stately`](crates/stately) | Core library - entity macros, state management, Axum integration |
| [`stately-derive`](crates/stately-derive) | Procedural macros (re-exported by `stately`) |
| [`stately-files`](crates/stately-files) | File system plugin - browsing, upload, download |
| [`stately-arrow`](crates/stately-arrow) | SQL query plugin - DataFusion, Arrow IPC streaming |

### TypeScript Packages

| Package | Description |
|---------|-------------|
| [`@statelyjs/schema`](packages/schema) | Schema type definitions, parsing, validation |
| [`@statelyjs/codegen`](packages/codegen) | CLI tool for generating types from OpenAPI |
| [`@statelyjs/ui`](packages/ui) | React components - base runtime + core entity UI |
| [`@statelyjs/files`](packages/files) | File browser UI plugin |
| [`@statelyjs/arrow`](packages/arrow) | SQL query UI plugin with Arrow IPC streaming |

## Plugin Architecture

Stately is designed around a plugin architecture. The "core" functionality (entity CRUD) is itself a plugin, demonstrating the pattern for extension.

### For Users

Install backend and frontend plugins that pair together:

```rust
// Backend: Cargo.toml
stately-files = "0.1"
stately-arrow = "0.1"
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
- **Files**: [`crates/stately-files`](crates/stately-files) + [`packages/files`](packages/files)
- **Arrow**: [`crates/stately-arrow`](crates/stately-arrow) + [`packages/arrow`](packages/arrow)

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

- [Rust examples](crates/stately/examples) - Basic usage, Axum API
- Real-world usage: See how plugins are integrated in a full application

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.

## Links

- [Rust Documentation](https://docs.rs/stately)
- [Crates.io](https://crates.io/crates/stately)
- [npm](https://www.npmjs.com/package/@statelyjs/ui)
- [Repository](https://github.com/georgeleepatterson/stately)
- [Issue Tracker](https://github.com/georgeleepatterson/stately/issues)
