# api

Arrow plugin API operations.

Defines the typed API operations for the Arrow plugin. These operations
are available via `runtime.plugins.arrow.api` when the plugin is installed.

## Available Operations

- `list_connectors` - List all available data connectors
- `connector_list` - Get details for a specific connector
- `connector_list_many` - Get details for multiple connectors
- `list_catalogs` - List available data catalogs
- `list_registered` - List registered connections
- `register` - Register a connector for use
- `execute_query` - Execute a SQL query

## Example

```typescript
const { plugins } = useStatelyUi();

// List connectors
const { data } = await plugins.arrow.api.list_connectors();

// Execute a query
const result = await plugins.arrow.api.execute_query({
  body: { sql: 'SELECT * FROM users LIMIT 10' }
});
```

## Type Aliases

### ArrowApi

> **ArrowApi** = [`TypedOperations`](../ui/api.md#typedoperations)\<[`ArrowPaths`](#arrowpaths), *typeof* [`ARROW_OPERATIONS`](#arrow_operations)\>

Defined in: [arrow/src/api.ts:72](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/arrow/src/api.ts#L72)

Typed API client for Arrow operations.

Access via `runtime.plugins.arrow.api`.

***

### ArrowOperations

> **ArrowOperations** = [`DefineOperations`](../schema/api.md#defineoperations)\<`operations`\>

Defined in: [arrow/src/api.ts:42](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/arrow/src/api.ts#L42)

OpenAPI operations type for the arrow plugin

***

### ArrowPaths

> **ArrowPaths** = [`DefinePaths`](../stately/schema.md#definepaths)\<`paths`\>

Defined in: [arrow/src/api.ts:39](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/arrow/src/api.ts#L39)

OpenAPI paths type for the arrow plugin

## Variables

### ARROW\_OPERATIONS

> `const` **ARROW\_OPERATIONS**: `object`

Defined in: [arrow/src/api.ts:50](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/arrow/src/api.ts#L50)

Arrow plugin operation bindings.

Maps friendly operation names to their HTTP method and path.
Paths do NOT include any prefix - that's provided via plugin options.

#### Type Declaration

##### connector\_list

> `readonly` **connector\_list**: `object`

Get details for a specific connector

###### connector\_list.method

> `readonly` **method**: `"get"` = `'get'`

###### connector\_list.path

> `readonly` **path**: `"/connectors/{connector_id}"` = `'/connectors/{connector_id}'`

##### connector\_list\_many

> `readonly` **connector\_list\_many**: `object`

Get details for multiple connectors

###### connector\_list\_many.method

> `readonly` **method**: `"post"` = `'post'`

###### connector\_list\_many.path

> `readonly` **path**: `"/connectors"` = `'/connectors'`

##### execute\_query

> `readonly` **execute\_query**: `object`

Execute a SQL query against connected data

###### execute\_query.method

> `readonly` **method**: `"post"` = `'post'`

###### execute\_query.path

> `readonly` **path**: `"/query"` = `'/query'`

##### list\_catalogs

> `readonly` **list\_catalogs**: `object`

List available data catalogs

###### list\_catalogs.method

> `readonly` **method**: `"get"` = `'get'`

###### list\_catalogs.path

> `readonly` **path**: `"/catalogs"` = `'/catalogs'`

##### list\_connectors

> `readonly` **list\_connectors**: `object`

List all available data connectors

###### list\_connectors.method

> `readonly` **method**: `"get"` = `'get'`

###### list\_connectors.path

> `readonly` **path**: `"/connectors"` = `'/connectors'`

##### list\_registered

> `readonly` **list\_registered**: `object`

List registered connections

###### list\_registered.method

> `readonly` **method**: `"get"` = `'get'`

###### list\_registered.path

> `readonly` **path**: `"/register"` = `'/register'`

##### register

> `readonly` **register**: `object`

Register a connector for use

###### register.method

> `readonly` **method**: `"get"` = `'get'`

###### register.path

> `readonly` **path**: `"/register/{connector_id}"` = `'/register/{connector_id}'`
