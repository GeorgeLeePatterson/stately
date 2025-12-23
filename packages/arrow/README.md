# @statelyjs/arrow

[![npm](https://img.shields.io/npm/v/@statelyjs/arrow)](https://www.npmjs.com/package/@statelyjs/arrow)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../LICENSE)

Apache Arrow data visualization plugin for [Stately UI](../stately/README.md). Provides streaming SQL query execution, table visualization, and connector management for Arrow-based data sources.

## Overview

This package connects your application to a `stately-arrow` backend (Rust), giving you:

- **Arrow Viewer page** - Full-featured SQL query editor with streaming results
- **Connector management** - Browse and register data source connections
- **Streaming queries** - Execute SQL with real-time result streaming
- **Arrow table visualization** - High-performance table rendering with pagination and column controls

## Installation

```bash
pnpm add @statelyjs/arrow
```

## Quick Start

### 1. Add Schema Plugin

```typescript
import { stately } from '@statelyjs/stately/schema';
import { type ArrowPlugin, arrowPlugin } from '@statelyjs/arrow';

const schema = stately<MySchemas, readonly [ArrowPlugin]>(openapiDoc, PARSED_SCHEMAS)
  .withPlugin(arrowPlugin());
```

### 2. Add UI Plugin

```typescript
import { statelyUi } from '@statelyjs/stately';
import { type ArrowUiPlugin, arrowUiPlugin } from '@statelyjs/arrow';

const runtime = statelyUi<MySchemas, readonly [ArrowUiPlugin]>({
  schema,
  client,
  core: { api: { pathPrefix: '/entity' } },
  options: { api: { pathPrefix: '/api' } },
}).withPlugin(arrowUiPlugin({
  api: { pathPrefix: '/arrow' },
}));
```

### 3. Wrap Your App

```tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { AppStatelyProvider, runtime } from './lib/stately';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppStatelyProvider runtime={runtime}>
        <YourApp />
      </AppStatelyProvider>
    </QueryClientProvider>
  );
}
```

### Adding Routes

The plugin provides an `ArrowViewer` page component. Add it to your router:

```tsx
import { ArrowViewer } from '@statelyjs/arrow/pages';

// Example with React Router
<Route path="/data" element={<ArrowViewer />} />
```

## Hooks

All hooks use the arrow API through the plugin context:

### `useStreamingQuery`

Execute SQL queries with streaming results:

```tsx
import { useStreamingQuery } from '@statelyjs/arrow/hooks';

function QueryRunner() {
  const { snapshot, execute, isPending, isStreaming } = useStreamingQuery();

  const handleRun = () => {
    execute({
      connector_id: 'my-connector',
      sql: 'SELECT * FROM users LIMIT 100',
    });
  };

  return (
    <div>
      <button onClick={handleRun} disabled={isPending || isStreaming}>
        Run Query
      </button>
      {snapshot.table && (
        <p>Rows: {snapshot.table.numRows}, Bytes: {snapshot.metrics.bytesReceived}</p>
      )}
    </div>
  );
}
```

### `useConnectors`

Manage connector state and selection:

```tsx
import { useConnectors } from '@statelyjs/arrow/hooks';

function ConnectorPicker() {
  const { connectors, currentConnector, setConnectorId } = useConnectors();

  return (
    <select
      value={currentConnector?.id}
      onChange={e => setConnectorId(e.target.value)}
    >
      {connectors.map(c => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  );
}
```

### `useListConnectors`

Fetch available connectors:

```tsx
import { useListConnectors } from '@statelyjs/arrow/hooks';

const { data: connectors, isLoading } = useListConnectors();
```

### `useListRegistered`

Get registered catalog connections:

```tsx
import { useListRegistered } from '@statelyjs/arrow/hooks';

const { data: registrations } = useListRegistered();
```

### `useConnectionDetails`

Get details for a specific connector:

```tsx
import { useConnectionDetails } from '@statelyjs/arrow/hooks';

const { data: details } = useConnectionDetails(connectorId);
```

### `useRegisterConnection`

Register a new connection:

```tsx
import { useRegisterConnection } from '@statelyjs/arrow/hooks';

const { mutate: register } = useRegisterConnection();
register({ connectorId: 'postgres-1' });
```

### `useListCatalogs`

List available catalogs:

```tsx
import { useListCatalogs } from '@statelyjs/arrow/hooks';

const { data: catalogs } = useListCatalogs();
```

## Components

Reusable components for building data interfaces:

### `ArrowTable`

High-performance table for Arrow data:

```tsx
import { ArrowTable } from '@statelyjs/arrow/components';

<ArrowTable
  data={tableDataView}
  isLoading={isStreaming}
/>
```

### `QueryEditor`

SQL editor with run controls and stats:

```tsx
import { QueryEditor } from '@statelyjs/arrow/components';

<QueryEditor
  sql={sql}
  onSql={setSql}
  onRun={handleRun}
  isExecuting={isPending}
  stats={[
    { label: SquareSigma, value: '1,234' },
    { label: Timer, value: '45.2 ms' },
  ]}
/>
```

### `TablePagination`

Pagination controls for tables:

```tsx
import { TablePagination } from '@statelyjs/arrow/components';

<TablePagination table={reactTable} />
```

### `TableViewOptions`

Column visibility toggles:

```tsx
import { TableViewOptions } from '@statelyjs/arrow/components';

<TableViewOptions table={reactTable} />
```

### `TableRowDrawer`

Drawer for viewing row details:

```tsx
import { TableRowDrawer } from '@statelyjs/arrow/components';

<TableRowDrawer row={selectedRow} onClose={handleClose} />
```

## Views

Pre-built view cards for common layouts:

### Connectors

```tsx
import { Connectors } from '@statelyjs/arrow/views';

// Connector selection dropdown
<Connectors.ConnectorSelectCard
  connectors={connectors}
  currentConnector={selected}
  onSelect={handleSelect}
/>

// Connector browser with schema navigation
<Connectors.ConnectorMenuCard
  connectors={connectors}
  currentConnector={selected}
  onSelectItem={(identifier, type) => { /* handle table/schema selection */ }}
/>

// Registration card
<Connectors.ConnectorsRegisterCard
  connectors={connectors}
  currentConnector={selected}
/>
```

### Query

```tsx
import { Query } from '@statelyjs/arrow/views';

// Query editor card
<Query.QueryEditorCard
  sql={sql}
  onSql={setSql}
  onRun={handleRun}
  isExecuting={isPending}
/>

// Results table card
<Query.QueryResultsCard
  data={tableDataView}
  isLoading={isStreaming}
/>
```

## Pages

### `ArrowViewer`

Full-featured data exploration page with:

- Connector sidebar with schema browser
- SQL query editor with syntax highlighting
- Streaming results table with pagination
- Query statistics (rows, bytes, elapsed time)
- Responsive layout with collapsible sidebar

```tsx
import { ArrowViewer } from '@statelyjs/arrow/pages';

// Basic usage
<Route path="/data" element={<ArrowViewer />} />

// With streaming subscription
<ArrowViewer subscribe={(event) => console.log('Stream event:', event)} />
```

## Library Utilities

Low-level utilities for custom implementations:

### `createArrowTableStore`

Store for managing Arrow table state:

```typescript
import { createArrowTableStore } from '@statelyjs/arrow/lib';

const store = createArrowTableStore();
store.subscribe(snapshot => {
  console.log('Table updated:', snapshot.table?.numRows);
});
```

### `streamQuery`

Execute streaming queries directly:

```typescript
import { streamQuery } from '@statelyjs/arrow/lib';

await streamQuery({
  client,
  sql: 'SELECT * FROM users',
  connectorId: 'my-connector',
  onBatch: (table) => console.log('Batch:', table.numRows),
});
```

### `tableToDataView`

Convert Arrow table to component-friendly format:

```typescript
import { tableToDataView } from '@statelyjs/arrow/lib';

const view = tableToDataView(arrowTable);
// { columns: [...], rows: [...] }
```

## Backend Requirements

This plugin expects a `stately-arrow` compatible backend with these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/connectors` | GET | List available connectors |
| `/connectors` | POST | Get details for multiple connectors |
| `/connectors/{connector_id}` | GET | Get connector details |
| `/register` | GET | List registered connections |
| `/register/{connector_id}` | GET | Register a connector |
| `/catalogs` | GET | List available catalogs |
| `/query` | POST | Execute SQL query (streaming response) |

The `/query` endpoint returns Apache Arrow IPC stream format for efficient data transfer.

## License

Apache-2.0
