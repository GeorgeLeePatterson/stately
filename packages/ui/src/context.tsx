import type { Schemas } from '@stately/schema';
import { createUseBaseStatelyUi } from './base/context';
import type { UiPluginAugment } from './base/plugin';
import type { CoreUiAugment } from './core/plugin';

/**
 * Stately UI Context Provider with core included
 *
 * This hook is both used in core's plugin code but also serves as an example for how to customize
 * the application's Stately context with any plugin augmentations.
 */
export function createUseStatelyUi<
  Schema extends Schemas<any, any>,
  ExtraAugments extends readonly UiPluginAugment<string, Schema, any, any>[] = [],
>() {
  return createUseBaseStatelyUi<Schema, readonly [CoreUiAugment<Schema>, ...ExtraAugments]>();
}
