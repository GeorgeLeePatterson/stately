import { type AnyUiPlugin, createStatelyUiProvider, type UiOptions } from '@/base';
import type { Schemas } from '@/core/schema';
import type { CoreUiPlugin } from '.';
import { LinkExplorerProvider } from './context/link-explore-context';

/**
 * Create a Stately UI provider with the given schema and augmentations and core built in.
 * The `LinkExplorer` provider is also included by default.
 */
export function statelyUiProvider<
  Schema extends Schemas<any, any>,
  Augments extends readonly AnyUiPlugin[] = readonly [],
>(themeOptions?: Partial<UiOptions>['theme']) {
  return createStatelyUiProvider<Schema, readonly [CoreUiPlugin, ...Augments]>(
    LinkExplorerProvider,
    themeOptions,
  );
}
