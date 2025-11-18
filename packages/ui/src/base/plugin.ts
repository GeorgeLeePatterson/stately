import type { AnyPaths, OperationBindings } from '@stately/schema/api';
import type { AnyRecord, NeverRecord } from '@stately/schema/helpers';
import type { StatelySchemas } from '@stately/schema/schema';
import type { ComponentType } from 'react';
import type { TypedOperations } from './api';

/**
 * Define utility functions for a plugin.
 */
export type DefineUiUtils<T extends PluginFunctionMap = PluginFunctionMap> = T;

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
  Paths extends AnyPaths,
  Ops extends OperationBindings<Paths, any>,
  Utils extends PluginFunctionMap = PluginFunctionMap,
> {
  api?: TypedOperations<Paths, Ops>;
  utils?: PluginUtils<Utils>;
}

/**
 * UI PLUGIN - Plugin Type Distribution
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
 *
 * Does NOT reference Schema or Paths - describes what the plugin contributes.
 * The runtime instantiates PluginRuntime with the user's Paths via MergeUiAugments.
 */
export type UiPlugin<
  Name extends string,
  Paths extends AnyPaths,
  Ops extends OperationBindings<any, any>,
  Utils extends PluginFunctionMap = PluginFunctionMap,
> = { name: Name; paths: Paths; ops: Ops; utils?: PluginUtils<Utils> };

export type AnyUiPlugin = UiPlugin<string, any, any, any>;

/**
 * Merge augments into a type-safe plugin map.
 * Extracts the Name from each UiAugment and uses it as a key in the result.
 *
 * Takes Schema to extract Paths, then instantiates PluginRuntime with those Paths.
 * Processes right-to-left (...Rest, Last) to enable incremental type addition.
 *
 * MergeUiAugments<Schema, [...Base, New]> = MergeUiAugments<Schema, Base> & { [New.name]: ... }
 */
export type MergeUiAugments<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[],
> = Augments extends readonly [
  ...infer Rest extends readonly AnyUiPlugin[],
  infer Last extends AnyUiPlugin,
]
  ? MergeUiAugments<Schema, Rest> &
      (Last extends UiPlugin<infer Name, infer Paths, infer Ops, infer Utils>
        ? {
            [K in Name]: PluginRuntime<Paths, Ops, Utils>;
          }
        : AnyRecord)
  : NeverRecord;

/**
 * Extract the merged plugin record type from an augments array.
 * Distributes each augment's contribution into a single type-safe record.
 */
export type AugmentPlugins<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[],
> = MergeUiAugments<Schema, Augments>;
