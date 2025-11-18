/**
 * @stately/files
 *
 * File system integration plugin for Stately UI
 * Provides relative path handling, file browsing, and file operations
 */

// Plugin
import { FILES_PLUGIN_NAME, filesPlugin, filesUiPlugin } from './plugin.js';

export type { FilesPlugin, FilesUiPlugin } from './plugin.js';
export { filesPlugin, filesUiPlugin, FILES_PLUGIN_NAME };

// API operations
import { FILES_OPERATIONS } from './api.js';

export type { FilesApi, FilesOperations, FilesPaths } from './api.js';
export { FILES_OPERATIONS };

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
