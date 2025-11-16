/**
 * @stately/files
 *
 * File system integration plugin for Stately UI
 * Provides relative path handling, file browsing, and file operations
 */

// Plugin
import { createFilesUiPlugin, filesSchemaPlugin, filesUiPlugin } from './plugin.js';
export { filesSchemaPlugin, createFilesUiPlugin, filesUiPlugin };
export type { FilesPlugin, FilesPluginRuntime, FilesUiPlugin } from './plugin.js';

// Schema extensions
import { FilesNodeType } from './schema.js';
export { FilesNodeType };
