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
import { createClient } from 'openapi-fetch';
import { createStately } from '@statelyjs/schema';
import { statelyUi, statelyUiProvider, createUseStatelyUi } from '@statelyjs/stately';
import { corePlugin } from '@statelyjs/stately/core/schema';

import type { paths, components } from './generated/types';
import { PARSED_SCHEMAS } from './generated/schemas';

const client = createClient<paths>({ baseUrl: '/api' });

const schema = createStately<paths, components>({}, PARSED_SCHEMAS)
  .withPlugin(corePlugin());

export const runtime = statelyUi({
  client,
  schema,
  core: {
    api: { pathPrefix: '/api/entity' },
  },
});

export const StatelyProvider = statelyUiProvider();
export const useStately = createUseStatelyUi();
```

### Using Hooks

```typescript
import { useListEntities, useEntityData, useCreateEntity } from '@statelyjs/stately/core/hooks';

function MyComponent() {
  // List all entities of a type
  const { data: tasks } = useListEntities('Task');
  
  // Get a single entity
  const { data: task } = useEntityData('Task', taskId);
  
  // Create mutation
  const createTask = useCreateEntity('Task');
  
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
    <Layout.Root>
      <Card>
        <Card.Header>
          <Card.Title>My Form</Card.Title>
        </Card.Header>
        <Card.Content>
          <Input placeholder="Enter value" />
          <Button>Submit</Button>
        </Card.Content>
      </Card>
    </Layout.Root>
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

- Base UI components (Button, Card, Dialog, etc.)
- Layout system (Root, Header, Page)
- Component and transformer registries
- Theme provider
- Plugin infrastructure

### @statelyjs/stately

- Core plugin with entity management
- React hooks for CRUD operations
- Pre-built views and pages
- Codegen CLI

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
