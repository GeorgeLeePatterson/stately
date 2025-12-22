---
title: Frontend Development
description: Building Stately frontends with TypeScript and React
---

# Frontend Development

This section covers building Stately frontends with TypeScript and React, including runtime setup, hooks, components, and plugin integration.

## Core Packages

| Package | Description |
|---------|-------------|
| `@statelyjs/schema` | Schema type system and runtime |
| `@statelyjs/ui` | Base components and plugin infrastructure |
| `@statelyjs/stately` | Full runtime with hooks, views, and codegen |

## Quick Reference

### Runtime Setup

```typescript
import {
  type StatelyConfiguration,
  statelyUi,
  statelyUiProvider,
  useStatelyUi,
} from '@statelyjs/stately';
import { type DefineConfig, type Schemas, stately } from '@statelyjs/stately/schema';
import createClient from 'openapi-fetch';

import openapiSpec from '../../openapi.json';
import { PARSED_SCHEMAS, type ParsedSchema } from './generated/schemas';
import type { components, operations, paths } from './generated/types';

// Create the API client
export const client = createClient<paths>({ baseUrl: 'http://localhost:3000/api/v1' });

// Create derived stately schema
type AppSchemas = Schemas<DefineConfig<components, paths, operations, ParsedSchema>>;

// Configure stately application options
const runtimeOpts: StatelyConfiguration<AppSchemas> = {
  client,
  // Configure included core plugin options
  core: { api: { pathPrefix: '/entity' } },
  // Configure application-wide options
  options: { api: { pathPrefix: '/' } },
  // Pass in derived stately schema
  schema: stately<AppSchemas>(openapiSpec, PARSED_SCHEMAS),
};

// Create stately runtime (core plugin is included automatically)
export const runtime = statelyUi<AppSchemas>(runtimeOpts);

// Create application's context provider and hook
export const StatelyProvider = statelyUiProvider<AppSchemas>();
export const useStately = useStatelyUi<AppSchemas>;
```

### Using Hooks

```typescript
import { useListEntities, useEntityData, useCreateEntity } from '@statelyjs/stately/core/hooks';

function MyComponent({ taskId }: { taskId: string }) {
  // List all entities of a type
  const { data: tasks } = useListEntities({ entity: 'task' });
  
  // Get a single entity
  const { data: task } = useEntityData({ entity: 'task', identifier: taskId });
  
  // Create mutation
  const createTask = useCreateEntity({ entity: 'task' });
  
  const handleCreate = () => {
    createTask.mutate({ name: 'New Task', status: 'Pending' });
  };
}
```

### Using Components

```typescript
import { Button, Card, Input } from '@statelyjs/ui/components/base';
import { Layout } from '@statelyjs/ui/layout';

function MyPage() {
  return (
    <Layout.Page>
      <Card>
        <Card.Header>
          <Card.Title>My Form</Card.Title>
        </Card.Header>
        <Card.Content>
          <Input placeholder="Enter value" />
          <Button>Submit</Button>
        </Card.Content>
      </Card>
    </Layout.Page>
  );
}
```

## Package Structure

### @statelyjs/schema

- Schema type definitions
- Node parsing and validation
- Plugin system types
- No React dependencies

### @statelyjs/ui

- `Base UI` components (Button, Card, Dialog, etc.)
- Layout system (Root, Page, Navigation, etc.)
- Component and transformer registries
- Theme provider
- Plugin infrastructure

### @statelyjs/stately

- "Core" plugin with entity management
  - React hooks for CRUD operations against entities
  - Pre-built views and pages
  - Utilities and helpers
- Codegen CLI
- Stately Schema and UI Runtimes (with "Core" baked in)

## Code Generation

Generate TypeScript types from your backend's OpenAPI spec:

```bash
pnpm exec stately generate ./openapi.json -o ./src/lib/generated
```

This creates:
- `types.ts` - TypeScript types from OpenAPI components
- `schemas.ts` - Parsed schema definitions for runtime form generation

## Next Steps

- [Concepts Overview](../concepts/overview.md) - Understand the architecture
- [Plugins](../concepts/plugins.md) - Learn about the plugin system
- [Quick Start](../getting-started/quick-start.md) - Build a complete example
