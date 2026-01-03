# runtime

Low-level StatelyUi runtime configuration and builder.

This module provides the base runtime types and factory function for
creating a StatelyUi instance **without** the core plugin. These are
intended for plugin authors and advanced use cases.

## For Most Users

**Use `statelyUi` from `@statelyjs/stately` instead.** It includes the
core plugin automatically and provides a simpler API:

```typescript
import { statelyUi } from '@statelyjs/stately';

const runtime = statelyUi<MySchemas>({
  schema,
  client,
  options: { api: { pathPrefix: '/api/v1' } }
});
```

## For Plugin Authors

Use `createStatelyUi` when building plugins that need to work with
the base runtime before the core plugin is applied:

```typescript
import { createStatelyUi } from '@statelyjs/ui/runtime';

const baseRuntime = createStatelyUi<MySchemas, [MyPlugin]>({
  schema,
  client,
  options: {}
}).withPlugin(myPlugin());
```

## Interfaces

### RouteOption

Defined in: [packages/ui/src/runtime.ts:103](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L103)

Route and navigation option for an individual route.

Primarily represented in the application's navigation but may be used elsewhere.

#### Properties

##### badge?

> `optional` **badge**: `ComponentType`\<`Omit`\<[`RouteOption`](#routeoption), `"badge"`\>\> \| `null`

Defined in: [packages/ui/src/runtime.ts:107](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L107)

##### icon?

> `optional` **icon**: `ComponentType`\<`any`\>

Defined in: [packages/ui/src/runtime.ts:104](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L104)

##### label

> **label**: `string`

Defined in: [packages/ui/src/runtime.ts:105](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L105)

##### to

> **to**: `string`

Defined in: [packages/ui/src/runtime.ts:106](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L106)

***

### StatelyUiBuilder

Defined in: [packages/ui/src/runtime.ts:216](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L216)

Builder interface for constructing a StatelyUi runtime.

Extends the runtime with `withPlugin()` for chaining plugin installation.
After all plugins are added, the builder can be used as the runtime.

#### Extends

- [`StatelyUiRuntime`](#statelyuiruntime)\<`Schema`, `Augments`\>

#### Type Parameters

##### Schema

`Schema` *extends* [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>

The application's StatelySchemas type

##### Augments

`Augments` *extends* readonly [`AnyUiPlugin`](plugin.md#anyuiplugin)[] = readonly \[\]

Tuple of plugin types that will be installed

#### Properties

##### client

> `readonly` **client**: `Client`\<`Schema`\[`"config"`\]\[`"paths"`\]\>

Defined in: [packages/ui/src/runtime.ts:155](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L155)

An openapi-fetch client for making API calls

###### Inherited from

[`StatelyUiRuntime`](#statelyuiruntime).[`client`](#client-2)

##### options

> `readonly` **options**: [`UiOptions`](#uioptions)

Defined in: [packages/ui/src/runtime.ts:157](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L157)

UI configuration options

###### Inherited from

[`StatelyUiRuntime`](#statelyuiruntime).[`options`](#options-2)

##### plugins

> **plugins**: [`MergeUiAugments`](plugin.md#mergeuiaugments)\<`Schema`, `Augments`\>

Defined in: [packages/ui/src/runtime.ts:178](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L178)

Installed plugins accessible by name

###### Inherited from

[`StatelyUiRuntime`](#statelyuiruntime).[`plugins`](#plugins-1)

##### registry

> **registry**: [`UiRegistry`](registry.md#uiregistry)

Defined in: [packages/ui/src/runtime.ts:174](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L174)

Component and transformer registry for dynamic rendering

###### Inherited from

[`StatelyUiRuntime`](#statelyuiruntime).[`registry`](#registry-1)

##### schema

> `readonly` **schema**: [`Stately`](../schema/stately.md#stately)\<`Schema`\>

Defined in: [packages/ui/src/runtime.ts:153](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L153)

The Stately schema instance containing type definitions

###### Inherited from

[`StatelyUiRuntime`](#statelyuiruntime).[`schema`](#schema-5)

##### utils

> **utils**: [`UiUtils`](utils.md#uiutils)

Defined in: [packages/ui/src/runtime.ts:176](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L176)

Utility functions available throughout the application

###### Inherited from

[`StatelyUiRuntime`](#statelyuiruntime).[`utils`](#utils-1)

#### Methods

##### withPlugin()

> **withPlugin**(`plugin`): [`StatelyUiBuilder`](#statelyuibuilder)\<`Schema`, `Augments`\>

Defined in: [packages/ui/src/runtime.ts:226](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L226)

Install a plugin into the runtime.

###### Parameters

###### plugin

[`UiPluginFactory`](plugin.md#uipluginfactory)\<`Schema`, `Augments`\>

Plugin factory function

###### Returns

[`StatelyUiBuilder`](#statelyuibuilder)\<`Schema`, `Augments`\>

Builder with the plugin installed

***

### StatelyUiConfiguration

Defined in: [packages/ui/src/runtime.ts:151](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L151)

Core configuration required to create a StatelyUi runtime.

#### Type Parameters

##### Schema

`Schema` *extends* [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>

The application's StatelySchemas type

#### Properties

##### client

> **client**: `Client`\<`Schema`\[`"config"`\]\[`"paths"`\]\>

Defined in: [packages/ui/src/runtime.ts:155](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L155)

An openapi-fetch client for making API calls

##### options

> **options**: [`UiOptions`](#uioptions)

Defined in: [packages/ui/src/runtime.ts:157](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L157)

UI configuration options

##### schema

> **schema**: [`Stately`](../schema/stately.md#stately)\<`Schema`\>

Defined in: [packages/ui/src/runtime.ts:153](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L153)

The Stately schema instance containing type definitions

***

### StatelyUiRuntime

Defined in: [packages/ui/src/runtime.ts:201](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L201)

The complete StatelyUi runtime.

Combines the base configuration with plugin-provided runtime additions.
This is what gets passed to the StatelyUiProvider and is accessible
via the useStatelyUi hook.

#### Example

```typescript
// Access runtime in components
const runtime = useStatelyUi();
runtime.schema // Schema instance
runtime.client // API client
runtime.plugins.core // Core plugin
runtime.registry // Component registry
```

#### Extends

- `Readonly`\<[`StatelyUiConfiguration`](#statelyuiconfiguration)\<`Schema`\>\>.[`UiPluginRuntime`](#uipluginruntime)\<`Schema`, `Augments`\>

#### Extended by

- [`StatelyUiBuilder`](#statelyuibuilder)

#### Type Parameters

##### Schema

`Schema` *extends* [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>

The application's StatelySchemas type

##### Augments

`Augments` *extends* readonly [`AnyUiPlugin`](plugin.md#anyuiplugin)[] = readonly \[\]

Tuple of plugin types that are installed

#### Properties

##### client

> `readonly` **client**: `Client`\<`Schema`\[`"config"`\]\[`"paths"`\]\>

Defined in: [packages/ui/src/runtime.ts:155](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L155)

An openapi-fetch client for making API calls

###### Inherited from

`Readonly.client`

##### options

> `readonly` **options**: [`UiOptions`](#uioptions)

Defined in: [packages/ui/src/runtime.ts:157](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L157)

UI configuration options

###### Inherited from

`Readonly.options`

##### plugins

> **plugins**: [`MergeUiAugments`](plugin.md#mergeuiaugments)\<`Schema`, `Augments`\>

Defined in: [packages/ui/src/runtime.ts:178](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L178)

Installed plugins accessible by name

###### Inherited from

[`UiPluginRuntime`](#uipluginruntime).[`plugins`](#plugins-2)

##### registry

> **registry**: [`UiRegistry`](registry.md#uiregistry)

Defined in: [packages/ui/src/runtime.ts:174](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L174)

Component and transformer registry for dynamic rendering

###### Inherited from

[`UiPluginRuntime`](#uipluginruntime).[`registry`](#registry-2)

##### schema

> `readonly` **schema**: [`Stately`](../schema/stately.md#stately)\<`Schema`\>

Defined in: [packages/ui/src/runtime.ts:153](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L153)

The Stately schema instance containing type definitions

###### Inherited from

`Readonly.schema`

##### utils

> **utils**: [`UiUtils`](utils.md#uiutils)

Defined in: [packages/ui/src/runtime.ts:176](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L176)

Utility functions available throughout the application

###### Inherited from

[`UiPluginRuntime`](#uipluginruntime).[`utils`](#utils-2)

***

### UiNavigationOptions

Defined in: [packages/ui/src/runtime.ts:116](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L116)

Navigation configuration for the application.

Controls the sidebar navigation structure, base paths for links,
and allows overriding plugin-provided routes.

#### Properties

##### basePath?

> `optional` **basePath**: `string`

Defined in: [packages/ui/src/runtime.ts:118](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L118)

Base path prepended to all navigation links

##### routeOverrides?

> `optional` **routeOverrides**: `Record`\<`string`, [`RouteOption`](#routeoption)\>

Defined in: [packages/ui/src/runtime.ts:138](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L138)

Override specific route configurations by path.

Keys are the original `to` path, values are the replacement route config.
Useful for customizing plugin-provided navigation items.

###### Example

```typescript
routeOverrides: {
  '/entities/user': {
    icon: UserIcon,
    label: 'Team Members',
    to: '/team'
  }
}
```

##### routes?

> `optional` **routes**: `object` & [`RouteOption`](#routeoption)

Defined in: [packages/ui/src/runtime.ts:120](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L120)

Primary navigation routes displayed in the sidebar

###### Type Declaration

###### items?

> `optional` **items**: [`RouteOption`](#routeoption)[]

***

### UiOptions

Defined in: [packages/ui/src/runtime.ts:83](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L83)

App-wide configuration options for StatelyUi.

Configure API path prefixes, navigation structure, and theme settings.
These options are available throughout the application via context.

#### Example

```typescript
const options: UiOptions = {
  api: { pathPrefix: '/api/v1' },
  navigation: {
    basePath: 'app',
    routes: {
      label: 'Application',
      to: '/',
      items: [{
        icon: Cog,
        label: 'Pipelines',
        to: '/pipelines',
      }]
    },
    routeOverrides: {
      ['/entities/source']: {
        icon: Cog,
        label: 'Source',
        to: '/source-driver',
      }
    }
  },
  theme: { defaultTheme: 'dark' }
};
```

#### Properties

##### api?

> `optional` **api**: `object`

Defined in: [packages/ui/src/runtime.ts:85](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L85)

API configuration options

###### pathPrefix?

> `optional` **pathPrefix**: `string`

Path prefix prepended to all API calls

##### navigation?

> `optional` **navigation**: [`UiNavigationOptions`](#uinavigationoptions)

Defined in: [packages/ui/src/runtime.ts:90](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L90)

Navigation configuration for sidebar and routing

##### theme?

> `optional` **theme**: `object` & `Partial`\<`Omit`\<[`ThemeProviderProps`](theme.md#themeproviderprops), `"children"`\>\>

Defined in: [packages/ui/src/runtime.ts:92](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L92)

Theme configuration for light/dark mode

###### Type Declaration

###### disabled?

> `optional` **disabled**: `boolean`

Set to true to disable the theme provider

***

### UiPluginRuntime

Defined in: [packages/ui/src/runtime.ts:169](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L169)

Plugin-provided runtime additions.

Contains the component registry, utility functions, and plugin instances
that are added to the runtime through plugins.

#### Extended by

- [`StatelyUiRuntime`](#statelyuiruntime)

#### Type Parameters

##### Schema

`Schema` *extends* [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>

The application's StatelySchemas type

##### Augments

`Augments` *extends* readonly [`AnyUiPlugin`](plugin.md#anyuiplugin)[] = readonly \[\]

Tuple of plugin types that are installed

#### Properties

##### plugins

> **plugins**: [`MergeUiAugments`](plugin.md#mergeuiaugments)\<`Schema`, `Augments`\>

Defined in: [packages/ui/src/runtime.ts:178](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L178)

Installed plugins accessible by name

##### registry

> **registry**: [`UiRegistry`](registry.md#uiregistry)

Defined in: [packages/ui/src/runtime.ts:174](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L174)

Component and transformer registry for dynamic rendering

##### utils

> **utils**: [`UiUtils`](utils.md#uiutils)

Defined in: [packages/ui/src/runtime.ts:176](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L176)

Utility functions available throughout the application

## Variables

### defaultUiOptions

> `const` **defaultUiOptions**: [`UiOptions`](#uioptions)

Defined in: [packages/ui/src/runtime.ts:144](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L144)

Default UI options applied when not specified.

## Functions

### createStatelyUi()

> **createStatelyUi**\<`Schema`, `Augments`\>(`config`): [`StatelyUiBuilder`](#statelyuibuilder)\<`Schema`, `Augments`\>

Defined in: [packages/ui/src/runtime.ts:267](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/ui/src/runtime.ts#L267)

Create a new base StatelyUi runtime builder (without core plugin).

This is a **low-level API** for plugin authors and advanced use cases.
It returns a builder that allows chaining plugin installations via `withPlugin()`.

## For Most Users

**Use `statelyUi` from `@statelyjs/stately` instead**, which includes
the core plugin automatically:

```typescript
import { statelyUi } from '@statelyjs/stately';

const runtime = statelyUi<MySchemas>({ schema, client, options });
```

## For Plugin Authors

Use this when you need the base runtime without core:

#### Type Parameters

##### Schema

`Schema` *extends* [`StatelySchemas`](../schema/schema.md#statelyschemas)\<`any`, `any`\>

The application's StatelySchemas type

##### Augments

`Augments` *extends* readonly [`AnyUiPlugin`](plugin.md#anyuiplugin)[] = readonly \[\]

Tuple of plugin types that will be installed

#### Parameters

##### config

`Readonly`\<[`StatelyUiConfiguration`](#statelyuiconfiguration)\<`Schema`\>\>

Core configuration with schema, client, and options

#### Returns

[`StatelyUiBuilder`](#statelyuibuilder)\<`Schema`, `Augments`\>

A builder for installing plugins and creating the runtime

#### Example

```typescript
import { createStatelyUi } from '@statelyjs/ui';

const baseRuntime = createStatelyUi<MySchemas, [MyPlugin]>({
  schema,
  client,
  options: {}
}).withPlugin(myPlugin());
```
