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

## Backend Setup

### 1. Create a New Rust Project

```bash
cargo new my-stately-app
cd my-stately-app
```

### 2. Add Dependencies

Update your `Cargo.toml`:

```toml
[package]
name = "my-stately-app"
version = "0.1.0"
edition = "2024"

[dependencies]
stately = { version = "0.3", features = ["axum"] }
axum = "0.8"
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

### 3. Define Your Entities

Create `src/state.rs`:

```rust
use serde::{Deserialize, Serialize};
use stately::prelude::*;

/// A task in our application
#[stately::entity]
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Task {
    pub name: String,
    pub description: Option<String>,
    pub status: TaskStatus,
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub enum TaskStatus {
    #[default]
    Pending,
    InProgress,
    Complete,
}

/// Application state containing all entity collections
#[stately::state(openapi)]
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct AppState {
    tasks: Task,
}
```

### 4. Create the API

Create `src/api.rs`:

```rust
use std::sync::Arc;
use tokio::sync::RwLock;
use axum::Router;
use stately::prelude::*;

use crate::state::AppState;

/// API state wrapper
#[stately::axum_api(AppState, openapi)]
#[derive(Clone)]
pub struct ApiState {
    #[state]
    pub app: Arc<RwLock<AppState>>,
}

impl ApiState {
    pub fn new() -> Self {
        Self {
            app: Arc::new(RwLock::new(AppState::new())),
        }
    }
}

/// Build the application router
pub fn app() -> Router {
    let state = ApiState::new();
    
    Router::new()
        .nest("/api/entity", ApiState::router(state.clone()))
        .with_state(state)
}
```

### 5. Wire Up the Main Entry Point

Update `src/main.rs`:

```rust
mod api;
mod state;

use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    let app = api::app();
    
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Server running at http://{}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
```

### 6. Generate OpenAPI Spec

Add a binary to generate the OpenAPI spec. Create `src/bin/openapi.rs`:

```rust
use my_stately_app::api::ApiState;

fn main() {
    let openapi = ApiState::openapi();
    println!("{}", serde_json::to_string_pretty(&openapi).unwrap());
}
```

Update `src/lib.rs`:

```rust
pub mod api;
pub mod state;
```

Generate the spec:

```bash
cargo run --bin openapi > openapi.json
```

### 7. Run the Backend

```bash
cargo run
```

Your API is now running at `http://localhost:3000`. Test it:

```bash
# List tasks (empty initially)
curl http://localhost:3000/api/entity/list/Task

# Create a task
curl -X PUT http://localhost:3000/api/entity \
  -H "Content-Type: application/json" \
  -d '{"type": "Task", "entity": {"name": "My First Task", "status": "Pending"}}'

# List tasks again
curl http://localhost:3000/api/entity/list/Task
```

## Frontend Setup

### 1. Create a React Project

In a separate directory (or a `ui/` subdirectory):

```bash
npm create vite@latest ui -- --template react-ts
cd ui
```

### 2. Install Dependencies

```bash
npm install @statelyjs/stately @statelyjs/ui @statelyjs/schema
npm install @tanstack/react-query lucide-react sonner openapi-fetch
```

### 3. Generate TypeScript Types

Copy `openapi.json` to your UI directory, then generate types:

```bash
npx stately generate ./openapi.json -o ./src/lib/generated
```

### 4. Create the Stately Runtime

Create `src/lib/stately.ts`:

```typescript
import { createClient } from 'openapi-fetch';
import { createStately } from '@statelyjs/schema';
import { statelyUi, statelyUiProvider, createUseStatelyUi } from '@statelyjs/stately';
import { corePlugin } from '@statelyjs/stately/core/schema';

import type { paths, components } from './generated/types';
import { PARSED_SCHEMAS } from './generated/schemas';

// Create the API client
const client = createClient<paths>({ baseUrl: 'http://localhost:3000' });

// Create the schema runtime
const schema = createStately<paths, components>(
  {}, // OpenAPI doc (optional, used for validation)
  PARSED_SCHEMAS
).withPlugin(corePlugin());

// Create the UI runtime
export const runtime = statelyUi({
  client,
  schema,
  core: {
    api: { pathPrefix: '/api/entity' },
  },
});

// Create typed hooks and provider
export const StatelyProvider = statelyUiProvider();
export const useStately = createUseStatelyUi();
```

### 5. Set Up Providers

Update `src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatelyProvider, runtime } from './lib/stately';
import App from './App';
import '@statelyjs/ui/styles.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <StatelyProvider value={runtime}>
        <App />
      </StatelyProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
```

### 6. Create a Task List Component

Update `src/App.tsx`:

```typescript
import { useListEntities, useCreateEntity } from '@statelyjs/stately/core/hooks';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@statelyjs/ui/components/base';
import { useState } from 'react';

function App() {
  const { data: tasks, isLoading } = useListEntities('Task');
  const createTask = useCreateEntity('Task');
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (name.trim()) {
      createTask.mutate({
        name,
        status: 'Pending',
      });
      setName('');
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Task Manager</h1>
      
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New task name"
          className="flex-1 px-3 py-2 border rounded"
        />
        <Button onClick={handleCreate}>Add Task</Button>
      </div>

      <div className="space-y-4">
        {tasks?.map((task) => (
          <Card key={task.id}>
            <CardHeader>
              <CardTitle>{task.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Status: {task.status}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default App;
```

### 7. Run the Frontend

```bash
npm run dev
```

Open `http://localhost:5173` to see your application.

## What Just Happened?

1. **Backend**: You defined a `Task` entity with `#[stately::entity]` and a state container with `#[stately::state]`. The `#[stately::axum_api]` macro generated complete CRUD endpoints.

2. **OpenAPI**: The backend generated an OpenAPI spec describing all your entities and endpoints.

3. **Codegen**: The Stately CLI parsed the OpenAPI spec and generated TypeScript types and schema definitions.

4. **Frontend**: The runtime consumed those types to provide:
   - Type-safe API client
   - React hooks for data fetching
   - Form generation from schemas

## Next Steps

This quick start showed the minimal path. To build a complete application:

- [Entities and State](../concepts/entities-and-state.md) - Learn about entity relationships with `Link<T>`
- [Backend Guide](../backend/README.md) - Customize your API and add persistence
- [Frontend Guide](../frontend/README.md) - Use pre-built views and pages
- [Plugins](../plugins/README.md) - Add file management or data connectivity
