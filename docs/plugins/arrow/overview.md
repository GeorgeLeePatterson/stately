---
title: Arrow Plugin Overview
description: Data connectivity and SQL queries with the Stately arrow plugin
---

# Arrow Plugin

The arrow plugin provides data connectivity and SQL query execution capabilities using Apache Arrow and DataFusion. Connect to various data sources and run queries with streaming results.

## Features

- **Multiple Backends**: S3, GCS, Azure, ClickHouse, local filesystem
- **SQL Queries**: Execute queries via DataFusion
- **Streaming Results**: Arrow IPC streaming for large datasets
- **Connector Registry**: Manage and register data sources
- **Schema Discovery**: Browse catalogs, databases, and tables

## Installation

### Backend

```toml
[dependencies]
stately-arrow = "0.3"
```

Feature flags for backends:

```toml
[dependencies]
stately-arrow = { version = "0.3", features = ["object-store", "clickhouse"] }
```

### Frontend

```bash
pnpm add @statelyjs/arrow
```

## Quick Start

### Backend Setup

```rust
use stately_arrow::{api, QueryContext, QueryState, ConnectorRegistry};
use std::sync::Arc;

// Create connector registry
let registry: Arc<dyn ConnectorRegistry> = create_your_registry();

// Create query context
let query_context = QueryContext::new(registry);

// State extraction
impl FromRef<ApiState> for QueryState {
    fn from_ref(state: &ApiState) -> Self {
        QueryState::new(state.query_context.clone())
    }
}

// Add to router
pub fn app(state: ApiState) -> Router {
    Router::new()
        .nest("/arrow", api::router(state.clone()))
        .with_state(state)
}
```

### Frontend Setup

```typescript
import { arrowPlugin, arrowUiPlugin } from '@statelyjs/arrow';

// Add to schema runtime
const schema = createStately(spec, schemas)
  .withPlugin(corePlugin())
  .withPlugin(arrowPlugin());

// Add to UI runtime
const runtime = statelyUi({ client, schema, core })
  .withPlugin(arrowUiPlugin({
    api: { pathPrefix: '/arrow' },
  }));
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/connectors` | List available connectors |
| POST | `/connectors` | Get details for multiple connectors |
| GET | `/connectors/{id}` | List connector contents |
| GET | `/register` | List registered connections |
| GET | `/register/{id}` | Register connector with DataFusion |
| GET | `/catalogs` | List DataFusion catalogs |
| POST | `/query` | Execute SQL query (streaming response) |

## Backend Connectors

### Object Store

Connect to cloud object stores:

```rust
use stately_arrow::object_store::{Config, ObjectStore};

let config = Config {
    format: ObjectStoreFormat::Parquet(None),
    store: ObjectStore::S3 {
        bucket: "my-bucket".into(),
        region: Some("us-east-1".into()),
        // Credentials from environment
    },
};
```

Supported stores:
- Amazon S3
- Google Cloud Storage
- Azure Blob Storage
- Local filesystem

### ClickHouse

Connect to ClickHouse databases:

```rust
use stately_arrow::database::clickhouse::Config;

let config = Config {
    options: ConnectionOptions {
        endpoint: "http://localhost:8123".into(),
        username: Some("default".into()),
        password: None,
        tls: false,
    },
    // ...
};
```

## Streaming Queries

Queries return results as streaming Arrow IPC:

```rust
// Backend streams RecordBatches
POST /query
Content-Type: application/json
{ "sql": "SELECT * FROM my_table LIMIT 1000", "connector_id": "my-connector" }

// Response: application/vnd.apache.arrow.stream
```

The frontend handles streaming automatically:

```typescript
import { useStreamingQuery } from '@statelyjs/arrow/hooks';

function QueryView() {
  const { execute, data, isStreaming, stats } = useStreamingQuery();
  
  const runQuery = () => {
    execute({
      sql: 'SELECT * FROM my_table',
      connectorId: 'my-connector',
    });
  };
  
  return (
    <div>
      <button onClick={runQuery}>Run Query</button>
      {isStreaming && <p>Streaming... {stats.rowCount} rows</p>}
      <ArrowTable data={data} />
    </div>
  );
}
```

## Frontend Components

### ArrowViewer

Full-featured data exploration page:

```typescript
import { ArrowViewer } from '@statelyjs/arrow/pages';

function DataPage() {
  return <ArrowViewer />;
}
```

### QueryEditor

SQL editor with syntax highlighting:

```typescript
import { QueryEditor } from '@statelyjs/arrow/components';

function MyComponent() {
  return (
    <QueryEditor
      value={sql}
      onChange={setSql}
      onExecute={handleExecute}
    />
  );
}
```

### ArrowTable

High-performance data table:

```typescript
import { ArrowTable } from '@statelyjs/arrow/components';

function Results({ data }) {
  return <ArrowTable data={data} />;
}
```

### ConnectorMenuCard

Connector browser with schema navigation:

```typescript
import { ConnectorMenuCard } from '@statelyjs/arrow/views';

function Sidebar() {
  return (
    <ConnectorMenuCard
      onTableSelect={(table) => insertIntoQuery(table)}
    />
  );
}
```

## Hooks

```typescript
import {
  useStreamingQuery,
  useConnectors,
  useListConnectors,
  useRegisterConnection,
  useListCatalogs,
} from '@statelyjs/arrow/hooks';

function MyComponent() {
  const { connectors } = useListConnectors();
  const { register } = useRegisterConnection();
  const { execute, data, stats } = useStreamingQuery();
  
  // ...
}
```

## The Backend Trait

Implement custom backends by implementing the `Backend` trait:

```rust
#[async_trait]
pub trait Backend: Send + Sync {
    fn connection(&self) -> &ConnectionMetadata;
    
    async fn prepare_session(&self, session: &SessionContext) -> Result<()>;
    
    async fn list(&self, database: Option<&str>) -> Result<ListSummary>;
}
```

## Next Steps

- [Plugin Development](../../plugin-development/README.md) - Learn how to create your own plugins
- [Concepts: Plugins](../../concepts/plugins.md) - Understand plugin architecture
