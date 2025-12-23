# 🏰 @statelyjs/stately

[![npm](https://img.shields.io/npm/v/@statelyjs/stately)](https://www.npmjs.com/package/@statelyjs/stately)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../LICENSE)

> Full Stately runtime with core plugin and codegen CLI

This is the main package most users should install. It provides:

- **Core Plugin**: Entity CRUD operations, hooks, and views
- **Codegen CLI**: Generate TypeScript types from OpenAPI specs
- **Schema Utilities**: Re-exports from `@statelyjs/schema` with `core` plugin for convenience

## Installation

```bash
pnpm add @statelyjs/stately
```

## Quick Start

### 1. Generate Types from OpenAPI

```bash
# Generate types from your backend's OpenAPI spec
pnpm exec stately ./openapi.json -o ./src/generated
```

This generates:
- `schemas.ts` - Parsed schema nodes for form generation
- `types.ts` - Full OpenAPI types (paths, operations, components)

### 2. Create Your Runtime

```typescript
import { statelyUi, statelyUiProvider, useStatelyUi } from '@statelyjs/stately';
import { type DefineConfig, type Schemas, stately } from '@statelyjs/stately/schema';
import { PARSED_SCHEMAS, type ParsedSchema } from './generated/schemas';
import type { components, operations, paths } from './generated/types';
import openapiDoc from '../openapi.json';
import createClient from 'openapi-fetch';

// Create API client
const api = createClient<paths>({ baseUrl: 'http://localhost:3000' });

// Define your schema types
export type AppSchemas = Schemas<DefineConfig<components, paths, operations, ParsedSchema>>;

// Create schema runtime
export const appSchema = stately<AppSchemas>(openapiDoc, PARSED_SCHEMAS, {
  // Enable lazy loading for code-split schemas
  runtimeSchemas: () => import('./generated/schemas.runtime').then(m => m.RUNTIME_SCHEMAS),
});

// Create UI runtime with core plugin pre-installed
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

### 3. Wrap Your App

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppStatelyUiProvider, appStatelyUi } from './lib/stately';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppStatelyUiProvider value={appStatelyUi}>
        <YourApp />
      </AppStatelyUiProvider>
    </QueryClientProvider>
  );
}
```

## Core Plugin

The core plugin provides everything needed for entity CRUD operations:

### Hooks

```typescript
import {
  useListEntities,
  useEntityData,
  useCreateEntity,
  useUpdateEntity,
  useRemoveEntity,
} from '@statelyjs/stately/core/hooks';

// List all entities of a type
const { data: pipelines } = useListEntities({ entity: 'pipeline' });

// Get a single entity
const { data: pipeline } = useEntityData({ entity: 'pipeline', identifier: pipelineId });

// Create a new entity
const { mutate: create } = useCreateEntity({ entity: 'pipeline' });
create({ 
  type: 'pipeline', 
  data: { name: 'My Pipeline', source: { entity_type: 'source', ref: 'source-1' }}
});

// Update an entity
const { mutate: update } = useUpdateEntity({ entity: 'pipeline', id: pipelineId });
update({ type: 'pipeline', data: { name: 'Updated Name' } });

// Remove an entity
const { mutate: remove } = useRemoveEntity({ entity: 'pipeline' });
remove(pipelineId);
```

### Entity Views

Pre-built pages and views for common entity operations:

```typescript
import { 
  EntitiesIndexPage,
  EntityTypeListPage, 
  EntityNewPage, 
  EntityEditPage, 
  EntityDetailsPage 
} from '@statelyjs/stately/core/pages';

// List of all entities in system
<EntitiesIndexPage />

// List entities of type page
<EntityTypeListPage stateEntry="pipeline" />

// Create entities page
<EntityNewPage entity="pipeline" />

// Edit entities page 
<EntityEditPage entity="pipeline" id={pipelineId} />

// Read-only entity detail view
<EntityDetailsPage entity="pipeline" id={pipelineId} />
```

## Codegen CLI

### Basic Usage

```bash
pnpm exec stately <openapi.json> -o <output_dir>
```

### With Plugin Configuration

Create a `stately.config.js` to customize code generation:

```javascript
// stately.config.js
import { filesCodegenPlugin } from '@statelyjs/files/codegen';

export default { plugins: [filesCodegenPlugin()] };
```

Then run:

```bash
pnpm exec stately ./openapi.json -o ./src/generated -c ./stately.config.js
```

### Generated Files

| File | Description |
|------|-------------|
| `types.ts` | TypeScript interfaces from OpenAPI spec (paths, operations, components) |
| `schemas.ts` | Parsed schema nodes (`PARSED_SCHEMAS`) for runtime form generation |

## Exports

### Main (`@statelyjs/stately`)

```typescript
import {
  // Runtime creation
  statelyUi,
  useStatelyUi,
  statelyUiProvider,
  
  // Types
  type StatelyUi,
  type StatelyConfiguration,
} from '@statelyjs/stately';
```

### Schema (`@statelyjs/stately/schema`)

Re-exports from `@statelyjs/schema` with core plugin included:

```typescript
import {
  stately,
  type Schemas,
  type DefineConfig,
  type DefinePlugin,
} from '@statelyjs/stately/schema';
```

### Hooks (`@statelyjs/stately/core/hooks`)

```typescript
import {
  useListEntities,
  useEntityData,
  useEntityDataInline,
  useEntitySchema,
  useEntityUrl,
  useCreateEntity,
  useUpdateEntity,
  useRemoveEntity,
  useObjectField,
} from '@statelyjs/stately/core/hooks';
```

### Pages (`@statelyjs/stately/core/pages`)

```typescript
import {
  EntitiesIndexPage,
  EntityTypeListPage,
  EntityNewPage,
  EntityEditPage,
  EntityDetailsPage,
} from '@statelyjs/stately/core/pages';
```

### Codegen (`@statelyjs/stately/codegen`)

```typescript
import type { CodegenPlugin, CodegenPluginContext } from '@statelyjs/stately/codegen';
```

## Difference from @statelyjs/ui

| Package | Purpose |
|---------|---------|
| `@statelyjs/ui` | Base UI layer: components, layout, theme, plugin runtime. No entity knowledge. |
| `@statelyjs/stately` | Full runtime: includes `@statelyjs/ui` + core plugin + codegen CLI |

Use `@statelyjs/ui` directly only if:
- Using base components, layouts, or views provided
- Building a custom plugin without entity CRUD (possibly leaner plugin dependency)
- Want fine-grained control over plugin composition

## Peer Dependencies

- `react` ^18.0.0 || ^19.0.0
- `react-dom` ^18.0.0 || ^19.0.0
- `@tanstack/react-query` ^5.90.10
- `lucide-react` ^0.562.0
- `sonner` ^2.0.7

## Related Packages

- [`@statelyjs/ui`](../ui) - Base UI components and plugin runtime
- [`@statelyjs/schema`](../schema) - Schema types and parsing
- [`@statelyjs/files`](../files) - File management plugin
- [`@statelyjs/arrow`](../arrow) - Arrow/SQL query plugin

## License

Apache-2.0
