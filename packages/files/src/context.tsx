import type { Schemas } from '@stately/schema';
import { createUseStatelyUi } from '@stately/ui';
import type { FilesUiPlugin } from './plugin';

/**
 * Hook for accessing Stately UI runtime with Files plugin
 *
 * Assumes core plugin is available (since files uses core components like Editor)
 * Returns runtime with type-safe access to core and files plugins
 */
export function createUseFilesStatelyUi<Schema extends Schemas<any, any> = Schemas<any, any>>() {
  return createUseStatelyUi<Schema, readonly [FilesUiPlugin<Schema>]>();
}

/**
 * Default hook instance for files plugin
 * Use this in files plugin components and hooks
 */
export const useFilesStatelyUi = createUseFilesStatelyUi();
