import type { StatelySchemas } from '@stately/schema/schema';
import { createContext, type PropsWithChildren, useContext } from 'react';
import type { UiPluginAugment } from '@/base/plugin';
import type { StatelyRuntime } from '@/base/runtime';

/**
 * Context for storing the StatelyUi runtime.
 * Type is intentionally wide to allow any runtime configuration.
 */
const StatelyUiContext = createContext<StatelyRuntime<any, any> | null>(null);

type ProviderProps<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly UiPluginAugment<string, Schema, any, any>[],
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
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly UiPluginAugment<string, Schema, any, any>[] = readonly [],
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
export function createUseBaseStatelyUi<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly UiPluginAugment<string, Schema, any, any>[] = readonly [],
>() {
  return function useTypedStatelyUi(): StatelyRuntime<Schema, Augments> {
    const ctx = useContext(StatelyUiContext);
    if (!ctx) {
      throw new Error('useStatelyUi must be used within a StatelyUiProvider');
    }
    return ctx as StatelyRuntime<Schema, Augments>;
  };
}
