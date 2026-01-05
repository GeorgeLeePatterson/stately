---
title: Tasks Demo 
description: A dead-simple Task application using Stately
---

# Tasks 

The [Quick Start](../start/quick-start.md) guide builds a simple end-to-end application using Stately. The Tasks demo takes a bit further but still keeps it dead simple. Almost nothing on the UI side will change, yet simple additions to the backend result in a more complex application with more capabilities.

The only shortcoming of this demo is that it doesn't follow through with some important additional concepts, like nesting `Link<T>` which leverage recursive references, api state composition across different sub-routers, and more advanced concepts. The goal instead is to demonstrate how extending an application's capabilities works alongside what Stately already provides. We'll save the more advanced concepts for the advanced guide. 

## Goal

The goal of this guide is to demonstrate how simply adding entities to the backend, in this case `Task`s and `User`s, requires almost no changes to the UI. In fact, any changes to the UI were done to enhance the UI, otherwise the quick start's UI would work out of the box. To that end, we will add a new page, `Dashboard`, and show how to configure it against stately's configuration options, automatically including it in the sidebar, and accessing api endpoints using stately provided functionality. That new endpoint, `/metrics`, demonstrates how to listen in on CRUD operations, providing additional capabilities across the stack. 

## What We're Building

A simple task management application with:
- A `Task` entity with name, description, and status
- A `User` entity with name, title, and status
- CRUD API endpoints
- A React UI for listing and creating tasks

The folder structure will assume:

```
tasks/
├── Cargo.toml
│── src/
│   ├── bin/                            # Openapi generation 
│   │   └── openapi.rs                         
│   ├── main.rs                         # Entry point
│   ├── lib.rs 
│   ├── state.rs                        # Entity definitions
│   └── api.rs                          # API configuration
├── ui/
│   ├── package.json
│   ├── src/
│   │   ├── index.css                   # Pull stately styles into scope
│   │   ├── lib/
│   │   │   └── stately.ts              # Stately integration
│   │   ├── generated/                  # Generated from OpenAPI
│   │   │   ├── types.ts
│   │   │   └── schemas.ts
│   │   ├── App.tsx
│   │   ├── Dashboard.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── tsconfig.json
│   └── vite.config.ts
└── openapi.json                        # Generated OpenAPI spec
```


## Backend Setup

### 1. Create a New Rust Project

```shellscript
cargo new my-stately-app --bin
cd my-stately-app
```

### 2. Add Dependencies

Update your `Cargo.toml`:

```toml
[package]
name = "tasks"
version = "0.1.0"
edition = "2024"
default-run = "tasks"

[dependencies]
axum = "0.8"
serde = { version = "1", features = ["derive"] }
stately = { version = "0.3", features = ["axum"] }
tokio = { version = "1", features = ["rt", "rt-multi-thread", "sync", "macros" }
tower-http = { version = "0.6", features = ["cors"] }
utoipa = { version = "5", features = ["axum_extras", "uuid", "macros"] }

[[bin]]
name = "demo-tasks-openapi"
path = "src/bin/openapi.rs"
```

### 3. Define Your Entities

Create `src/state.rs`:

```rust
use serde::{Deserialize, Serialize};
use stately::Link;

/// A task in our application
#[stately::entity]
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, utoipa::ToSchema)]
pub struct Task {
    // The task's friendly name
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    // The task's current status
    pub status: TaskStatus,
    // The task's assigned user
    #[serde(skip_serializing_if = "Option::is_none")]
    pub assigned_to: Option<Link<User>>,
}

/// A user in our application
#[stately::entity]
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, utoipa::ToSchema)]
pub struct User {
    // The user's full name
    pub name: String,
    // The user's title
    pub title: Option<String>,
    // The user's current status
    #[serde(default)]
    pub status: UserStatus,
}

/// A task's status
#[derive(Clone, Copy, Debug, Default, PartialEq, Serialize, Deserialize, utoipa::ToSchema)]
pub enum TaskStatus {
    #[default]
    Pending,
    InProgress,
    Complete,
}

/// A user's status
#[derive(Clone, Copy, Debug, Default, PartialEq, Serialize, Deserialize, utoipa::ToSchema)]
pub enum UserStatus {
    /// The user is working
    #[default]
    Working,
    /// The user is currently on approved PTO
    #[serde(rename = "PTO")]
    Pto,
    /// The user is currently out of office
    #[serde(rename = "OOO")]
    Ooo,
    /// The user is currently absent without notice 
    Absent,
}

// Simple tracker for the ui
#[derive(Clone, Copy, Debug, Default, PartialEq, Serialize, Deserialize, utoipa::ToSchema)]
pub struct TaskMetrics {
    /// The number of tasks created
    pub tasks_created: u64,
    /// The number of tasks removed
    pub tasks_removed: u64,
}

/// Application state containing all entity collections
#[stately::state(openapi)]
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct State {
    tasks: Task,
    users: User,
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

use crate::state::{
    Entity, State as AppState, StateEntry, Task, TaskMetrics, TaskStatus, User, UserStatus,
};

/// Create API state used across all endpoints
#[derive(Clone)]
pub struct ApiState {
    pub state: Arc<RwLock<AppState>>,
    // Define any other properties needed in endpoints
    pub metrics: Arc<RwLock<TaskMetrics>>,
}

/// API state wrapper
#[stately::axum_api(AppState, openapi(
    server = "/api/v1",
    components = [Task, TaskStatus, TaskMetrics, User, UserStatus],
    paths = [metrics]
))]
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
        // Ensure cors is enabled
        .layer(CorsLayer::new().allow_headers(Any).allow_methods(Any).allow_origin(Any))
        .with_state(state.clone())
}

/// Simple function to retrieve task metrics
#[utoipa::path(
    get,
    path = "/metrics",
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
use std::net::SocketAddr;
use std::sync::Arc;

use tasks::{api, state};
use tokio::sync::RwLock;

#[tokio::main]
async fn main() {
    // Bring some derived types into scope
    use api::ResponseEvent;
    use state::{Entity, StateEntry};

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
                ResponseEvent::Created { entity, .. } if matches!(entity, Entity::Task(_)) => {
                    metrics.write().await.tasks_created += 1;
                }
                ResponseEvent::Deleted { entry, .. } if matches!(entry, StateEntry::Task) => {
                    metrics.write().await.tasks_removed += 1;
                }
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
use tasks::api::EntityState;

fn main() {
    let output_dir = std::env::args().nth(1).unwrap_or_else(|| {
        eprintln!("Usage: demo-tasks-openapi <output_dir>");
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

Generate the OpenAPI spec:

```shellscript
cargo run --bin demo-tasks-openapi -- .
```

### 7. Run the Backend

```shellscript
cargo run
```

Your API is now running at `http://localhost:3000`. Test it:

```shellscript
# List tasks (empty initially)
curl http://localhost:3000/api/v1/entity/list/task

# Create a user
curl -X PUT http://localhost:3000/api/v1/entity \
  -H "Content-Type: application/json" \
  -d '{"type": "user", "data": {"name": "Alice User", "status": "Working"}}'

# Create a task, assigned to no one yet.
curl -X PUT http://localhost:3000/api/v1/entity \
  -H "Content-Type: application/json" \
  -d '{"type": "task", "data": {"name": "My First Task", "status": "Pending"}}'

# List tasks again
curl http://localhost:3000/api/v1/entity/list/task

# List users 
curl http://localhost:3000/api/v1/entity/list/user
```

## Frontend Setup

> [!Note]
> This example uses [React Router](https://reactrouter.com/) for routing, but Stately works with any routing library (e.g., TanStack Router, Next.js App Router). Routing helpers are planned for a future release.

### 1. Create a React Project

```shellscript
# Intall pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -
# Create ui directory
mkdir -p ui && cd ui
# Create a vite/React/Typescript project
pnpm create vite . --template react-ts --no-interactive
```

### 2. Install Dependencies

#### Install stately and additional packages

import { PackageManagerTabs } from '@theme';

Install the stately and ui packages:

<PackageManagerTabs command="install @statelyjs/stately @statelyjs/ui" />

> [!NOTE]
> In this demo, we are installed `@statelyjs/ui` since we will leverage base ui components, which `@statelyjs/stately` doesn't re-export.

Install required peer dependencies:

<PackageManagerTabs command="install @tanstack/react-query lucide-react sonner openapi-fetch react-router-dom" />

Since we'll be leveraging tailwind classes, let's get tailwind setup as well:

<PackageManagerTabs command="install -D @tailwindcss/vite tailwindcss" />

### 3. Generate TypeScript Types

Assuming `openapi.json` was created in the root directory, generate types:

```shellscript
pnpm exec stately generate ../openapi.json -o ./src/generated
```

### 4. Create the Stately Runtime

Create `ui/src/lib/stately.ts`:

```typescript
import {
  type StatelyConfiguration,
  statelyUi,
  statelyUiProvider,
  useStatelyUi,
} from '@statelyjs/stately';
import { type DefineConfig, type Schemas, stately } from '@statelyjs/stately/schema';
import { Check, LayoutDashboard } from 'lucide-react';
import createClient from 'openapi-fetch';

import openapiSpec from '../../../openapi.json';
import { PARSED_SCHEMAS, type ParsedSchema } from '../generated/schemas';
import type { components, operations, paths } from '../generated/types';

// Create the API client
export const client = createClient<paths>({ baseUrl: 'http://localhost:3000/api/v1' });

// Create derived stately schema
type AppSchemas = Schemas<DefineConfig<components, paths, operations, ParsedSchema>>;

// Configure stately application options
const runtimeOptions: StatelyConfiguration<AppSchemas> = {
  client,
  // Configure included core plugin options
  core: { api: { pathPrefix: '/entity' }, entities: { icons: { task: Check } } },
  // Configure application-wide options
  options: {
    api: { pathPrefix: '/' },
    navigation: {
      routes: {
        // Any additional routes that should appear in the sidebar
        items: [{ icon: LayoutDashboard, label: 'Dashboard', to: '/' }],
        // Section label for all routes
        label: 'Application',
        to: '/',
      },
    },
  },
  // Pass in derived stately schema
  schema: stately<AppSchemas>(openapiSpec, PARSED_SCHEMAS),
};

// Create stately runtime
export const runtime = statelyUi<AppSchemas>(runtimeOptions);

// Create application's context provider
export const StatelyProvider = statelyUiProvider<AppSchemas>();
export const useStately = useStatelyUi<AppSchemas>;
```

### 5. Set Up Providers

Update `src/main.tsx`:

```tsx
import './index.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { runtime, StatelyProvider } from './lib/stately';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <StatelyProvider runtime={runtime}>
          <App />
        </StatelyProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
```

### 6. Configure Tailwind CSS

Stately requires Tailwind CSS v4. Create `src/index.css`:

```css
/* Import Tailwind */
@import "tailwindcss";

/* Import Stately theme tokens and base styles */
@import "@statelyjs/stately/styles.css";

/* Scan app source for Tailwind classes */
@source ".";

/* Scan all Stately packages for utility classes */
@source "./node_modules/@statelyjs";

/* If looking to override any stately tokens... */
/*
:root { --stately-primary: oklch(...); }
*/
```

> [!NOTE]
> The `@source "./node_modules/@statelyjs"` directive tells Tailwind to scan all Stately packages for utility classes. This single directive covers `@statelyjs/stately`, `@statelyjs/ui`, and any plugins you add.

Update `vite.config.ts`:

```typescript
import tailwindcss from '@tailwindcss/vite'; // Add tailwindcss vite plugin
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), /** Add tailwind plugin */ tailwindcss()],
})
```

### 7. Create the Dashboard Component

Create `src/Dashboard.tsx`:

```tsx
import { Note } from '@statelyjs/ui/components';
import { Card, CardContent, CardHeader, CardTitle } from '@statelyjs/ui/components/base/card';
import { Spinner } from '@statelyjs/ui/components/base/spinner';
import { Layout } from '@statelyjs/stately/layout';
import { useQuery } from '@tanstack/react-query';
import { client } from './lib/stately';

// Simple dashboard component
export function Dashboard() {
  // Pull metrics from the api. The backend can be used like any api.
  const { data, error, isLoading } = useQuery({
    queryFn: async () => {
      const { data, error } = await client.GET('/metrics');
      if (error) throw new Error('Failed to fetch metrics');
      return data;
    },
    queryKey: ['metrics'],
    refetchInterval: 5000,
  });

  return (
    <Layout.Page description="Welcome to your task manager" title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Task Quick Link</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Navigate to{' '}
              <a className="text-primary underline" href="/entities/task">
                Tasks
              </a>{' '}
              to get started.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Task Metrics
              {isLoading ? (
                <span className="ml-2">
                  <Spinner className="w-4 h-4" />{' '}
                </span>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && <Note message={`Request failed: ${error.message}`} />}
            {data ? (
              <div>
                <p>Total Actions: {data.tasks_created + data.tasks_removed}</p>
                <p>Created Tasks: {data.tasks_created}</p>
                <p>Deleted Tasks: {data.tasks_removed}</p>
              </div>
            ) : (
              <span>No metrics available</span>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout.Page>
  );
}
```

### 8. Create the App Component with Routes

Update `src/App.tsx`:

```tsx
import * as EntitiesPages from '@statelyjs/stately/core/pages';
import { Layout } from '@statelyjs/ui/layout';
import { Gem } from 'lucide-react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Dashboard } from './Dashboard';

const useRequiredParams = <T extends Record<string, unknown>>() => useParams() as T;

function App() {
  return (
    <Layout.Root
      sidebarProps={{ collapsible: 'icon', logo: <Gem />, logoName: 'Tasks', variant: 'floating' }}
    >
      <Routes>
        {/* Dashboard */}
        <Route element={<Dashboard />} index path="/" />

        {/* Entity routes */}
        <Route element={<Entities />} path="/entities/*" />

        {/* Fallback */}
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </Layout.Root>
  );
}

// Entrypoint into entity configurations
function Entities() {
  return (
    <Routes>
      <Route element={<EntitiesPages.EntitiesIndexPage />} index path="/" />
      <Route element={<EntityType />} path="/:type/*" />
    </Routes>
  );
}

// Entrypoint into an entity type
function EntityType() {
  const { type } = useRequiredParams<{ type: string }>();
  return (
    <Routes>
      <Route element={<EntitiesPages.EntityTypeListPage entity={type} />} index path="/" />
      <Route element={<EntitiesPages.EntityNewPage entity={type} />} path="/new" />
      <Route element={<Entity entity={type} />} path="/:id/*" />
    </Routes>
  );
}

// Entrypoint into an instance of an entity
function Entity({ entity }: React.ComponentProps<typeof EntitiesPages.EntityNewPage>) {
  const { id } = useRequiredParams<{ id: string }>();
  return (
    <Routes>
      <Route element={<EntitiesPages.EntityDetailsPage entity={entity} id={id} />} index path="/" />
      <Route element={<EntitiesPages.EntityEditPage entity={entity} id={id} />} path="/edit" />
    </Routes>
  );
}

export default App;
```

### 9. Run the Frontend

```shellscript
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

1. **Backend**: You defined `Task` and `User` entities with `#[stately::entity]` and a state container with `#[stately::state]`. The `#[stately::axum_api]` macro generated complete CRUD endpoints.

2. **OpenAPI**: The backend generated an OpenAPI spec describing all your entities and endpoints.

3. **Codegen**: The Stately CLI parsed the OpenAPI spec and generated TypeScript types and schema definitions.

4. **Frontend**: The Stately runtime and pre-built pages provided:
   - Type-safe API client via `openapi-fetch`
   - Complete CRUD UI with list, detail, create, and edit views
   - Auto-generated forms based on your entity schemas
   - Navigation sidebar with entity types
   - Responsive layout with header and breadcrumbs
