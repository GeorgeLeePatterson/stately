# @statelyjs/files

> File system integration plugin for [Stately](https://www.npmjs.com/package/@statelyjs/stately). 

[![npm](https://img.shields.io/npm/v/@statelyjs/files)](https://www.npmjs.com/package/@statelyjs/files)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](https://github.com/georgeleepatterson/stately/blob/main/LICENSE)

Provides file browsing, versioned file management, uploads, downloads, and relative path handling.

## Overview

This package connects your application to a `stately-files` backend (Rust), giving you:

- **File Manager page** - Browse files across `cache`, `data`, and `upload` directories
- **Versioned file support** - View version history and download specific versions
- **Upload/download** - Seamless file operations with progress feedback
- **RelativePath field** - Custom form field for selecting files from your backend

## Installation

```bash
pnpm add @statelyjs/files
```

## Quick Start

### 1. Add Schema Plugin

```typescript
import { stately } from '@statelyjs/stately/schema';
import { type FilesPlugin, filesPlugin } from '@statelyjs/files';

const schema = stately<MySchemas, readonly [FilesPlugin]>(openapiDoc, PARSED_SCHEMAS)
  .withPlugin(filesPlugin());
```

### 2. Add UI Plugin

```typescript
import { statelyUi } from '@statelyjs/stately';
import { type FilesUiPlugin, filesUiPlugin } from '@statelyjs/files';

const runtime = statelyUi<MySchemas, readonly [FilesUiPlugin]>({
  schema,
  client,
  core: { api: { pathPrefix: '/entity' } },
  options: { api: { pathPrefix: '/api' } },
}).withPlugin(filesUiPlugin({
  api: { pathPrefix: '/files' },
}));
```

### 3. Wrap Your App

```tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { AppStatelyProvider, runtime } from './lib/stately';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppStatelyProvider runtime={runtime}>
        <YourApp />
      </AppStatelyProvider>
    </QueryClientProvider>
  );
}
```

### Adding Routes

The plugin provides a `FileManager` page component. Add it to your router:

```tsx
import { FileManager } from '@statelyjs/files/pages';

// Example with React Router
<Route path="/files" element={<FileManager />} />
```

## Hooks

All hooks use the files API through the plugin context:

### `useFileExplore`

Browse files and directories:

```tsx
import { useFileExplore } from '@statelyjs/files/hooks';

function FileBrowser() {
  const { data, isLoading } = useFileExplore({ path: 'data/configs' });

  return (
    <ul>
      {data?.entries.map(entry => (
        <li key={entry.name}>{entry.name}</li>
      ))}
    </ul>
  );
}
```

### `useFileVersions`

Get version history for a file:

```tsx
import { useFileVersions } from '@statelyjs/files/hooks';

const { data: versions } = useFileVersions({
  target: 'data',
  path: 'configs/settings.json',
});
```

### `useDownload`

Download files (supports versioned downloads):

```tsx
import { useDownload } from '@statelyjs/files/hooks';

function DownloadButton({ path }: { path: string }) {
  const { mutate: download, isPending } = useDownload();

  return (
    <button
      onClick={() => download({ target: 'data', path })}
      disabled={isPending}
    >
      {isPending ? 'Downloading...' : 'Download'}
    </button>
  );
}
```

### `useUpload`

Upload files:

```tsx
import { useUpload } from '@statelyjs/files/hooks';

const { mutate: upload, isPending } = useUpload({
  onSuccess: () => console.log('Upload complete'),
});

upload({ file, path: 'uploads/my-file.txt' });
```

### `useSaveFile`

Save content to a file:

```tsx
import { useSaveFile } from '@statelyjs/files/hooks';

const { mutate: save } = useSaveFile();

save({
  path: { dir: 'data', path: 'config.json' },
  content: JSON.stringify(config, null, 2),
});
```

## Views

Reusable view components for building file interfaces:

### `FileExplorer`

Directory browser with navigation:

```tsx
import { FileExplorer } from '@statelyjs/files/views';

<FileExplorer
  path="data/configs"
  onNavigate={setCurrentPath}
  onSelect={handleFileSelect}
/>
```

### `FileSelector`

File picker dialog:

```tsx
import { FileSelector } from '@statelyjs/files/views';

<FileSelector
  value={selectedPath}
  onChange={setSelectedPath}
  filter={entry => entry.name.endsWith('.json')}
/>
```

### `FileDetails` / `VersionedFileDetails`

Display file metadata and actions:

```tsx
import { FileDetails, VersionedFileDetails } from '@statelyjs/files/views';

// For simple files
<FileDetails entry={fileEntry} currentPath={path} onClose={handleClose} />

// For versioned files (shows version history)
<VersionedFileDetails
  entry={fileEntry}
  currentPath={path}
  onClose={handleClose}
/>
```

## Pages

### `FileManager`

Full-featured file management page with:

- Directory navigation breadcrumbs
- File/folder listing with icons
- File details sidebar
- Version history for versioned files
- Download buttons

```tsx
import { FileManager } from '@statelyjs/files/pages';

<Route path="/files/*" element={<FileManager />} />
```

## Codegen Integration

The package includes a codegen plugin that detects `RelativePath` schemas from your OpenAPI spec. Add it to your `stately.config.js`:

```javascript
// stately.config.js
import { filesCodegenPlugin } from '@statelyjs/files/codegen';

export default {
  plugins: [filesCodegenPlugin()],
};
```

Then run:

```bash
pnpm exec stately ./openapi.json -o ./src/generated -c ./stately.config.js
```

This transforms OpenAPI `oneOf` schemas matching the RelativePath pattern into `FilesNodeType.RelativePath` nodes, enabling the custom path selector field in forms.

## Backend Requirements

This plugin expects a `stately-files` compatible backend with these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/list` | GET | List files (query: `path`) |
| `/save` | POST | Save file content |
| `/upload` | POST | Upload file (multipart) |
| `/file/cache/{path}` | GET | Download from cache |
| `/file/data/{path}` | GET | Download from data |
| `/file/upload/{path}` | GET | Download from uploads |

All download endpoints support an optional `version` query parameter for versioned files.

## Plugin Architecture

For plugin authors, this package demonstrates the Stately plugin pattern:

### Schema Plugin

Extends the node type system, expected types, additional data properties, and files utilities:

```typescript
export const FILES_PLUGIN_NAME = 'files' as const;

export type FilesPlugin = DefinePlugin<
  typeof FILES_PLUGIN_NAME,
  FilesNodeMap,
  FilesTypes,
  FilesData,
  FilesUtils
>;

export function filesPlugin<S extends Schemas<any, any> = Schemas>(): PluginFactory<S> {
  return runtime => {
    return {
      ...runtime,
      data: { ...runtime.data },
      plugins: { ...runtime.plugins, [FILES_PLUGIN_NAME]: {} },
    };
  };
}
```

### UI Plugin

Registers components, navigation, and API bindings:

```typescript
export type FilesOptions = DefineOptions<{
  /** API configuration for Files endpoints */
  api?: { pathPrefix?: string };
  /** Navigation configuration for Files routes */
  navigation?: { routes?: UiNavigationOptions['routes'] };
}>;

export type FilesUiPlugin = DefineUiPlugin<
  typeof FILES_PLUGIN_NAME,
  FilesPaths,
  typeof FILES_OPERATIONS,
  FilesUiUtils,
  FilesOptions,
  typeof filesRoutes
>;

export function filesUiPlugin<
  Schema extends Schemas<any, any> = Schemas,
  Augments extends readonly AnyUiPlugin[] = [],
>(options?: FilesOptions): UiPluginFactory<Schema, Augments> {
  return runtime => {
    ...

    // Register components
    registry.components.set(
      baseRegistry.makeRegistryKey(FilesNodeType.RelativePath, 'edit'),
      props => <RelativePathEdit {...props} standalone />,
    );
    registry.components.set(
      baseRegistry.makeRegistryKey(FilesNodeType.RelativePath, 'view'),
      RelativePathView,
    );

    // Register transformers
    registry.transformers.set(
      baseRegistry.makeRegistryKey(CoreNodeType.Primitive, 'edit', 'transformer', 'string'),
      primitiveStringTransformer,
    );

    ...

    const pathPrefix = runtime.utils.mergePathPrefixOptions(basePathPrefix, corePathPrefix);
    const api = createOperations<FilesPaths, typeof FILES_OPERATIONS>(
      client,
      FILES_OPERATIONS,
      pathPrefix,
    );

     // Files only supports a top level route, only provides a single page.
    const routes = { ...filesRoutes, ...(options?.navigation?.routes || {}) };
    const plugin = { [FILES_PLUGIN_NAME]: { api, options, routes, utils: filesUiUtils } };
    return { ...runtime, plugins: { ...runtime.plugins, ...plugin } };
  };
}
```

The UI plugin:
1. Creates an API client bound to your base URL
2. Registers the `RelativePathField` component for the `RelativePath` node type
3. Provides a prop transformer for core's PrimitiveNode::PrimitiveString fields
4. Provides the files context to child components

### Context Access

Access the files runtime from components:

```typescript
import { useFilesStatelyUi } from '@statelyjs/files';

function MyComponent() {
  const runtime = useFilesStatelyUi();
  const filesApi = runtime.plugins.files?.api;
  // Use filesApi for custom operations
}
```

## License

Apache-2.0
