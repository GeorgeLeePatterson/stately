import type { EmptyRecord } from '@stately/schema/helpers';
import type { ComponentType } from 'react';
import type { AnyBaseSchemas, BaseSchemas } from '@/base';
import type { EditFieldProps } from '@/base/form/field-edit';
import type { ViewFieldProps } from '@/base/form/field-view';
import type { DefineOperationMap, HttpBundle } from './operations';

/**
 * =============================================================================
 * REGISTRY TYPES
 * =============================================================================
 */

export type RegistryMode = 'edit' | 'view';
export type RegistryKey = `${string}::${RegistryMode}` | `${string}::${RegistryMode}::${string}`;

export type NodeTypeComponent<S extends AnyBaseSchemas = BaseSchemas> =
  | ComponentType<EditFieldProps<S>>
  | ComponentType<ViewFieldProps<S>>;

export function makeRegistryKey(
  node: string,
  mode: RegistryMode,
  discriminator?: string,
): RegistryKey {
  return discriminator ? `${node}::${mode}::${discriminator}` : `${node}::${mode}`;
}

export function splitRegistryKey(key: RegistryKey): {
  node: string;
  mode: RegistryMode;
  discriminator?: string;
} {
  const [node, mode, discriminator] = key.split('::');
  return { discriminator, mode: mode as RegistryMode, node };
}

/**
 * =============================================================================
 * PLUGIN RUNTIME DESCRIPTOR
 * =============================================================================
 */

export type PluginFunction = (...args: any[]) => unknown;
export type PluginFunctionMap = Record<string, PluginFunction>;

export type PluginUtils<Utils extends PluginFunctionMap = PluginFunctionMap> = Utils & {
  getNodeTypeIcon?: (node: string) => ComponentType<any> | null;
};

export interface PluginRuntime<
  Schema extends AnyBaseSchemas = BaseSchemas,
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
 * UI augment contributed by a plugin. The Name parameter identifies which schema
 * augment this UI plugin corresponds to. This ensures schema.utils[Name] and
 * runtime.plugins[Name] use the SAME key for perfect alignment.
 *
 * Pattern matches PluginAugment structure: Name is both a type parameter AND
 * a property. The type parameter is used for type distribution (infer Name),
 * while the property provides structural consistency. Plugin authors must use
 * the SAME constant for both PluginAugment and UiAugment.
 */

export type UiAugment<
  Name extends string,
  Schema extends AnyBaseSchemas = BaseSchemas,
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
  Schema extends AnyBaseSchemas,
  Augments extends readonly UiAugment<string, Schema, any, any>[],
> = Augments extends readonly [
  ...infer Rest extends readonly UiAugment<string, Schema, any, any>[],
  infer Last extends UiAugment<string, Schema, any, any>,
]
  ? MergeUiAugments<Schema, Rest> &
      (Last extends UiAugment<infer Name, Schema, infer Ops, infer Utils>
        ? { [K in Name]: PluginRuntime<Schema, Ops, Utils> }
        : EmptyRecord)
  : EmptyRecord;

/**
 * Extract the merged plugin record type from an augments array.
 * Distributes each augment's contribution into a single type-safe record.
 */
export type AugmentPlugins<
  Schema extends AnyBaseSchemas,
  Augments extends readonly UiAugment<string, Schema, any, any>[],
> = MergeUiAugments<Schema, Augments>;

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
 * @deprecated Use UiAugment directly
 */
export type StatelyUiPluginDescriptor<
  Schema extends AnyBaseSchemas = BaseSchemas,
  Ops extends DefineOperationMap = DefineOperationMap,
  Utils extends PluginFunctionMap = PluginFunctionMap,
> = PluginRuntime<Schema, Ops, Utils>;
