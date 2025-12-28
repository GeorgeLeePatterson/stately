/**
 * @statelyjs/ui Extension System
 *
 * Extensions provide a type-safe, composable way for plugins to modify behavior.
 * An extension point is a named hook that accepts transformers - functions that
 * receive state and return (possibly modified) state.
 *
 * ## Core Concepts
 *
 * - **Extension Point**: A named hook defined by a plugin (e.g., `addStringModes`)
 * - **Transformer**: A function `(T) => T` that modifies state
 * - **Composition**: Multiple transformers chain together via `extend()`
 *
 * ## For Plugin Authors
 *
 * Define extension points to allow customization of your plugin's behavior:
 *
 * ```typescript
 * // Define the state shape
 * export interface StringEditState {
 *   mode: string;
 *   modeGroups: StringModeGroup[];
 *   component?: ComponentType<...>;
 * }
 *
 * // Create the extension point
 * export const addStringModes = defineExtension<StringEditState>({
 *   id: 'core.addStringModes',
 *   summary: 'Add custom input modes to string fields',
 * });
 *
 * // In your component, apply the extension
 * const state = addStringModes.transform(initialState);
 * ```
 *
 * ## For Users & Plugin Consumers
 *
 * Extend behavior by registering transformers:
 *
 * ```typescript
 * import { addStringModes } from '@statelyjs/stately/extensions';
 *
 * addStringModes.extend(state => ({
 *   ...state,
 *   modeGroups: [...state.modeGroups, myCustomModes],
 * }));
 * ```
 *
 * ## Composition
 *
 * Transformers compose in registration order. If plugin A and plugin B both
 * extend the same point:
 *
 * ```typescript
 * // Plugin A (registered first)
 * point.extend(s => ({ ...s, value: s.value + 1 }));
 *
 * // Plugin B (registered second)
 * point.extend(s => ({ ...s, value: s.value * 2 }));
 *
 * // Result: initial { value: 0 } → A: { value: 1 } → B: { value: 2 }
 * point.transform({ value: 0 }); // { value: 2 }
 * ```
 *
 * @packageDocumentation
 */

/**
 * Configuration for defining an extension point.
 */
export interface ExtensionPointConfig {
  /**
   * Unique identifier for the extension point.
   *
   * Use the convention `{plugin}.{feature}` to avoid collisions.
   *
   * @example 'core.addStringModes'
   * @example 'files.filePreview'
   */
  readonly id: string;

  /**
   * Human-readable summary describing what this extension point does.
   *
   * This is used for documentation generation and IDE hints.
   *
   * @example 'Add custom input modes to string fields'
   */
  readonly summary: string;
}

/**
 * An extension point that plugins can extend with transformers.
 *
 * Extension points are the primary mechanism for plugins to allow
 * customization of their behavior. They follow a simple pattern:
 * state in, state out (`T => T`).
 *
 * @typeParam T - The state type that flows through the extension
 */
export interface ExtensionPoint<T> extends ExtensionPointConfig {
  /**
   * Apply all registered transformers to the input state.
   *
   * Transformers are applied in registration order. If no transformers
   * are registered, returns the input state unchanged.
   *
   * @param state - The initial state
   * @returns The transformed state
   *
   * @example
   * ```typescript
   * const resolved = addStringModes.transform({
   *   mode: 'text',
   *   modeGroups: [coreModes],
   * });
   * ```
   */
  transform(state: T): T;

  /**
   * Register a transformer to this extension point.
   *
   * Transformers are composed in registration order. Each transformer
   * receives the output of the previous transformer (or the initial
   * state for the first transformer).
   *
   * @param transformer - A function that receives state and returns modified state
   *
   * @example
   * ```typescript
   * addStringModes.extend(state => ({
   *   ...state,
   *   modeGroups: [...state.modeGroups, myModeGroup],
   *   component: state.mode === 'code' ? CodeEditor : state.component,
   * }));
   * ```
   */
  extend(transformer: (state: T) => T): void;
}

/**
 * Define a new extension point.
 *
 * Extension points allow plugins to expose hooks that other plugins
 * or user code can extend. The pattern is simple: transformers are
 * functions `(T) => T` that receive state and return (possibly modified) state.
 *
 * @typeParam T - The state type that flows through the extension
 * @param config - Configuration for the extension point
 * @returns A new extension point
 *
 * @example
 * ```typescript
 * // Define the state shape
 * export interface MyExtensionState {
 *   options: string[];
 *   selectedOption?: string;
 * }
 *
 * // Create the extension point
 * export const myExtension = defineExtension<MyExtensionState>({
 *   id: 'myPlugin.myExtension',
 *   summary: 'Customize available options',
 * });
 *
 * // Use it in your component
 * const state = myExtension.transform({
 *   options: ['default'],
 *   selectedOption: undefined,
 * });
 *
 * // Others can extend it
 * myExtension.extend(state => ({
 *   ...state,
 *   options: [...state.options, 'custom'],
 * }));
 * ```
 */
export function defineExtension<T>(config: ExtensionPointConfig): ExtensionPoint<T> {
  let pipeline: Array<(state: T) => T> = [];

  return {
    extend(transformer: (state: T) => T): void {
      pipeline = [...pipeline, transformer];
    },
    id: config.id,
    summary: config.summary,

    transform(state: T): T {
      return pipeline.reduce((s, fn) => fn(s), state);
    },
  };
}

/**
 * Type helper to extract the state type from an extension point.
 *
 * @example
 * ```typescript
 * type State = ExtensionState<typeof addStringModes>;
 * // Infers the state type from the extension point
 * ```
 */
export type ExtensionState<E> = E extends ExtensionPoint<infer T> ? T : never;

// =============================================================================
// Layer 1: createExtensible - Ergonomic wrapper over defineExtension
// =============================================================================

import { useMemo } from 'react';

/**
 * Deep merge source into target, handling nested objects.
 *
 * **Merge behavior:**
 * - Plain objects: recursively merged
 * - Arrays: replaced (not concatenated)
 * - Primitives: replaced
 * - `undefined` values in source: ignored (target value preserved)
 *
 * **Future consideration:** Array handling could be extended with sentinel
 * helpers like `append(item)` that `deepMerge` recognizes, enabling:
 * ```typescript
 * feature.extend({ items: append(newItem) }); // Concat to existing
 * feature.extend({ items: [newItem] });       // Replace entirely
 * ```
 * For now, use the transformer form for array concatenation:
 * ```typescript
 * feature.extend(state => ({ items: [...state.items, newItem] }));
 * ```
 *
 * @internal
 */
function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key of Object.keys(source) as Array<keyof T & string>) {
    const sourceValue = source[key];
    const targetValue = target[key];

    // If both are plain objects, recurse
    if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
      result[key] = deepMerge(targetValue, sourceValue as any) as T[typeof key];
    } else if (sourceValue !== undefined) {
      // Replace with source value (arrays, primitives, class instances)
      result[key] = sourceValue as T[typeof key];
    }
  }

  return result;
}

/**
 * Check if value is a plain object (not array, null, or class instance).
 * @internal
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Configuration for creating an extensible hook.
 *
 * @typeParam TOptions - Options passed to the hook
 * @typeParam TState - The state shape that flows through transformers
 */
export interface ExtensibleConfig<TOptions, TState> extends ExtensionPointConfig {
  /**
   * Factory function that creates initial state from hook options.
   * Called each time the hook is used.
   *
   * @param options - Options passed to the hook
   * @returns Initial state before any transformers are applied
   */
  initial: (options: TOptions) => TState;
}

/**
 * Input type for extend() - either a partial state object or a transformer function.
 *
 * - `Partial<T>`: Merged into state (deep merge)
 * - `(state: T) => Partial<T>`: Function that receives state and returns partial to merge
 *
 * In both cases, the framework handles merging. You never need to spread state.
 */
export type ExtendInput<T> = Partial<T> | ((state: T) => Partial<T>);

/**
 * A React hook that returns transformed state from an extensible.
 *
 * This is the first element of the tuple returned by `createExtensible`.
 * Use this inside React components.
 *
 * @typeParam TOptions - Options passed to the hook
 * @typeParam TState - The state shape that flows through transformers
 */
export type ExtensibleHook<TOptions, TState> = (options: TOptions) => TState;

/**
 * An extension object for registering transformers.
 *
 * This is the second element of the tuple returned by `createExtensible`.
 * Use this at module/plugin initialization time to register extensions.
 *
 * @typeParam TState - The state shape that flows through transformers
 */
export interface Extensible<TState> extends ExtensionPointConfig {
  /**
   * The underlying extension point.
   * Use this for advanced scenarios requiring direct pipeline access.
   */
  readonly extension: ExtensionPoint<TState>;

  /**
   * Extend the state with a partial update or transformer function.
   *
   * Two forms are supported:
   *
   * 1. **Partial object** - Merged into state unconditionally:
   *    ```typescript
   *    feature.extend({ label: 'New Label', count: 5 });
   *    ```
   *
   * 2. **Transformer function** - Receives state, returns partial to merge:
   *    ```typescript
   *    feature.extend(state => ({
   *      component: state.mode === 'code' ? CodeEditor : state.component,
   *    }));
   *    ```
   *
   * In both cases, you never need to spread state - the framework handles
   * deep merging automatically.
   *
   * @param input - Partial state object or transformer function
   */
  extend(input: ExtendInput<TState>): void;
}

/**
 * Create an extensible hook with ergonomic extension API.
 *
 * This is the primary way for plugin authors to define extension points.
 * It wraps `defineExtension` with:
 *
 * - A React hook for use in components
 * - An `extend()` method that handles deep merging automatically
 * - No need to spread state in transformers
 *
 * ## Defining an Extension Point
 *
 * ```typescript
 * export interface MyFeatureState {
 *   items: string[];
 *   component?: ComponentType<any>;
 * }
 *
 * export const [useMyFeature, myFeature] = createExtensible<
 *   { formId: string },
 *   MyFeatureState
 * >({
 *   id: 'myPlugin.myFeature',
 *   summary: 'Customize my feature',
 *   initial: (opts) => ({
 *     items: ['default'],
 *     component: undefined,
 *   }),
 * });
 * ```
 *
 * ## Using in Components
 *
 * ```typescript
 * function MyComponent({ formId }) {
 *   const { items, component: Component } = useMyFeature({ formId });
 *   // ...
 * }
 * ```
 *
 * ## Extending (from other plugins)
 *
 * ```typescript
 * // Simple partial - always applied
 * myFeature.extend({ items: ['custom'] });
 *
 * // Transformer - conditional logic, but still no spreading
 * myFeature.extend(state => ({
 *   component: state.mode === 'custom' ? CustomComponent : state.component,
 * }));
 * ```
 *
 * @typeParam TOptions - Options passed to the hook
 * @typeParam TState - The state shape (must be an object)
 * @param config - Configuration including id, summary, and initial state factory
 * @returns Tuple of [hook, extension] - hook for components, extension for registration
 */
export function createExtensible<TOptions, TState extends object>(
  config: ExtensibleConfig<TOptions, TState>,
): [ExtensibleHook<TOptions, TState>, Extensible<TState>] {
  // Create the underlying extension point with (T) => T transformers
  const extension = defineExtension<TState>({ id: config.id, summary: config.summary });

  /**
   * Normalize user input to a (T) => T transformer.
   * Handles both partial objects and transformer functions.
   */
  function normalizeExtendInput(input: ExtendInput<TState>): (state: TState) => TState {
    return (state: TState): TState => {
      // Get the partial - either directly or by calling the function
      const partial = typeof input === 'function' ? input(state) : input;
      // Deep merge the partial into state
      return deepMerge(state, partial);
    };
  }

  /**
   * The hook function - for use in React components.
   */
  function useExtensible(options: TOptions): TState {
    // useMemo dependencies: we need to re-run when options change
    // The pipeline itself is stable (registered once at startup)
    //
    // biome-ignore lint/correctness/useExhaustiveDependencies: static config
    return useMemo(() => {
      const initial = config.initial(options);
      return extension.transform(initial);
      // Note: options object identity may change, but we want to recompute
      // when the *contents* change. For complex options, caller should memoize.
    }, [options]);
  }

  /**
   * Extend the state with a partial or transformer.
   */
  function extend(input: ExtendInput<TState>): void {
    extension.extend(normalizeExtendInput(input));
  }

  // The extension object - for use at module/plugin initialization
  const extensible: Extensible<TState> = {
    extend,
    extension,
    id: config.id,
    summary: config.summary,
  };

  // Return tuple: [hook for components, extension for registration]
  return [useExtensible, extensible];
}
