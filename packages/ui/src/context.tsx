import { createContext, type PropsWithChildren, useContext } from 'react';
import type { AnyBaseSchemas } from './base';
import type { UiAugment } from './plugin';
import type { StatelyRuntime } from './runtime';

/**
 * Context for storing the StatelyUi runtime.
 * Type is intentionally wide to allow any runtime configuration.
 */
const StatelyUiContext = createContext<StatelyRuntime<any, any> | null>(null);

type ProviderProps<
  Schema extends AnyBaseSchemas,
  Augments extends readonly UiAugment<string, Schema, any, any>[],
> = PropsWithChildren<{ value: StatelyRuntime<Schema, Augments> }>;

/**
 * Create a typed StatelyUi provider.
 *
 * @example
 * ```typescript
 * const MyProvider = createStatelyUiProvider<MySchemas, [CoreUiAugment<MySchemas>]>();
 *
 * <MyProvider value={runtime}>
 *   <App />
 * </MyProvider>
 * ```
 */
export function createStatelyUiProvider<
  Schema extends AnyBaseSchemas,
  Augments extends readonly UiAugment<string, Schema, any, any>[] = readonly [],
>() {
  return function StatelyUiProvider({ value, children }: ProviderProps<Schema, Augments>) {
    return <StatelyUiContext.Provider value={value}>{children}</StatelyUiContext.Provider>;
  };
}

/**
 * Default untyped provider for convenience.
 * For better type safety, use createStatelyUiProvider with your specific types.
 */
export const StatelyUiProvider = createStatelyUiProvider();

/**
 * Create a typed hook for accessing StatelyUi runtime.
 *
 * @example
 * ```typescript
 * const useMyStatelyUi = createUseStatelyUi<MySchemas, [CoreUiAugment<MySchemas>]>();
 *
 * function MyComponent() {
 *   const runtime = useMyStatelyUi();
 *   runtime.plugins.core // ✓ Fully typed!
 * }
 * ```
 */
export function createUseStatelyUi<
  Schema extends AnyBaseSchemas,
  Augments extends readonly UiAugment<string, Schema, any, any>[] = readonly [],
>() {
  return function useTypedStatelyUi(): StatelyRuntime<Schema, Augments> {
    const ctx = useContext(StatelyUiContext);
    if (!ctx) {
      throw new Error('useStatelyUi must be used within a StatelyUiProvider');
    }
    return ctx as StatelyRuntime<Schema, Augments>;
  };
}

/**
 * Default untyped hook for convenience.
 * For better type safety, use createUseStatelyUi with your specific types.
 *
 * @example
 * ```typescript
 * const runtime = useStatelyUi();
 * // runtime.plugins has type Record<string, PluginRuntime<...>>
 * ```
 */
export const useStatelyUi = createUseStatelyUi();
