import type { AnyPaths, OperationBindings } from '@statelyjs/schema/api';
import type { AnyRecord, EmptyRecord, RequireLiteral } from '@statelyjs/schema/helpers';
import type { StatelySchemas } from '@statelyjs/schema/schema';
import type { ComponentType } from 'react';
import type { TypedOperations } from './api';
import type { StatelyUiRuntime, UiNavigationOptions } from './runtime';
import type { UiUtils } from './utils';

/**
 * Plugin factory function signature.
 * Takes runtime and returns runtime with SAME augments type.
 * Augments are declared upfront; factories populate runtime data to match.
 *
 * Pattern matches @statelyjs/schema's PluginFactory.
 */
export type UiPluginFactory<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[] = readonly [],
> = (runtime: StatelyUiRuntime<Schema, Augments>) => StatelyUiRuntime<Schema, Augments>;

export type DeepPartialExtends<T extends object> = T extends ComponentType<any>
  ? T
  : T extends Record<string, any>
    ? {
        [K in keyof T]: DeepPartialExtends<T[K]>;
      } & Record<string, any>
    : T;

/**
 * Specify options for a plugin
 */
export type DefineOptions<T extends object = EmptyRecord> = T;

/**
 * Specify routes for a plugin
 */
export type DefineRoutes<T extends UiNavigationOptions['routes'] = UiNavigationOptions['routes']> =
  T;

/**
 * Public helper for declaring a ui plugin augment.
 *
 * Enforces string-literal names so downstream utilities preserve keyed plugins.
 * Plugin authors should export their augments defined with this type
 */
export type DefineUiPlugin<
  Name extends string,
  Paths extends AnyPaths,
  Ops extends OperationBindings<any, any>,
  Utils extends DefineUiUtils<object> = DefineUiUtils<any>,
  Options extends DefineOptions<any> = EmptyRecord,
  Routes extends DefineRoutes = DefineRoutes,
> = UiPlugin<
  RequireLiteral<Name, 'Plugin names must be string literals'>,
  Paths,
  Ops,
  Utils,
  Options,
  Routes
>;

/**
 * Generic plugin function
 */
export type PluginFunction = (...args: any[]) => unknown;

/**
 * Plugin function map
 */
export type PluginFunctionMap = Record<string, PluginFunction>;

/**
 * Define utility functions for a plugin.
 */
export type DefineUiUtils<T extends object = PluginFunctionMap> = T & Partial<UiUtils>;

export interface PluginRuntime<
  Paths extends AnyPaths,
  Ops extends OperationBindings<Paths, any>,
  Utils extends DefineUiUtils<any> = PluginFunctionMap,
  Options extends DefineOptions<any> = EmptyRecord,
  Routes extends DefineRoutes = DefineRoutes,
> {
  api?: TypedOperations<Paths, Ops>;
  utils?: Utils;
  options?: Options;
  routes?: Routes;
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
type UiPlugin<
  Name extends string,
  Paths extends AnyPaths,
  Ops extends OperationBindings<any, any>,
  Utils extends DefineUiUtils<any> = PluginFunctionMap,
  Options extends DefineOptions<any> = EmptyRecord,
  Routes extends DefineRoutes = DefineRoutes,
> = { name: Name; paths: Paths; ops: Ops; utils?: Utils; options?: Options; routes?: Routes };

export type AnyUiPlugin = UiPlugin<string, any, any, any, any, any>;
export type AnyUiAugments = readonly UiPlugin<string, any, any, any, any, any>[];

/**
 * Merge augments into a type-safe plugin map.
 * Extracts the Name from each UiAugment and uses it as a key in the result.
 */
export type MergeUiAugments<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[],
> = Augments extends readonly [
  ...infer Rest extends readonly AnyUiPlugin[],
  infer Last extends AnyUiPlugin,
]
  ? MergeUiAugments<Schema, Rest> &
      (Last extends UiPlugin<
        infer Name,
        infer Paths,
        infer Ops,
        infer Utils,
        infer Options,
        infer Routes
      >
        ? {
            [K in Name]: PluginRuntime<Paths, Ops, Utils, Options, Routes>;
          }
        : AnyRecord)
  : Record<string, PluginRuntime<any, any>>;

/**
 * Extract the merged plugin record type from an augments array.
 * Distributes each augment's contribution into a single type-safe record.
 */
export type AllUiPlugins<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[],
> = MergeUiAugments<Schema, Augments>;
