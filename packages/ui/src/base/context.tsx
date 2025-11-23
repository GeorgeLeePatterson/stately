import type { StatelySchemas } from '@stately/schema/schema';
import { type ComponentType, createContext, type PropsWithChildren, useContext } from 'react';
import type { AnyUiPlugin } from '@/base/plugin';
import type { StatelyUiRuntime, UiOptions } from '@/base/runtime';
import { ThemeProvider } from './theme';

/**
 * Context for storing the StatelyUi runtime.
 * Type is intentionally wide to allow any runtime configuration.
 */
const StatelyUiContext = createContext<StatelyUiRuntime<any, any> | null>(null);

export type StatelyProviderProps<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[],
> = PropsWithChildren<{ value: StatelyUiRuntime<Schema, Augments> }>;

/**
 * Create a typed StatelyUi provider. Optionally pass in a component to wrap the children to inject
 * your own providers.
 *
 * @example
 * ```typescript
 * const MyProvider = createStatelyUiProvider<MySchemas, [CoreUiPlugin<MySchemas>]>();
 *
 * <MyProvider value={runtime}>
 *   <App />
 * </MyProvider>
 * ```
 *
 * @example
 * ```typescript
 * const MyOtherProvider = OtherProvider;
 * const MyProvider = createStatelyUiProvider<MySchemas, [CoreUiPlugin<MySchemas>]>(
 *   MyOtherProvider,
 * );
 *
 * <MyProvider value={runtime}>
 *   <App />
 * </MyProvider>
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
  return ({ value, children }: StatelyProviderProps<Schema, Augments>) => {
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
 * Default untyped provider for convenience.
 * For better type safety, use createStatelyUiProvider with your specific types.
 */
export const StatelyUiProvider = createStatelyUiProvider();

/**
 * Create a typed hook for accessing StatelyUi runtime.
 *
 * @example
 * ```typescript
 * const useMyStatelyUi = createUseStatelyUi<MySchemas, [CoreUiPlugin]>();
 *
 * function MyComponent() {
 *   const runtime = useMyStatelyUi();
 *   runtime.plugins.core // ✓ Fully typed!
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

export function useBaseStatelyUi<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[] = [],
>() {
  return createUseStatelyUi<Schema, Augments>()();
}
