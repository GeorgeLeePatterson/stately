# Tasks Demo

A minimal task management application demonstrating Stately's core features. This is the companion example for the [Basic Demo](../../docs/guide/start/quick-start.md) guide.

## What's Included

- **Rust Backend** - Entity definitions, state management, and API endpoints
- **React Frontend** - Full CRUD UI with auto-generated forms
- **OpenAPI Integration** - Type-safe API client and schema-driven rendering

## Prerequisites

- Rust (stable)
- Node.js 18+
- pnpm

## Running the Demo

### 1. Start the Backend

```bash
cd demos/tasks
cargo run
```

The API runs at `http://localhost:3000`.

### 2. Start the Frontend

```bash
cd demos/tasks/ui
pnpm install --ignore-workspace
pnpm dev
```

The UI runs at `http://localhost:5173`.

## Project Structure

```
tasks/
├── Cargo.toml          # Rust dependencies
├── src/
│   ├── main.rs         # Entry point with event handling
│   ├── lib.rs          # Module exports
│   ├── state.rs        # Task entity and state definitions
│   ├── api.rs          # API configuration and routes
│   └── bin/
│       └── openapi.rs  # OpenAPI spec generator
├── openapi.json        # Generated OpenAPI spec
└── ui/
    ├── package.json
    ├── src/
    │   ├── main.tsx          # React entry with providers
    │   ├── App.tsx           # Routes and layout
    │   ├── Dashboard.tsx     # Dashboard with metrics
    │   ├── lib/
    │   │   └── stately.ts    # Stately runtime configuration
    │   └── generated/        # Generated from OpenAPI
    │       ├── types.ts
    │       └── schemas.ts
    └── vite.config.ts
```

## Key Features Demonstrated

### Entity Definition

```rust
#[stately::entity]
pub struct Task {
    pub name: String,
    pub description: Option<String>,
    pub status: TaskStatus,
}
```

### State Management

```rust
#[stately::state(openapi)]
pub struct State {
    tasks: Task,
}
```

### API Generation

```rust
#[stately::axum_api(State, openapi(components = [Task, TaskStatus, TaskMetrics]))]
pub struct EntityState {}
```

### Frontend Runtime

```typescript
const runtime = statelyUi<AppSchemas>({
  client,
  core: { api: { pathPrefix: '/entity' } },
  schema: stately<AppSchemas>(openapiSpec, PARSED_SCHEMAS),
});
```

## Regenerating Types

If you modify the Rust entities:

```bash
# Generate new OpenAPI spec
cargo run --bin demo-tasks-openapi .

# Regenerate TypeScript types
cd ui
pnpm exec stately generate ../openapi.json -o ./src/generated
```
