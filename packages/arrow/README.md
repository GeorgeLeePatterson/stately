# @stately/arrow

Apache Arrow data visualization plugin for [Stately UI](../ui/README.md). Provides streaming SQL query execution, table visualization, and connector management for Arrow-based data sources.

## Overview

This package connects your application to a `stately-arrow` backend (Rust), giving you:

- **Arrow Viewer page** - Full-featured SQL query editor with streaming results
- **Connector management** - Browse and register data source connections
- **Streaming queries** - Execute SQL with real-time result streaming
- **Arrow table visualization** - High-performance table rendering with pagination and column controls

## Installation

```bash
pnpm add @stately/arrow
```

## Quick Start

Register the plugin when creating your Stately UI runtime:

```typescript
import { createStatelyUi } from '@stately/ui';
import { arrowPlugin, arrowUiPlugin } from '@stately/arrow';

const stately = createStatelyUi({
  // Your base URL for API requests
  baseUrl: import.meta.env.VITE_API_URL,

  // Schema plugins extend the type system
  schemaPlugins: [arrowPlugin],

  // UI plugins register components, routes, and API bindings
  uiPlugins: [
    arrowUiPlugin({
      // Base path for arrow API endpoints (default: '/arrow')
      api: { pathPrefix: '/arrow' },
    }),
  ],
});
```

### Using with React

Wrap your app with the Stately provider:

```tsx
import { StatelyProvider } from '@stately/ui';

function App() {
  return (
    <StatelyProvider runtime={stately}>
      <YourApp />
    </StatelyProvider>
  );
}
```

### Adding Routes

The plugin provides an `ArrowViewer` page component. Add it to your router:

```tsx
import { ArrowViewer } from '@stately/arrow/pages';

// Example with React Router
<Route path="/data" element={<ArrowViewer />} />
```

## Hooks

All hooks use the arrow API through the plugin context:

### `useStreamingQuery`

Execute SQL queries with streaming results:

```tsx
import { useStreamingQuery } from '@stately/arrow/hooks';

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
import { useConnectors } from '@stately/arrow/hooks';

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
import { useListConnectors } from '@stately/arrow/hooks';

const { data: connectors, isLoading } = useListConnectors();
```

### `useListRegistered`

Get registered catalog connections:

```tsx
import { useListRegistered } from '@stately/arrow/hooks';

const { data: registrations } = useListRegistered();
```

### `useConnectionDetails`

Get details for a specific connector:

```tsx
import { useConnectionDetails } from '@stately/arrow/hooks';

const { data: details } = useConnectionDetails(connectorId);
```

### `useRegisterConnection`

Register a new connection:

```tsx
import { useRegisterConnection } from '@stately/arrow/hooks';

const { mutate: register } = useRegisterConnection();
register({ connectorId: 'postgres-1' });
```

### `useListCatalogs`

List available catalogs:

```tsx
import { useListCatalogs } from '@stately/arrow/hooks';

const { data: catalogs } = useListCatalogs();
```

## Components

Reusable components for building data interfaces:

### `ArrowTable`

High-performance table for Arrow data:

```tsx
import { ArrowTable } from '@stately/arrow/components';

<ArrowTable
  data={tableDataView}
  isLoading={isStreaming}
/>
```

### `QueryEditor`

SQL editor with run controls and stats:

```tsx
import { QueryEditor } from '@stately/arrow/components';

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
import { TablePagination } from '@stately/arrow/components';

<TablePagination table={reactTable} />
```

### `TableViewOptions`

Column visibility toggles:

```tsx
import { TableViewOptions } from '@stately/arrow/components';

<TableViewOptions table={reactTable} />
```

### `TableRowDrawer`

Drawer for viewing row details:

```tsx
import { TableRowDrawer } from '@stately/arrow/components';

<TableRowDrawer row={selectedRow} onClose={handleClose} />
```

## Views

Pre-built view cards for common layouts:

### Connectors

```tsx
import { Connectors } from '@stately/arrow/views';

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
import { Query } from '@stately/arrow/views';

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
import { ArrowViewer } from '@stately/arrow/pages';

// Basic usage
<Route path="/data" element={<ArrowViewer />} />

// With streaming subscription
<ArrowViewer subscribe={(event) => console.log('Stream event:', event)} />
```

## Library Utilities

Low-level utilities for custom implementations:

### `createArrowTableStore`

Zustand store for managing Arrow table state:

```typescript
import { createArrowTableStore } from '@stately/arrow/lib';

const store = createArrowTableStore();
store.subscribe(snapshot => {
  console.log('Table updated:', snapshot.table?.numRows);
});
```

### `streamQuery`

Execute streaming queries directly:

```typescript
import { streamQuery } from '@stately/arrow/lib';

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
import { tableToDataView } from '@stately/arrow/lib';

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

## Plugin Architecture

For plugin authors, this package follows the Stately plugin pattern:

### Schema Plugin

Extends the node type system:

```typescript
import { arrowPlugin } from '@stately/arrow';

schemaPlugins: [arrowPlugin()]
```

### UI Plugin

Registers API bindings and navigation:

```typescript
import { arrowUiPlugin } from '@stately/arrow';

uiPlugins: [
  arrowUiPlugin({
    api: { pathPrefix: '/arrow' },
    navigation: { routes: { label: 'Data Explorer', to: '/data' } },
  }),
]
```

The UI plugin:
1. Creates an API client bound to your base URL with the configured path prefix
2. Registers navigation routes (default: "Data" at `/data`)
3. Provides the arrow context to child components

## License

Apache-2.0
