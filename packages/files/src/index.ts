/**
 * @statelyjs/files - File System Plugin
 *
 * File system integration plugin for Stately applications. Provides
 * comprehensive file management capabilities for both schema and UI.
 *
 * ## Features
 *
 * - **File Browsing**: Directory navigation with breadcrumbs
 * - **File Uploads**: Drag-and-drop with automatic versioning
 * - **File Downloads**: Support for multiple storage targets (data, cache, upload)
 * - **RelativePath Field**: Form components for file path selection
 * - **Version History**: Track and manage file versions
 *
 * ## Installation
 *
 * ```bash
 * pnpm add @statelyjs/files
 * ```
 *
 * ## Setup
 *
 * ### 1. Add Schema Plugin
 *
 * ```typescript
 * // stately.ts
 * import { stately } from '@statelyjs/stately/schema';
 * import { filesPlugin } from '@statelyjs/files';
 *
 * const schema = stately<MySchemas>(openapiDoc, PARSED_SCHEMAS)
 *   .withPlugin(filesPlugin());
 * ```
 *
 * ### 2. Add UI Plugin
 *
 * ```typescript
 * // stately.ts
 * import { statelyUi } from '@statelyjs/stately';
 * import { filesUiPlugin } from '@statelyjs/files';
 *
 * const runtime = statelyUi<MySchemas>({ schema, client, options })
 *   .withPlugin(filesUiPlugin({ api: { pathPrefix: '/files' } }));
 * ```
 *
 * ### 3. Access in Components
 *
 * ```typescript
 * import { useFilesStatelyUi } from '@statelyjs/files';
 *
 * function FileManager() {
 *   const { plugins } = useFilesStatelyUi();
 *   const files = plugins.files;
 *
 *   // Use file operations
 *   const upload = () => files.api.upload({ body: formData });
 *   const list = () => files.api.list_files({ params: { query: { dir: '/' } } });
 * }
 * ```
 *
 * @packageDocumentation
 */

// Plugin
import { FILES_PLUGIN_NAME, filesPlugin, filesUiPlugin } from './plugin.jsx';

export type { FilesOptions, FilesPlugin, FilesUiPlugin } from './plugin.jsx';
export { filesPlugin, filesUiPlugin, FILES_PLUGIN_NAME };

// API operations
export type { FilesApi, FilesOperations, FilesPaths } from './api.js';

// Schema extensions
import { FilesNodeType } from './schema.js';

export type {
  FilesData,
  FilesTypes,
  RelativePathNode,
  TFilesNodeType,
} from './schema.js';
export { FilesNodeType };

// Utils
import { filesUiUtils } from './utils.js';

export type { FilesUiUtils, FilesUtils } from './utils.js';
export { filesUiUtils };

// Context
import { createUseFilesStatelyUi, useFilesStatelyUi } from './context.js';
export { createUseFilesStatelyUi, useFilesStatelyUi };
