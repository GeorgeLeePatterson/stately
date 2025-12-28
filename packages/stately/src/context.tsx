/**
 * Low-level React context and providers for StatelyUi.
 *
 * This module provides the base context infrastructure for making the StatelyUi
 * runtime available throughout your React application. These are intended for
 * plugin authors and advanced use cases.
 *
 * ## For Most Users
 *
 * **Use `StatelyProvider` and `useStatelyUi` from `@statelyjs/stately` instead.**
 * They include the core plugin types automatically:
 *
 * ```typescript
 * import { StatelyProvider, useStatelyUi } from '@statelyjs/stately';
 *
 * // In your app
 * <StatelyProvider runtime={runtime}>
 *   <App />
 * </StatelyProvider>
 *
 * // In components - core plugin is typed automatically
 * function MyComponent() {
 *   const { plugins } = useStatelyUi();
 *   plugins.core.api.operations.listEntities(...);
 * }
 * ```
 *
 * ## For Plugin Authors
 *
 * Use `createStatelyUiProvider` and `createUseStatelyUi` when building
 * plugins or working with custom plugin configurations:
 *
 * ```typescript
 * import { createStatelyUiProvider, createUseStatelyUi } from '@statelyjs/ui';
 *
 * const MyProvider = createStatelyUiProvider<MySchemas, [MyPlugin]>();
 * const useMyStatelyUi = createUseStatelyUi<MySchemas, [MyPlugin]>();
 * ```
 *
 * @module context
 */

import type { StatelySchemas } from '@statelyjs/schema';
import {
  type AnyUiPlugin,
  type StatelyUiRuntime,
  ThemeProvider,
  type UiOptions,
} from '@statelyjs/ui';
import { type ComponentType, createContext, type PropsWithChildren, useContext } from 'react';

/**
 * React context for the StatelyUi runtime.
 *
 * @internal Use hooks from `@statelyjs/stately` or `createUseStatelyUi` to access.
 */
const StatelyUiContext = createContext<StatelyUiRuntime<any, any> | null>(null);

/**
 * Props for the StatelyUi provider component.
 *
 * @typeParam Schema - The application's StatelySchemas type
 * @typeParam Augments - Tuple of installed plugin types
 */
export type StatelyProviderProps<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[],
> = PropsWithChildren<{
  /** The StatelyUi runtime instance */
  runtime: StatelyUiRuntime<Schema, Augments>;
}>;

/**
 * Create a typed StatelyUi provider component (low-level API).
 *
 * This is a **low-level API** for plugin authors. Most users should use
 * `StatelyProvider` from `@statelyjs/stately` which includes core types.
 *
 * Optionally pass a wrapper component to inject additional providers
 * (e.g., query clients, routing context).
 *
 * @typeParam Schema - The application's StatelySchemas type
 * @typeParam Augments - Tuple of plugin types that are installed
 *
 * @param Providers - Optional wrapper component for additional context providers
 * @param themeOptions - Optional theme configuration overrides
 * @returns A React provider component
 *
 * @example
 * ```typescript
 * // Basic usage
 * const MyProvider = createStatelyUiProvider<MySchemas, [MyPlugin]>();
 *
 * <MyProvider runtime={runtime}>
 *   <App />
 * </MyProvider>
 * ```
 *
 * @example
 * ```typescript
 * // With additional providers
 * const MyProvider = createStatelyUiProvider<MySchemas, [MyPlugin]>(
 *   ({ children }) => (
 *     <QueryClientProvider client={queryClient}>
 *       {children}
 *     </QueryClientProvider>
 *   )
 * );
 * ```
 */
export function createStatelyUiProvider<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[] = readonly [],
>(
  Providers?: ComponentType<{ children: React.ReactNode }>,
  themeOptions?: Partial<UiOptions>['theme'],
) {
  const themeDisabled = themeOptions?.disabled ?? false;
  const defaultTheme = themeOptions?.defaultTheme;
  const defaultStorageKey = themeOptions?.storageKey;

  // TODO: Allow providing inner provider props
  return ({ runtime: value, children }: StatelyProviderProps<Schema, Augments>) => {
    let composedChildren = Providers ? <Providers>{children}</Providers> : children;
    composedChildren = themeDisabled ? (
      composedChildren
    ) : (
      <ThemeProvider defaultTheme={defaultTheme} storageKey={defaultStorageKey}>
        {composedChildren}
      </ThemeProvider>
    );

    return <StatelyUiContext.Provider value={value}>{composedChildren}</StatelyUiContext.Provider>;
  };
}

/**
 * Default untyped provider for quick prototyping.
 *
 * This is a **low-level API**. For production use with proper types,
 * use `StatelyProvider` from `@statelyjs/stately`.
 */
export const StatelyUiProvider = createStatelyUiProvider();

/**
 * Create a typed hook for accessing StatelyUi runtime (low-level API).
 *
 * This is a **low-level API** for plugin authors. Most users should use
 * `useStatelyUi` from `@statelyjs/stately` which includes core types.
 *
 * @typeParam Schema - The application's StatelySchemas type
 * @typeParam Augments - Tuple of plugin types that are installed
 * @returns A hook function that returns the typed runtime
 *
 * @example
 * ```typescript
 * // For plugin authors
 * const useMyStatelyUi = createUseStatelyUi<MySchemas, [MyPlugin]>();
 *
 * function MyPluginComponent() {
 *   const runtime = useMyStatelyUi();
 *   runtime.plugins.myPlugin // Typed access
 * }
 * ```
 */
export function createUseStatelyUi<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[],
>() {
  return function useTypedStatelyUi(): StatelyUiRuntime<Schema, Augments> {
    const ctx = useContext(StatelyUiContext);
    if (!ctx) {
      throw new Error('useStatelyUi must be used within a StatelyUiProvider');
    }
    return ctx as StatelyUiRuntime<Schema, Augments>;
  };
}

/**
 * Access the StatelyUi runtime without plugin type assumptions.
 *
 * This is a **low-level API** primarily for internal use or plugin authors
 * who need runtime access without specific plugin types.
 *
 * @typeParam Schema - The application's StatelySchemas type
 * @typeParam Augments - Tuple of plugin types (defaults to empty)
 * @returns The StatelyUi runtime
 *
 * @throws Error if called outside of a StatelyUiProvider
 */
export function useBaseStatelyUi<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[] = [],
>() {
  return createUseStatelyUi<Schema, Augments>()();
}
