---
title: Architecture Overview
description: Understanding Stately's architecture and design principles
---

# Architecture Overview

Stately is built around a few core principles that shape its architecture. Understanding these principles helps you work effectively with the framework.

## Design Principles

### 1. Define Once, Derive Everything

The central idea in Stately is that your entity definitions are the single source of truth. From a Rust struct with derive macros, the framework generates:

- State management infrastructure (collections, CRUD operations)
- API endpoints with proper HTTP semantics
- OpenAPI documentation
- TypeScript types for the frontend
- Schema definitions for form rendering

This eliminates the drift that occurs when you maintain separate definitions in multiple places.

### 2. Vertical Plugin Architecture

Plugins in Stately are "vertical" - they span the entire stack from backend to frontend. A plugin like `files` provides:

- Rust crate (`stately-files`) with API endpoints and utilities
- TypeScript package (`@statelyjs/files`) with components and hooks

This ensures that backend capabilities have corresponding frontend support, and vice versa.

### 3. Schema-Driven UI

The frontend doesn't just consume API types - it uses parsed schema information to render appropriate form controls. A `string` field renders a text input. An `enum` renders a select. An `object` renders a nested form. This happens automatically based on the schema structure.

### 4. Composition Over Configuration

Stately favors composable building blocks over monolithic configuration. You can use:

- Individual hooks without pre-built views
- Views without full pages
- Schema parsing without UI
- Backend macros without frontend integration

Each layer is useful independently.

## Core Architecture

### Backend Layer

```
┌─────────────────────────────────────────────────┐
│                 Your Application                 │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │           #[stately::axum_api]           │    │
│  │  Generates HTTP handlers, router,        │    │
│  │  OpenAPI docs, request/response types    │    │
│  └─────────────────────────────────────────┘    │
│                       │                          │
│                       ▼                          │
│  ┌─────────────────────────────────────────┐    │
│  │            #[stately::state]             │    │
│  │  Generates StateEntry enum, Entity       │    │
│  │  wrapper, collection types, state impl   │    │
│  └─────────────────────────────────────────┘    │
│                       │                          │
│                       ▼                          │
│  ┌─────────────────────────────────────────┐    │
│  │           #[stately::entity]             │    │
│  │  Implements HasName trait                │    │
│  └─────────────────────────────────────────┘    │
│                       │                          │
│                       ▼                          │
│  ┌─────────────────────────────────────────┐    │
│  │              stately crate               │    │
│  │  Core types: EntityId, Link, Collection, │    │
│  │  Singleton, traits, error types          │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Key components:**

- **EntityId**: UUID v7-based identifiers that are time-sortable
- **Link<T>**: Enum for entity references (by ID) or inline embedding
- **Collection<T>**: HashMap-backed entity collection with CRUD operations
- **Singleton<T>**: Single-instance container for settings-like entities
- **StateEntity trait**: Connects entities to their collection type

### Frontend Layer

```
┌─────────────────────────────────────────────────┐
│                 Your Application                 │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │              Your Components             │    │
│  │  Use hooks, views, and pages             │    │
│  └─────────────────────────────────────────┘    │
│                       │                          │
│                       ▼                          │
│  ┌─────────────────────────────────────────┐    │
│  │           @statelyjs/stately             │    │
│  │  Runtime, hooks, views, pages, codegen   │    │
│  │  Core plugin with entity management      │    │
│  └─────────────────────────────────────────┘    │
│                       │                          │
│                       ▼                          │
│  ┌─────────────────────────────────────────┐    │
│  │             @statelyjs/ui                │    │
│  │  Base components, layout, plugin system, │    │
│  │  component registry, theming             │    │
│  └─────────────────────────────────────────┘    │
│                       │                          │
│                       ▼                          │
│  ┌─────────────────────────────────────────┐    │
│  │            @statelyjs/schema             │    │
│  │  Schema type system, node parsing,       │    │
│  │  validation, runtime creation            │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Key components:**

- **Schema Runtime**: Parses OpenAPI schemas into typed node trees
- **UI Runtime**: Combines schema with API client and plugins
- **Component Registry**: Maps node types to React components
- **Hooks**: React Query-based data fetching and mutations
- **Views/Pages**: Pre-built UI for common entity operations

### OpenAPI Bridge

The OpenAPI specification serves as the contract between backend and frontend:

```
Backend                    OpenAPI                    Frontend
────────                   ───────                    ────────

#[state(openapi)]    ──►   openapi.json    ──►   stately generate
                               │
                               ▼
                     ┌─────────────────┐
                     │   types.ts      │  TypeScript types
                     │   schemas.ts    │  Parsed schema nodes
                     └─────────────────┘
                               │
                               ▼
                     ┌─────────────────┐
                     │  createStately  │  Schema runtime
                     │  statelyUi      │  UI runtime
                     └─────────────────┘
```

The codegen step ensures frontend types exactly match backend definitions.

## Plugin Architecture

Plugins extend Stately at both layers:

### Backend Plugin Pattern

```rust
// Plugin provides a router factory
pub fn router<S>(state: S) -> Router<S>
where
    S: Clone + Send + Sync + 'static,
    MyPluginState: FromRef<S>,
{
    Router::new()
        .route("/my-endpoint", get(handler))
        .with_state(state)
}

// State extraction via FromRef
impl FromRef<AppState> for MyPluginState {
    fn from_ref(state: &AppState) -> Self {
        // Extract plugin-specific state
    }
}
```

### Frontend Plugin Pattern

```typescript
// Schema plugin - extends type system
function mySchemaPlugin<S extends Schemas>(): PluginFactory<S> {
  return runtime => ({
    ...runtime,
    plugins: { ...runtime.plugins, myPlugin: {} },
  });
}

// UI plugin - registers components and API
function myUiPlugin(options?: Options): UiPluginFactory {
  return runtime => {
    const { registry, client } = runtime;
    
    // Register custom components
    registry.components.set('myNodeType::edit', MyEditComponent);
    
    // Create typed API client
    const api = createOperations(client, MY_OPERATIONS, options?.pathPrefix);
    
    return {
      ...runtime,
      plugins: {
        ...runtime.plugins,
        myPlugin: { api, options },
      },
    };
  };
}
```

## Data Flow

### Creating an Entity

```
1. User fills form
        │
        ▼
2. useCreateEntity hook
        │
        ▼
3. API client sends PUT /api/entity
        │
        ▼
4. Axum handler deserializes request
        │
        ▼
5. State.create() adds to collection
        │
        ▼
6. Response with new EntityId
        │
        ▼
7. React Query invalidates cache
        │
        ▼
8. UI re-renders with new entity
```

### Form Rendering

```
1. Schema runtime parses OpenAPI component
        │
        ▼
2. Node tree created (object → fields → types)
        │
        ▼
3. FieldEdit component receives node
        │
        ▼
4. Registry lookup by nodeType
        │
        ▼
5. Specific component rendered (string → Input, enum → Select, etc.)
        │
        ▼
6. onChange propagates up to form state
```

## Key Types

### Backend

| Type | Purpose |
|------|---------|
| `EntityId` | UUID v7 identifier for entities |
| `Link<T>` | Reference or inline entity relationship |
| `Collection<T>` | HashMap-backed entity collection |
| `Singleton<T>` | Single-instance container |
| `StateEntity` | Trait connecting entity to state |
| `StateCollection` | Trait for CRUD operations |

### Frontend

| Type | Purpose |
|------|---------|
| `StatelySchemas` | Type combining config, plugins, and derived types |
| `BaseNode` | Union of all schema node types |
| `UiRegistry` | Component and transformer registries |
| `StatelyUiRuntime` | Combined schema + UI runtime |

## Next Steps

- [Entities and State](./entities-and-state.md) - Deep dive into entity definitions
- [Links](./links.md) - Understanding entity relationships
- [Plugins](./plugins.md) - How the plugin system works
