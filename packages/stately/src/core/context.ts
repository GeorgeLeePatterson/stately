/**
 * Stately context provider factory.
 *
 * This module provides the `statelyUiProvider` factory for creating
 * typed React context providers with core plugin support.
 *
 * @module context
 */

import type { AnyUiPlugin, UiOptions } from '@statelyjs/ui';
import { createStatelyUiProvider } from '@/context';
import type { Schemas } from '@/core/schema';
import type { CoreUiPlugin } from '.';
import { LinkExplorerProvider } from './context/link-explore-context';

/**
 * Create a typed React context provider with core plugin support.
 *
 * This factory creates a provider component that:
 * - Includes the core plugin types automatically
 * - Wraps children with `LinkExplorerProvider` for link navigation
 * - Supports optional theme configuration
 *
 * @typeParam Schema - Your application's schema type
 * @typeParam Augments - Additional plugins beyond core
 *
 * @param themeOptions - Optional theme configuration
 * @returns A React provider component
 *
 * @example
 * ```typescript
 * // Create the provider once
 * export const AppProvider = statelyUiProvider<MySchemas>();
 *
 * // Use in your app
 * <AppProvider runtime={runtime}>
 *   <App />
 * </AppProvider>
 * ```
 *
 * @example With theme disabled
 * ```typescript
 * export const AppProvider = statelyUiProvider<MySchemas>({ disabled: true });
 * ```
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
