/**
 * @statelyjs/ui Component & Transformer Registry
 *
 * The registry system enables dynamic component resolution based on schema node types.
 * When rendering a field, the form system looks up the appropriate component from the
 * registry using the node's type (e.g., 'string', 'object', 'array').
 *
 * ## How It Works
 *
 * Components are registered with composite keys:
 * - `{nodeType}::edit::component` - Edit component for a node type
 * - `{nodeType}::view::component` - View component for a node type
 *
 * ## For Plugin Authors
 *
 * Register custom components for your plugin's node types:
 *
 * ```typescript
 *
 * // In your plugin factory
 * export const myUiPlugin = createUiPlugin<MyUiPlugin>({
 *  name: PLUGIN_NAME,
 *  operations: PLUGIN_OPERATIONS,
 *
 *  setup: (ctx, options) => {
 *   // Register edit component for custom node type
 *   ctx.registerComponent('myCustomType', 'edit', MyCustomEditComponent);
 *
 *   // Register view component
 *   ctx.registerComponent('myCustomType', 'view', MyCustomViewComponent);
 *
 *   return {};
 * });
 * ```
 *
 * @packageDocumentation
 */

import type { PluginNodeUnion } from '@statelyjs/schema';
import type { StatelyConfig } from '@statelyjs/schema/generated';
import type { BaseNode } from '@statelyjs/schema/nodes';
import type { StatelySchemas } from '@statelyjs/schema/schema';
import type { ComponentType } from 'react';

// ============================================================================
// Registry Types
// ============================================================================

/**
 * Common interface for all 'view' type fields registered
 */
export interface FieldViewProps<
  S extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  N extends BaseNode = PluginNodeUnion<S>,
  V = unknown,
> {
  node: N;
  value: V;
}

/**
 * Common interface for all 'edit' type fields registered
 */
export interface FieldEditProps<
  S extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  N extends BaseNode = S['plugin']['AnyNode'],
  V = unknown,
> {
  formId: string;
  node: N;
  value?: V;
  onChange: (value: V) => void;
  label?: string;
  description?: string;
  placeholder?: string;
  isRequired?: boolean;
  isWizard?: boolean;
}

// TODO: Remove or use
// /** Map of registry keys to React components. */
// export type NodeTypeRegistry<S extends StatelySchemas<any, any>> = {
//   edit: Map<S['plugin']['NodeNames'], ComponentType<FieldEditProps<S>>>;
//   view: Map<S['plugin']['NodeNames'], ComponentType<FieldEditProps<S>>>;
// };

/** Map of registry keys to React components. */
export type ComponentRegistry = Map<string, ComponentType<any>>;

/**
 * A transformer function that modifies props before they reach a component.
 *
 * @typeParam T - Input props type
 * @typeParam U - Output props type (defaults to T)
 */
export type Transformer<T, U = T> = (value: T) => U extends never ? T : U;

// TODO: Remove - type parameter was meant for NodeTypeRegistry. Decide if it stays
/**
 * The UI registry containing all registered components, transformers, and functions.
 *
 * Access via `runtime.registry` to register or retrieve components.
 */
export interface UiRegistry<_Schema extends StatelySchemas<any, any>> {
  /** Component registry - maps node types to React components */
  components: ComponentRegistry;
}

// ============================================================================
// Registry Keys
// ============================================================================

/** The mode for a registry entry: 'edit' for form inputs, 'view' for display. */
export type RegistryMode = 'edit' | 'view';

/**
 * A composite key for registry lookup.
 *
 * Format: `{nodeType}::{mode}::{type}`
 *
 * @example
 * - `"string::edit::component"` - String edit component
 * - `"object::view::component"` - Object view component
 */
export type RegistryKey =
  | `${string}::${RegistryMode}` // Same as w/ 'component'
  | `${string}::${RegistryMode}::component`;

/**
 * Union type of all components that can be registered.
 */
export type NodeTypeComponent<
  S extends StatelySchemas<any, any> = StatelySchemas<StatelyConfig, []>,
> = ComponentType<FieldEditProps<S>> | ComponentType<FieldViewProps<S>>;

// ============================================================================
// Registry Helpers
// ============================================================================

// TODO: Remove - this is no longer needed, after registry is changed
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
export function makeRegistryKey(node: string, mode: RegistryMode): RegistryKey {
  return `${node}::${mode}::component`;
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
>(registry: ComponentRegistry, node: string): ComponentType<FieldEditProps<S, N, V>> | undefined {
  return getComponent(registry, makeRegistryKey(node, 'edit')) as ComponentType<
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
>(registry: ComponentRegistry, node: string): ComponentType<FieldViewProps<S, N, V>> | undefined {
  return getComponent(registry, makeRegistryKey(node, 'view')) as ComponentType<
    FieldViewProps<S, N, V>
  >;
}
