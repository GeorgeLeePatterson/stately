---
title: Plugins
description: Understanding Stately's plugin architecture
---

# Plugins

Stately's plugin system enables extending functionality across the entire stack. Plugins are "vertical" - they provide coordinated backend and frontend capabilities that work together seamlessly.

## Plugin Philosophy

Traditional plugin systems often work at a single layer - backend middleware, frontend components, or API extensions. Stately plugins span the full stack:

```
┌─────────────────────────────────────────┐
│              Your Application           │
├────────────────────┬────────────────────┤
│        Files       │       Arrow        │ 
│   ┌─────────────┐  │  ┌─────────────┐   │
│   │ @statelyjs/ │  │  │ @statelyjs/ │   │
│   │    files    │  │  │    arrow    │   │
│   └─────────────┘  │  └─────────────┘   │
│          ↓         │         ↓          │
│   ┌─────────────┐  │  ┌─────────────┐   │
│   │  stately-   │  │  │  stately-   │   │
│   │    files    │  │  │    arrow    │   │
│   └─────────────┘  │  └─────────────┘   │
└────────────────────┴────────────────────┘
```

When you add file upload capabilities, you get:
- Backend: Rust endpoints for upload, download, versioning
- Frontend: React components for file browsers, upload dialogs, path selectors
- Types: Generated TypeScript matching Rust types
- Integration: Path types that work in entity forms

## Built-in Plugins

Stately includes two production-ready plugins:

### Files Plugin

**Backend (`stately-files`):**
- Multipart and JSON file upload endpoints
- Automatic UUID v7 file versioning
- Directory listing with metadata
- Download endpoints with version support
- Path types for entity fields

**Frontend (`@statelyjs/files`):**
- File manager page component
- File browser and selector dialogs
- RelativePath form field
- Upload and download hooks
- Version history views
- File and versioned file downloading

### Arrow Plugin

**Backend (`stately-arrow`):**
- Connector registry for data sources
- Support for `S3`, `GCS`, `Azure`, `ClickHouse`, and more
- SQL query execution via `DataFusion`
- Streaming `Arrow` IPC responses
- Catalog and schema discovery

**Frontend (`@statelyjs/arrow`):**
- Data explorer page component
- Connector browser with schema navigation
- SQL query editor with syntax highlighting
- Streaming results table
- Query statistics and metrics

## Using Plugins

### Backend Integration

Add the plugin crate and wire it into your router:

```rust
use stately_files::{router as files_router, FileState, Dirs};

// Configure plugin state
impl FromRef<ApiState> for FileState {
    fn from_ref(state: &ApiState) -> Self {
        let dirs = Dirs::new(
            state.config.cache_dir.clone(),
            state.config.data_dir.clone(),
        );
        FileState::new(dirs)
    }
}

// Add to router
pub fn app(state: ApiState) -> Router {
    Router::new()
        .nest("/api/entity", entity_router(state.clone()))
        .nest("/api/files", files_router(state.clone()))
        .with_state(state)
}
```

### Frontend Integration

Install the plugin packages and compose them with your runtime:

```typescript
import { statelyUi, statelyUiProvider, useStatelyUi } from '@statelyjs/stately';
import { stately } from '@statelyjs/stately/schema';
import { filesPlugin, filesUiPlugin } from '@statelyjs/files';
import { arrowPlugin, arrowUiPlugin } from '@statelyjs/arrow';

// Schema runtime with plugins
const schema = stately<AppSchemas>(openapiSpec, PARSED_SCHEMAS)
  .withPlugin(filesPlugin())
  .withPlugin(arrowPlugin());

// UI runtime with plugins (core plugin is included automatically)
const runtime = statelyUi<AppSchemas>({
  client,
  schema,
  core: { api: { pathPrefix: '/entity' } },
  options: { api: { pathPrefix: '/api/v1' } },
})
  .withPlugin(filesUiPlugin({ api: { pathPrefix: '/files' } }))
  .withPlugin(arrowUiPlugin({ api: { pathPrefix: '/arrow' } }));
```

> **Note:** The core plugin is automatically included when you use `statelyUi()` or `stately()` from `@statelyjs/stately`. You never need to add it manually.

### Using Plugin Features

Once integrated, plugins provide typed access to their capabilities:

```typescript
// Access plugin API and utilities
const { plugins } = useStatelyUi();
const filesApi = plugins.files.api;
const { formatFileSize } = plugins.files.utils;

// Use plugin hooks
import { useFileExplore, useUpload } from '@statelyjs/files';

function MyComponent() {
  const { files, navigate } = useFileExplore('/uploads');
  const { upload, isUploading } = useUpload();
  
  // ...
}
```

## Plugin Anatomy

### Backend Structure

A plugin crate typically includes:

```
stately-my-plugin/
├── Cargo.toml
├── src/
│   ├── lib.rs          # Public exports
│   ├── router.rs       # Router factory
│   ├── handlers.rs     # HTTP handlers
│   ├── state.rs        # Plugin state type
│   ├── request.rs      # Request DTOs
│   ├── response.rs     # Response DTOs
│   ├── error.rs        # Error types
│   └── openapi.rs      # OpenAPI generation
└── bin/
    └── generate-openapi.rs
```

**Key patterns:**

1. **Router Factory**: Generic over application state

```rust
pub fn router<S>(state: S) -> Router<S>
where
    S: Clone + Send + Sync + 'static,
    MyPluginState: FromRef<S>,
{
    Router::new()
        .route("/endpoint", get(handler))
        .with_state(state)
}
```

2. **State Extraction**: Via Axum's `FromRef`

```rust
pub struct MyPluginState {
    pub config: PluginConfig,
}

// User implements this for their app state
impl FromRef<AppState> for MyPluginState { ... }
```

3. **OpenAPI Generation**: For type codegen

```rust
// bin/generate-openapi.rs
fn main() {
    let output_dir = PathBuf::from(".");
    let doc = stately::codegen::generate_openapi::<OpenApiDoc>(&output_dir);
    println!("{}", serde_json::to_string_pretty(&doc).unwrap());
}
```

### Frontend Structure

A plugin package typically includes:

```
@statelyjs/my-plugin/
├── package.json
├── src/
│   ├── index.ts           # Public exports
│   ├── plugin.ts          # Plugin factories
│   ├── schema.ts          # Schema plugin (node types)
│   ├── api.ts             # API operations
│   ├── context.tsx        # Plugin context hook
│   ├── components/        # React components
│   ├── views/             # Composed views
│   ├── pages/             # Full page components
│   ├── hooks/             # React hooks
│   ├── fields/            # Form field components
│   │   ├── edit/
│   │   └── view/
│   └── codegen.ts         # Codegen plugin (optional)
└── openapi.json           # Generated from backend
```

**Key patterns:**

1. **Two-Tier Plugin**: Schema + UI

```typescript
// Schema plugin - extends type system
export function mySchemaPlugin<S extends Schemas>(): PluginFactory<S> {
  return runtime => ({
    ...runtime,
    plugins: { ...runtime.plugins, myPlugin: {} },
  });
}

// UI plugin - registers components, API, utilities
export function myUiPlugin(options?: Options): UiPluginFactory {
  return runtime => {
    const api = createOperations(runtime.client, OPERATIONS, options?.pathPrefix);
    
    // Register custom field components
    runtime.registry.components.set('myNodeType::edit', MyFieldEdit);
    runtime.registry.components.set('myNodeType::view', MyFieldView);
    
    return {
      ...runtime,
      plugins: {
        ...runtime.plugins,
        myPlugin: { api, options, utils: myUtils },
      },
    };
  };
}
```

2. **Context Hook**: Typed access to plugin

```typescript
export function useMyPlugin() {
  const runtime = useStatelyUi();
  return runtime.plugins.myPlugin;
}
```

3. **Codegen Plugin**: Transform schemas during generation

```typescript
export const myCodegenPlugin: CodegenPlugin = {
  name: 'my-plugin',
  // Define entrypoints to parse from the top
  entrypoints: undefined, /** ["SomeExpectedType", ...], */
  description: 'Detects OpenAPI definitions of relevant nodes',
  match(schema) {
    // Match on anything to identify that transformation should occur
    return Boolean(schema?.oneOf);
  },
  // Finally, emit special node types
  transformNode(node, context) {
    // Transform matching nodes to custom types
    if (matchesMyPattern(node)) {
      return { nodeType: 'myCustomNodeType', ...node };
    }
    return node;
  },
};
```

## The Component Registry

Plugins register components for their node types:

```typescript
// Registration
registry.components.set('relativePath::edit', RelativePathEdit);
registry.components.set('relativePath::view', RelativePathView);

// Lookup (done automatically by FieldEdit/FieldView)
const EditComponent = registry.components.get('relativePath::edit');
```

This enables schema-driven rendering: when a form encounters a `relativePath` node, it automatically renders the plugin's component.

## Plugin Communication

Plugins can interact through the shared runtime:

```typescript
function MyComponent() {
  const { plugins } = useStatelyUi();
  
  // Use files plugin to upload
  const {
    full_path,
    path,
    success,
    uuid,
  } = await plugins.files.api.upload({ body: formData });
  
  // Use arrow plugin to query
  const { response, error } = await plugins.arrow.api.execute_query({ body, parseAs: 'stream' });
}
```

## Creating Your Own Plugin

See the [Plugin Development](../../develop/plugins.md) guide for a complete walkthrough of creating custom plugins.

Key steps:
1. Define your backend Rust crate with router and handlers
2. Generate OpenAPI spec from your backend
3. Create frontend package with schema and UI plugins
4. Register custom node types and components
5. Document integration patterns

## Codegen Configuration

When using plugins that extend the schema (like Files), you need to configure codegen to include the plugin's transformations. Create a config file (e.g., `stately.codegen.config.ts`):

```typescript
// stately.codegen.config.ts (or any name you prefer)
import { filesCodegenPlugin } from '@statelyjs/files/codegen';
import { someOtherCodegenPlugin } from 'some-other-stately-plugin';

export default [filesCodegenPlugin, someOtherCodegenPlugin];
```

Then run codegen with the config:

```bash
pnpm exec stately generate ./openapi.json -o ./src/generated -c ./stately.codegen.config.ts
```

Codegen plugins transform schema nodes during generation. For example, the files plugin detects `RelativePath` and `UserDefinedPath` patterns and generates appropriate node types.
