/**
 * @statelyjs/files
 *
 * @packageDocumentation
 *
 * File system integration plugin for Stately UI.
 *
 * This package provides comprehensive file management capabilities including:
 * - File browsing with directory navigation
 * - File uploads with automatic versioning
 * - File downloads from multiple storage targets
 * - Relative path field components for forms
 * - File version history management
 *
 * ## Quick Start
 *
 * ```typescript
 * import { createStately } from '@statelyjs/schema';
 * import { statelyUi } from '@statelyjs/stately';
 * import { filesPlugin, filesUiPlugin } from '@statelyjs/files';
 *
 * // Schema configuration
 * const stately = createStately()
 *   .plugin(filesPlugin())
 *   .build();
 *
 * // UI configuration
 * const ui = statelyUi({
 *   plugins: [filesUiPlugin()],
 * });
 * ```
 *
 * @module
 */

// Plugin
import { FILES_PLUGIN_NAME, filesPlugin, filesUiPlugin } from './plugin.js';

export type { FilesOptions, FilesPlugin, FilesUiPlugin } from './plugin.js';
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
