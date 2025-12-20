---
title: Quick Start
description: Build your first Stately application in minutes
---

# Quick Start

This guide walks you through building a minimal Stately application with a Rust backend and React frontend. By the end, you'll have entities defined, an API running, and a UI rendering forms.

## What We're Building

A simple task management application with:
- A `Task` entity with name, description, and status
- CRUD API endpoints
- A React UI for listing and creating tasks

The folder structure will assume:

```
my-stately-app/
├── Cargo.toml
│── src/
│   ├── main.rs                         # Entry point
│   ├── state.rs                        # Entity definitions
│   └── api.rs                          # API configuration
├── ui/
│   ├── package.json
│   ├── src/
│   │   ├── index.css                   # Pull tailwind styles into scope
│   │   ├── lib/
│   │   │   └── stately.ts  # Stately integration
│   │   ├── generated/                  # Generated from OpenAPI
│   │   │   ├── types.ts
│   │   │   └── schemas.ts
│   │   └── App.tsx
│   └── tsconfig.json
│   └── vite.config.ts
└── openapi.json                        # Generated OpenAPI spec
```


## Backend Setup

### 1. Create a New Rust Project

```bash
cargo new my-stately-app --bin
cd my-stately-app
```

### 2. Add Dependencies

Update your `Cargo.toml`:

```toml
[package]
name = "my-stately-app"
version = "0.1.0"
edition = "2024"
default-run = "my-stately-app"

[dependencies]
axum = "0.8"
serde = { version = "1", features = ["derive"] }
stately = { version = "0.3", features = ["axum"] }
tokio = { version = "1", features = ["full"] }
tower-http = { version = "0.6", features = ["cors"] }
utoipa = { version = "5", features = ["axum_extras", "uuid", "macros"] }

[[bin]]
name = "generate-openapi"
path = "src/bin/openapi.rs"
```

### 3. Define Your Entities

Create `src/state.rs`:

```rust
use serde::{Deserialize, Serialize};

/// A task in our application
#[stately::entity]
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, utoipa::ToSchema)]
pub struct Task {
    pub name: String,
    pub description: Option<String>,
    pub status: TaskStatus,
}

#[derive(Clone, Copy, Debug, Default, PartialEq, Serialize, Deserialize, utoipa::ToSchema)]
pub enum TaskStatus {
    #[default]
    Pending,
    InProgress,
    Complete,
}

// Simple tracker for the ui
#[derive(Clone, Copy, Debug, Default, PartialEq, Serialize, Deserialize, utoipa::ToSchema)]
pub struct TaskMetrics {
  pub tasks_created: u64,
  pub tasks_removed: u64,
}

/// Application state containing all entity collections
#[stately::state(openapi)]
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct State {
    tasks: Task,
}
```

### 4. Create the API

Create `src/api.rs`:

```rust
use std::sync::Arc;

use axum::extract::{FromRef, State};
use axum::{Json, Router};
use tokio::sync::RwLock;
use tower_http::cors::{Any, CorsLayer};

use crate::state::{Entity, State as AppState, StateEntry, Task, TaskMetrics, TaskStatus};

/// Create API state used across all endpoints
#[derive(Clone)]
pub struct ApiState {
    pub state: Arc<RwLock<AppState>>,
    // Define any other properties needed in endpoints
    pub metrics: Arc<RwLock<TaskMetrics>>,
}

/// API state wrapper
#[stately::axum_api(AppState, openapi(components = [Task, TaskStatus, TaskMetrics]))]
#[derive(Clone)]
pub struct EntityState {}

// Derive `FromRef` for `ApiState` to `EntityState`
impl FromRef<ApiState> for EntityState {
    fn from_ref(state: &ApiState) -> Self {
        EntityState::new_from_state(Arc::clone(&state.state))
    }
}

/// Build the application router
pub fn router(state: &ApiState, tx: &tokio::sync::mpsc::Sender<ResponseEvent>) -> Router {
    Router::new()
        .route("/api/v1/metrics", axum::routing::get(metrics))
        .nest(
            "/api/v1/entity",
            EntityState::router(state.clone()).layer(axum::middleware::from_fn(
                EntityState::event_middleware::<ResponseEvent>(tx.clone()),
            )),
        )
        .layer(CorsLayer::new().allow_headers(Any).allow_methods(Any).allow_origin(Any))
        .with_state(state.clone())
}

/// Simple function to retrieve task metrics
#[utoipa::path(
    get,
    path = "/api/v1/metrics",
    tag = "metrics",
    responses((status = 200, description = "Current task metrics", body = TaskMetrics))
)]
pub async fn metrics(State(state): State<ApiState>) -> Json<TaskMetrics> {
    Json(*state.metrics.read().await)
}
```

### 5. Wire Up the Main Entry Point

Update `src/main.rs`:

```rust
use std::sync::Arc;
use std::net::SocketAddr;

use tasks::{api, state};
use tokio::sync::RwLock;

#[tokio::main]
async fn main() {
    // Bring some derived types into scope
    use api::ResponseEvent;

    // Create channel to listen to entity events
    let (tx, mut rx) = tokio::sync::mpsc::channel(32);

    // Track task metrics
    let metrics = Arc::new(RwLock::new(state::TaskMetrics::default()));

    // Create api state
    let api_state = api::ApiState { 
        metrics: Arc::clone(&metrics),
        state: Arc::new(RwLock::new(state::State::new())),
    };

    // Create app router
    let app = api::router(&api_state, &tx);

    // Create a listener for events to update metrics
    tokio::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                ResponseEvent::Created { .. } => metrics.write().await.tasks_created += 1,
                ResponseEvent::Deleted { .. } => metrics.write().await.tasks_removed += 1,
                _ => { /* Ignore */ }
            }
        }
    });

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    eprintln!("Server running at http://{addr}");
    
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
    eprintln!("Server exited");
}
```

### 6. Generate OpenAPI Spec

Add a binary target to generate the OpenAPI spec. Create `src/bin/openapi.rs`:

```rust
#![expect(unused_crate_dependencies)] // Suppresses lints if pedantic lints are set
use my_stately_app::api::EntityState;

fn main() {
    let output_dir = std::env::args().nth(1).unwrap_or_else(|| {
        eprintln!("Usage: generate-openapi <output_dir>");
        std::process::exit(1);
    });

    match stately::codegen::generate_openapi::<EntityState>(&output_dir) {
        Ok(path) => println!("OpenAPI spec written to {}", path.display()),
        Err(e) => {
            eprintln!("Failed to generate OpenAPI spec: {e}");
            std::process::exit(1);
        }
    }
}
```

Update `src/lib.rs`:

```rust
pub mod api;
pub mod state;
```

Generate the spec:

```bash
cargo run --bin generate-openapi . > openapi.json
```

### 7. Run the Backend

```bash
cargo run
```

Your API is now running at `http://localhost:3000`. Test it:

```bash
# List tasks (empty initially)
curl http://localhost:3000/api/v1/entity/list/task

# Create a task
curl -X PUT http://localhost:3000/api/v1/entity \
  -H "Content-Type: application/json" \
  -d '{"type": "task", "data": {"name": "My First Task", "status": "Pending"}}'

# List tasks again
curl http://localhost:3000/api/v1/entity/list/task
```

## Frontend Setup

### 1. Create a React Project

```bash
# Intall pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -
# Create ui directory
mkdir -p ui && cd ui
# Create a vite/React/Typescript project
pnpm create vite . --template react-ts --no-interactive
```

### 2. Install Dependencies

```bash
# Install stately
pnpm add @statelyjs/stately @statelyjs/ui @statelyjs/schema
# Install ui essentials
pnpm add @tanstack/react-query lucide-react sonner openapi-fetch react-router-dom
# Install tailwind helpers
pnpm add -D @tailwindcss/vite tailwindcss
```

### 3. Generate TypeScript Types

Assuming `openapi.json` was created in the root directory, generate types:

```bash
pnpm exec stately generate ../openapi.json -o ./src/generated
```

### 4. Create the Stately Runtime

Create `src/lib/stately.ts`:

```typescript
import openapiSpec from '../../../openapi.json';
import type { components, operations, paths } from '../generated/types';
import { PARSED_SCHEMAS, type ParsedSchema } from '../generated/schemas';

import createClient from 'openapi-fetch';
import { statelyUi, statelyUiProvider, useStatelyUi } from '@statelyjs/stately';
import { type DefineConfig, type Schemas, stately } from '@statelyjs/stately/schema';

// Create the API client
const client = createClient<paths>({ baseUrl: 'http://localhost:3000' });

// Create derived stately schema
type AppSchemas = Schemas<DefineConfig<components, paths, operations, ParsedSchema>>;

// Configure stately application options
const runtimeOpts = {
  client,
  // Pass in derived stately schema
  schema: stately<AppSchemas>(openapiSpec, PARSED_SCHEMAS),
  // Configure application-wide options
  options: { api: { pathPrefix: '/api/v1' } },
  // Configure included core plugin options
  core: { api: { pathPrefix: '/entity' } },
};

// Create stately runtime
export const runtime = statelyUi<AppSchemas>(runtimeOpts);

// Create application's context provider
export const StatelyProvider = statelyUiProvider<AppSchemas>();
export const useStately = useStatelyUi<AppSchemas>;
```

### 5. Set Up Providers

Update `src/main.tsx`:

```typescript
import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatelyProvider, runtime } from './lib/stately';
import App from './App';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <StatelyProvider value={runtime}>
          <App />
        </StatelyProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

### 6. Bring in '@statelyjs/ui' tailwind styles

Create `src/index.css`:

```css
/* Load Tailwind framework */
@import "tailwindcss";
/* Import Stately UI theme variables and base styles */
@import "@statelyjs/ui/styles.css";
/* Tell Tailwind to scan all Stately packages (core + plugins) for utility class usage */
@source "../node_modules/@statelyjs/**/dist/*.css";
```

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'; // Add tailwindcss vite plugin

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), /** Add tailwind plugin */ tailwindcss()],
})
```

### 7. Create the App Component with Routes

Update `src/App.tsx`:

```typescript
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@statelyjs/ui/layout';
import {
  EntitiesIndexPage,
  EntityTypeListPage,
  EntityDetailsPage,
  EntityEditPage,
  EntityNewPage,
} from '@statelyjs/stately/core/pages';

// Simple dashboard component
function Dashboard() {
  return (
    <Layout.Page title="Dashboard" description="Welcome to your task manager">
      <div className="grid gap-4">
        <p>Navigate to <a href="/entities/task" className="text-primary underline">Tasks</a> to get started.</p>
      </div>
    </Layout.Page>
  );
}

function App() {
  return (
    <Layout.Root>
      <Routes>
        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Entity routes */}
        <Route path="/entities" element={<EntitiesIndexPage />} />
        <Route path="/entities/:type" element={<EntityTypeList />} />
        <Route path="/entities/:type/new" element={<EntityNew />} />
        <Route path="/entities/:type/:id" element={<EntityDetails />} />
        <Route path="/entities/:type/:id/edit" element={<EntityEdit />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout.Root>
  );
}

// Route wrapper components to extract params
function EntityTypeList() {
  const { type } = useParams();
  return <EntityTypeListPage entity={type!} />;
}

function EntityNew() {
  const { type } = useParams();
  return <EntityNewPage entity={type!} />;
}

function EntityDetails() {
  const { type, id } = useParams();
  return <EntityDetailsPage entity={type!} id={id!} />;
}

function EntityEdit() {
  const { type, id } = useParams();
  return <EntityEditPage entity={type!} id={id!} />;
}

export default App;
```

Don't forget to add the `useParams` import at the top:

```typescript
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
```

### 8. Run the Frontend

```bash
pnpm dev
```

Open `http://localhost:5173` to see your application. You now have:

- **Dashboard** at `/` - A simple landing page
- **All Entities** at `/entities` - Browse all entity types  
- **Task List** at `/entities/task` - List, create, and delete tasks
- **Create Task** at `/entities/task/new` - Form to create a new task
- **View Task** at `/entities/task/:id` - View task details
- **Edit Task** at `/entities/task/:id/edit` - Edit an existing task

## What Just Happened?

1. **Backend**: You defined a `Task` entity with `#[stately::entity]` and a state container with `#[stately::state]`. The `#[stately::axum_api]` macro generated complete CRUD endpoints.

2. **OpenAPI**: The backend generated an OpenAPI spec describing all your entities and endpoints.

3. **Codegen**: The Stately CLI parsed the OpenAPI spec and generated TypeScript types and schema definitions.

4. **Frontend**: The Stately runtime and pre-built pages provided:
   - Type-safe API client via `openapi-fetch`
   - Complete CRUD UI with list, detail, create, and edit views
   - Auto-generated forms based on your entity schemas
   - Navigation sidebar with entity types
   - Responsive layout with header and breadcrumbs

## Next Steps

This quick start showed the minimal path. To build a complete application:

- [Entities and State](../concepts/entities-and-state.md) - Learn about entity relationships with `Link<T>`
- [Backend Guide](../backend/README.md) - Customize your API and add persistence
- [Frontend Guide](../frontend/README.md) - Use pre-built views and pages
- [Plugins](../plugins/README.md) - Add file management or data connectivity
