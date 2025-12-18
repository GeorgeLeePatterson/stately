/**
 * @statelyjs/ui Component & Transformer Registry
 *
 * The registry system enables dynamic component resolution based on schema node types.
 * When rendering a field, the form system looks up the appropriate component from the
 * registry using the node's type (e.g., 'string', 'object', 'array').
 *
 * ## How It Works
 *
 * Components and transformers are registered with composite keys:
 * - `{nodeType}::edit::component` - Edit component for a node type
 * - `{nodeType}::view::component` - View component for a node type
 * - `{nodeType}::edit::transformer::{state}` - Transform props before rendering
 *
 * ## For Plugin Authors
 *
 * Register custom components for your plugin's node types:
 *
 * ```typescript
 * import { registry, makeRegistryKey } from '@statelyjs/ui/registry';
 *
 * // In your plugin factory
 * function myPlugin(runtime) {
 *   // Register edit component for custom node type
 *   runtime.registry.components.set(
 *     makeRegistryKey('myCustomType', 'edit'),
 *     MyCustomEditComponent
 *   );
 *
 *   // Register view component
 *   runtime.registry.components.set(
 *     makeRegistryKey('myCustomType', 'view'),
 *     MyCustomViewComponent
 *   );
 *
 *   return runtime;
 * }
 * ```
 *
 * ## Transformers
 *
 * Transformers modify props before they reach a component. Useful for
 * adding computed values or reformatting data:
 *
 * ```typescript
 * runtime.registry.transformers.set(
 *   makeRegistryKey('string', 'edit', 'transformer', 'password'),
 *   (props) => ({ ...props, inputType: 'password' })
 * );
 * ```
 *
 * @packageDocumentation
 */

import type { PluginNodeUnion } from '@statelyjs/schema';
import type { StatelyConfig } from '@statelyjs/schema/generated';
import type { BaseNode } from '@statelyjs/schema/nodes';
import type { StatelySchemas } from '@statelyjs/schema/schema';
import type { ComponentType } from 'react';
import type { FieldEditProps } from '@/form/field-edit';
import type { FieldViewProps } from '@/form/field-view';

// ============================================================================
// Registry Types
// ============================================================================

/** Map of registry keys to React components. */
export type ComponentRegistry = Map<string, ComponentType<any>>;

/** Map of registry keys to transformer functions. */
export type TransformerRegistry = Map<string, Transformer<any>>;

/** Map of registry keys to utility functions. */
export type FunctionRegistry = Map<string, (...args: any[]) => any>;

/**
 * A transformer function that modifies props before they reach a component.
 *
 * @typeParam T - Input props type
 * @typeParam U - Output props type (defaults to T)
 */
export type Transformer<T, U = T> = (value: T) => U extends never ? T : U;

/**
 * The UI registry containing all registered components, transformers, and functions.
 *
 * Access via `runtime.registry` to register or retrieve components.
 */
export interface UiRegistry {
  /** Component registry - maps node types to React components */
  components: ComponentRegistry;
  /** Transformer registry - maps node types to prop transformers */
  transformers: TransformerRegistry;
  /** Function registry - maps keys to utility functions */
  functions: FunctionRegistry;
}

// ============================================================================
// Registry Keys
// ============================================================================

/** The mode for a registry entry: 'edit' for form inputs, 'view' for display. */
export type RegistryMode = 'edit' | 'view';

/** The type of registry entry: component or transformer. */
export type RegistryType = 'component' | 'transformer';

/**
 * A composite key for registry lookup.
 *
 * Format: `{nodeType}::{mode}::{type}::{state?}`
 *
 * @example
 * - `"string::edit::component"` - String edit component
 * - `"object::view::component"` - Object view component
 * - `"string::edit::transformer::password"` - Password transformer for strings
 */
export type RegistryKey =
  | `${string}::${RegistryMode}` // Same as w/ 'component'
  | `${string}::${RegistryMode}::${RegistryType}`
  | `${string}::${RegistryMode}::${RegistryType}::${string}`;

/**
 * Union type of all components that can be registered.
 */
export type NodeTypeComponent<
  S extends StatelySchemas<any, any> = StatelySchemas<StatelyConfig, []>,
> = ComponentType<FieldEditProps<S>> | ComponentType<FieldViewProps<S>>;

// ============================================================================
// Registry Helpers
// ============================================================================

/**
 * Create a registry key for component or transformer lookup.
 *
 * @param node - The node type name (e.g., 'string', 'object', 'myCustomType')
 * @param mode - 'edit' for form inputs, 'view' for display
 * @param discriminator - 'component' or 'transformer' (defaults to 'component')
 * @param state - Optional state discriminator for variants (e.g., 'password', 'multiline')
 *
 * @returns A formatted registry key
 *
 * @example
 * ```typescript
 * makeRegistryKey('string', 'edit'); // "string::edit::component"
 * makeRegistryKey('string', 'edit', 'transformer', 'password'); // "string::edit::transformer::password"
 * ```
 */
export function makeRegistryKey(
  node: string,
  mode: RegistryMode,
  discriminator: RegistryType = 'component',
  state?: string,
): RegistryKey {
  let key: RegistryKey = `${node}::${mode}::${discriminator}`;
  if (state) key = `${key}::${state}`;
  return key;
}

/**
 * Get a component from the registry by key.
 *
 * @param registry - The component registry
 * @param key - The registry key
 * @returns The component if found, undefined otherwise
 */
export function getComponent(registry: ComponentRegistry, key: string): unknown | undefined {
  const comp = registry.get(key);
  if (!comp) {
    console.error(`Component not found for key: ${key}`);
    return;
  }
  return comp;
}

/**
 * Get a transformer from the registry by key.
 *
 * @param registry - The transformer registry
 * @param key - The registry key
 * @returns The transformer function if found, undefined otherwise
 */
export function getTransformer<T>(
  registry: TransformerRegistry,
  key: string,
): Transformer<T> | undefined {
  const comp = registry.get(key);
  if (!comp) {
    console.error(`Transformer not found for key: ${key}`);
    return;
  }
  return comp as Transformer<T>;
}

/**
 * Get a component by building a key from path segments.
 *
 * @param registry - The component registry
 * @param node - The node type
 * @param path - Additional path segments to append
 */
export function getComponentByPath(
  registry: ComponentRegistry,
  node: string,
  path: string[],
): ComponentType<any> | undefined {
  return getComponent(registry, [node, ...path].join('::')) as ComponentType<any>;
}

/**
 * Get a transformer by building a key from path segments.
 *
 * @param registry - The transformer registry
 * @param node - The node type
 * @param path - Additional path segments to append
 */
export function getTransformerByPath<T>(
  registry: TransformerRegistry,
  node: string,
  path: string[],
): Transformer<any> | undefined {
  return getTransformer<T>(registry, [node, ...path].join('::')) as Transformer<T>;
}

/**
 * Get the edit component for a node type.
 *
 * Convenience wrapper around `getComponent` that builds the correct key.
 *
 * @param registry - The component registry
 * @param node - The node type name
 * @param state - Optional state discriminator
 * @returns The edit component if found
 *
 * @example
 * ```typescript
 * const StringEdit = getEditComponent(registry, 'string');
 * const PasswordEdit = getEditComponent(registry, 'string', 'password');
 * ```
 */
export function getEditComponent<
  S extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  N extends BaseNode = PluginNodeUnion<S>,
  V = unknown,
>(
  registry: ComponentRegistry,
  node: string,

  state?: string,
): ComponentType<FieldEditProps<S, N, V>> | undefined {
  return getComponent(registry, makeRegistryKey(node, 'edit', 'component', state)) as ComponentType<
    FieldEditProps<S, N, V>
  >;
}

/**
 * Get the view component for a node type.
 *
 * Convenience wrapper around `getComponent` that builds the correct key.
 *
 * @param registry - The component registry
 * @param node - The node type name
 * @param state - Optional state discriminator
 * @returns The view component if found
 */
export function getViewComponent<
  S extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  N extends BaseNode = PluginNodeUnion<S>,
  V = unknown,
>(
  registry: ComponentRegistry,
  node: string,
  state?: string,
): ComponentType<FieldViewProps<S, N, V>> | undefined {
  return getComponent(registry, makeRegistryKey(node, 'view', 'component', state)) as ComponentType<
    FieldViewProps<S, N, V>
  >;
}

// ============================================================================
// Transformer Props Types
// ============================================================================

/**
 * Props passed to an edit transformer function.
 *
 * Extends `FieldEditProps` with an optional `extra` object for custom data.
 */
export type TransformerEditProps<
  T extends {} = Record<string, any>,
  S extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  N extends BaseNode = PluginNodeUnion<S>,
  V = unknown,
> = FieldEditProps<S, N, V> & { extra?: T };

/**
 * Get an edit transformer for a node type.
 *
 * @param registry - The transformer registry
 * @param node - The node type name
 * @param state - Optional state discriminator
 * @returns The transformer function if found
 */
export function getEditTransformer<
  T extends {} = Record<string, any>,
  S extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  N extends BaseNode = PluginNodeUnion<S>,
  V = unknown,
>(
  registry: TransformerRegistry,
  node: N['nodeType'],
  state?: string,
): Transformer<TransformerEditProps<T, S, N, V>> | undefined {
  return getTransformer<TransformerEditProps<T, S, N, V>>(
    registry,
    makeRegistryKey(node, 'edit', 'transformer', state),
  );
}

/**
 * Props passed to a view transformer function.
 *
 * Extends `FieldViewProps` with an optional `extra` object for custom data.
 */
export type TransformerViewProps<
  T extends {} = Record<string, any>,
  S extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  N extends BaseNode = PluginNodeUnion<S>,
  V = unknown,
> = FieldViewProps<S, N, V> & { extra?: T };

/**
 * Get a view transformer for a node type.
 *
 * @param registry - The transformer registry
 * @param node - The node type name
 * @param state - Optional state discriminator
 * @returns The transformer function if found
 */
export function getViewTransformer<
  T extends {} = Record<string, any>,
  S extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  N extends BaseNode = PluginNodeUnion<S>,
  V = unknown,
>(
  registry: TransformerRegistry,
  node: string,
  state?: string,
): Transformer<TransformerViewProps<T, S, N, V>> | undefined {
  return getTransformer<TransformerViewProps<T, S, N, V>>(
    registry,
    makeRegistryKey(node, 'view', 'transformer', state),
  );
}
