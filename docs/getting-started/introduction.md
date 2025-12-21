---
title: Introduction
description: What is Stately and why use it for your applications
---

# Introduction

Stately is a framework for building Rust backends and TypeScript/React frontends, with an emphasis on configuration-driven applications. It provides a unified approach to state management, API generation, and UI rendering that spans your entire stack.

## The Problem

Building full-stack applications often involves significant boilerplate:

- Defining data models in multiple places (backend structs, API schemas, frontend types)
- Writing CRUD endpoints by hand for every entity, often inconsistent and ad-hoc
- Building forms that match your data structures
- Keeping everything in sync as your application evolves
- Designing around denotational semantics for scalability and composability

Changes to your data model cascade through layers of code, each requiring manual updates. Poor decisions up front can escalate problems later on as your application's capabilities grow.

## The Stately Approach

Stately takes a different approach: **define your entities, derive everything else**.

On the backend, you define your entities as Rust structs with derive macros, and compose your state:

```rust
#[stately::entity]
pub struct Pipeline {
    pub name: String,
    pub description: Option<String>,
    pub source: Link<Source>,
    pub enabled: bool,
}

#[stately::state]
pub struct AppState {
    pipelines: Pipeline,
}
```

From this definition, Stately generates:

- Type-safe state management supporting both `collections` and `singletons`
- Complete CRUD API endpoints through the unified state structure
- OpenAPI documentation
- Serialization/Deserialization and validation

On the frontend, you consume the generated OpenAPI spec:

```typescript
type AppSchemas = Schemas<DefineConfig<components, paths, operations, ParsedSchemas>>;

const runtime = statelyUi({
  client: createClient({ baseUrl: '/api' }),
  schema: stately<AppSchemas>(openapiSpec, PARSED_SCHEMAS),
  options: { /** Configure Stately options */ },
  core: { /** Configure Stately's core plugin */ },
});
```

This gives you:

- Fully typed API client, accessible anywhere in the application
- Schema-driven form rendering
- React hooks for data fetching and mutations
- Automatic page layouts and app navigation
- Pre-built views and pages
- Access to pre-defined or app-defined plugins

## Key Concepts

### Entities

Entities are the core data structures in your application. They have friendly names, can be referenced by ID, and are managed in collections.

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

### API

Stately currently supports `axum` (support for different libraries planned) and provides a simple way to automatically construct everything needed to manage the Stately state over api endpoints:

```rust
#[axum_api(AppState, openapi(components = [Settings, Source, Pipeline]))]
pub struct ApiState {
    // Your additional dependencies
    pub db_pool: PgPool,
    pub config: SomeAppConfig,
}
```

### Plugins

Plugins extend Stately with additional capabilities. Each plugin provides coordinated backend and frontend packages.

Currently Stately provides two plugins out of the box.

#### Files

File upload, automatic versioning using time-sortable unique ids, and file management.

Implement `axum::extract::FromRef` from `FileState` to your defined and annotated api state, and simply include the file plugin's routes in your root router:

```rust
impl axum::extract::FromRef<ApiState> for stately_files::FileState {
    fn from_ref(_: &ApiState) -> Self {
        let app_dirs = crate::AppDirs::get();
        let base = 
            stately_files::settings::Dirs::new(app_dirs.cache.clone(), app_dirs.data.clone());
        FileState { base: Some(base) }
    }
}

fn api(state: &ApiState) -> Router<ApiState> {
    axum::Router::new()
        .nest("/entity", ApiState::router(state.clone()))
        .nest("/files", stately_files::router::router::<ApiState>(state.clone()))
        .nest("/other", some_other_endpoints::router())
        .layer(CorsLayer::new().allow_headers(Any).allow_methods(Any).allow_origin(Any))
}
```

#### Arrow

Data connectivity with SQL query execution, powered by the battle-tested [`Datafusion`](https://datafusion.apache.org/).

Implement `axum::extract::FromRef` from `QueryState` to your defined and annotated api state

```rust
impl axum::extract::FromRef<ApiState> for stately_arrow::QueryState<DefaultQuerySessionContext> {
    // Extract query context from api state
    fn from_ref(state: &ApiState) -> Self { Self::new(state.query_context.clone()) }
}

// Include the generated api endpoints in your app router
fn api(state: &ApiState) -> Router<ApiState> {
    axum::Router::new()
        .nest("/entity", ApiState::router(state.clone()))
        .nest("/arrow", stately_arrow::api::router(state.clone()))
        .layer(CorsLayer::new().allow_headers(Any).allow_methods(Any).allow_origin(Any))
}
```

## When to Use Stately

Stately is a good fit when:

- You're building a configuration-heavy application
- Entity-driven or concept-driven design guides your app development
- Denotational design provides entities and their relationships up front
- You want type safety across your full stack
- You need CRUD operations across different entity types
- You want schema-driven UIs that stay in sync with your backend
- You plan to extend functionality with plugins

Stately may not be the best choice when:

- Your API is primarily highly custom designs that don't follow CRUD patterns
- Your frontend has complex state management needs that don't align with your backend
- You're building ad-hoc applications where boilerplate or cross-API consistency is not needed

## Architecture Overview

```
Your Application

┌────────────────────────────────────────────────────────────────────┐
│  Frontend (React)                                                  │
└────────────────────────────────────────────────────────────────────┘

    ⬆ Automatic Form Generation
   ╭────────────────────╮   ╭───────────────╮   ╭─────────╮          
   │ @statelyjs/stately │ + │ @statelyjs/ui │ + │ plugins │
   ╰────────────────────╯   ╰───────────────╯   ╰─────────╯
    ⬇ OpenAPI Driven Schema and API 

┌────────────────────────────────────────────────────────────────────┐
│  Backend (Rust)                                                    │
└────────────────────────────────────────────────────────────────────┘

    ⬆ End to End Type-safe State Management
   ╭─────────────╮   ╭─────────────╮
   │   stately   │ + │   plugins   │
   ╰─────────────╯   ╰─────────────╯
    ⬇ CRUD Updates and Events                                                  

┌────────────────────────────────────────────────────────────────────┐               
│  Your State + Entities                                             │
└────────────────────────────────────────────────────────────────────┘

    ⬆ Merge State Changes
    ⬇ Persist State Updates

┌────────────────────────────────────────────────────────────────────┐               
│  Backing Store                                                     │
└────────────────────────────────────────────────────────────────────┘

```

Plugins are vertical slices of functionality, spanning frontend to backend:

```
╭─────────╮   ╭──────────────────╮ ╭──────────────────╮     ╭─────────────────╮
│ stately │   │ @statelyjs/files │ │ @statelyjs/arrow │     │ plugin-frontend │
│    ↑    │   │        ↑         │ │        ↑         │     │        ↑        │
│         │ + │                  │ │                  │ ... │                 │
│    ↓    │   │        ↓         │ │        ↓         │     │        ↓        │
│ stately │   │  stately-files   │ │  stately-arrow   │     │  plugin-backend │
╰─────────╯   ╰──────────────────╯ ╰──────────────────╯     ╰─────────────────╯
```

## Next Steps

- [Installation](./installation.md) - Install the Stately packages
- [Quick Start](./quick-start.md) - Build your first Stately application
- [Concepts Overview](../concepts/overview.md) - Deep dive into Stately's architecture
