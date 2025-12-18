/**
 * @statelyjs/files - React Hooks
 *
 * @packageDocumentation
 *
 * This module exports React hooks for file operations including uploads,
 * downloads, file browsing, and version management.
 *
 * ## Available Hooks
 *
 * ### File Operations
 * - {@link useUpload} - Upload files to the server
 * - {@link useDownload} - Download files from cache, data, or upload directories
 * - {@link useSaveFile} - Save text content as a file
 *
 * ### File Browsing
 * - {@link useFileExplore} - Navigate and browse the file system
 * - {@link useFileVersions} - List versions of a versioned file
 *
 * @module
 */

import { useDownload } from './use-download';
import { useFileExplore } from './use-file-explore';
import { useFileVersions } from './use-file-versions';
import { useSaveFile } from './use-save-file';
import { useUpload } from './use-upload';

export type { DownloadParams, DownloadTarget } from './use-download';
export type { VersionedDataValue } from './use-file-versions';

export { useDownload, useFileExplore, useFileVersions, useSaveFile, useUpload };
