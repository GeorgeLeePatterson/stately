import type { StatelyConfig } from '@stately/schema/generated';
import type { AnyRecord, NeverRecord } from '@stately/schema/helpers';
import type { StatelySchemas } from '@stately/schema/schema';
import type { ComponentType } from 'react';
import type { EditFieldProps } from '@/base/form/field-edit';
import type { ViewFieldProps } from '@/base/form/field-view';
import type { DefineOperationMap, HttpBundle } from './operations';

/**
 * =============================================================================
 * REGISTRY TYPES
 * =============================================================================
 */

/** Registry modes */
export type RegistryMode = 'edit' | 'view';
export type RegistryType = 'component' | 'transformer';
/** Registry keys */
export type RegistryKey =
  | `${string}::${RegistryMode}` // Same as w/ 'component'
  | `${string}::${RegistryMode}::${RegistryType}`
  | `${string}::${RegistryMode}::${RegistryType}::${string}`;

/** The types of components registered into the component registry */
export type NodeTypeComponent<
  S extends StatelySchemas<any, any> = StatelySchemas<StatelyConfig, []>,
> = ComponentType<EditFieldProps<S>> | ComponentType<ViewFieldProps<S>>;

/** Helper to easily create a registry key */
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
 * =============================================================================
 * PLUGIN AUTHOR HELPERS
 * =============================================================================
 */

/**
 * Define operation map for a plugin.
 */
export type DefineUiOperations<T extends DefineOperationMap = DefineOperationMap> = T;

/**
 * Define utility functions for a plugin.
 */
export type DefineUiUtils<T extends PluginFunctionMap = PluginFunctionMap> = T;

/**
 * =============================================================================
 * PLUGIN RUNTIME DESCRIPTOR
 * =============================================================================
 */

/**
 * Generic plugin function
 */
export type PluginFunction = (...args: any[]) => unknown;

/**
 * Plugin function map
 */
export type PluginFunctionMap = Record<string, PluginFunction>;

/**
 * Base plugin utilities.
 *
 * The utilities here will delegate to each plugin's runtime.
 */
export type PluginUtils<Utils extends PluginFunctionMap = PluginFunctionMap> = Utils & {
  getNodeTypeIcon?: (node: string) => ComponentType<any> | null;
};

export interface PluginRuntime<
  Schema extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  Ops extends DefineOperationMap = DefineOperationMap,
  Utils extends PluginFunctionMap = PluginFunctionMap,
> {
  api?: HttpBundle<Schema, Ops>;
  utils?: PluginUtils<Utils>;
}

/**
 * =============================================================================
 * UI AUGMENT - Plugin Type Distribution
 * =============================================================================
 *
 * IMPORTANT: Prefer `DefineUiPlugin` if declaring a UI plugin's augment.
 *
 * UI augment contributed by a plugin. The Name parameter identifies which schema
 * augment this UI plugin corresponds to. This ensures schema.utils[Name] and
 * runtime.plugins[Name] use the SAME key for perfect alignment.
 *
 * Pattern matches PluginAugment structure: Name is both a type parameter AND
 * a property. The type parameter is used for type distribution (infer Name),
 * while the property provides structural consistency. Plugin authors must use
 * the SAME constant for both PluginAugment and UiAugment.
 */

export type UiPluginAugment<
  Name extends string,
  Schema extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  Ops extends DefineOperationMap = DefineOperationMap,
  Utils extends PluginFunctionMap = PluginFunctionMap,
> = { name: Name; api?: HttpBundle<Schema, Ops>; utils?: PluginUtils<Utils> };

/**
 * Merge augments into a type-safe plugin map.
 * Extracts the Name from each UiAugment and uses it as a key in the result.
 *
 * CRITICAL: Processes right-to-left (...Rest, Last) instead of left-to-right
 * (First, ...Rest). This enables TypeScript to see that appending an augment
 * to the tuple produces an incremental type addition, allowing plugin factories
 * to type-check without assertions.
 *
 * MergeUiAugments<[...Base, New]> = MergeUiAugments<Base> & { [New.name]: ... }
 */
export type MergeUiAugments<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly UiPluginAugment<string, Schema, any, any>[],
> = Augments extends readonly [
  ...infer Rest extends readonly UiPluginAugment<string, Schema, any, any>[],
  infer Last extends UiPluginAugment<string, Schema, any, any>,
]
  ? MergeUiAugments<Schema, Rest> &
      (Last extends UiPluginAugment<infer Name, Schema, infer Ops, infer Utils>
        ? { [K in Name]: PluginRuntime<Schema, Ops, Utils> }
        : AnyRecord)
  : NeverRecord;

/**
 * Extract the merged plugin record type from an augments array.
 * Distributes each augment's contribution into a single type-safe record.
 */
export type AugmentPlugins<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly UiPluginAugment<string, Schema, any, any>[],
> = MergeUiAugments<Schema, Augments>;
