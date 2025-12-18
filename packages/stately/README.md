# @statelyjs/stately

[![npm](https://img.shields.io/npm/v/@statelyjs/stately)](https://www.npmjs.com/package/@statelyjs/stately)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../LICENSE)

> Full Stately runtime with core plugin and codegen CLI

This is the main package most users should install. It provides:

- **Core Plugin**: Entity CRUD operations, hooks, and views
- **Codegen CLI**: Generate TypeScript types from OpenAPI specs
- **Schema Utilities**: Re-exports from `@statelyjs/schema` for convenience

## Installation

```bash
pnpm add @statelyjs/stately
```

## Quick Start

### 1. Generate Types from OpenAPI

```bash
# Generate types from your backend's OpenAPI spec
pnpm exec stately ./openapi.json ./src/generated
```

This generates:
- `schemas.ts` - Parsed schema nodes for form generation
- `types.ts` - Full OpenAPI types (paths, operations, components)

### 2. Create Your Runtime

```typescript
import { stately } from '@statelyjs/schema';
import { statelyUi, statelyUiProvider, useStatelyUi } from '@statelyjs/stately';
import type { DefineConfig, DefinePaths, DefineOperations, Schemas } from '@statelyjs/schema';
import { PARSED_SCHEMAS } from './generated/schemas';
import type { components, operations, paths } from './generated/types';
import openapiDoc from '../openapi.json';
import createClient from 'openapi-fetch';

// Create API client
const api = createClient<paths>({ baseUrl: '/api/v1' });

// Define your schema types
export type AppSchemas = Schemas<
  DefineConfig<components, DefinePaths<paths>, DefineOperations<operations>, typeof PARSED_SCHEMAS>
>;

// Create schema runtime
export const appSchema = stately<AppSchemas>(openapiDoc, PARSED_SCHEMAS);

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
import { AppStatelyUiProvider, appStatelyUi } from './lib/stately-integration';

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
const { data: pipelines } = useListEntities('Pipeline');

// Get a single entity
const { data: pipeline } = useEntityData('Pipeline', pipelineId);

// Create a new entity
const { mutate: create } = useCreateEntity('Pipeline');
create({ name: 'My Pipeline', source: { id: 'source-1' } });

// Update an entity
const { mutate: update } = useUpdateEntity('Pipeline', pipelineId);
update({ name: 'Updated Name' });

// Remove an entity
const { mutate: remove } = useRemoveEntity('Pipeline', pipelineId);
remove();
```

### Entity Views

Pre-built views for common entity operations:

```typescript
import { EntityList, EntityCreate, EntityEdit, EntityView } from '@statelyjs/stately/core/views/entity';

// List view with create button
<EntityList entity="Pipeline" />

// Create form
<EntityCreate entity="Pipeline" onSuccess={(id) => navigate(`/pipelines/${id}`)} />

// Edit form
<EntityEdit entity="Pipeline" id={pipelineId} />

// Read-only view
<EntityView entity="Pipeline" id={pipelineId} />
```

### Link Views

For exploring entity relationships:

```typescript
import { LinkExplore, LinkSelect } from '@statelyjs/stately/core/views/link';

// Browse linked entities
<LinkExplore entity="SourceConfig" onSelect={handleSelect} />

// Select a link in a form
<LinkSelect entity="SourceConfig" value={selectedId} onChange={setSelectedId} />
```

### Field Components

Custom field renderers for edit and view modes:

```typescript
// Edit mode components
import { StringEdit, IntegerEdit, BooleanEdit, ObjectEdit } from '@statelyjs/stately/core/fields/edit';

// View mode components
import { StringView, IntegerView, BooleanView, ObjectView } from '@statelyjs/stately/core/fields/view';
```

## Codegen CLI

### Basic Usage

```bash
pnpm exec stately <openapi.json> <output_dir> [pluginConfig.js]
```

### With Plugin Configuration

Create a `stately.config.js` to customize code generation:

```javascript
// stately.config.js
import { filesCodegenPlugin } from '@statelyjs/files/codegen';

export default {
  plugins: [
    filesCodegenPlugin(),
  ],
};
```

Then run:

```bash
pnpm exec stately ./openapi.json ./src/generated ./stately.config.js
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

### Core (`@statelyjs/stately/core`)

```typescript
import {
  // Plugin
  corePlugin,
  coreUiPlugin,
  
  // Schema utilities
  stately,
  CoreNodeType,
  PrimitiveType,
  
  // Types
  type CorePlugin,
  type CoreUiPlugin,
  type Schemas,
} from '@statelyjs/stately/core';
```

### Core Hooks (`@statelyjs/stately/core/hooks`)

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

### Core Views

```typescript
// Entity views
import { EntityList, EntityCreate, EntityEdit, EntityView } from '@statelyjs/stately/core/views/entity';

// Link views  
import { LinkExplore, LinkSelect } from '@statelyjs/stately/core/views/link';
```

### Core Fields

```typescript
// Edit components
import { StringEdit, IntegerEdit, ... } from '@statelyjs/stately/core/fields/edit';

// View components
import { StringView, IntegerView, ... } from '@statelyjs/stately/core/fields/view';
```

### Schema (`@statelyjs/stately/schema`)

Re-exports from `@statelyjs/schema`:

```typescript
import {
  stately,
  type Schemas,
  type DefineConfig,
  type DefinePlugin,
  // ... all schema exports
} from '@statelyjs/stately/schema';
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
- Building a custom plugin without entity CRUD
- Need just the base components
- Want fine-grained control over plugin composition

## Peer Dependencies

- `react` ^18.0.0 || ^19.0.0
- `react-dom` ^18.0.0 || ^19.0.0
- `@tanstack/react-query` ^5.90.10
- `lucide-react` ^0.554.0
- `sonner` ^2.0.7

## Related Packages

- [`@statelyjs/ui`](../ui) - Base UI components and plugin runtime
- [`@statelyjs/schema`](../schema) - Schema types and parsing
- [`@statelyjs/files`](../files) - File management plugin
- [`@statelyjs/arrow`](../arrow) - Arrow/SQL query plugin

## License

Apache-2.0
