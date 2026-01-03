# context

Low-level React context and providers for Stately.

This module provides the base context infrastructure for making the Stately
runtime available throughout your React application. These are intended for
plugin authors and advanced use cases.

## For Most Users

**Use `StatelyProvider` and `useStatelyUi` from `@statelyjs/stately` instead.**
They include the core plugin types automatically:

```typescript
import { StatelyProvider, useStatelyUi } from '@statelyjs/stately';

// In your app
<StatelyProvider runtime={runtime}>
  <App />
</StatelyProvider>

// In components - core plugin is typed automatically
function MyComponent() {
  const { plugins } = useStatelyUi();
  plugins.core.api.operations.list_entities(...);
}
```

## For Plugin Authors

Use `createStatelyUiProvider` and `createUseStatelyUi` when building
plugins or working with custom plugin configurations:

```typescript
import { createStatelyUiProvider, createUseStatelyUi } from '@statelyjs/ui';

const MyProvider = createStatelyUiProvider<MySchemas, [MyPlugin]>();
const useMyStatelyUi = createUseStatelyUi<MySchemas, [MyPlugin]>();
```

## Type Aliases

### StatelyProviderProps

> **StatelyProviderProps**\<`Schema`, `Augments`\> = `PropsWithChildren`\<\{ `runtime`: `StatelyUiRuntime`\<`Schema`, `Augments`\>; \}\>

Defined in: [packages/stately/src/context.tsx:65](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/context.tsx#L65)

Props for the Stately provider component.

#### Type Parameters

##### Schema

`Schema` *extends* [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>

The application's StatelySchemas type

##### Augments

`Augments` *extends* readonly `AnyUiPlugin`[]

Tuple of installed plugin types

## Variables

### StatelyUiProvider()

> `const` **StatelyUiProvider**: (`__namedParameters`) => `Element`

Defined in: [packages/stately/src/context.tsx:143](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/context.tsx#L143)

Default untyped provider for quick prototyping.

This is a **low-level API**. For production use with proper types,
use `StatelyProvider` from `@statelyjs/stately`.

#### Parameters

##### \_\_namedParameters

[`StatelyProviderProps`](#statelyproviderprops)\<[`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>, readonly \[\]\>

#### Returns

`Element`

## Functions

### createStatelyUiProvider()

> **createStatelyUiProvider**\<`Schema`, `Augments`\>(`Providers?`, `themeOptions?`): (`__namedParameters`) => `Element`

Defined in: [packages/stately/src/context.tsx:111](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/context.tsx#L111)

Create a typed Stately provider component (low-level API).

This is a **low-level API** for plugin authors. Most users should use
`StatelyProvider` from `@statelyjs/stately` which includes core types.

Optionally pass a wrapper component to inject additional providers
(e.g., query clients, routing context).

#### Type Parameters

##### Schema

`Schema` *extends* [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>

The application's StatelySchemas type

##### Augments

`Augments` *extends* readonly `AnyUiPlugin`[] = readonly \[\]

Tuple of plugin types that are installed

#### Parameters

##### Providers?

`ComponentType`\<\{ `children`: `ReactNode`; \}\>

Optional wrapper component for additional context providers

##### themeOptions?

`object` & `Partial`\<`Omit`\<[`ThemeProviderProps`](ui.md#themeproviderprops), `"children"`\>\>

Optional theme configuration overrides

#### Returns

A React provider component

> (`__namedParameters`): `Element`

##### Parameters

###### \_\_namedParameters

[`StatelyProviderProps`](#statelyproviderprops)\<`Schema`, `Augments`\>

##### Returns

`Element`

#### Examples

```typescript
// Basic usage
const MyProvider = createStatelyUiProvider<MySchemas, [MyPlugin]>();

<MyProvider runtime={runtime}>
  <App />
</MyProvider>
```

```typescript
// With additional providers
const MyProvider = createStatelyUiProvider<MySchemas, [MyPlugin]>(
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
);
```

***

### createUseStatelyUi()

> **createUseStatelyUi**\<`Schema`, `Augments`\>(): () => `StatelyUiRuntime`\<`Schema`, `Augments`\>

Defined in: [packages/stately/src/context.tsx:166](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/context.tsx#L166)

Create a typed hook for accessing Stately runtime (low-level API).

This is a **low-level API** for plugin authors. Most users should use
`useStatelyUi` from `@statelyjs/stately` which includes core types.

#### Type Parameters

##### Schema

`Schema` *extends* [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>

The application's StatelySchemas type

##### Augments

`Augments` *extends* readonly `AnyUiPlugin`[]

Tuple of plugin types that are installed

#### Returns

A hook function that returns the typed runtime

> (): `StatelyUiRuntime`\<`Schema`, `Augments`\>

##### Returns

`StatelyUiRuntime`\<`Schema`, `Augments`\>

#### Example

```typescript
// For plugin authors
const useMyStatelyUi = createUseStatelyUi<MySchemas, [MyPlugin]>();

function MyPluginComponent() {
  const runtime = useMyStatelyUi();
  runtime.plugins.myPlugin // Typed access
}
```

***

### useBaseStatelyUi()

> **useBaseStatelyUi**\<`Schema`, `Augments`\>(): `StatelyUiRuntime`\<`Schema`, `Augments`\>

Defined in: [packages/stately/src/context.tsx:191](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/context.tsx#L191)

Access the Stately runtime without plugin type assumptions.

This is a **low-level API** primarily for internal use or plugin authors
who need runtime access without specific plugin types.

#### Type Parameters

##### Schema

`Schema` *extends* [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>

The application's StatelySchemas type

##### Augments

`Augments` *extends* readonly `AnyUiPlugin`[] = \[\]

Tuple of plugin types (defaults to empty)

#### Returns

`StatelyUiRuntime`\<`Schema`, `Augments`\>

The Stately runtime

#### Throws

Error if called outside of a StatelyUiProvider
