import type { DefineUiUtils } from '@statelyjs/ui';
import { devLogger } from '@statelyjs/ui/base';
import { Files, FileText, Folder, FolderOpen, History } from 'lucide-react';
import type { ComponentType } from 'react';
import { FilesNodeType } from './schema';
import type { FileEntryType } from './types/api';

/**
 * Re-export logger for files plugin
 */
export const log = devLogger('@statelyjs/files');

/**
 * Files plugin utilities
 */
export type FilesUtils = Record<string, never>;

/**
 * Files UI plugin utilities
 */
export type FilesUiUtils = DefineUiUtils<{
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
  formatTimestamp: (timestamp?: number | string | null, withTime?: boolean) => string | null;
}>;

/**
 * Files plugin utilities implementation
 */
export const filesUiUtils: FilesUiUtils = {
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)}KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)}MB`;
  },

  formatTimestamp(timestamp?: number | string | null, withTime = false): string | null {
    if (timestamp === undefined || timestamp === null) return null;
    const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp);
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

  getNodeTypeIcon(nodeType: string): ComponentType<any> | null {
    return nodeType === FilesNodeType.RelativePath ? Files : null;
  },
};
