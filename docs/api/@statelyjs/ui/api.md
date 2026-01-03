# api

API client utilities for creating typed operation bindings (low-level API).

This module provides the infrastructure for creating type-safe API clients
from OpenAPI operation bindings. It wraps `openapi-fetch` to provide
ergonomic, named operations instead of path-based calls.

## For Most Users

You don't need to use this directly. The core plugin from `@statelyjs/stately`
automatically creates typed API operations for your schema. Access them via:

```typescript
const { plugins } = useStatelyUi();
const { data } = await plugins.core.api.operations.list_entities(...);
```

## For Plugin Authors

Use `createOperations` when building plugins that need their own API clients:

```typescript
import { createOperations } from '@statelyjs/ui/api';

const OPERATIONS = {
  getUser: { method: 'get', path: '/users/{id}' },
  createUser: { method: 'post', path: '/users' },
} as const;

const api = createOperations(client, OPERATIONS, '/api/v1');

// Type-safe calls with full inference
const { data } = await api.getUser({ params: { path: { id: '123' } } });
```

## Type Aliases

### TypedOperations

> **TypedOperations**\<`Paths`, `Bindings`, `Media`\> = \{ \[K in keyof Bindings\]: Bindings\[K\] extends \{ method: infer M extends HttpMethod; path: infer P extends keyof Paths \} ? Paths\[P\] extends Record\<M, infer Op extends Record\<string \| number, any\>\> ? (init: MaybeOptionalInitParam\<Init\>) =\> Promise\<FetchResponse\<Op, Init, Media\>\> : never : never \}

Defined in: [packages/ui/src/api.ts:81](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/api.ts#L81)

**`Internal`**

Map of operation names to typed API functions.

Transforms operation bindings into callable functions with full type inference.
Each operation is a generic function that captures the specific Init type,
allowing options like `parseAs: 'arrayBuffer'` to properly transform the
response type via openapi-fetch's ParseAsResponse.

#### Type Parameters

##### Paths

`Paths`

OpenAPI paths type from generated types

##### Bindings

`Bindings` *extends* `Record`\<`string`, \{ `method`: `HttpMethod`; `path`: `any`; \}\>

Operation bindings mapping names to method/path pairs

##### Media

`Media` *extends* `MediaType` = `MediaType`

Media type for responses (defaults to all MediaType)

#### Example

```typescript
type MyOperations = TypedOperations<paths, typeof OPERATIONS>;

// Each key becomes a typed function
const ops: MyOperations = {
  getUser: async (init) => { ... },
  createUser: async (init) => { ... },
};
```

## Functions

### createOperations()

> **createOperations**\<`Paths`, `Bindings`, `Media`\>(`client`, `bindings`, `prefix`): [`TypedOperations`](#typedoperations)\<`Paths`, `Bindings`, `Media`\>

Defined in: [packages/ui/src/api.ts:139](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/api.ts#L139)

#### Type Parameters

##### Paths

`Paths` *extends* `object`

##### Bindings

`Bindings` *extends* `Record`\<`string`, \{ `method`: `HttpMethod`; `path`: `any`; \}\>

##### Media

`Media` *extends* `` `${string}/${string}` `` = `` `${string}/${string}` ``

#### Parameters

##### client

`Client`\<`Paths`, `Media`\>

##### bindings

`Bindings`

##### prefix

`string` = `''`

#### Returns

[`TypedOperations`](#typedoperations)\<`Paths`, `Bindings`, `Media`\>
