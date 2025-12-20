---
title: Installation
description: How to install Stately packages for your project
---

# Installation

Stately consists of Rust crates for the backend and TypeScript packages for the frontend. Install the packages you need based on your project requirements.

## Backend (Rust)

### Core Packages

Add the core Stately crates to your `Cargo.toml`:

```toml
[dependencies]
stately = "0.3"
```

The `stately` crate re-exports `stately-derive`, so you don't need to add it separately.

### Feature Flags

Stately supports several feature flags:

| Feature | Default | Description |
|---------|---------|-------------|
| `openapi` | Yes | OpenAPI schema generation via `utoipa` |
| `axum` | No | Axum web framework integration (includes `openapi`) |

To enable Axum API generation:

```toml
[dependencies]
stately = { version = "0.3", features = ["axum"] }
```

### Plugin Crates

For file management capabilities:

```toml
[dependencies]
stately-files = "0.3"
```

For data connectivity and Arrow-based queries:

```toml
[dependencies]
stately-arrow = "0.3"
```

To enable object-store functionality or common DBMSs:

```toml
[dependencies]
stately = { version = "0.3", features = ["object-store", "clickhouse"] }
```

## Frontend (TypeScript)

### Package Manager

Stately packages are published to npm. Install using your preferred package manager:

```bash
# npm
npm install @statelyjs/stately @statelyjs/ui @statelyjs/schema

# pnpm
pnpm add @statelyjs/stately @statelyjs/ui @statelyjs/schema

# yarn
yarn add @statelyjs/stately @statelyjs/ui @statelyjs/schema
```

### Peer Dependencies

The packages require several peer dependencies:

```bash
pnpm add react react-dom @tanstack/react-query lucide-react \
  sonner openapi-fetch @uiw/react-codemirror
```

### Plugin Packages

For file management:

```bash
pnpm add @statelyjs/files
```

For data connectivity:

```bash
pnpm add @statelyjs/arrow @tanstack/react-table @tanstack/react-virtual
```

# Additional Notes and a Simple Example

## Development Setup

### Rust Requirements

- Rust 2024 edition (1.85+)
- Cargo

### TypeScript Requirements

- A node runtime (Node.js 20+, bun, deno)
- A package manager (npm, pnpm, or yarn)
- TypeScript 5.0+

### Recommended Project Structure

A minimal Stately project might have this structure:

```
my-app/
├── Cargo.toml              # Rust workspace
├── crates/
│   └── my-app/
│       ├── Cargo.toml
│       └── src/
│           ├── main.rs     # Entry point
│           ├── state.rs    # Entity definitions
│           └── api.rs      # API configuration
├── ui/
│   ├── package.json
│   ├── src/
│   │   ├── lib/
│   │   │   └── generated/  # Generated from OpenAPI
│   │   │       ├── types.ts
│   │   │       └── schemas.ts
│   │   └── App.tsx
│   └── tsconfig.json
└── openapi.json            # Generated OpenAPI spec
```

## Generating TypeScript Types from OpenAPI

Stately includes a CLI for generating TypeScript types from your OpenAPI spec:

```bash
# Generate types and schemas, providing path to optional plugin configuration
pnpm exec stately generate ./openapi.json -o ./src/lib/generated -c stately.plugins.ts
```

This creates:
- `types.ts` - TypeScript types from OpenAPI components
- `schemas.ts` - Parsed schema definitions for runtime form generation

## Verifying Installation

### Backend

Create a simple entity and state shape to verify your Rust setup:

```rust
use stately::prelude::*;

#[stately::entity]
pub struct Example {
    pub name: String,
}

#[stately::state(openapi)]
#[derive(Debug, Clone)]
pub struct State {
    examples: Example
}

fn main() {
    let mut state = State::new();
    let entity_id = state.create_entity(Example { name: "test".to_string() });
    println!("Stately is installed!");
    println!("State contains my example entity: {state:?}");
}
```

Build to verify:

```bash
cargo build
```

### Frontend

Bootstrap your frontend application with stately:

```typescript
// Generated imports
import openapiSpec from '../openapi.json';
import type { components, operations, paths } from '@/generated/types';
import { PARSED_SCHEMAS, type ParsedSchema } from '@/generated/schemas';

// Application specific imports
import createClient from 'openapi-fetch';
import { API_BASE_URL } from '@/api/client';
import { statelyUi, statelyUiProvider, useStatelyUi } from '@statelyjs/stately';
import { type DefineConfig, type Schemas, stately } from '@statelyjs/stately/schema';

// Create derived stately application schema
type AppSchemas = Schemas<
  DefineConfig<components, paths, operations, ParsedSchema>,
  readonly [/** Plugin Schema definitions */]
>;

// Optionally define any extra sidebar navigation
export const sidebarNav = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
  { badge: PipelineBadge, icon: PlayCircle, label: 'Active Pipelines', to: '/pipelines' },
  { icon: History, label: 'History', to: '/history' },
  { icon: ShieldAlert, label: 'Admin', to: '/admin' },
];

// Configure stately application options
const runtimeOpts = {
  // Provide application's api client, strongly typed via openapi-fetch
  client: createClient<paths>({ baseUrl: API_BASE_URL }),
  // Pass in derived stately schema
  schema: stately<AppSchemas>(openapiSpec, PARSED_SCHEMAS),
  // Configure application-wide options
  options: { 
    api: { pathPrefix: '/api/v1' },
    navigation: { routes: { items: sidebarNav, label: 'Application', to: '/' }}
  },
  // Configure included core plugin options
  core: { api: { pathPrefix: '/entity' }, entities: { icons: {/** Entity icon map */}}},
};

// Create stately runtime
const runtime = statelyUi<AppSchemas, readonly [/** Plugin UI definitions */]>(runtimeOpts);

// Create application's stately context provider
const AppStatelyProvider = statelyUiProvider<AppSchemas, readonly [/** Plugin UI definitions */]>();

// Create application's stately context provider hook
const useAppStately = useStatelyUi<AppSchemas, readonly [/** Plugin UI definitions */]>;

console.log('Stately is installed!');
```

Stately works with any framework, ie `@tanstack/react-router`, `next.js`:

```typescript
import { Layout as StatelyLayout } from '@statelyjs/ui';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { AppStatelyProvider, runtime } from '@/lib/stately-integration';

import { MetricsIndicator, useMetrics, MetricsProvider } from '@/features/metrics';
import Logo from '@/images/logo.png';

// Example root route using @tanstack/react-router
export const RootRoute = createRootRoute({
  component: () => (
    <AppStatelyProvider value={runtime}>
      <MetricsProvider>
        <Layout />
      </MetricsProvider>
    </AppStatelyProvider>
  )
});

// Exmaple layout outlet using @tanstack/react-router
function Layout() {
  // Live SSE pipeline metrics
  const metrics = useMetrics();

  return (
    <StatelyLayout.Root
      headerProps={{ children: <MetricsIndicator metrics={metrics} /> }}
      sidebarProps={{ collapsible: 'icon', logo: Logo, logoName: 'app', variant: 'floating' }}
    >
      <Outlet />
    </StatelyLayout.Root>
  );
}

```

## Next Steps

- [Quick Start](./quick-start.md) - Build your first Stately application
- [Entities and State](../concepts/entities-and-state.md) - Learn about defining entities
