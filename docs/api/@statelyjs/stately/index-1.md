# index

@statelyjs/stately - Full Stately runtime with core plugin and codegen

This is the main package for Stately applications. It provides:
- **Core Plugin**: Entity CRUD operations, hooks, views, and field components
- **Codegen CLI**: Generate TypeScript types from OpenAPI specs (`pnpm exec stately`)
- **Schema Re-exports**: Convenient access to `@statelyjs/schema` types
- **Dynamic Form Component**: `FieldView` and `FieldEdit` that render forms based on node type
- **Layout Components**: Root layout with sidebar, Page, PageHeader, and Navigation Components
- **Feature plugins**: Optional feature plugins, like `codemirror`

Most users should install this package rather than `@statelyjs/ui` directly.
The base `@statelyjs/ui` package provides layout, theming, and plugin infrastructure
but has no knowledge of Stately's entity system.

## Examples

```typescript
import { stately } from '@statelyjs/schema';
import { statelyUi, statelyUiProvider, useStatelyUi } from '@statelyjs/stately';
import { PARSED_SCHEMAS } from './generated/schemas';
import type { components, paths, operations } from './generated/types';

// Create schema runtime
const schema = stately<MySchemas>(openapiDoc, PARSED_SCHEMAS);

// Create UI runtime with core plugin pre-installed
export const runtime = statelyUi<MySchemas>({
  client: api,
  schema,
  core: { api: { pathPrefix: '/entity' } },
  options: { api: { pathPrefix: '/api/v1' } },
});

// Create typed provider and hook for your app
export const AppProvider = statelyUiProvider<MySchemas>();
export const useAppStatelyUi = () => useStatelyUi<MySchemas>();
```

```typescript
import { filesUiPlugin } from '@statelyjs/files';
import { arrowUiPlugin } from '@statelyjs/arrow';

const runtime = statelyUi<MySchemas>({ ... })
  .withPlugin(filesUiPlugin({ api: { pathPrefix: '/files' } }))
  .withPlugin(arrowUiPlugin({ api: { pathPrefix: '/arrow' } }));
```

## Type Aliases

### StatelyConfiguration

> **StatelyConfiguration**\<`Schema`\> = `Readonly`\<`Omit`\<`StatelyUiConfiguration`\<`Schema`\>, `"options"`\> & `object`\> & `object`

Defined in: [packages/stately/src/index.ts:80](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/index.ts#L80)

Configuration for creating a Stately runtime.

Extends the base `StatelyUiConfiguration` with core plugin options.

#### Type Declaration

##### core?

> `optional` **core**: `CoreUiOptions`

Core plugin configuration options.

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](schema.md#schemas)\<`any`, `any`\> = [`Schemas`](schema.md#schemas)

Your application's schema type (from `Schemas<DefineConfig<...>>`)

***

### StatelyUi

> **StatelyUi**\<`S`, `Augments`\> = `StatelyUiRuntime`\<`S`, readonly \[`CoreUiPlugin`, `...Augments`\]\>

Defined in: [packages/stately/src/index.ts:115](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/index.ts#L115)

The Stately runtime type with core plugin installed.

This is the return type of `statelyUi()`. It includes the core plugin
and any additional plugins you've added via `withPlugin()`.

#### Type Parameters

##### S

`S` *extends* [`Schemas`](schema.md#schemas)\<`any`, `any`\> = [`Schemas`](schema.md#schemas)

Your application's schema type

##### Augments

`Augments` *extends* readonly `AnyUiPlugin`[] = readonly \[\]

Additional plugins beyond core (inferred from `withPlugin` calls)

#### Example

```typescript
const runtime: StatelyUi<MySchemas> = statelyUi({ ... });

// Access core plugin
runtime.plugins.core.api.operations.list_entities({ ... });
runtime.plugins.core.utils.getEntityIcon('Pipeline');

// Access other plugins
runtime.plugins.files?.api.operations.list_files({ ... });
```

## Variables

### statelyUiProvider()

> `const` **statelyUiProvider**: \<`Schema`, `Augments`\>(`themeOptions?`) => (`__namedParameters`) => `Element` = `coreStatelyUiProvider`

Defined in: [packages/stately/src/index.ts:248](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/index.ts#L248)

Create a typed React context provider for your Stately runtime.

Call this once in your app setup to create a provider component.
The provider also includes theming support.

Create a typed React context provider with core plugin support.

This factory creates a provider component that:
- Includes the core plugin types automatically
- Wraps children with `LinkExplorerProvider` for link navigation
- Supports optional theme configuration

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](schema.md#schemas)\<`any`, `any`\>

Your application's schema type

##### Augments

`Augments` *extends* readonly `AnyUiPlugin`[] = readonly \[\]

Additional plugins beyond core

#### Parameters

##### themeOptions?

`object` & `Partial`\<`Omit`\<[`ThemeProviderProps`](ui.md#themeproviderprops), `"children"`\>\>

Optional theme configuration

#### Returns

A React provider component

> (`__namedParameters`): `Element`

##### Parameters

###### \_\_namedParameters

[`StatelyProviderProps`](context.md#statelyproviderprops)\<`Schema`, readonly \[`CoreUiPlugin`, `Augments`\]\>

##### Returns

`Element`

#### Examples

```typescript
// Create the provider once
export const AppProvider = statelyUiProvider<MySchemas>();

// Use in your app
<AppProvider runtime={runtime}>
  <App />
</AppProvider>
```

```typescript
export const AppProvider = statelyUiProvider<MySchemas>({ disabled: true });
```

#### Type Param

Your application's schema type

#### Type Param

Plugin types (usually inferred from your runtime)

#### Returns

A React context provider component

#### Example

```typescript
// lib/stately.ts
export const AppStatelyProvider = statelyUiProvider<MySchemas>();

// app/layout.tsx
import { AppStatelyProvider, runtime } from '@/lib/stately';

export default function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppStatelyProvider value={runtime}>
        {children}
      </AppStatelyProvider>
    </QueryClientProvider>
  );
}
```

## Functions

### statelyUi()

> **statelyUi**\<`Schema`, `Augments`\>(`config`): `StatelyUiBuilder`\<`Schema`, readonly \[`CoreUiPlugin`, `Augments`\]\>

Defined in: [packages/stately/src/index.ts:166](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/index.ts#L166)

Create a Stately runtime with the core plugin pre-installed.

This is the main entry point for creating a Stately UI runtime. It returns
a builder that can be extended with additional plugins via `withPlugin()`.

The core plugin provides:
- Entity CRUD API operations (`list_entities`, `get_entity_by_id`, `create_entity`, etc.)
- Field components for all schema node types (primitives, objects, arrays, etc.)
- Entity navigation routes for the sidebar
- Utility functions for entity display and URL generation

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](schema.md#schemas)\<`any`, `any`\>

Your application's schema type

##### Augments

`Augments` *extends* readonly `AnyUiPlugin`[] = readonly \[\]

Additional plugin types (usually inferred)

#### Parameters

##### config

[`StatelyConfiguration`](#statelyconfiguration)\<`Schema`\>

Runtime configuration (see [StatelyConfiguration](#statelyconfiguration))

#### Returns

`StatelyUiBuilder`\<`Schema`, readonly \[`CoreUiPlugin`, `Augments`\]\>

A runtime builder with core plugin installed. Chain `.withPlugin()` to add more.

#### Examples

```typescript
const runtime = statelyUi<MySchemas>({
  client: createClient<paths>({ baseUrl: '/api/v1' }),
  schema: stately<MySchemas>(openapiDoc, PARSED_SCHEMAS),
  core: {
    api: { pathPrefix: '/entity' },
    entities: {
      icons: {
        Pipeline: PipelineIcon,
        SourceConfig: DatabaseIcon,
      },
    },
  },
});
```

```typescript
const runtime = statelyUi<MySchemas>({ ... })
  .withPlugin(filesUiPlugin({ api: { pathPrefix: '/files' } }))
  .withPlugin(arrowUiPlugin({ api: { pathPrefix: '/arrow' } }));
```

***

### useStatelyUi()

> **useStatelyUi**\<`Schema`, `ExtraAugments`\>(): `StatelyUiRuntime`\<`Schema`, readonly \[`CoreUiPlugin`, `ExtraAugments`\]\>

Defined in: [packages/stately/src/index.ts:211](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/stately/src/index.ts#L211)

Access the Stately runtime from React context.

Use this hook in components to access the runtime's plugins, utilities,
and configuration. The runtime must be provided via `statelyUiProvider`.

#### Type Parameters

##### Schema

`Schema` *extends* [`Schemas`](schema.md#schemas)\<`any`, `any`\>

Your application's schema type

##### ExtraAugments

`ExtraAugments` *extends* readonly `AnyUiPlugin`[] = \[\]

Additional plugins beyond core

#### Returns

`StatelyUiRuntime`\<`Schema`, readonly \[`CoreUiPlugin`, `ExtraAugments`\]\>

The current Stately runtime from context

#### Throws

If called outside of a `StatelyUiProvider`

#### Example

```typescript
function MyComponent() {
  const runtime = useStatelyUi<MySchemas>();

  // Access core plugin utilities
  const icon = runtime.plugins.core.utils.getEntityIcon('Pipeline');

  // Access schema information
  const entities = runtime.schema.utils.getStateEntries();

  return <div>...</div>;
}
```
