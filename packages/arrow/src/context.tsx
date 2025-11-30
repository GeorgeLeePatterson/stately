import { useStatelyUi } from '@stately/ui';
import type { Schemas } from '@stately/ui/schema';
import type { ArrowUiPlugin } from './plugin';

/**
 * Hook for accessing Stately UI runtime with Files plugin
 *
 * Assumes core plugin is available (since files uses core components like Editor)
 * Returns runtime with type-safe access to core and files plugins
 */
export function createUseArrowStatelyUi<Schema extends Schemas<any, any> = Schemas<any, any>>() {
  return useStatelyUi<Schema, readonly [ArrowUiPlugin]>;
}

/**
 * Default hook instance for files plugin
 * Use this in files plugin components and hooks
 */
export const useArrowStatelyUi = createUseArrowStatelyUi();
