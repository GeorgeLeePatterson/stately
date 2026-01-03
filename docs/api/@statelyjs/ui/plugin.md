# plugin

Stately Plugin System.

This module provides the infrastructure for creating UI plugins that extend
the Stately runtime. Plugins can add:
- API operations (typed fetch clients)
- Utility functions
- Navigation routes
- Custom components for node types
- Custom configuration options

## For Most Users

Use `statelyUi` from `@statelyjs/stately` to create runtimes with the core
plugin included, then add additional plugins via `withPlugin()`:

## Examples

```typescript
import { statelyUi } from '@statelyjs/stately';
import { type FilesUiPlugin, filesUiPlugin } from '@statelyjs/files';

const runtime = statelyUi<MySchemas, readonly [FilesUiPlugin]>({
  schema,
  client,
  options
}).withPlugin(filesUiPlugin({ api: { pathPrefix: '/files' } }));

// Access plugin functionality
runtime.plugins.core.api.operations.list_entities(...); // Core plugin
runtime.plugins.files.api.operations.list_files(...);   // Files plugin
```

## For Plugin Authors

Use `createUiPlugin` to build plugins with an ergonomic API:

1. Define your plugin's type using `DefineUiPlugin`:

```typescript
import type { DefineUiPlugin, DefineOptions } from '@statelyjs/ui';

export type MyPlugin = DefineUiPlugin<
  'my-plugin',           // Unique plugin name (must be string literal)
  MyPaths,               // OpenAPI paths type (generated from Rust OpenAPI)
  typeof MY_OPERATIONS,  // Operation bindings (generated from Rust OpenAPI)
  MyUtils,               // Utility functions type
  MyOptions              // Configuration options type
>;
```

2. Create the plugin factory using `createUiPlugin`:

```typescript
import { createUiPlugin } from '@statelyjs/ui';

export const myUiPlugin = createUiPlugin<MyPlugin>({
  name: 'my-plugin',
  operations: MY_OPERATIONS,
  routes: myDefaultRoutes,
  utils: myUtils,

  setup: (ctx, options) => {
    // Register custom components
    ctx.registerComponent('MyNodeType', 'edit', MyEditComponent);
    ctx.registerComponent('MyNodeType', 'view', MyViewComponent);

    // Extend extension points
    someExtension.extend(myTransformer);

    return {};
  },
});
```

The `createUiPlugin` helper provides:
- **No manual spreading** - Return only what's being added
- **Automatic API creation** - Provide operations, get typed API
- **Simplified component registration** - `ctx.registerComponent()` handles keys
- **Path prefix merging** - Handled automatically
- **Single type parameter** - Derive everything from your `DefineUiPlugin` type

## Interfaces

### PluginRuntime

Defined in: [packages/ui/src/plugin.ts:385](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L385)

**`Internal`**

Runtime data contributed by an instantiated plugin.

This is what gets stored in `runtime.plugins[name]` after a plugin factory runs.
It contains the actual API client, utility functions, and configuration.

#### Type Parameters

##### Paths

`Paths` *extends* [`AnyPaths`](../schema/api.md#anypaths)

OpenAPI paths type

##### Ops

`Ops` *extends* [`OperationBindings`](../schema/api.md#operationbindings)\<`Paths`, `any`\>

Operation bindings type

##### Utils

`Utils` *extends* [`DefineUiUtils`](#defineuiutils)\<`any`\> = [`PluginFunctionMap`](#pluginfunctionmap)

Utility functions type

##### Options

`Options` *extends* [`DefineOptions`](#defineoptions)\<`any`\> = [`EmptyRecord`](../schema/helpers.md#emptyrecord)

Configuration options type

##### Routes

`Routes` *extends* [`DefineRoutes`](#defineroutes) = [`DefineRoutes`](#defineroutes)

Navigation routes type

#### Properties

##### api?

> `optional` **api**: [`TypedOperations`](api.md#typedoperations)\<`Paths`, `Ops`, `` `${string}/${string}` ``\>

Defined in: [packages/ui/src/plugin.ts:393](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L393)

Typed API operations for this plugin

##### options?

> `optional` **options**: `Options`

Defined in: [packages/ui/src/plugin.ts:397](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L397)

Configuration options passed to the plugin

##### routes?

> `optional` **routes**: `Routes`

Defined in: [packages/ui/src/plugin.ts:399](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L399)

Navigation routes registered by this plugin

##### utils?

> `optional` **utils**: `Utils`

Defined in: [packages/ui/src/plugin.ts:395](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L395)

Utility functions provided by this plugin

***

### UiPluginConfig

Defined in: [packages/ui/src/plugin.ts:105](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L105)

Configuration for creating a UI plugin.

#### Type Parameters

##### Plugin

`Plugin` *extends* [`AnyUiPlugin`](#anyuiplugin)

The plugin type (extends AnyUiPlugin)

#### Properties

##### name

> **name**: `Plugin`\[`"name"`\]

Defined in: [packages/ui/src/plugin.ts:111](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L111)

Unique plugin name. Must match the name in your DefineUiPlugin type.

###### Example

```ts
FILES_PLUGIN_NAME, ARROW_PLUGIN_NAME
```

##### operations?

> `optional` **operations**: `Plugin`\[`"ops"`\]

Defined in: [packages/ui/src/plugin.ts:117](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L117)

Operation bindings for creating typed API operations.
If provided, the plugin will automatically create typed operations.

##### routes?

> `optional` **routes**: `Plugin`\[`"routes"`\]

Defined in: [packages/ui/src/plugin.ts:123](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L123)

Default navigation routes for this plugin.
Can be overridden by user options.

##### setup()

> **setup**: (`ctx`, `options`) => [`UiPluginResult`](#uipluginresult)\<`Plugin`\>

Defined in: [packages/ui/src/plugin.ts:138](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L138)

Setup function called when the plugin is installed.

Receives a context object with access to the runtime and helpers.
Returns only the parts the plugin is adding - no spreading required.

###### Parameters

###### ctx

[`UiPluginContext`](#uiplugincontext)\<[`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>, readonly \[`Plugin`, [`AnyUiPlugin`](#anyuiplugin)\]\>

Plugin context with runtime access and helpers

###### options

User-provided options for this plugin

`Plugin`\[`"options"`\] | `undefined`

###### Returns

[`UiPluginResult`](#uipluginresult)\<`Plugin`\>

The plugin's contributions (api, utils, routes)

##### utils?

> `optional` **utils**: `Plugin`\[`"utils"`\]

Defined in: [packages/ui/src/plugin.ts:126](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L126)

Static utility functions provided by this plugin

***

### UiPluginContext

Defined in: [packages/ui/src/plugin.ts:169](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L169)

Context provided to plugin setup functions.

Gives plugins access to the runtime for reading configuration,
registering components, and accessing utilities.

#### Type Parameters

##### Schema

`Schema` *extends* [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>

The application's schema type

##### Augments

`Augments` *extends* readonly [`AnyUiPlugin`](#anyuiplugin)[] = readonly \[\]

#### Properties

##### client

> `readonly` **client**: `Client`\<`Schema`\[`"config"`\]\[`"paths"`\], `` `${string}/${string}` ``\>

Defined in: [packages/ui/src/plugin.ts:185](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L185)

The openapi-fetch client for API calls

##### pathPrefix

> `readonly` **pathPrefix**: `string`

Defined in: [packages/ui/src/plugin.ts:188](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L188)

Resolved path prefix (merged from runtime and plugin options)

##### registry

> `readonly` **registry**: [`ComponentRegistry`](registry.md#componentregistry)

Defined in: [packages/ui/src/plugin.ts:214](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L214)

Direct access to the component registry for advanced use cases.

#### Methods

##### getRuntime()

> **getRuntime**\<`S`, `A`\>(): [`StatelyUiRuntime`](runtime.md#statelyuiruntime)\<`S`, `A`\>

Defined in: [packages/ui/src/plugin.ts:179](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L179)

Get a typed view of the runtime.

Use this when you need access to runtime properties with proper typing.
The type parameter should match your plugin's schema requirements.

###### Type Parameters

###### S

`S` *extends* [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>

###### A

`A` *extends* readonly [`AnyUiPlugin`](#anyuiplugin)[] = readonly \[\]

###### Returns

[`StatelyUiRuntime`](runtime.md#statelyuiruntime)\<`S`, `A`\>

##### registerComponent()

> **registerComponent**(`nodeType`, `mode`, `component`): `void`

Defined in: [packages/ui/src/plugin.ts:205](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L205)

Register a component for a node type.

Simplified API that handles key generation automatically.

###### Parameters

###### nodeType

`string`

The node type name (e.g., 'RelativePath', 'Primitive')

###### mode

[`RegistryMode`](registry.md#registrymode)

'edit' or 'view'

###### component

`ComponentType`\<`any`\>

The React component to register

###### Returns

`void`

###### Example

```typescript
ctx.registerComponent('RelativePath', 'edit', RelativePathEdit);
ctx.registerComponent('RelativePath', 'view', RelativePathView);
```

***

### UiPluginResult

Defined in: [packages/ui/src/plugin.ts:152](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L152)

The result returned from a plugin setup function.

Plugins only return what they're adding - no need to spread runtime or plugins.
The framework handles merging automatically.

#### Type Parameters

##### Plugin

`Plugin` *extends* [`AnyUiPlugin`](#anyuiplugin)

The plugin type (extends AnyUiPlugin)

#### Properties

##### api?

> `optional` **api**: [`TypedOperations`](api.md#typedoperations)\<`Plugin`\[`"paths"`\], `Plugin`\[`"ops"`\], `` `${string}/${string}` ``\>

Defined in: [packages/ui/src/plugin.ts:154](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L154)

Typed API operations (optional - created automatically if operations provided)

##### routes?

> `optional` **routes**: `Plugin`\[`"routes"`\]

Defined in: [packages/ui/src/plugin.ts:156](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L156)

Navigation routes for this plugin that might need access to runtime.

##### utils?

> `optional` **utils**: `Plugin`\[`"utils"`\]

Defined in: [packages/ui/src/plugin.ts:158](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L158)

Additional utility functions provided by this plugin that might need access to runtime

## Type Aliases

### AllUiPlugins

> **AllUiPlugins**\<`Schema`, `Augments`\> = [`MergeUiAugments`](#mergeuiaugments)\<`Schema`, `Augments`\>

Defined in: [packages/ui/src/plugin.ts:461](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L461)

**`Internal`**

Extract the complete plugins record type from an augments array.

 Alias for `MergeUiAugments`.

#### Type Parameters

##### Schema

`Schema` *extends* [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>

##### Augments

`Augments` *extends* readonly [`AnyUiPlugin`](#anyuiplugin)[]

***

### AnyUiAugments

> **AnyUiAugments** = readonly `UiPlugin`\<`string`, `any`, `any`, `any`, `any`, `any`\>[]

Defined in: [packages/ui/src/plugin.ts:424](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L424)

Array of UI plugins (used for augments type parameter).

***

### AnyUiPlugin

> **AnyUiPlugin** = `UiPlugin`\<`string`, `any`, `any`, `any`, `any`, `any`\>

Defined in: [packages/ui/src/plugin.ts:421](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L421)

Any UI plugin type (used for generic constraints).

***

### DefineOptions

> **DefineOptions**\<`T`\> = `T`

Defined in: [packages/ui/src/plugin.ts:269](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L269)

Define configuration options for a plugin.

Wraps your options type to ensure proper typing in the plugin system.

#### Type Parameters

##### T

`T` *extends* `object` = [`EmptyRecord`](../schema/helpers.md#emptyrecord)

Your options object type

#### Example

```typescript
type MyOptions = DefineOptions<{
  api?: { pathPrefix?: string };
  theme?: 'light' | 'dark';
}>;
```

***

### DefineRoutes

> **DefineRoutes**\<`T`\> = `T`

Defined in: [packages/ui/src/plugin.ts:288](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L288)

Define navigation routes for a plugin.

Routes are automatically added to the sidebar navigation.

#### Type Parameters

##### T

`T` *extends* [`UiNavigationOptions`](runtime.md#uinavigationoptions)\[`"routes"`\] = [`UiNavigationOptions`](runtime.md#uinavigationoptions)\[`"routes"`\]

#### Example

```typescript
type MyRoutes = DefineRoutes<{
  label: 'My Plugin';
  to: '/my-plugin';
  icon: MyIcon;
  items: [
    // Any additional sub-routes
  ]
}>;
```

***

### DefineUiPlugin

> **DefineUiPlugin**\<`Name`, `Paths`, `Ops`, `Utils`, `Options`, `Routes`\> = `UiPlugin`\<[`RequireLiteral`](../schema/helpers.md#requireliteral)\<`Name`, `"Plugin names must be string literals"`\>, `Paths`, `Ops`, `Utils`, `Options`, `Routes`\>

Defined in: [packages/ui/src/plugin.ts:323](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L323)

Define a UI plugin's type signature.

This is the primary helper for plugin authors. It creates a type that describes
what your plugin contributes to the runtime: API operations, utilities, options,
and routes.

The `Name` must be a string literal (not `string`) to ensure type-safe access
via `runtime.plugins[name]`.

#### Type Parameters

##### Name

`Name` *extends* `string`

Unique plugin name (must be a string literal like `'files'`)

##### Paths

`Paths` *extends* [`AnyPaths`](../schema/api.md#anypaths)

OpenAPI paths type from your generated types

##### Ops

`Ops` *extends* [`OperationBindings`](../schema/api.md#operationbindings)\<`any`, `any`\>

Operation bindings object (use `typeof MY_OPERATIONS`)

##### Utils

`Utils` *extends* [`DefineUiUtils`](#defineuiutils)\<`object`\> = [`DefineUiUtils`](#defineuiutils)\<`any`\>

Utility functions type (optional)

##### Options

`Options` *extends* [`DefineOptions`](#defineoptions)\<`any`\> = [`EmptyRecord`](../schema/helpers.md#emptyrecord)

Configuration options type (optional)

##### Routes

`Routes` *extends* [`DefineRoutes`](#defineroutes) = [`DefineRoutes`](#defineroutes)

Navigation routes type (optional)

#### Example

```typescript
// Define the plugin type
export type FilesUiPlugin = DefineUiPlugin<
  'files',                    // Plugin name - used as runtime.plugins.files
  FilesPaths,                 // OpenAPI paths
  typeof FILES_OPERATIONS,    // Operation bindings
  FilesUiUtils,               // Utility functions
  FilesOptions                // Configuration
>;

// Use in factory function signature
export function filesUiPlugin(options?: FilesOptions): UiPluginFactory<S, readonly [FilesUiPlugin]>
```

***

### DefineUiUtils

> **DefineUiUtils**\<`T`\> = `T` & `Partial`\<[`UiUtils`](utils.md#uiutils)\>

Defined in: [packages/ui/src/plugin.ts:365](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L365)

Define utility functions for a plugin.

Utilities are accessible via `runtime.plugins[name].utils`.
They can optionally extend the base `UiUtils` interface.

#### Type Parameters

##### T

`T` *extends* `object` = [`PluginFunctionMap`](#pluginfunctionmap)

Object type containing your utility functions

#### Example

```typescript
type MyUtils = DefineUiUtils<{
  formatData: (data: RawData) => FormattedData;
  validateInput: (input: string) => boolean;
}>;
```

***

### MergeUiAugments

> **MergeUiAugments**\<`Schema`, `Augments`\> = `Augments` *extends* readonly \[`...(infer Rest extends readonly AnyUiPlugin[])`, infer Last\] ? [`MergeUiAugments`](#mergeuiaugments)\<`Schema`, `Rest`\> & `Last` *extends* `UiPlugin`\<infer Name, infer Paths, infer Ops, infer Utils, infer Options, infer Routes\> ? `{ [K in Name]: PluginRuntime<Paths, Ops, Utils, Options, Routes> }` : [`AnyRecord`](../schema/helpers.md#anyrecord) : `Record`\<`string`, [`PluginRuntime`](#pluginruntime)\<`any`, `any`\>\>

Defined in: [packages/ui/src/plugin.ts:434](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L434)

**`Internal`**

Merge multiple plugin augments into a single type-safe record.

This recursive type extracts each plugin's name and creates a record
where `plugins[name]` returns the correctly typed `PluginRuntime`.

 Used by the runtime to build the plugins record type.

#### Type Parameters

##### Schema

`Schema` *extends* [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>

##### Augments

`Augments` *extends* readonly [`AnyUiPlugin`](#anyuiplugin)[]

***

### PluginFunction()

> **PluginFunction** = (...`args`) => `unknown`

Defined in: [packages/ui/src/plugin.ts:342](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L342)

Any function that can be a plugin utility.

#### Parameters

##### args

...`any`[]

#### Returns

`unknown`

***

### PluginFunctionMap

> **PluginFunctionMap** = `Record`\<`string`, [`PluginFunction`](#pluginfunction)\>

Defined in: [packages/ui/src/plugin.ts:347](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L347)

Map of plugin utility functions.

***

### UiPluginFactory()

> **UiPluginFactory**\<`Schema`, `Augments`\> = (`runtime`) => [`StatelyUiRuntime`](runtime.md#statelyuiruntime)\<`Schema`, `Augments`\>

Defined in: [packages/ui/src/plugin.ts:229](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L229)

Factory function type for creating UI plugins.

A plugin factory receives the current runtime and returns an augmented runtime.
The `Augments` type parameter declares what plugins are available, allowing
TypeScript to provide full type inference for `runtime.plugins`.

#### Type Parameters

##### Schema

`Schema` *extends* [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>

The application's schema type

##### Augments

`Augments` *extends* readonly [`AnyUiPlugin`](#anyuiplugin)[] = readonly \[\]

Tuple of plugin types that will be available

#### Parameters

##### runtime

[`StatelyUiRuntime`](runtime.md#statelyuiruntime)\<`Schema`, `Augments`\>

#### Returns

[`StatelyUiRuntime`](runtime.md#statelyuiruntime)\<`Schema`, `Augments`\>

#### See

[createUiPlugin](#createuiplugin)

***

### UiPluginFactoryFn()

> **UiPluginFactoryFn**\<`Plugin`\> = \<`Schema`, `Augments`\>(`options?`) => [`UiPluginFactory`](#uipluginfactory)\<`Schema`, `Augments`\>

Defined in: [packages/ui/src/plugin.ts:243](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L243)

Configurable UI Plugin Factory Function.

Called by end users to provide initial configuration to a plugin.
Returns a `UiPluginFactory` that passes through the augments unchanged.

Users declare all plugins in their type parameters upfront, and the
factories simply operate on that declared type.

#### Type Parameters

##### Plugin

`Plugin` *extends* [`AnyUiPlugin`](#anyuiplugin)

#### Type Parameters

##### Schema

`Schema` *extends* [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>

##### Augments

`Augments` *extends* readonly [`AnyUiPlugin`](#anyuiplugin)[]

#### Parameters

##### options?

`Plugin`\[`"options"`\]

#### Returns

[`UiPluginFactory`](#uipluginfactory)\<`Schema`, `Augments`\>

## Functions

### createUiPlugin()

> **createUiPlugin**\<`Plugin`\>(`config`): [`UiPluginFactoryFn`](#uipluginfactoryfn)\<`Plugin`\>

Defined in: [packages/ui/src/plugin.ts:521](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/plugin.ts#L521)

Create a UI plugin with ergonomic API.

This helper wraps the low-level plugin pattern with:
- **No manual spreading** - Return only what you're adding
- **Automatic API creation** - Provide operations, get typed API
- **Simplified component registration** - `ctx.registerComponent()` instead of `makeRegistryKey`
- **Path prefix merging** - Handled automatically
- **Single type parameter** - Derive everything from your `DefineUiPlugin` type

## Example

#### Type Parameters

##### Plugin

`Plugin` *extends* [`AnyUiPlugin`](#anyuiplugin)

The plugin type created with DefineUiPlugin

#### Parameters

##### config

[`UiPluginConfig`](#uipluginconfig)\<`Plugin`\>

Plugin configuration

#### Returns

[`UiPluginFactoryFn`](#uipluginfactoryfn)\<`Plugin`\>

A factory function that accepts options and returns a UiPluginFactory

#### Example

```typescript
import { createUiPlugin } from '@statelyjs/ui';

// Define the plugin type (as before)
export type FilesUiPlugin = DefineUiPlugin<
  typeof FILES_PLUGIN_NAME,
  FilesPaths,
  typeof FILES_OPERATIONS,
  FilesUiUtils,
  FilesOptions,
  typeof filesRoutes
>;

// Create the plugin factory with a single type parameter
export const filesUiPlugin = createUiPlugin<FilesUiPlugin>({
  name: FILES_PLUGIN_NAME,
  operations: FILES_OPERATIONS,
  defaultRoutes: filesRoutes,

  setup: (ctx, options) => {
    // Register components - no makeRegistryKey needed
    ctx.registerComponent('RelativePath', 'edit', RelativePathEdit);
    ctx.registerComponent('RelativePath', 'view', RelativePathView);

    // Extend other extension points
    stringModes.extend(filesStringExtension);

    // Return only what you're adding - no spreading
    return { utils: filesUiUtils };
  },
});

// Usage in user's application
const runtime = statelyUi({ ... })
  .withPlugin(filesUiPlugin({ api: { pathPrefix: '/files' } }));
```
