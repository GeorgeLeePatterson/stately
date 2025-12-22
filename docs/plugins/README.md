---
title: Plugins
description: Using Stately plugins to extend your application
---

# Plugins

Stately plugins provide additional capabilities for your application. Each plugin includes coordinated backend (Rust) and frontend (TypeScript) packages.

## Available Plugins

### Files Plugin

File upload, versioning, and management capabilities.

| Package | Description |
|---------|-------------|
| `stately-files` | Rust crate with upload endpoints and path types |
| `@statelyjs/files` | TypeScript package with file browser and form fields |

**Key Features:**
- Multipart and JSON file uploads
- Automatic UUID v7 versioning
- Directory listing and navigation
- RelativePath field type for entity forms
- File manager page component

[Files Plugin Documentation](./files/overview.md)

### Arrow Plugin

Data connectivity and SQL query execution via Apache Arrow.

| Package | Description |
|---------|-------------|
| `stately-arrow` | Rust crate with connector registry and query engine |
| `@statelyjs/arrow` | TypeScript package with data explorer and query components |

**Key Features:**
- Multiple backend connectors (S3, GCS, Azure, ClickHouse)
- SQL query execution with DataFusion
- Streaming Arrow IPC responses
- Catalog and schema discovery
- High-performance data table component

[Arrow Plugin Documentation](./arrow/overview.md)

## Installing Plugins

### Backend

Add the plugin crate to your `Cargo.toml`:

```toml
[dependencies]
stately-files = "0.3"
stately-arrow = "0.3"
```

### Frontend

Install the npm package:

```bash
pnpm add @statelyjs/files @statelyjs/arrow
```

## Integrating Plugins

### Backend Integration

1. Implement state extraction for the plugin
2. Add the plugin router to your application

```rust
use stately_files::{router as files_router, FileState, Dirs};

// State extraction
impl FromRef<ApiState> for FileState {
    fn from_ref(state: &ApiState) -> Self {
        FileState::new(Dirs::new(cache_dir, data_dir))
    }
}

// Router integration
pub fn app(state: ApiState) -> Router {
    Router::new()
        .nest("/api/files", files_router(state.clone()))
        .with_state(state)
}
```

### Frontend Integration

1. Add schema and UI plugins to your runtime
2. Configure the API path prefix

```typescript
import { filesPlugin, filesUiPlugin } from '@statelyjs/files';

const schema = Stately(spec, schemas)
  .withPlugin(filesPlugin());

const runtime = statelyUi({ client, schema, core })
  .withPlugin(filesUiPlugin({
    api: { pathPrefix: '/api/files' },
  }));
```

## Plugin Architecture

Plugins follow a consistent architecture:

**Backend:**
- Router factory function generic over application state
- State extraction via Axum's `FromRef` trait
- OpenAPI generation for type codegen

**Frontend:**
- Schema plugin for type system extensions
- UI plugin for component registration
- Typed API client and hooks
- Pre-built components, views, and pages

See [Plugin Development](../plugin-development/README.md) for details on creating your own plugins.
