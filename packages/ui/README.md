# @stately/ui

[![npm](https://img.shields.io/npm/v/@stately/ui)](https://www.npmjs.com/package/@stately/ui)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../LICENSE)

> React UI components and runtime for Stately applications

This package provides the complete UI layer for Stately applications, including the plugin runtime, theming, layout, and full CRUD interfaces for entities.

## Installation

```bash
pnpm add @stately/ui @stately/schema @tanstack/react-query @tanstack/react-router openapi-fetch
```

## Architecture: Base vs Core

The `@stately/ui` package is organized into two layers:

```
@stately/ui
├── base/     → Plugin runtime, layout, theme, registry (no backend assumptions)
└── core/     → Entity CRUD, schema integration, hooks (requires stately backend)
```

### Base Layer (`@stately/ui/base`)

The **base** layer provides infrastructure that works with *any* backend. It has no knowledge of Stately's entity system:

- **Plugin Runtime**: `createStatelyUi()`, plugin registration, typed context
- **Layout**: App shell with sidebar, header, mobile responsiveness
- **Theme**: Dark/light mode toggle, theme provider
- **Registry**: Component and transformer registries for schema nodes
- **Utilities**: Path helpers, string transformations, logging

**Use base directly** when building a plugin or custom UI that doesn't need entity CRUD.

### Core Layer (default export)

The **core** layer is itself a plugin that adds Stately entity management:

- **Entity Views**: List, create, edit, view pages
- **Entity Hooks**: `useEntityData`, `useCreateEntity`, `useUpdateEntity`, etc.
- **Schema Integration**: Entity/StateEntry types, validation
- **Field Components**: Auto-generated form fields from schema nodes

**Core is included by default** when you use `statelyUi()` - it's the "batteries included" experience.

### Why This Separation?

This architecture serves two purposes:

1. **For users**: Import `@stately/ui` and get everything working immediately
2. **For plugin authors**: The base layer demonstrates how plugins are structured. Core is just a plugin that happens to ship with the package.

## Quick Start

### 1. Generate Types

First, generate TypeScript types from your backend's OpenAPI spec:

```bash
npx @stately/codegen ./openapi.json ./src/generated
```

This creates:
- `types.ts` - TypeScript interfaces for your API
- `schemas.ts` - Parsed schema nodes for the UI runtime

### 2. Create Integration File

```typescript
// src/lib/stately-integration.ts
import { stately } from '@stately/ui/schema';
import { statelyUi, statelyUiProvider, useStatelyUi } from '@stately/ui';
import type { DefineConfig, DefineOperations, DefinePaths, Schemas } from '@stately/ui/schema';
import createClient from 'openapi-fetch';

import { PARSED_SCHEMAS } from '@/generated/schemas';
import type { components, operations, paths } from '@/generated/types';
import openapiDoc from '../../openapi.json';

// Type your schemas
export type AppSchemas = Schemas<
  DefineConfig<
    components,
    DefinePaths<paths>,
    DefineOperations<operations>,
    typeof PARSED_SCHEMAS
  >
>;

// Create API client
const api = createClient<paths>({ baseUrl: 'http://localhost:3000' });

// Create schema runtime (types + validation)
export const appSchema = stately<AppSchemas>(openapiDoc, PARSED_SCHEMAS);

// Create UI runtime (components + hooks)
export const appStatelyUi = statelyUi<AppSchemas>({
  client: api,
  schema: appSchema,
  core: {
    api: { pathPrefix: '/entity' },
    entities: {
      icons: {
        pipeline: PlayCircle,
        source_config: Database,
      },
    },
  },
  options: {
    api: { pathPrefix: '/api/v1' },
    navigation: {
      routes: {
        label: 'My App',
        to: '/',
        items: [
          { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
          { icon: Settings, label: 'Settings', to: '/settings' },
        ],
      },
    },
  },
});

// Export typed provider and hook
export const AppStatelyUiProvider = statelyUiProvider<AppSchemas>();
export const useAppStatelyUi = useStatelyUi<AppSchemas>;
```

### 3. Setup Provider

```tsx
// src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { AppStatelyUiProvider, appStatelyUi } from '@/lib/stately-integration';
import { routeTree } from './routeTree.gen';

const queryClient = new QueryClient();
const router = createRouter({ routeTree });

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppStatelyUiProvider value={appStatelyUi}>
        <RouterProvider router={router} />
      </AppStatelyUiProvider>
    </QueryClientProvider>
  );
}
```

### 4. Use Components and Hooks

```tsx
// src/routes/entities/$type.tsx
import { useParams } from '@tanstack/react-router';
import { useAppStatelyUi } from '@/lib/stately-integration';

export function EntityListPage() {
  const { type } = useParams({ from: '/entities/$type' });
  const { plugins } = useAppStatelyUi();
  
  // Access core plugin utilities
  const { hooks, views } = plugins.core;
  const { data, isLoading } = hooks.useListEntities(type);
  
  if (isLoading) return <div>Loading...</div>;
  
  return <views.EntityListView data={data} type={type} />;
}
```

## Adding Plugins

Plugins extend both the schema (types) and UI (components) layers:

```typescript
import { filesPlugin, filesUiPlugin } from '@stately/files';
import { arrowPlugin, arrowUiPlugin } from '@stately/arrow';

// Extend schema types
export type AppSchemas = Schemas<
  DefineConfig<components, DefinePaths<paths>, DefineOperations<operations>, typeof PARSED_SCHEMAS>,
  readonly [FilesPlugin, ArrowPlugin]  // Plugin type augments
>;

// Create schema with plugins
export const appSchema = stately<AppSchemas>(openapiDoc, PARSED_SCHEMAS)
  .withPlugin(filesPlugin())
  .withPlugin(arrowPlugin());

// Create UI with plugins
export const appStatelyUi = statelyUi<AppSchemas, readonly [FilesUiPlugin, ArrowUiPlugin]>({
  client: api,
  schema: appSchema,
  // ... options
})
  .withPlugin(filesUiPlugin({ api: { pathPrefix: '/files' } }))
  .withPlugin(arrowUiPlugin({ api: { pathPrefix: '/arrow' } }));
```

## Exports

### Main Export (`@stately/ui`)

```typescript
import {
  // Runtime creation
  statelyUi,
  statelyUiProvider,
  useStatelyUi,
  
  // Theme
  ThemeProvider,
  ThemeToggle,
  useTheme,
  
  // Layout
  Layout,
  
  // Types
  type StatelyUi,
  type StatelyConfiguration,
} from '@stately/ui';
```

### Schema Export (`@stately/ui/schema`)

Re-exports from `@stately/schema` plus core schema utilities:

```typescript
import {
  stately,
  coreSchemaUtils,
  CORE_PLUGIN_NAME,
  
  // Type helpers
  type Schemas,
  type DefineConfig,
  type DefinePlugin,
} from '@stately/ui/schema';
```

### Base Export (`@stately/ui/base`)

Lower-level utilities for plugin authors:

```typescript
import {
  createStatelyUi,
  createStatelyUiProvider,
  createUseStatelyUi,
  
  // Registry
  registry,
  
  // Utilities
  cn,
  toTitleCase,
  toKebabCase,
} from '@stately/ui/base';
```

### Core Export (`@stately/ui/core`)

Direct access to core plugin internals:

```typescript
import {
  coreUiPlugin,
  corePlugin,
  
  // Types
  type CoreUiPlugin,
  type CorePlugin,
  type CoreStateEntry,
  type CoreEntity,
} from '@stately/ui/core';
```

## Configuration Options

### Core Options

```typescript
statelyUi({
  core: {
    api: {
      pathPrefix: '/entity',  // API path prefix for entity endpoints
    },
    entities: {
      icons: {
        // Map entity types to Lucide icons
        pipeline: PlayCircle,
        source_config: Database,
      },
    },
  },
});
```

### Global Options

```typescript
statelyUi({
  options: {
    api: {
      pathPrefix: '/api/v1',  // Global API prefix
    },
    navigation: {
      routes: {
        label: 'App Name',
        to: '/',
        items: [
          { icon: Home, label: 'Home', to: '/' },
          { icon: Settings, label: 'Settings', to: '/settings' },
        ],
      },
    },
  },
});
```

## Writing a Plugin

Plugins follow the same pattern as core. See [`@stately/files`](../files) and [`@stately/arrow`](../arrow) for examples.

A UI plugin provides:

1. **Schema Plugin**: Type augmentations and utilities
2. **UI Plugin**: Components, hooks, routes, API operations

```typescript
import type { DefineUiPlugin } from '@stately/ui/base';

export type MyUiPlugin = DefineUiPlugin<
  'my-plugin',
  MyPluginOptions,
  MyPluginRoutes,
  MyPluginUtils
>;

export function myUiPlugin(options: MyPluginOptions): UiPluginFactory<MyUiPlugin> {
  return (runtime) => ({
    name: 'my-plugin',
    options,
    routes: { /* ... */ },
    utils: { /* ... */ },
    api: {
      operations: createOperations(runtime.client, options),
    },
  });
}
```

## Peer Dependencies

- `react` >= 18
- `@tanstack/react-query` >= 5
- `openapi-fetch` >= 0.9

## License

Apache-2.0
