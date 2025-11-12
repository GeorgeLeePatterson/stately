/**
 * @stately/files
 *
 * File system integration plugin for Stately UI
 * Provides relative path handling, file browsing, and file operations
 */

// Schema extensions
export { FilesNodeType } from "./schema.js";
export type { RelativePathNode } from "./schema.js";

// Field components
export { RelativePathField } from "./components/fields/edit/relative-path-field.js";
export { RelativePathFieldView } from "./components/fields/view/relative-path-field.js";
export { Upload } from "./components/fields/edit/upload.js";

// View components
export { FileManager } from "./components/views/file-manager.js";
export { FileSelector } from "./components/views/file-selector.js";

// Base components
export { FileEntry } from "./components/base/file-entry.js";

// Hooks
export { useSaveFile } from "./hooks/use-save-file.js";
export { useFileView } from "./hooks/use-file-view.js";

export { filesCodegenPlugin } from "./codegen.js";
export { useFilesApi } from "./lib/files-api.js";
export { createFilesPlugin, filesPlugin } from "./plugin.js";
export type { FilesPluginOptions } from "./plugin.js";

export const VERSION = "0.1.0";
