# plugin

@statelyjs/arrow - Plugin Implementation

This module provides the Arrow plugin for Stately, enabling integration with
Apache Arrow-based data sources. The package includes both a schema plugin
for runtime configuration and a UI plugin for component registration.

## Overview

The Arrow plugin enables:
- Connection management for various data sources (databases, object stores)
- Catalog browsing and schema exploration
- Streaming SQL query execution with Apache Arrow
- Real-time data visualization

## Usage

### Schema Plugin

Add the schema plugin to your Stately configuration:

```typescript
import { createStately } from '@statelyjs/schema';
import { arrowPlugin } from '@statelyjs/arrow';

const stately = createStately()
  .plugin(arrowPlugin())
  .build();
```

### UI Plugin

Add the UI plugin to register Arrow components and operations:

```typescript
import { statelyUi } from '@statelyjs/stately';
import { arrowUiPlugin } from '@statelyjs/arrow';

const ui = statelyUi({
  plugins: [
    arrowUiPlugin({
      api: { pathPrefix: '/api/arrow' },
      navigation: { routes: { label: 'Data Explorer' } },
    }),
  ],
});
```

## Type Aliases

### ArrowOptions

> **ArrowOptions** = `DefineOptions`\<\{ `api?`: \{ `pathPrefix?`: `string`; \}; `navigation?`: \{ `routes?`: `UiNavigationOptions`\[`"routes"`\]; \}; \}\>

Defined in: [arrow/src/plugin.ts:85](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/arrow/src/plugin.ts#L85)

Configuration options for the Arrow plugin.

#### Example

```typescript
const options: ArrowOptions = {
  api: { pathPrefix: '/api/v1/arrow' },
  navigation: { routes: { label: 'Data', icon: Database } },
};
```

***

### ArrowPlugin

> **ArrowPlugin** = [`DefinePlugin`](../stately/schema.md#defineplugin)\<*typeof* [`ARROW_PLUGIN_NAME`](#arrow_plugin_name), [`ArrowNodeMap`](schema.md#arrownodemap), [`ArrowTypes`](schema.md#arrowtypes), [`ArrowData`](schema.md#arrowdata), [`ArrowUtils`](#arrowutils)\>

Defined in: [arrow/src/plugin.ts:108](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/arrow/src/plugin.ts#L108)

Arrow schema plugin type definition.

This type augments the Stately schema runtime with Arrow-specific
node types, data structures, and utilities.

#### See

[arrowPlugin](#arrowplugin-1) - Factory function to create this plugin

***

### ArrowUiPlugin

> **ArrowUiPlugin** = `DefineUiPlugin`\<*typeof* [`ARROW_PLUGIN_NAME`](#arrow_plugin_name), [`ArrowPaths`](api.md#arrowpaths), *typeof* [`ARROW_OPERATIONS`](api.md#arrow_operations), [`ArrowUiUtils`](#arrowuiutils), [`ArrowOptions`](#arrowoptions)\>

Defined in: [arrow/src/plugin.ts:163](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/arrow/src/plugin.ts#L163)

Arrow UI plugin type definition.

This type defines the shape of the Arrow UI plugin, including its
API operations, configuration options, and utilities.

#### See

[arrowUiPlugin](#arrowuiplugin-1) - Factory function to create this plugin

***

### ArrowUiUtils

> **ArrowUiUtils** = `DefineUiUtils`

Defined in: [arrow/src/plugin.ts:153](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/arrow/src/plugin.ts#L153)

Arrow UI plugin utilities type.

***

### ArrowUtils

> **ArrowUtils** = `Record`\<`string`, `never`\>

Defined in: [arrow/src/plugin.ts:98](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/arrow/src/plugin.ts#L98)

Arrow plugin utilities.

Currently empty but reserved for future utility functions that may be
added to the Arrow plugin runtime.

## Variables

### ARROW\_PLUGIN\_NAME

> `const` **ARROW\_PLUGIN\_NAME**: `"arrow"`

Defined in: [arrow/src/plugin.ts:72](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/arrow/src/plugin.ts#L72)

***

### arrowRoutes

> `const` **arrowRoutes**: `RouteOption`

Defined in: [arrow/src/plugin.ts:117](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/arrow/src/plugin.ts#L117)

Default navigation route configuration for the Arrow plugin.

***

### arrowUiPlugin

> `const` **arrowUiPlugin**: `UiPluginFactoryFn`\<[`ArrowUiPlugin`](#arrowuiplugin)\>

Defined in: [arrow/src/plugin.ts:196](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/arrow/src/plugin.ts#L196)

Creates the Arrow UI plugin factory.

This plugin registers Arrow-specific components, API operations, and
navigation routes into the Stately UI runtime. It provides typed access
to Arrow API endpoints through React Query hooks.

#### Example

```typescript
import { statelyUi } from '@statelyjs/stately';
import { arrowUiPlugin } from '@statelyjs/arrow';

const ui = statelyUi({
  plugins: [
    arrowUiPlugin({
      api: { pathPrefix: '/api/arrow' },
    }),
  ],
});

// Access Arrow API in components
const { plugins } = useStatelyUi();
const result = await plugins.arrow.api.list_catalogs();
```

## Functions

### arrowPlugin()

> **arrowPlugin**\<`S`\>(): [`PluginFactory`](../schema/stately.md#pluginfactory)\<`S`\>

Defined in: [arrow/src/plugin.ts:138](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/arrow/src/plugin.ts#L138)

Creates the Arrow schema plugin factory.

This plugin registers Arrow-specific types and utilities into the Stately
schema runtime. It should be used with `createStately().plugin()`.

#### Type Parameters

##### S

`S` *extends* `Schemas`\<`any`, `any`\> = `Schemas`

The schemas type, defaults to base Schemas

#### Returns

[`PluginFactory`](../schema/stately.md#pluginfactory)\<`S`\>

A plugin factory function that augments the runtime

#### Example

```typescript
import { createStately } from '@statelyjs/schema';
import { arrowPlugin } from '@statelyjs/arrow';

const stately = createStately()
  .plugin(arrowPlugin())
  .build();
```
