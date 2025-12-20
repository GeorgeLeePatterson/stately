---
title: Introduction
description: What is Stately and why use it for your applications
---

# Introduction

Stately is a framework for building configuration-driven applications with Rust backends and TypeScript/React frontends. It provides a unified approach to state management, API generation, and UI rendering that spans your entire stack.

## The Problem

Building full-stack applications often involves significant boilerplate:

- Defining data models in multiple places (backend structs, API schemas, frontend types)
- Writing CRUD endpoints by hand for every entity
- Building forms that match your data structures
- Keeping everything in sync as your application evolves

Changes to your data model cascade through layers of code, each requiring manual updates.

## The Stately Approach

Stately takes a different approach: **define your entities once, derive everything else**.

On the backend, you define your entities as Rust structs with derive macros:

```rust
#[stately::entity]
pub struct Pipeline {
    pub name: String,
    pub description: Option<String>,
    pub source: Link<Source>,
    pub enabled: bool,
}
```

From this definition, Stately generates:

- Type-safe state management with collections and singletons
- Complete CRUD API endpoints
- OpenAPI documentation
- Serialization and validation

On the frontend, you consume the generated OpenAPI spec:

```typescript
const runtime = statelyUi({
  client: createClient({ baseUrl: '/api' }),
  schema: createStately(openapiSpec, PARSED_SCHEMAS),
});
```

This gives you:

- Fully typed API client
- Schema-driven form rendering
- React hooks for data fetching and mutations
- Pre-built views and pages

## Key Concepts

### Entities

Entities are the core data structures in your application. They have names, can be referenced by ID, and are managed in collections.

```rust
#[stately::entity]
pub struct Source {
    pub name: String,
    pub endpoint: String,
}
```

### State

State is a container for your entity collections. The `#[stately::state]` macro generates the infrastructure for managing entities:

```rust
#[stately::state(openapi)]
pub struct AppState {
    pipelines: Pipeline,
    sources: Source,
    #[singleton]
    settings: Settings,
}
```

### Links

Links represent relationships between entities. They can be references (by ID) or inline (embedded):

```rust
pub struct Pipeline {
    pub source: Link<Source>,  // Reference or inline
}
```

### Plugins

Plugins extend Stately with additional capabilities. Each plugin provides coordinated backend and frontend packages:

- **Files**: File upload, versioning, and management
- **Arrow**: Data connectivity with SQL query execution

## When to Use Stately

Stately is a good fit when:

- You're building a configuration-heavy application
- You want type safety across your full stack
- You need CRUD operations for multiple entity types
- You want schema-driven UIs that stay in sync with your backend
- You plan to extend functionality with plugins

Stately may not be the best choice when:

- You need highly custom API designs that don't follow CRUD patterns
- Your frontend has complex state management needs beyond entity data
- You're building a simple application with just a few endpoints

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Your Application                      │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React)                                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ @statelyjs/ │  │ @statelyjs/ │  │ @statelyjs/ │          │
│  │   stately   │──│     ui      │──│   schema    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│         │                                                    │
│         │ OpenAPI Types                                      │
│         ▼                                                    │
├─────────────────────────────────────────────────────────────┤
│  Backend (Rust)                                              │
│  ┌─────────────┐  ┌─────────────┐                           │
│  │   stately   │──│   stately   │                           │
│  │   -derive   │  │   (core)    │                           │
│  └─────────────┘  └─────────────┘                           │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────────────────────────────┐                │
│  │            Your State + Entities         │                │
│  └─────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

Plugins add vertical slices of functionality:

```
┌─────────────┐  ┌─────────────┐
│ @statelyjs/ │  │ @statelyjs/ │
│    files    │  │    arrow    │
└──────┬──────┘  └──────┬──────┘
       │                │
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│  stately-   │  │  stately-   │
│    files    │  │    arrow    │
└─────────────┘  └─────────────┘
```

## Next Steps

- [Installation](./installation.md) - Install the Stately packages
- [Quick Start](./quick-start.md) - Build your first Stately application
- [Concepts Overview](../concepts/overview.md) - Deep dive into Stately's architecture
