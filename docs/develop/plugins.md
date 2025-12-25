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
│   └── my-plugin/          # Rust crate
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
    └── my-plugin-ui/          # TypeScript package
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
struct OpenApiDoc;

fn main() {
    let output_dir = std::env::args().nth(1).unwrap_or_else(|| {
        eprintln!("Usage: my-plugin-openapi <output_dir>");
        std::process::exit(1);
    });

    match stately::codegen::generate_openapi::<OpenApiDoc;>(&output_dir) {
        Ok(path) => println!("OpenAPI spec written to {}", path.display()),
        Err(e) => {
            eprintln!("Failed to generate OpenAPI spec: {e}");
            std::process::exit(1);
        }
    }
}
```

```bash
cargo run --bin my-plugin-openapi > ../packages/my-plugin-ui/openapi.json
```

### 3. Frontend Package

```typescript
// src/plugin.ts
import type { DefinePlugin, Schemas, PluginFactory } from '@statelyjs/stately/schema';
import {
  type AnyUiPlugin,
  registry as baseRegistry,
  createOperations,
  type DefineOptions,
  type DefineUiPlugin,
  type RouteOption,
  type UiNavigationOptions,
  type UiPluginFactory,
} from '@statelyjs/ui';
import { StarIcon } from 'lucide-react';

import { MY_OPERATIONS, MyPluginPaths } from './api';
import type { MyPluginData, MyPluginNodeMap, MyPluginTypes } from './schema';
import { MyPluginNodeType } from './schema';
import { type MyPluginUiUtils, type MyPluginUtils, myPluginUiUtils } from './utils';

export const MY_PLUGIN_NAME = 'my-plugin' as const;


/**
 * Schema Plugin
 */

// Declare schema plugin definition
export type MyPlugin = DefinePlugin<
  typeof MY_PLUGIN_NAME,
  // Declare any new nodes this plugin's codegen will parse and generate
  MyPluginNodeMap,
  // Declare any schema types that should be accessible during plugin development
  MyPluginTypes,
  // Declare any derived schema structures
  MyPluginData,
  // Declare any plugin utilities
  MyPluginUtils,
>;

// Schema plugin - extends type system
export function myPlugin<S extends Schemas<any, any> = Schemas>(): PluginFactory<S> {
  return runtime => ({
    ...runtime,
    plugins: { 
      ...runtime.plugins, 
      [MY_PLUGIN_NAME]: {
        // Optionally provide any schema level utilities
        // ...utils,
        // Optionally provide a validation hook that will be run on every node during edit
        // validate: (args: ValidateArgs<S>) => ({ valid: true, errors: [] }) 
      } 
    },
  });
}

/**
 * UI Plugin
 */

// Declare the default route for any pages exported. User can override.
export const myPluginRoutes: RouteOption = { icon: StarIcon, label: 'My Plugin', to: '/my-plugin' };

// Define any options your ui plugin should accept
export type MyPluginUiOptions = DefineOptions<{
  /** API configuration for My Plugin endpoints */
  api?: { pathPrefix?: string };
  /** Navigation configuration for My Plugin routes */
  navigation?: { routes?: UiNavigationOptions['routes'] };
}>;

// Declare ui plugin definition
export type MyUiPlugin = DefineUiPlugin<
  typeof MY_PLUGIN_NAME,
  MyPluginPaths,
  typeof MY_OPERATIONS,
  MyPluginUiUtils,
  MyPluginUiOptions,
  typeof myPluginRoutes
>;

// UI plugin - registers components and API
export function myUiPlugin<
  Schema extends Schemas<any, any> = Schemas,
  Augments extends readonly AnyUiPlugin[] = [],
>(options?: MyPluginUiOptions): UiPluginFactory {
  return runtime => {
    const { registry, client } = runtime;
  
    // Register any components that should be used for any node types introduced
    registry.components.set(
      baseRegistry.makeRegistryKey(MyPluginNodeType.MyNewNodeType, 'edit'),
      MyPluginNodeEdit,
    );
    registry.components.set(
      baseRegistry.makeRegistryKey(MyPluginNodeType.MyNewNodeType, 'view'),
      MyPluginNodeView,
    );
    
    // Register any additional custom components or transformers (if any)
    // registry.components.set('myOtherNodeType::edit', MyOtherNodeEdit);

    // Create typed operations with user provided prefix
    const basePathPrefix = runtime.options?.api?.pathPrefix;
    const corePathPrefix = options?.api?.pathPrefix;
    const pathPrefix = runtime.utils.mergePathPrefixOptions(basePathPrefix, corePathPrefix);
    const api = createOperations<MyPluginPaths, typeof MY_OPERATIONS>(
      client,
      MY_OPERATIONS,
      pathPrefix,
    );
    
    // This is how a user can override any routes defined
    const routes = { ...myPluginRoutes, ...(options?.navigation?.routes || {}) };
  
    // Finally, declare your plugin
    const plugin = { [MY_PLUGIN_NAME]: { api, options, routes, utils: myPluginUiUtils } };
  
    return { ...runtime, plugins: { ...runtime.plugins, ...plugin } };
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
// ...user imports openapi spec and parsed definitions...
import { type MyUiPlugin, myUiPlugin } from 'my-plugin';
import { type MyPlugin, myPlugin } from 'my-plugin/schema';

type AppSchemas = Schemas<
  DefineConfig<components, paths, operations, ParseSchema>,
  readonly [MyPlugin]
>;

const schema = stately<AppSchemas>(openApiSpec, PARSED_SCHEMAS)
  .withPlugin(myPlugin());

const runtime = statelyUi<AppSchemas, readonly [MyPlugin]>({ client, schema, core, options })
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
registry.components.set(makeRegistryKey('myNodeType', 'edit'), MyNodeEdit);

// View component
registry.components.set(makeRegistryKey('myNodeType', 'view'), MyNodeView);

// Transformer (modify props before rendering)
registry.transformers.set(
  makeRegistryKey('primitive', 'edit', 'transformer', 'string'), 
  myPropsTransformer
);
```

### Codegen Plugin

Transform schemas during code generation:

```typescript
export const myCodegenPlugin: CodegenPlugin = {
  name: 'my-plugin',
  description: 'Detects nodes relevant to my plugin\'s api and parses them',
  transform(schema, context) {
    if (matchesMyPattern(schema, context)) {
      return { description: schema?.description, nodeType: 'myCustomNodeType' };
    }
    return null;
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

Files:
* [stately-files](https://github.com/georgeleepatterson/stately/tree/main/crates/stately-files) File management
* [@statelyjs/files](https://github.com/georgeleepatterson/stately/tree/main/packages/files) File UI

Arrow:
* [stately-arrow](https://github.com/georgeleepatterson/stately/tree/main/crates/stately-arrow) Data connectivity
* [@statelyjs/arrow](https://github.com/georgeleepatterson/stately/tree/main/packages/arrow) Data UI

## Todo

[ ] Clarify how entrypoints => top-level schemas work. 
> Entrypoints provide a way to reduce size of parsed output, which could get quite large. When generating for a plugin, omitting entrypoints translates to "parse and store everything". This makes sense for plugin developers since visibility into all parsed nodes is required. But for users, the "entrypoints", and thus the "top level build-time parsed schemas", represent page entrypoints. Currently only stately's core provides those, in the form of entities. But if a plugin wishes to create a page and that page receives data via an API call, and the returned type is dynamic, but has a pre-defined shape, then an entrypoint should be introduced. The remaining schemas can be accessed via 'runtime schema', and accessed with 'loadRuntimeSchemas' on the "runtime.schema" object.

[ ] Clarify how "runtime schemas" works, how to access it, and how to introduce nodes into it.

[ ] Introduce a 'cookie cutter' like template
