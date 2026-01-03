# core/hooks

Core hooks for entity CRUD operations.

These hooks provide React Query-based data fetching and mutations for
working with Stately entities. They automatically handle caching,
cache invalidation, and error states.

## Example

```tsx
import {
  useListEntities,
  useEntityData,
  useCreateEntity,
  useUpdateEntity,
  useRemoveEntity,
} from '@statelyjs/stately/core/hooks';
```

## Interfaces

### MergedField

Defined in: [packages/stately/src/core/hooks/use-object-field.tsx:10](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/hooks/use-object-field.tsx#L10)

State for a merged field from `allOf` composition.

#### Type Parameters

##### S

`S` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

#### Properties

##### schema

> **schema**: `S`\[`"plugin"`\]\[`"AnyNode"`\]

Defined in: [packages/stately/src/core/hooks/use-object-field.tsx:12](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/hooks/use-object-field.tsx#L12)

The schema node for this merged section

##### value

> **value**: [`AnyRecord`](../schema.md#anyrecord)

Defined in: [packages/stately/src/core/hooks/use-object-field.tsx:14](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/hooks/use-object-field.tsx#L14)

Current values for fields in this merged section

***

### ObjectFieldState

Defined in: [packages/stately/src/core/hooks/use-object-field.tsx:20](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/hooks/use-object-field.tsx#L20)

Complete state and handlers for an object field editor.

#### Type Parameters

##### S

`S` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

#### Properties

##### extraFieldsValue

> **extraFieldsValue**: [`AnyRecord`](../schema.md#anyrecord)

Defined in: [packages/stately/src/core/hooks/use-object-field.tsx:38](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/hooks/use-object-field.tsx#L38)

Values for additional properties not in schema

##### fields

> **fields**: \[`string`, `S`\[`"plugin"`\]\[`"AnyNode"`\]\][]

Defined in: [packages/stately/src/core/hooks/use-object-field.tsx:34](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/hooks/use-object-field.tsx#L34)

Sorted array of [fieldName, fieldSchema] tuples

##### formData

> **formData**: `Record`\<`string`, `any`\>

Defined in: [packages/stately/src/core/hooks/use-object-field.tsx:22](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/hooks/use-object-field.tsx#L22)

Current form data (may differ from original value if dirty)

##### handleAdditionalFieldChange()

> **handleAdditionalFieldChange**: (`newAdditionalData`) => `void`

Defined in: [packages/stately/src/core/hooks/use-object-field.tsx:28](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/hooks/use-object-field.tsx#L28)

Handle changes to additional properties (dynamic keys)

###### Parameters

###### newAdditionalData

[`AnyRecord`](../schema.md#anyrecord)

###### Returns

`void`

##### handleCancel()

> **handleCancel**: () => `void`

Defined in: [packages/stately/src/core/hooks/use-object-field.tsx:32](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/hooks/use-object-field.tsx#L32)

Reset form data to original value

###### Returns

`void`

##### handleFieldChange()

> **handleFieldChange**: (`fieldName`, `isNullable`, `newValue`) => `void`

Defined in: [packages/stately/src/core/hooks/use-object-field.tsx:24](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/hooks/use-object-field.tsx#L24)

Handle a single field value change

###### Parameters

###### fieldName

`string`

###### isNullable

`boolean`

###### newValue

`any`

###### Returns

`void`

##### handleMergedFieldChange()

> **handleMergedFieldChange**: (`newMergedData`) => `void`

Defined in: [packages/stately/src/core/hooks/use-object-field.tsx:26](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/hooks/use-object-field.tsx#L26)

Handle changes to merged fields (from allOf composition)

###### Parameters

###### newMergedData

[`AnyRecord`](../schema.md#anyrecord)

###### Returns

`void`

##### handleSave()

> **handleSave**: () => `void`

Defined in: [packages/stately/src/core/hooks/use-object-field.tsx:30](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/hooks/use-object-field.tsx#L30)

Save the current form data

###### Returns

`void`

##### isDirty

> **isDirty**: `boolean`

Defined in: [packages/stately/src/core/hooks/use-object-field.tsx:40](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/hooks/use-object-field.tsx#L40)

Whether form data differs from original value

##### isValid

> **isValid**: `boolean`

Defined in: [packages/stately/src/core/hooks/use-object-field.tsx:42](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/hooks/use-object-field.tsx#L42)

Whether current form data passes validation

##### mergedFields

> **mergedFields**: [`MergedField`](#mergedfield)\<`S`\>[]

Defined in: [packages/stately/src/core/hooks/use-object-field.tsx:36](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/hooks/use-object-field.tsx#L36)

Merged schemas with their current values (from allOf)

##### resetKey

> **resetKey**: `number`

Defined in: [packages/stately/src/core/hooks/use-object-field.tsx:44](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/hooks/use-object-field.tsx#L44)

Counter that increments on cancel - use as key to force child remount

## Functions

### useCreateEntity()

> **useCreateEntity**\<`Schema`\>(`options`): `UseMutationResult`\<\{ \}, `Error`, `CoreEntityWrapped`\<`Schema`\>, `unknown`\>

Defined in: [packages/stately/src/core/hooks/use-create-entity.ts:47](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/hooks/use-create-entity.ts#L47)

Create a new entity.

Returns a React Query mutation that creates an entity and automatically
invalidates the entity list cache on success.

The mutation expects the full wrapped entity shape `{ type: "entity_type", data: {...} }`.
The hook validates that the entity type matches what was configured.

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

Your application's schema type

#### Parameters

##### options

Hook options

###### entity

`CoreStateEntry`\<`Schema`\>

The entity type name (e.g., 'Pipeline', 'SourceConfig')

###### queryClient?

`QueryClient`

Optional QueryClient for cache invalidation

#### Returns

`UseMutationResult`\<\{ \}, `Error`, `CoreEntityWrapped`\<`Schema`\>, `unknown`\>

A React Query mutation with `mutate` and `mutateAsync` functions

#### Example

```tsx
function CreatePipelineForm() {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useCreateEntity<MySchemas>({
    entity: 'Pipeline',
    queryClient,
  });

  const handleSubmit = (formData: PipelineData) => {
    mutate({ type: 'pipeline', data: formData }, {
      onSuccess: (result) => {
        toast.success('Pipeline created');
        navigate(`/pipelines/${result.id}`);
      },
    });
  };

  return <PipelineForm onSubmit={handleSubmit} disabled={isPending} />;
}
```

***

### useEntityData()

> **useEntityData**\<`Schema`\>(`options`): `UseQueryResult`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`, `Error`\>

Defined in: [packages/stately/src/core/hooks/use-entity-data.ts:39](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/hooks/use-entity-data.ts#L39)

Fetch a single entity by its ID.

Uses React Query to fetch and cache entity data. The query is automatically
disabled when `identifier` is not provided or when `disabled` is true.

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

Your application's schema type

#### Parameters

##### options

Hook options

###### disabled?

`boolean`

Set to true to prevent fetching

###### entity

`CoreStateEntry`\<`Schema`\>

The entity type name (e.g., 'Pipeline', 'SourceConfig')

###### identifier?

`string`

The entity's unique ID

#### Returns

`UseQueryResult`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`, `Error`\>

A React Query result with the entity data

#### Example

```tsx
function PipelineDetail({ id }: { id: string }) {
  const { data, isLoading, error } = useEntityData<MySchemas>({
    entity: 'Pipeline',
    identifier: id,
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return <div>{data?.entity.data.name}</div>;
}
```

***

### useEntityDataInline()

> **useEntityDataInline**\<`Schema`\>(`options`): \{ `data`: \{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`; `dataUpdatedAt`: `number`; `error`: `Error`; `errorUpdateCount`: `number`; `errorUpdatedAt`: `number`; `failureCount`: `number`; `failureReason`: `Error` \| `null`; `fetchStatus`: `FetchStatus`; `inlineEntity`: `string` \| `undefined`; `inlineNote`: `Element` \| `null`; `isEnabled`: `boolean`; `isError`: `true`; `isFetched`: `boolean`; `isFetchedAfterMount`: `boolean`; `isFetching`: `boolean`; `isInitialLoading`: `boolean`; `isLoading`: `false`; `isLoadingError`: `false`; `isPaused`: `boolean`; `isPending`: `false`; `isPlaceholderData`: `false`; `isRefetchError`: `true`; `isRefetching`: `boolean`; `isStale`: `boolean`; `isSuccess`: `false`; `promise`: `Promise`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`\>; `refetch`: (`options?`) => `Promise`\<`QueryObserverResult`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`, `Error`\>\>; `setInlineEntity`: `Dispatch`\<`SetStateAction`\<`string` \| `undefined`\>\>; `status`: `"error"`; \} \| \{ `data`: \{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`; `dataUpdatedAt`: `number`; `error`: `null`; `errorUpdateCount`: `number`; `errorUpdatedAt`: `number`; `failureCount`: `number`; `failureReason`: `Error` \| `null`; `fetchStatus`: `FetchStatus`; `inlineEntity`: `string` \| `undefined`; `inlineNote`: `Element` \| `null`; `isEnabled`: `boolean`; `isError`: `false`; `isFetched`: `boolean`; `isFetchedAfterMount`: `boolean`; `isFetching`: `boolean`; `isInitialLoading`: `boolean`; `isLoading`: `false`; `isLoadingError`: `false`; `isPaused`: `boolean`; `isPending`: `false`; `isPlaceholderData`: `false`; `isRefetchError`: `false`; `isRefetching`: `boolean`; `isStale`: `boolean`; `isSuccess`: `true`; `promise`: `Promise`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`\>; `refetch`: (`options?`) => `Promise`\<`QueryObserverResult`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`, `Error`\>\>; `setInlineEntity`: `Dispatch`\<`SetStateAction`\<`string` \| `undefined`\>\>; `status`: `"success"`; \} \| \{ `data`: `undefined`; `dataUpdatedAt`: `number`; `error`: `Error`; `errorUpdateCount`: `number`; `errorUpdatedAt`: `number`; `failureCount`: `number`; `failureReason`: `Error` \| `null`; `fetchStatus`: `FetchStatus`; `inlineEntity`: `string` \| `undefined`; `inlineNote`: `Element` \| `null`; `isEnabled`: `boolean`; `isError`: `true`; `isFetched`: `boolean`; `isFetchedAfterMount`: `boolean`; `isFetching`: `boolean`; `isInitialLoading`: `boolean`; `isLoading`: `false`; `isLoadingError`: `true`; `isPaused`: `boolean`; `isPending`: `false`; `isPlaceholderData`: `false`; `isRefetchError`: `false`; `isRefetching`: `boolean`; `isStale`: `boolean`; `isSuccess`: `false`; `promise`: `Promise`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`\>; `refetch`: (`options?`) => `Promise`\<`QueryObserverResult`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`, `Error`\>\>; `setInlineEntity`: `Dispatch`\<`SetStateAction`\<`string` \| `undefined`\>\>; `status`: `"error"`; \} \| \{ `data`: `undefined`; `dataUpdatedAt`: `number`; `error`: `null`; `errorUpdateCount`: `number`; `errorUpdatedAt`: `number`; `failureCount`: `number`; `failureReason`: `Error` \| `null`; `fetchStatus`: `FetchStatus`; `inlineEntity`: `string` \| `undefined`; `inlineNote`: `Element` \| `null`; `isEnabled`: `boolean`; `isError`: `false`; `isFetched`: `boolean`; `isFetchedAfterMount`: `boolean`; `isFetching`: `boolean`; `isInitialLoading`: `boolean`; `isLoading`: `true`; `isLoadingError`: `false`; `isPaused`: `boolean`; `isPending`: `true`; `isPlaceholderData`: `false`; `isRefetchError`: `false`; `isRefetching`: `boolean`; `isStale`: `boolean`; `isSuccess`: `false`; `promise`: `Promise`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`\>; `refetch`: (`options?`) => `Promise`\<`QueryObserverResult`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`, `Error`\>\>; `setInlineEntity`: `Dispatch`\<`SetStateAction`\<`string` \| `undefined`\>\>; `status`: `"pending"`; \} \| \{ `data`: `undefined`; `dataUpdatedAt`: `number`; `error`: `null`; `errorUpdateCount`: `number`; `errorUpdatedAt`: `number`; `failureCount`: `number`; `failureReason`: `Error` \| `null`; `fetchStatus`: `FetchStatus`; `inlineEntity`: `string` \| `undefined`; `inlineNote`: `Element` \| `null`; `isEnabled`: `boolean`; `isError`: `false`; `isFetched`: `boolean`; `isFetchedAfterMount`: `boolean`; `isFetching`: `boolean`; `isInitialLoading`: `boolean`; `isLoading`: `boolean`; `isLoadingError`: `false`; `isPaused`: `boolean`; `isPending`: `true`; `isPlaceholderData`: `false`; `isRefetchError`: `false`; `isRefetching`: `boolean`; `isStale`: `boolean`; `isSuccess`: `false`; `promise`: `Promise`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`\>; `refetch`: (`options?`) => `Promise`\<`QueryObserverResult`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`, `Error`\>\>; `setInlineEntity`: `Dispatch`\<`SetStateAction`\<`string` \| `undefined`\>\>; `status`: `"pending"`; \} \| \{ `data`: \{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`; `dataUpdatedAt`: `number`; `error`: `null`; `errorUpdateCount`: `number`; `errorUpdatedAt`: `number`; `failureCount`: `number`; `failureReason`: `Error` \| `null`; `fetchStatus`: `FetchStatus`; `inlineEntity`: `string` \| `undefined`; `inlineNote`: `Element` \| `null`; `isEnabled`: `boolean`; `isError`: `false`; `isFetched`: `boolean`; `isFetchedAfterMount`: `boolean`; `isFetching`: `boolean`; `isInitialLoading`: `boolean`; `isLoading`: `false`; `isLoadingError`: `false`; `isPaused`: `boolean`; `isPending`: `false`; `isPlaceholderData`: `true`; `isRefetchError`: `false`; `isRefetching`: `boolean`; `isStale`: `boolean`; `isSuccess`: `true`; `promise`: `Promise`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`\>; `refetch`: (`options?`) => `Promise`\<`QueryObserverResult`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`, `Error`\>\>; `setInlineEntity`: `Dispatch`\<`SetStateAction`\<`string` \| `undefined`\>\>; `status`: `"success"`; \}

Defined in: [packages/stately/src/core/hooks/use-entity-data-inline.tsx:42](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/hooks/use-entity-data-inline.tsx#L42)

Fetch entity data with inline display support.

Extends `useEntityData` with state management and UI helpers for inline
entity viewing. Useful for previewing linked entities without navigating away.

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

Your application's schema type

#### Parameters

##### options

Hook options

###### disabled?

`boolean`

Set to true to prevent fetching

###### entity

`CoreStateEntry`\<`Schema`\>

The entity type name (e.g., 'Pipeline', 'SourceConfig')

#### Returns

\{ `data`: \{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`; `dataUpdatedAt`: `number`; `error`: `Error`; `errorUpdateCount`: `number`; `errorUpdatedAt`: `number`; `failureCount`: `number`; `failureReason`: `Error` \| `null`; `fetchStatus`: `FetchStatus`; `inlineEntity`: `string` \| `undefined`; `inlineNote`: `Element` \| `null`; `isEnabled`: `boolean`; `isError`: `true`; `isFetched`: `boolean`; `isFetchedAfterMount`: `boolean`; `isFetching`: `boolean`; `isInitialLoading`: `boolean`; `isLoading`: `false`; `isLoadingError`: `false`; `isPaused`: `boolean`; `isPending`: `false`; `isPlaceholderData`: `false`; `isRefetchError`: `true`; `isRefetching`: `boolean`; `isStale`: `boolean`; `isSuccess`: `false`; `promise`: `Promise`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`\>; `refetch`: (`options?`) => `Promise`\<`QueryObserverResult`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`, `Error`\>\>; `setInlineEntity`: `Dispatch`\<`SetStateAction`\<`string` \| `undefined`\>\>; `status`: `"error"`; \}

##### data

> **data**: \{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`

The last successfully resolved data for the query.

##### dataUpdatedAt

> **dataUpdatedAt**: `number`

The timestamp for when the query most recently returned the `status` as `"success"`.

##### error

> **error**: `Error`

The error object for the query, if an error was thrown.
- Defaults to `null`.

##### errorUpdateCount

> **errorUpdateCount**: `number`

The sum of all errors.

##### errorUpdatedAt

> **errorUpdatedAt**: `number`

The timestamp for when the query most recently returned the `status` as `"error"`.

##### failureCount

> **failureCount**: `number`

The failure count for the query.
- Incremented every time the query fails.
- Reset to `0` when the query succeeds.

##### failureReason

> **failureReason**: `Error` \| `null`

The failure reason for the query retry.
- Reset to `null` when the query succeeds.

##### fetchStatus

> **fetchStatus**: `FetchStatus`

The fetch status of the query.
- `fetching`: Is `true` whenever the queryFn is executing, which includes initial `pending` as well as background refetch.
- `paused`: The query wanted to fetch, but has been `paused`.
- `idle`: The query is not fetching.
- See [Network Mode](https://tanstack.com/query/latest/docs/framework/react/guides/network-mode) for more information.

##### inlineEntity

> **inlineEntity**: `string` \| `undefined`

##### inlineNote

> **inlineNote**: `Element` \| `null`

##### isEnabled

> **isEnabled**: `boolean`

`true` if this observer is enabled, `false` otherwise.

##### isError

> **isError**: `true`

A derived boolean from the `status` variable, provided for convenience.
- `true` if the query attempt resulted in an error.

##### isFetched

> **isFetched**: `boolean`

Will be `true` if the query has been fetched.

##### isFetchedAfterMount

> **isFetchedAfterMount**: `boolean`

Will be `true` if the query has been fetched after the component mounted.
- This property can be used to not show any previously cached data.

##### isFetching

> **isFetching**: `boolean`

A derived boolean from the `fetchStatus` variable, provided for convenience.
- `true` whenever the `queryFn` is executing, which includes initial `pending` as well as background refetch.

##### ~~isInitialLoading~~

> **isInitialLoading**: `boolean`

###### Deprecated

`isInitialLoading` is being deprecated in favor of `isLoading`
and will be removed in the next major version.

##### isLoading

> **isLoading**: `false`

Is `true` whenever the first fetch for a query is in-flight.
- Is the same as `isFetching && isPending`.

##### isLoadingError

> **isLoadingError**: `false`

Will be `true` if the query failed while fetching for the first time.

##### isPaused

> **isPaused**: `boolean`

A derived boolean from the `fetchStatus` variable, provided for convenience.
- The query wanted to fetch, but has been `paused`.

##### isPending

> **isPending**: `false`

Will be `pending` if there's no cached data and no query attempt was finished yet.

##### isPlaceholderData

> **isPlaceholderData**: `false`

Will be `true` if the data shown is the placeholder data.

##### isRefetchError

> **isRefetchError**: `true`

Will be `true` if the query failed while refetching.

##### isRefetching

> **isRefetching**: `boolean`

Is `true` whenever a background refetch is in-flight, which _does not_ include initial `pending`.
- Is the same as `isFetching && !isPending`.

##### isStale

> **isStale**: `boolean`

Will be `true` if the data in the cache is invalidated or if the data is older than the given `staleTime`.

##### isSuccess

> **isSuccess**: `false`

A derived boolean from the `status` variable, provided for convenience.
- `true` if the query has received a response with no errors and is ready to display its data.

##### promise

> **promise**: `Promise`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`\>

A stable promise that will be resolved with the data of the query.
Requires the `experimental_prefetchInRender` feature flag to be enabled.

###### Example

### Enabling the feature flag
```ts
const client = new QueryClient({
  defaultOptions: {
    queries: {
      experimental_prefetchInRender: true,
    },
  },
})
```

### Usage
```tsx
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { fetchTodos, type Todo } from './api'

function TodoList({ query }: { query: UseQueryResult<Todo[], Error> }) {
  const data = React.use(query.promise)

  return (
    <ul>
      {data.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}

export function App() {
  const query = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })

  return (
    <>
      <h1>Todos</h1>
      <React.Suspense fallback={<div>Loading...</div>}>
        <TodoList query={query} />
      </React.Suspense>
    </>
  )
}
```

##### refetch()

> **refetch**: (`options?`) => `Promise`\<`QueryObserverResult`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`, `Error`\>\>

A function to manually refetch the query.

###### Parameters

###### options?

`RefetchOptions`

###### Returns

`Promise`\<`QueryObserverResult`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`, `Error`\>\>

##### setInlineEntity

> **setInlineEntity**: `Dispatch`\<`SetStateAction`\<`string` \| `undefined`\>\>

##### status

> **status**: `"error"`

The status of the query.
- Will be:
  - `pending` if there's no cached data and no query attempt was finished yet.
  - `error` if the query attempt resulted in an error.
  - `success` if the query has received a response with no errors and is ready to display its data.

\{ `data`: \{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`; `dataUpdatedAt`: `number`; `error`: `null`; `errorUpdateCount`: `number`; `errorUpdatedAt`: `number`; `failureCount`: `number`; `failureReason`: `Error` \| `null`; `fetchStatus`: `FetchStatus`; `inlineEntity`: `string` \| `undefined`; `inlineNote`: `Element` \| `null`; `isEnabled`: `boolean`; `isError`: `false`; `isFetched`: `boolean`; `isFetchedAfterMount`: `boolean`; `isFetching`: `boolean`; `isInitialLoading`: `boolean`; `isLoading`: `false`; `isLoadingError`: `false`; `isPaused`: `boolean`; `isPending`: `false`; `isPlaceholderData`: `false`; `isRefetchError`: `false`; `isRefetching`: `boolean`; `isStale`: `boolean`; `isSuccess`: `true`; `promise`: `Promise`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`\>; `refetch`: (`options?`) => `Promise`\<`QueryObserverResult`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`, `Error`\>\>; `setInlineEntity`: `Dispatch`\<`SetStateAction`\<`string` \| `undefined`\>\>; `status`: `"success"`; \}

##### data

> **data**: \{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`

The last successfully resolved data for the query.

##### dataUpdatedAt

> **dataUpdatedAt**: `number`

The timestamp for when the query most recently returned the `status` as `"success"`.

##### error

> **error**: `null`

The error object for the query, if an error was thrown.
- Defaults to `null`.

##### errorUpdateCount

> **errorUpdateCount**: `number`

The sum of all errors.

##### errorUpdatedAt

> **errorUpdatedAt**: `number`

The timestamp for when the query most recently returned the `status` as `"error"`.

##### failureCount

> **failureCount**: `number`

The failure count for the query.
- Incremented every time the query fails.
- Reset to `0` when the query succeeds.

##### failureReason

> **failureReason**: `Error` \| `null`

The failure reason for the query retry.
- Reset to `null` when the query succeeds.

##### fetchStatus

> **fetchStatus**: `FetchStatus`

The fetch status of the query.
- `fetching`: Is `true` whenever the queryFn is executing, which includes initial `pending` as well as background refetch.
- `paused`: The query wanted to fetch, but has been `paused`.
- `idle`: The query is not fetching.
- See [Network Mode](https://tanstack.com/query/latest/docs/framework/react/guides/network-mode) for more information.

##### inlineEntity

> **inlineEntity**: `string` \| `undefined`

##### inlineNote

> **inlineNote**: `Element` \| `null`

##### isEnabled

> **isEnabled**: `boolean`

`true` if this observer is enabled, `false` otherwise.

##### isError

> **isError**: `false`

A derived boolean from the `status` variable, provided for convenience.
- `true` if the query attempt resulted in an error.

##### isFetched

> **isFetched**: `boolean`

Will be `true` if the query has been fetched.

##### isFetchedAfterMount

> **isFetchedAfterMount**: `boolean`

Will be `true` if the query has been fetched after the component mounted.
- This property can be used to not show any previously cached data.

##### isFetching

> **isFetching**: `boolean`

A derived boolean from the `fetchStatus` variable, provided for convenience.
- `true` whenever the `queryFn` is executing, which includes initial `pending` as well as background refetch.

##### ~~isInitialLoading~~

> **isInitialLoading**: `boolean`

###### Deprecated

`isInitialLoading` is being deprecated in favor of `isLoading`
and will be removed in the next major version.

##### isLoading

> **isLoading**: `false`

Is `true` whenever the first fetch for a query is in-flight.
- Is the same as `isFetching && isPending`.

##### isLoadingError

> **isLoadingError**: `false`

Will be `true` if the query failed while fetching for the first time.

##### isPaused

> **isPaused**: `boolean`

A derived boolean from the `fetchStatus` variable, provided for convenience.
- The query wanted to fetch, but has been `paused`.

##### isPending

> **isPending**: `false`

Will be `pending` if there's no cached data and no query attempt was finished yet.

##### isPlaceholderData

> **isPlaceholderData**: `false`

Will be `true` if the data shown is the placeholder data.

##### isRefetchError

> **isRefetchError**: `false`

Will be `true` if the query failed while refetching.

##### isRefetching

> **isRefetching**: `boolean`

Is `true` whenever a background refetch is in-flight, which _does not_ include initial `pending`.
- Is the same as `isFetching && !isPending`.

##### isStale

> **isStale**: `boolean`

Will be `true` if the data in the cache is invalidated or if the data is older than the given `staleTime`.

##### isSuccess

> **isSuccess**: `true`

A derived boolean from the `status` variable, provided for convenience.
- `true` if the query has received a response with no errors and is ready to display its data.

##### promise

> **promise**: `Promise`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`\>

A stable promise that will be resolved with the data of the query.
Requires the `experimental_prefetchInRender` feature flag to be enabled.

###### Example

### Enabling the feature flag
```ts
const client = new QueryClient({
  defaultOptions: {
    queries: {
      experimental_prefetchInRender: true,
    },
  },
})
```

### Usage
```tsx
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { fetchTodos, type Todo } from './api'

function TodoList({ query }: { query: UseQueryResult<Todo[], Error> }) {
  const data = React.use(query.promise)

  return (
    <ul>
      {data.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}

export function App() {
  const query = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })

  return (
    <>
      <h1>Todos</h1>
      <React.Suspense fallback={<div>Loading...</div>}>
        <TodoList query={query} />
      </React.Suspense>
    </>
  )
}
```

##### refetch()

> **refetch**: (`options?`) => `Promise`\<`QueryObserverResult`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`, `Error`\>\>

A function to manually refetch the query.

###### Parameters

###### options?

`RefetchOptions`

###### Returns

`Promise`\<`QueryObserverResult`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`, `Error`\>\>

##### setInlineEntity

> **setInlineEntity**: `Dispatch`\<`SetStateAction`\<`string` \| `undefined`\>\>

##### status

> **status**: `"success"`

The status of the query.
- Will be:
  - `pending` if there's no cached data and no query attempt was finished yet.
  - `error` if the query attempt resulted in an error.
  - `success` if the query has received a response with no errors and is ready to display its data.

\{ `data`: `undefined`; `dataUpdatedAt`: `number`; `error`: `Error`; `errorUpdateCount`: `number`; `errorUpdatedAt`: `number`; `failureCount`: `number`; `failureReason`: `Error` \| `null`; `fetchStatus`: `FetchStatus`; `inlineEntity`: `string` \| `undefined`; `inlineNote`: `Element` \| `null`; `isEnabled`: `boolean`; `isError`: `true`; `isFetched`: `boolean`; `isFetchedAfterMount`: `boolean`; `isFetching`: `boolean`; `isInitialLoading`: `boolean`; `isLoading`: `false`; `isLoadingError`: `true`; `isPaused`: `boolean`; `isPending`: `false`; `isPlaceholderData`: `false`; `isRefetchError`: `false`; `isRefetching`: `boolean`; `isStale`: `boolean`; `isSuccess`: `false`; `promise`: `Promise`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`\>; `refetch`: (`options?`) => `Promise`\<`QueryObserverResult`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`, `Error`\>\>; `setInlineEntity`: `Dispatch`\<`SetStateAction`\<`string` \| `undefined`\>\>; `status`: `"error"`; \}

##### data

> **data**: `undefined`

The last successfully resolved data for the query.

##### dataUpdatedAt

> **dataUpdatedAt**: `number`

The timestamp for when the query most recently returned the `status` as `"success"`.

##### error

> **error**: `Error`

The error object for the query, if an error was thrown.
- Defaults to `null`.

##### errorUpdateCount

> **errorUpdateCount**: `number`

The sum of all errors.

##### errorUpdatedAt

> **errorUpdatedAt**: `number`

The timestamp for when the query most recently returned the `status` as `"error"`.

##### failureCount

> **failureCount**: `number`

The failure count for the query.
- Incremented every time the query fails.
- Reset to `0` when the query succeeds.

##### failureReason

> **failureReason**: `Error` \| `null`

The failure reason for the query retry.
- Reset to `null` when the query succeeds.

##### fetchStatus

> **fetchStatus**: `FetchStatus`

The fetch status of the query.
- `fetching`: Is `true` whenever the queryFn is executing, which includes initial `pending` as well as background refetch.
- `paused`: The query wanted to fetch, but has been `paused`.
- `idle`: The query is not fetching.
- See [Network Mode](https://tanstack.com/query/latest/docs/framework/react/guides/network-mode) for more information.

##### inlineEntity

> **inlineEntity**: `string` \| `undefined`

##### inlineNote

> **inlineNote**: `Element` \| `null`

##### isEnabled

> **isEnabled**: `boolean`

`true` if this observer is enabled, `false` otherwise.

##### isError

> **isError**: `true`

A derived boolean from the `status` variable, provided for convenience.
- `true` if the query attempt resulted in an error.

##### isFetched

> **isFetched**: `boolean`

Will be `true` if the query has been fetched.

##### isFetchedAfterMount

> **isFetchedAfterMount**: `boolean`

Will be `true` if the query has been fetched after the component mounted.
- This property can be used to not show any previously cached data.

##### isFetching

> **isFetching**: `boolean`

A derived boolean from the `fetchStatus` variable, provided for convenience.
- `true` whenever the `queryFn` is executing, which includes initial `pending` as well as background refetch.

##### ~~isInitialLoading~~

> **isInitialLoading**: `boolean`

###### Deprecated

`isInitialLoading` is being deprecated in favor of `isLoading`
and will be removed in the next major version.

##### isLoading

> **isLoading**: `false`

Is `true` whenever the first fetch for a query is in-flight.
- Is the same as `isFetching && isPending`.

##### isLoadingError

> **isLoadingError**: `true`

Will be `true` if the query failed while fetching for the first time.

##### isPaused

> **isPaused**: `boolean`

A derived boolean from the `fetchStatus` variable, provided for convenience.
- The query wanted to fetch, but has been `paused`.

##### isPending

> **isPending**: `false`

Will be `pending` if there's no cached data and no query attempt was finished yet.

##### isPlaceholderData

> **isPlaceholderData**: `false`

Will be `true` if the data shown is the placeholder data.

##### isRefetchError

> **isRefetchError**: `false`

Will be `true` if the query failed while refetching.

##### isRefetching

> **isRefetching**: `boolean`

Is `true` whenever a background refetch is in-flight, which _does not_ include initial `pending`.
- Is the same as `isFetching && !isPending`.

##### isStale

> **isStale**: `boolean`

Will be `true` if the data in the cache is invalidated or if the data is older than the given `staleTime`.

##### isSuccess

> **isSuccess**: `false`

A derived boolean from the `status` variable, provided for convenience.
- `true` if the query has received a response with no errors and is ready to display its data.

##### promise

> **promise**: `Promise`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`\>

A stable promise that will be resolved with the data of the query.
Requires the `experimental_prefetchInRender` feature flag to be enabled.

###### Example

### Enabling the feature flag
```ts
const client = new QueryClient({
  defaultOptions: {
    queries: {
      experimental_prefetchInRender: true,
    },
  },
})
```

### Usage
```tsx
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { fetchTodos, type Todo } from './api'

function TodoList({ query }: { query: UseQueryResult<Todo[], Error> }) {
  const data = React.use(query.promise)

  return (
    <ul>
      {data.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}

export function App() {
  const query = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })

  return (
    <>
      <h1>Todos</h1>
      <React.Suspense fallback={<div>Loading...</div>}>
        <TodoList query={query} />
      </React.Suspense>
    </>
  )
}
```

##### refetch()

> **refetch**: (`options?`) => `Promise`\<`QueryObserverResult`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`, `Error`\>\>

A function to manually refetch the query.

###### Parameters

###### options?

`RefetchOptions`

###### Returns

`Promise`\<`QueryObserverResult`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`, `Error`\>\>

##### setInlineEntity

> **setInlineEntity**: `Dispatch`\<`SetStateAction`\<`string` \| `undefined`\>\>

##### status

> **status**: `"error"`

The status of the query.
- Will be:
  - `pending` if there's no cached data and no query attempt was finished yet.
  - `error` if the query attempt resulted in an error.
  - `success` if the query has received a response with no errors and is ready to display its data.

\{ `data`: `undefined`; `dataUpdatedAt`: `number`; `error`: `null`; `errorUpdateCount`: `number`; `errorUpdatedAt`: `number`; `failureCount`: `number`; `failureReason`: `Error` \| `null`; `fetchStatus`: `FetchStatus`; `inlineEntity`: `string` \| `undefined`; `inlineNote`: `Element` \| `null`; `isEnabled`: `boolean`; `isError`: `false`; `isFetched`: `boolean`; `isFetchedAfterMount`: `boolean`; `isFetching`: `boolean`; `isInitialLoading`: `boolean`; `isLoading`: `true`; `isLoadingError`: `false`; `isPaused`: `boolean`; `isPending`: `true`; `isPlaceholderData`: `false`; `isRefetchError`: `false`; `isRefetching`: `boolean`; `isStale`: `boolean`; `isSuccess`: `false`; `promise`: `Promise`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`\>; `refetch`: (`options?`) => `Promise`\<`QueryObserverResult`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`, `Error`\>\>; `setInlineEntity`: `Dispatch`\<`SetStateAction`\<`string` \| `undefined`\>\>; `status`: `"pending"`; \}

##### data

> **data**: `undefined`

The last successfully resolved data for the query.

##### dataUpdatedAt

> **dataUpdatedAt**: `number`

The timestamp for when the query most recently returned the `status` as `"success"`.

##### error

> **error**: `null`

The error object for the query, if an error was thrown.
- Defaults to `null`.

##### errorUpdateCount

> **errorUpdateCount**: `number`

The sum of all errors.

##### errorUpdatedAt

> **errorUpdatedAt**: `number`

The timestamp for when the query most recently returned the `status` as `"error"`.

##### failureCount

> **failureCount**: `number`

The failure count for the query.
- Incremented every time the query fails.
- Reset to `0` when the query succeeds.

##### failureReason

> **failureReason**: `Error` \| `null`

The failure reason for the query retry.
- Reset to `null` when the query succeeds.

##### fetchStatus

> **fetchStatus**: `FetchStatus`

The fetch status of the query.
- `fetching`: Is `true` whenever the queryFn is executing, which includes initial `pending` as well as background refetch.
- `paused`: The query wanted to fetch, but has been `paused`.
- `idle`: The query is not fetching.
- See [Network Mode](https://tanstack.com/query/latest/docs/framework/react/guides/network-mode) for more information.

##### inlineEntity

> **inlineEntity**: `string` \| `undefined`

##### inlineNote

> **inlineNote**: `Element` \| `null`

##### isEnabled

> **isEnabled**: `boolean`

`true` if this observer is enabled, `false` otherwise.

##### isError

> **isError**: `false`

A derived boolean from the `status` variable, provided for convenience.
- `true` if the query attempt resulted in an error.

##### isFetched

> **isFetched**: `boolean`

Will be `true` if the query has been fetched.

##### isFetchedAfterMount

> **isFetchedAfterMount**: `boolean`

Will be `true` if the query has been fetched after the component mounted.
- This property can be used to not show any previously cached data.

##### isFetching

> **isFetching**: `boolean`

A derived boolean from the `fetchStatus` variable, provided for convenience.
- `true` whenever the `queryFn` is executing, which includes initial `pending` as well as background refetch.

##### ~~isInitialLoading~~

> **isInitialLoading**: `boolean`

###### Deprecated

`isInitialLoading` is being deprecated in favor of `isLoading`
and will be removed in the next major version.

##### isLoading

> **isLoading**: `true`

Is `true` whenever the first fetch for a query is in-flight.
- Is the same as `isFetching && isPending`.

##### isLoadingError

> **isLoadingError**: `false`

Will be `true` if the query failed while fetching for the first time.

##### isPaused

> **isPaused**: `boolean`

A derived boolean from the `fetchStatus` variable, provided for convenience.
- The query wanted to fetch, but has been `paused`.

##### isPending

> **isPending**: `true`

Will be `pending` if there's no cached data and no query attempt was finished yet.

##### isPlaceholderData

> **isPlaceholderData**: `false`

Will be `true` if the data shown is the placeholder data.

##### isRefetchError

> **isRefetchError**: `false`

Will be `true` if the query failed while refetching.

##### isRefetching

> **isRefetching**: `boolean`

Is `true` whenever a background refetch is in-flight, which _does not_ include initial `pending`.
- Is the same as `isFetching && !isPending`.

##### isStale

> **isStale**: `boolean`

Will be `true` if the data in the cache is invalidated or if the data is older than the given `staleTime`.

##### isSuccess

> **isSuccess**: `false`

A derived boolean from the `status` variable, provided for convenience.
- `true` if the query has received a response with no errors and is ready to display its data.

##### promise

> **promise**: `Promise`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`\>

A stable promise that will be resolved with the data of the query.
Requires the `experimental_prefetchInRender` feature flag to be enabled.

###### Example

### Enabling the feature flag
```ts
const client = new QueryClient({
  defaultOptions: {
    queries: {
      experimental_prefetchInRender: true,
    },
  },
})
```

### Usage
```tsx
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { fetchTodos, type Todo } from './api'

function TodoList({ query }: { query: UseQueryResult<Todo[], Error> }) {
  const data = React.use(query.promise)

  return (
    <ul>
      {data.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}

export function App() {
  const query = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })

  return (
    <>
      <h1>Todos</h1>
      <React.Suspense fallback={<div>Loading...</div>}>
        <TodoList query={query} />
      </React.Suspense>
    </>
  )
}
```

##### refetch()

> **refetch**: (`options?`) => `Promise`\<`QueryObserverResult`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`, `Error`\>\>

A function to manually refetch the query.

###### Parameters

###### options?

`RefetchOptions`

###### Returns

`Promise`\<`QueryObserverResult`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`, `Error`\>\>

##### setInlineEntity

> **setInlineEntity**: `Dispatch`\<`SetStateAction`\<`string` \| `undefined`\>\>

##### status

> **status**: `"pending"`

The status of the query.
- Will be:
  - `pending` if there's no cached data and no query attempt was finished yet.
  - `error` if the query attempt resulted in an error.
  - `success` if the query has received a response with no errors and is ready to display its data.

\{ `data`: `undefined`; `dataUpdatedAt`: `number`; `error`: `null`; `errorUpdateCount`: `number`; `errorUpdatedAt`: `number`; `failureCount`: `number`; `failureReason`: `Error` \| `null`; `fetchStatus`: `FetchStatus`; `inlineEntity`: `string` \| `undefined`; `inlineNote`: `Element` \| `null`; `isEnabled`: `boolean`; `isError`: `false`; `isFetched`: `boolean`; `isFetchedAfterMount`: `boolean`; `isFetching`: `boolean`; `isInitialLoading`: `boolean`; `isLoading`: `boolean`; `isLoadingError`: `false`; `isPaused`: `boolean`; `isPending`: `true`; `isPlaceholderData`: `false`; `isRefetchError`: `false`; `isRefetching`: `boolean`; `isStale`: `boolean`; `isSuccess`: `false`; `promise`: `Promise`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`\>; `refetch`: (`options?`) => `Promise`\<`QueryObserverResult`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`, `Error`\>\>; `setInlineEntity`: `Dispatch`\<`SetStateAction`\<`string` \| `undefined`\>\>; `status`: `"pending"`; \}

##### data

> **data**: `undefined`

The last successfully resolved data for the query.

##### dataUpdatedAt

> **dataUpdatedAt**: `number`

The timestamp for when the query most recently returned the `status` as `"success"`.

##### error

> **error**: `null`

The error object for the query, if an error was thrown.
- Defaults to `null`.

##### errorUpdateCount

> **errorUpdateCount**: `number`

The sum of all errors.

##### errorUpdatedAt

> **errorUpdatedAt**: `number`

The timestamp for when the query most recently returned the `status` as `"error"`.

##### failureCount

> **failureCount**: `number`

The failure count for the query.
- Incremented every time the query fails.
- Reset to `0` when the query succeeds.

##### failureReason

> **failureReason**: `Error` \| `null`

The failure reason for the query retry.
- Reset to `null` when the query succeeds.

##### fetchStatus

> **fetchStatus**: `FetchStatus`

The fetch status of the query.
- `fetching`: Is `true` whenever the queryFn is executing, which includes initial `pending` as well as background refetch.
- `paused`: The query wanted to fetch, but has been `paused`.
- `idle`: The query is not fetching.
- See [Network Mode](https://tanstack.com/query/latest/docs/framework/react/guides/network-mode) for more information.

##### inlineEntity

> **inlineEntity**: `string` \| `undefined`

##### inlineNote

> **inlineNote**: `Element` \| `null`

##### isEnabled

> **isEnabled**: `boolean`

`true` if this observer is enabled, `false` otherwise.

##### isError

> **isError**: `false`

A derived boolean from the `status` variable, provided for convenience.
- `true` if the query attempt resulted in an error.

##### isFetched

> **isFetched**: `boolean`

Will be `true` if the query has been fetched.

##### isFetchedAfterMount

> **isFetchedAfterMount**: `boolean`

Will be `true` if the query has been fetched after the component mounted.
- This property can be used to not show any previously cached data.

##### isFetching

> **isFetching**: `boolean`

A derived boolean from the `fetchStatus` variable, provided for convenience.
- `true` whenever the `queryFn` is executing, which includes initial `pending` as well as background refetch.

##### ~~isInitialLoading~~

> **isInitialLoading**: `boolean`

###### Deprecated

`isInitialLoading` is being deprecated in favor of `isLoading`
and will be removed in the next major version.

##### isLoading

> **isLoading**: `boolean`

Is `true` whenever the first fetch for a query is in-flight.
- Is the same as `isFetching && isPending`.

##### isLoadingError

> **isLoadingError**: `false`

Will be `true` if the query failed while fetching for the first time.

##### isPaused

> **isPaused**: `boolean`

A derived boolean from the `fetchStatus` variable, provided for convenience.
- The query wanted to fetch, but has been `paused`.

##### isPending

> **isPending**: `true`

Will be `pending` if there's no cached data and no query attempt was finished yet.

##### isPlaceholderData

> **isPlaceholderData**: `false`

Will be `true` if the data shown is the placeholder data.

##### isRefetchError

> **isRefetchError**: `false`

Will be `true` if the query failed while refetching.

##### isRefetching

> **isRefetching**: `boolean`

Is `true` whenever a background refetch is in-flight, which _does not_ include initial `pending`.
- Is the same as `isFetching && !isPending`.

##### isStale

> **isStale**: `boolean`

Will be `true` if the data in the cache is invalidated or if the data is older than the given `staleTime`.

##### isSuccess

> **isSuccess**: `false`

A derived boolean from the `status` variable, provided for convenience.
- `true` if the query has received a response with no errors and is ready to display its data.

##### promise

> **promise**: `Promise`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`\>

A stable promise that will be resolved with the data of the query.
Requires the `experimental_prefetchInRender` feature flag to be enabled.

###### Example

### Enabling the feature flag
```ts
const client = new QueryClient({
  defaultOptions: {
    queries: {
      experimental_prefetchInRender: true,
    },
  },
})
```

### Usage
```tsx
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { fetchTodos, type Todo } from './api'

function TodoList({ query }: { query: UseQueryResult<Todo[], Error> }) {
  const data = React.use(query.promise)

  return (
    <ul>
      {data.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}

export function App() {
  const query = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })

  return (
    <>
      <h1>Todos</h1>
      <React.Suspense fallback={<div>Loading...</div>}>
        <TodoList query={query} />
      </React.Suspense>
    </>
  )
}
```

##### refetch()

> **refetch**: (`options?`) => `Promise`\<`QueryObserverResult`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`, `Error`\>\>

A function to manually refetch the query.

###### Parameters

###### options?

`RefetchOptions`

###### Returns

`Promise`\<`QueryObserverResult`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`, `Error`\>\>

##### setInlineEntity

> **setInlineEntity**: `Dispatch`\<`SetStateAction`\<`string` \| `undefined`\>\>

##### status

> **status**: `"pending"`

The status of the query.
- Will be:
  - `pending` if there's no cached data and no query attempt was finished yet.
  - `error` if the query attempt resulted in an error.
  - `success` if the query has received a response with no errors and is ready to display its data.

\{ `data`: \{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`; `dataUpdatedAt`: `number`; `error`: `null`; `errorUpdateCount`: `number`; `errorUpdatedAt`: `number`; `failureCount`: `number`; `failureReason`: `Error` \| `null`; `fetchStatus`: `FetchStatus`; `inlineEntity`: `string` \| `undefined`; `inlineNote`: `Element` \| `null`; `isEnabled`: `boolean`; `isError`: `false`; `isFetched`: `boolean`; `isFetchedAfterMount`: `boolean`; `isFetching`: `boolean`; `isInitialLoading`: `boolean`; `isLoading`: `false`; `isLoadingError`: `false`; `isPaused`: `boolean`; `isPending`: `false`; `isPlaceholderData`: `true`; `isRefetchError`: `false`; `isRefetching`: `boolean`; `isStale`: `boolean`; `isSuccess`: `true`; `promise`: `Promise`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`\>; `refetch`: (`options?`) => `Promise`\<`QueryObserverResult`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`, `Error`\>\>; `setInlineEntity`: `Dispatch`\<`SetStateAction`\<`string` \| `undefined`\>\>; `status`: `"success"`; \}

##### data

> **data**: \{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`

The last successfully resolved data for the query.

##### dataUpdatedAt

> **dataUpdatedAt**: `number`

The timestamp for when the query most recently returned the `status` as `"success"`.

##### error

> **error**: `null`

The error object for the query, if an error was thrown.
- Defaults to `null`.

##### errorUpdateCount

> **errorUpdateCount**: `number`

The sum of all errors.

##### errorUpdatedAt

> **errorUpdatedAt**: `number`

The timestamp for when the query most recently returned the `status` as `"error"`.

##### failureCount

> **failureCount**: `number`

The failure count for the query.
- Incremented every time the query fails.
- Reset to `0` when the query succeeds.

##### failureReason

> **failureReason**: `Error` \| `null`

The failure reason for the query retry.
- Reset to `null` when the query succeeds.

##### fetchStatus

> **fetchStatus**: `FetchStatus`

The fetch status of the query.
- `fetching`: Is `true` whenever the queryFn is executing, which includes initial `pending` as well as background refetch.
- `paused`: The query wanted to fetch, but has been `paused`.
- `idle`: The query is not fetching.
- See [Network Mode](https://tanstack.com/query/latest/docs/framework/react/guides/network-mode) for more information.

##### inlineEntity

> **inlineEntity**: `string` \| `undefined`

##### inlineNote

> **inlineNote**: `Element` \| `null`

##### isEnabled

> **isEnabled**: `boolean`

`true` if this observer is enabled, `false` otherwise.

##### isError

> **isError**: `false`

A derived boolean from the `status` variable, provided for convenience.
- `true` if the query attempt resulted in an error.

##### isFetched

> **isFetched**: `boolean`

Will be `true` if the query has been fetched.

##### isFetchedAfterMount

> **isFetchedAfterMount**: `boolean`

Will be `true` if the query has been fetched after the component mounted.
- This property can be used to not show any previously cached data.

##### isFetching

> **isFetching**: `boolean`

A derived boolean from the `fetchStatus` variable, provided for convenience.
- `true` whenever the `queryFn` is executing, which includes initial `pending` as well as background refetch.

##### ~~isInitialLoading~~

> **isInitialLoading**: `boolean`

###### Deprecated

`isInitialLoading` is being deprecated in favor of `isLoading`
and will be removed in the next major version.

##### isLoading

> **isLoading**: `false`

Is `true` whenever the first fetch for a query is in-flight.
- Is the same as `isFetching && isPending`.

##### isLoadingError

> **isLoadingError**: `false`

Will be `true` if the query failed while fetching for the first time.

##### isPaused

> **isPaused**: `boolean`

A derived boolean from the `fetchStatus` variable, provided for convenience.
- The query wanted to fetch, but has been `paused`.

##### isPending

> **isPending**: `false`

Will be `pending` if there's no cached data and no query attempt was finished yet.

##### isPlaceholderData

> **isPlaceholderData**: `true`

Will be `true` if the data shown is the placeholder data.

##### isRefetchError

> **isRefetchError**: `false`

Will be `true` if the query failed while refetching.

##### isRefetching

> **isRefetching**: `boolean`

Is `true` whenever a background refetch is in-flight, which _does not_ include initial `pending`.
- Is the same as `isFetching && !isPending`.

##### isStale

> **isStale**: `boolean`

Will be `true` if the data in the cache is invalidated or if the data is older than the given `staleTime`.

##### isSuccess

> **isSuccess**: `true`

A derived boolean from the `status` variable, provided for convenience.
- `true` if the query has received a response with no errors and is ready to display its data.

##### promise

> **promise**: `Promise`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`\>

A stable promise that will be resolved with the data of the query.
Requires the `experimental_prefetchInRender` feature flag to be enabled.

###### Example

### Enabling the feature flag
```ts
const client = new QueryClient({
  defaultOptions: {
    queries: {
      experimental_prefetchInRender: true,
    },
  },
})
```

### Usage
```tsx
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { fetchTodos, type Todo } from './api'

function TodoList({ query }: { query: UseQueryResult<Todo[], Error> }) {
  const data = React.use(query.promise)

  return (
    <ul>
      {data.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}

export function App() {
  const query = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })

  return (
    <>
      <h1>Todos</h1>
      <React.Suspense fallback={<div>Loading...</div>}>
        <TodoList query={query} />
      </React.Suspense>
    </>
  )
}
```

##### refetch()

> **refetch**: (`options?`) => `Promise`\<`QueryObserverResult`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`, `Error`\>\>

A function to manually refetch the query.

###### Parameters

###### options?

`RefetchOptions`

###### Returns

`Promise`\<`QueryObserverResult`\<\{ `entity`: `CoreEntityWrapped`\<`Schema`\>; `id`: `string`; \} \| `undefined`, `Error`\>\>

##### setInlineEntity

> **setInlineEntity**: `Dispatch`\<`SetStateAction`\<`string` \| `undefined`\>\>

##### status

> **status**: `"success"`

The status of the query.
- Will be:
  - `pending` if there's no cached data and no query attempt was finished yet.
  - `error` if the query attempt resulted in an error.
  - `success` if the query has received a response with no errors and is ready to display its data.

An object with:
  - `inlineEntity` - The currently selected entity ID (if any)
  - `setInlineEntity` - Set an entity ID to fetch and display inline
  - `inlineNote` - A pre-built Note component showing status/errors
  - All properties from `useEntityData` (data, isLoading, error, etc.)

#### Example

```tsx
function LinkedEntityPreview({ entity }: { entity: string }) {
  const { inlineEntity, setInlineEntity, inlineNote, data } = useEntityDataInline<MySchemas>({
    entity,
  });

  return (
    <div>
      <Button onClick={() => setInlineEntity('some-id')}>Preview</Button>
      {inlineNote}
      {data && <EntityView data={data.entity} />}
    </div>
  );
}
```

***

### useEntitySchema()

> **useEntitySchema**\<`Schema`\>(`entityType`, `entitySchema?`): \{ `error?`: `undefined`; `node`: `Schema`\[`"plugin"`\]\[`"Nodes"`\]\[`"object"`\]; \} \| \{ `error`: `string`; `node?`: `undefined`; \}

Defined in: [packages/stately/src/core/hooks/use-entity-schema.ts:41](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/hooks/use-entity-schema.ts#L41)

Get the schema node for an entity type.

Retrieves the parsed object schema for a given entity type, which can be used
for form generation, validation, or custom rendering. Returns either the schema
node or an error message if the schema is not found or invalid.

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas)

Your application's schema type

#### Parameters

##### entityType

`CoreStateEntry`\<`Schema`\>

The entity type name (e.g., 'Pipeline', 'SourceConfig')

##### entitySchema?

`Schema`\[`"plugin"`\]\[`"Nodes"`\]\[`"object"`\]

Optional pre-fetched schema to use instead of looking up

#### Returns

\{ `error?`: `undefined`; `node`: `Schema`\[`"plugin"`\]\[`"Nodes"`\]\[`"object"`\]; \} \| \{ `error`: `string`; `node?`: `undefined`; \}

Either `{ node }` with the schema, or `{ error }` with an error message

#### Example

```tsx
function EntityForm({ entityType }: { entityType: string }) {
  const result = useEntitySchema<MySchemas>(entityType);

  if (result.error) {
    return <Error message={result.error} />;
  }

  const { node } = result;
  return (
    <form>
      {Object.entries(node.properties).map(([name, fieldSchema]) => (
        <FieldEdit key={name} name={name} node={fieldSchema} />
      ))}
    </form>
  );
}
```

***

### useEntityUrl()

> **useEntityUrl**\<`Schema`\>(): (`parts`, `params?`, `omitBasePath?`) => `string`

Defined in: [packages/stately/src/core/hooks/use-entity-url.ts:31](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/hooks/use-entity-url.ts#L31)

Build URLs for entity navigation.

Returns a memoized function for generating entity URLs based on the
configured base path and entity routing conventions.

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

Your application's schema type

#### Returns

A function `(parts, params?, omitBasePath?) => string` for building URLs

> (`parts`, `params?`, `omitBasePath?`): `string`

##### Parameters

###### parts

[`EntityUrlParts`](utils.md#entityurlparts)

###### params?

`Record`\<`string`, `string`\>

###### omitBasePath?

`boolean`

##### Returns

`string`

#### Example

```tsx
function PipelineLink({ id, name }: { id: string; name: string }) {
  const resolveUrl = useEntityUrl<MySchemas>();

  // Generate URL like "/entities/pipelines/abc123"
  const url = resolveUrl({ type: 'Pipeline', id });

  // With query params: "/entities/pipelines/abc123?tab=settings"
  const urlWithParams = resolveUrl({ type: 'Pipeline', id }, { tab: 'settings' });

  return <Link to={url}>{name}</Link>;
}
```

***

### useListEntities()

> **useListEntities**\<`Schema`\>(`options`): `UseQueryResult`\<\{ \}, `Error`\>

Defined in: [packages/stately/src/core/hooks/use-list-entities.ts:40](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/hooks/use-list-entities.ts#L40)

Fetch all entities of a given type.

Uses React Query to fetch and cache the entity list. The query key is
`['entities', entity]`, so it will be automatically invalidated when
entities are created, updated, or removed.

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

Your application's schema type

#### Parameters

##### options

Hook options

###### entity

`CoreStateEntry`\<`Schema`\>

The entity type name (e.g., 'Pipeline', 'SourceConfig')

#### Returns

`UseQueryResult`\<\{ \}, `Error`\>

A React Query result with an array of entity summaries

#### Example

```tsx
function PipelineList() {
  const { data, isLoading } = useListEntities<MySchemas>({
    entity: 'Pipeline',
  });

  if (isLoading) return <Spinner />;

  return (
    <ul>
      {data?.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

***

### useObjectCompare()

> **useObjectCompare**(`value`, `formData`, `isDirty`): (`changes?`) => `boolean`

Defined in: [packages/stately/src/core/hooks/use-object-compare.ts:17](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/hooks/use-object-compare.ts#L17)

A simple hook providing a method to validate whether incomning value, when compared to runtime
form data, has changed.

Sometimes just a flag tracking form changes is not enough, ie when a value changes *back*. This
hook provides a function for determining whether the value has in fact changed.

Typically, a `React.RefObject` is used to track `changes`, the argument to the method returned.

#### Parameters

##### value

`any`

Any object like value representing the incoming value

##### formData

`any`

Any object like value representing the form data

##### isDirty

`boolean`

A boolean indicating whether the form data has been modified

#### Returns

A function that returns a boolean indicating whether the value has changed

> (`changes?`): `boolean`

##### Parameters

###### changes?

`Map`\<`string`, `any`\>

##### Returns

`boolean`

***

### useObjectField()

> **useObjectField**\<`S`\>(`options`): [`ObjectFieldState`](#objectfieldstate)

Defined in: [packages/stately/src/core/hooks/use-object-field.tsx:97](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/hooks/use-object-field.tsx#L97)

Manage state for editing an object-type schema field.

Provides comprehensive state management for complex object editing including:
- Regular property fields
- Merged fields from `allOf` composition
- Additional properties (dynamic keys)
- Dirty tracking and validation

#### Type Parameters

##### S

`S` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

Your application's schema type

#### Parameters

##### options

Hook options

###### label?

`string`

Optional label for validation error paths

###### node

`S`\[`"plugin"`\]\[`"Nodes"`\]\[`"object"`\]

The object schema node

###### onSave

(`formData`) => `void`

Callback when save is triggered

###### value

`any`

Current value of the object

#### Returns

[`ObjectFieldState`](#objectfieldstate)

Complete state and handlers for the object editor

#### Example

```tsx
function ObjectEditor({ schema, value, onSave }) {
  const state = useObjectField({
    node: schema,
    value,
    onSave,
  });

  return (
    <div>
      {state.fields.map(([name, fieldSchema]) => (
        <Field
          key={name}
          name={name}
          schema={fieldSchema}
          value={state.formData[name]}
          onChange={(v) => state.handleFieldChange(name, false, v)}
        />
      ))}
      <Button onClick={state.handleSave} disabled={!state.isDirty || !state.isValid}>
        Save
      </Button>
      <Button onClick={state.handleCancel} disabled={!state.isDirty}>
        Cancel
      </Button>
    </div>
  );
}
```

***

### useRemoveEntity()

> **useRemoveEntity**\<`Schema`\>(`options`): `object`

Defined in: [packages/stately/src/core/hooks/use-remove-entity.tsx:51](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/hooks/use-remove-entity.tsx#L51)

Remove an entity with confirmation dialog support.

Returns a mutation for deleting entities along with state and helpers
for triggering a confirmation dialog.

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

Your application's schema type

#### Parameters

##### options

Hook options

###### entity

`CoreStateEntry`\<`Schema`\>

The entity type name (e.g., 'Pipeline', 'SourceConfig')

###### queryClient?

`QueryClient`

Optional QueryClient for cache invalidation

#### Returns

`object`

An object with:
  - `mutation` - The React Query mutation
  - `removeEntityId` - The ID currently pending removal (if any)
  - `setRemoveEntityId` - Set an ID to trigger the confirmation dialog

##### mutation

> **mutation**: `UseMutationResult`\<\{ \}, `Error`, `string`, `unknown`\>

##### removeEntityId

> **removeEntityId**: `string` \| `undefined`

##### setRemoveEntityId

> **setRemoveEntityId**: `Dispatch`\<`SetStateAction`\<`string` \| `undefined`\>\>

#### Example

```tsx
function PipelineList() {
  const queryClient = useQueryClient();
  const { removeEntityId, setRemoveEntityId, confirmRemove } = useRemoveEntity<MySchemas>({
    entity: 'Pipeline',
    queryClient,
    onConfirmed: () => toast.success('Pipeline deleted'),
  });

  return (
    <>
      <ul>
        {pipelines.map(p => (
          <li key={p.id}>
            {p.name}
            <Button onClick={() => setRemoveEntityId(p.id)}>Delete</Button>
          </li>
        ))}
      </ul>
      <ConfirmModal open={!!removeEntityId} {...otherProps} />
    </>
  );
}
```

***

### useUpdateEntity()

> **useUpdateEntity**\<`Schema`\>(`options`): `UseMutationResult`\<\{ \}, `Error`, `CoreEntityWrapped`\<`Schema`\>, `unknown`\>

Defined in: [packages/stately/src/core/hooks/use-update-entity.ts:46](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/core/hooks/use-update-entity.ts#L46)

Update an existing entity.

Returns a React Query mutation that updates an entity and automatically
invalidates both the individual entity cache and the entity list cache on success.

The mutation expects the full wrapped entity shape `{ type: "entity_type", data: {...} }`.
The hook validates that the entity type matches what was configured.

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](../schema.md#schemas) = [`Schemas`](../schema.md#schemas)

Your application's schema type

#### Parameters

##### options

Hook options

###### entity

`CoreStateEntry`\<`Schema`\>

The entity type name (e.g., 'Pipeline', 'SourceConfig')

###### id

`string`

The entity's unique ID to update

###### queryClient?

`QueryClient`

Optional QueryClient for cache invalidation

#### Returns

`UseMutationResult`\<\{ \}, `Error`, `CoreEntityWrapped`\<`Schema`\>, `unknown`\>

A React Query mutation with `mutate` and `mutateAsync` functions

#### Example

```tsx
function EditPipelineForm({ id, initialData }: Props) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useUpdateEntity<MySchemas>({
    entity: 'Pipeline',
    id,
    queryClient,
  });

  const handleSubmit = (formData: PipelineData) => {
    mutate({ type: 'pipeline', data: formData }, {
      onSuccess: () => toast.success('Pipeline updated'),
    });
  };

  return <PipelineForm defaultValues={initialData} onSubmit={handleSubmit} disabled={isPending} />;
}
```
