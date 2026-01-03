# index

@statelyjs/files - File System Plugin

File system integration plugin for Stately applications. Provides
comprehensive file management capabilities for both schema and UI.

## Features

- **File Browsing**: Directory navigation with breadcrumbs
- **File Uploads**: Drag-and-drop with automatic versioning
- **File Downloads**: Support for multiple storage targets (data, cache, upload)
- **RelativePath Field**: Form components for file path selection
- **Version History**: Track and manage file versions

## Installation

```bash
pnpm add @statelyjs/files
```

## Setup

### 1. Add Schema Plugin

```typescript
// stately.ts
import { stately } from '@statelyjs/stately/schema';
import { filesPlugin } from '@statelyjs/files';

const schema = stately<MySchemas>(openapiDoc, PARSED_SCHEMAS)
  .withPlugin(filesPlugin());
```

### 2. Add UI Plugin

```typescript
// stately.ts
import { statelyUi } from '@statelyjs/stately';
import { filesUiPlugin } from '@statelyjs/files';

const runtime = statelyUi<MySchemas>({ schema, client, options })
  .withPlugin(filesUiPlugin({ api: { pathPrefix: '/files' } }));
```

### 3. Access in Components

```typescript
import { useFilesStatelyUi } from '@statelyjs/files';

function FileManager() {
  const { plugins } = useFilesStatelyUi();
  const files = plugins.files;

  // Use file operations
  const upload = () => files.api.upload({ body: formData });
  const list = () => files.api.list_files({ params: { query: { dir: '/' } } });
}
```

## Type Aliases

### FilesOptions

> **FilesOptions** = `DefineOptions`\<\{ `api?`: \{ `pathPrefix?`: `string`; \}; `navigation?`: \{ `routes?`: `UiNavigationOptions`\[`"routes"`\]; \}; \}\>

Defined in: [files/src/plugin.tsx:93](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/files/src/plugin.tsx#L93)

Configuration options for the Files plugin.

#### Example

```typescript
const options: FilesOptions = {
  api: { pathPrefix: '/api/v1/files' },
  navigation: { routes: { label: 'Documents', icon: FileIcon } },
};
```

***

### FilesPlugin

> **FilesPlugin** = [`DefinePlugin`](../stately/schema.md#defineplugin)\<*typeof* [`FILES_PLUGIN_NAME`](#files_plugin_name), [`FilesNodeMap`](schema.md#filesnodemap), [`FilesTypes`](schema.md#filestypes), [`FilesData`](schema.md#filesdata), [`FilesUtils`](#filesutils)\>

Defined in: [files/src/plugin.tsx:108](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/files/src/plugin.tsx#L108)

Files schema plugin type definition.

This type augments the Stately schema runtime with file-related
node types, data structures, and utilities.

#### See

[filesPlugin](#filesplugin-1) - Factory function to create this plugin

***

### FilesUiPlugin

> **FilesUiPlugin** = `DefineUiPlugin`\<*typeof* [`FILES_PLUGIN_NAME`](#files_plugin_name), [`FilesPaths`](api.md#filespaths), *typeof* [`FILES_OPERATIONS`](api.md#files_operations), [`FilesUiUtils`](#filesuiutils), [`FilesOptions`](#filesoptions), *typeof* `filesRoutes`\>

Defined in: [files/src/plugin.tsx:156](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/files/src/plugin.tsx#L156)

Files UI plugin type definition.

This type defines the shape of the Files UI plugin, including its
API operations, configuration options, and utilities.

#### See

[filesUiPlugin](#filesuiplugin-1) - Factory function to create this plugin

***

### FilesUiUtils

> **FilesUiUtils** = `DefineUiUtils`\<\{ `formatFileSize`: (`bytes`) => `string`; `formatTimestamp`: (`timestamp?`, `withTime?`) => `string` \| `null`; `getFileEntryIcon`: (`entryType`, `isSelected?`) => `ComponentType`\<`any`\>; \}\>

Defined in: [files/src/utils.ts:21](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/files/src/utils.ts#L21)

Files UI plugin utilities

***

### FilesUtils

> **FilesUtils** = `Record`\<`string`, `never`\>

Defined in: [files/src/utils.ts:16](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/files/src/utils.ts#L16)

Files plugin utilities

## Variables

### FILES\_PLUGIN\_NAME

> `const` **FILES\_PLUGIN\_NAME**: `"files"`

Defined in: [files/src/plugin.tsx:80](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/files/src/plugin.tsx#L80)

Plugin identifier for the Files plugin.

***

### filesUiPlugin

> `const` **filesUiPlugin**: `UiPluginFactoryFn`\<[`FilesUiPlugin`](#filesuiplugin)\>

Defined in: [files/src/plugin.tsx:192](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/files/src/plugin.tsx#L192)

Creates the Files UI plugin factory.

This plugin registers file-related components, API operations, and
navigation routes into the Stately UI runtime. It provides:
- RelativePath field components for edit and view modes
- String primitive transformers
- Typed API operations for file management

#### Example

```typescript
import { statelyUi } from '@statelyjs/stately';
import { filesUiPlugin } from '@statelyjs/files';

const ui = statelyUi({
  plugins: [
    filesUiPlugin({
      api: { pathPrefix: '/api/files' },
    }),
  ],
});

// Access Files API in components
const { plugins } = useStatelyUi();
const result = await plugins.files.api.list_files();
```

***

### filesUiUtils

> `const` **filesUiUtils**: [`FilesUiUtils`](#filesuiutils)

Defined in: [files/src/utils.ts:39](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/files/src/utils.ts#L39)

Files plugin utilities implementation

***

### useFilesStatelyUi()

> `const` **useFilesStatelyUi**: () => `StatelyUiRuntime`\<`Schemas`\<`any`, `any`\>, readonly \[`CoreUiPlugin`, [`FilesUiPlugin`](#filesuiplugin)\]\>

Defined in: [files/src/context.tsx:19](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/files/src/context.tsx#L19)

Default hook instance for files plugin
Use this in files plugin components and hooks

Access the Stately runtime from React context.

Use this hook in components to access the runtime's plugins, utilities,
and configuration. The runtime must be provided via `statelyUiProvider`.

#### Returns

`StatelyUiRuntime`\<`Schemas`\<`any`, `any`\>, readonly \[`CoreUiPlugin`, [`FilesUiPlugin`](#filesuiplugin)\]\>

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

## Functions

### createUseFilesStatelyUi()

> **createUseFilesStatelyUi**\<`Schema`\>(): () => `StatelyUiRuntime`\<`Schema`, readonly \[`CoreUiPlugin`, [`FilesUiPlugin`](#filesuiplugin)\]\>

Defined in: [files/src/context.tsx:11](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/files/src/context.tsx#L11)

Hook for accessing Stately UI runtime with Files plugin

Assumes core plugin is available (since files uses core components like Editor)
Returns runtime with type-safe access to core and files plugins

#### Type Parameters

##### Schema

`Schema` *extends* `Schemas`\<`any`, `any`\> = `Schemas`\<`any`, `any`\>

#### Returns

> (): `StatelyUiRuntime`\<`Schema`, readonly \[`CoreUiPlugin`, [`FilesUiPlugin`](#filesuiplugin)\]\>

Access the Stately runtime from React context.

Use this hook in components to access the runtime's plugins, utilities,
and configuration. The runtime must be provided via `statelyUiProvider`.

##### Returns

`StatelyUiRuntime`\<`Schema`, readonly \[`CoreUiPlugin`, [`FilesUiPlugin`](#filesuiplugin)\]\>

The current Stately runtime from context

##### Throws

If called outside of a `StatelyUiProvider`

##### Example

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

***

### filesPlugin()

> **filesPlugin**\<`S`\>(): [`PluginFactory`](../schema/stately.md#pluginfactory)\<`S`\>

Defined in: [files/src/plugin.tsx:138](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/files/src/plugin.tsx#L138)

Creates the Files schema plugin factory.

This plugin registers file-related types and utilities into the Stately
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
import { filesPlugin } from '@statelyjs/files';

const stately = createStately()
  .plugin(filesPlugin())
  .build();
```

## References

### FilesApi

Re-exports [FilesApi](api.md#filesapi)

***

### FilesData

Re-exports [FilesData](schema.md#filesdata)

***

### FilesNodeType

Re-exports [FilesNodeType](schema.md#filesnodetype)

***

### FilesOperations

Re-exports [FilesOperations](api.md#filesoperations)

***

### FilesPaths

Re-exports [FilesPaths](api.md#filespaths)

***

### FilesTypes

Re-exports [FilesTypes](schema.md#filestypes)

***

### RelativePathNode

Re-exports [RelativePathNode](schema.md#relativepathnode)

***

### TFilesNodeType

Re-exports [TFilesNodeType](schema.md#tfilesnodetype)
