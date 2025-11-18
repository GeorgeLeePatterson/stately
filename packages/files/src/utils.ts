import type { DefineUtils } from '@stately/schema/plugin';
import { FileText, Folder, FolderOpen, History } from 'lucide-react';
import type { ComponentType } from 'react';
import { FILES_OPERATION_IDS, type FilesOperationMap } from './operations';
import type { FileEntryType } from './types/api';

/**
 * Files plugin utilities
 */
export type FilesUtils = DefineUtils<{
  /**
   * Get icon component for a file entry type
   */
  getFileEntryIcon: (entryType: FileEntryType, isSelected?: boolean) => ComponentType<any>;
  /**
   * Format file size in bytes to human-readable string
   */
  formatFileSize: (bytes: number) => string;
  /**
   * Format Unix timestamp to date string
   */
  formatTimestamp: (timestamp?: number, withTime?: boolean) => string | null;
}>;

/**
 * Files UI plugin utilities
 */
export type FilesUiPluginUtils = {
  /**
   * Get the configured operation IDs for the files plugin
   */
  getFilesOperationIds: () => FilesOperationMap;
};

export const filesUiUtils: FilesUiPluginUtils = { getFilesOperationIds: () => FILES_OPERATION_IDS };

/**
 * Files plugin utilities implementation
 */
export const filesUtils: FilesUtils = {
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)}KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)}MB`;
  },

  formatTimestamp(timestamp?: number, withTime = false): string | null {
    if (timestamp === undefined) return null;
    const date = new Date(timestamp * 1000);
    if (Number.isNaN(date.getTime())) return null;
    return withTime ? date.toLocaleString() : date.toLocaleDateString();
  },

  getFileEntryIcon(entryType: FileEntryType, isSelected = false) {
    switch (entryType) {
      case 'directory':
        return isSelected ? FolderOpen : Folder;
      case 'versioned_file':
        return History;
      default:
        return FileText;
    }
  },
};
