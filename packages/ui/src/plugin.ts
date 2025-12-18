/**
 * @statelyjs/ui Plugin System
 *
 * This module provides the type infrastructure for creating UI plugins that extend
 * the Stately runtime. Plugins can add:
 * - API operations (typed fetch clients)
 * - Utility functions
 * - Navigation routes
 * - Custom configuration options
 *
 * ## For Plugin Users
 *
 * Add plugins to your runtime using `withPlugin()`:
 *
 * ```typescript
 * import { statelyUi } from '@statelyjs/stately';
 * import { filesUiPlugin } from '@statelyjs/files';
 *
 * const runtime = statelyUi<MySchemas>({ ... })
 *   .withPlugin(filesUiPlugin({ api: { pathPrefix: '/files' } }));
 *
 * // Access plugin functionality
 * runtime.plugins.files.api.operations.listFiles({ ... });
 * runtime.plugins.files.utils.formatFileSize(1024);
 * ```
 *
 * ## For Plugin Authors
 *
 * 1. Define your plugin's type using `DefineUiPlugin`:
 *
 * ```typescript
 * import type { DefineUiPlugin, DefineOptions, DefineUiUtils } from '@statelyjs/ui/plugin';
 *
 * export type MyPlugin = DefineUiPlugin<
 *   'my-plugin',           // Unique plugin name (string literal)
 *   MyPaths,               // OpenAPI paths type
 *   typeof MY_OPERATIONS,  // Operation bindings
 *   MyUtils,               // Utility functions type
 *   MyOptions              // Configuration options type
 * >;
 * ```
 *
 * 2. Create a factory function that returns `UiPluginFactory`:
 *
 * ```typescript
 * import type { UiPluginFactory } from '@statelyjs/ui/plugin';
 *
 * export function myUiPlugin<S extends Schemas>(
 *   options?: MyOptions
 * ): UiPluginFactory<S, readonly [MyPlugin, ...any[]]> {
 *   return (runtime) => {
 *     const api = createOperations(runtime.client, MY_OPERATIONS, options?.api?.pathPrefix);
 *     return {
 *       ...runtime,
 *       plugins: {
 *         ...runtime.plugins,
 *         'my-plugin': { api, options, utils: myUtils },
 *       },
 *     };
 *   };
 * }
 * ```
 *
 * @packageDocumentation
 */

import type { StatelySchemas } from '@statelyjs/schema';
import type { AnyPaths, OperationBindings } from '@statelyjs/schema/api';
import type { AnyRecord, EmptyRecord, RequireLiteral } from '@statelyjs/schema/helpers';
import type { ComponentType } from 'react';
import type { TypedOperations } from './api';
import type { StatelyUiRuntime, UiNavigationOptions } from './runtime';
import type { UiUtils } from './utils';

// ============================================================================
// Plugin Factory
// ============================================================================

/**
 * Factory function type for creating UI plugins.
 *
 * A plugin factory receives the current runtime and returns an augmented runtime.
 * The `Augments` type parameter declares what plugins are available, allowing
 * TypeScript to provide full type inference for `runtime.plugins`.
 *
 * @typeParam Schema - The application's schema type
 * @typeParam Augments - Tuple of plugin types that will be available
 *
 * @example
 * ```typescript
 * const myPlugin: UiPluginFactory<MySchemas, [MyPlugin]> = (runtime) => {
 *   return {
 *     ...runtime,
 *     plugins: {
 *       ...runtime.plugins,
 *       'my-plugin': { api, utils, options },
 *     },
 *   };
 * };
 * ```
 */
export type UiPluginFactory<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[] = readonly [],
> = (runtime: StatelyUiRuntime<Schema, Augments>) => StatelyUiRuntime<Schema, Augments>;

/** @internal */
export type DeepPartialExtends<T extends object> = T extends ComponentType<any>
  ? T
  : T extends Record<string, any>
    ? {
        [K in keyof T]: DeepPartialExtends<T[K]>;
      } & Record<string, any>
    : T;

// ============================================================================
// Plugin Definition Helpers
// ============================================================================

/**
 * Define configuration options for a plugin.
 *
 * Wraps your options type to ensure proper typing in the plugin system.
 *
 * @typeParam T - Your options object type
 *
 * @example
 * ```typescript
 * type MyOptions = DefineOptions<{
 *   api?: { pathPrefix?: string };
 *   theme?: 'light' | 'dark';
 * }>;
 * ```
 */
export type DefineOptions<T extends object = EmptyRecord> = T;

/**
 * Define navigation routes for a plugin.
 *
 * Routes are automatically added to the sidebar navigation.
 *
 * @example
 * ```typescript
 * type MyRoutes = DefineRoutes<{
 *   label: 'My Plugin';
 *   to: '/my-plugin';
 *   icon: MyIcon;
 * }>;
 * ```
 */
export type DefineRoutes<T extends UiNavigationOptions['routes'] = UiNavigationOptions['routes']> =
  T;

/**
 * Define a UI plugin's type signature.
 *
 * This is the primary helper for plugin authors. It creates a type that describes
 * what your plugin contributes to the runtime: API operations, utilities, options,
 * and routes.
 *
 * The `Name` must be a string literal (not `string`) to ensure type-safe access
 * via `runtime.plugins[name]`.
 *
 * @typeParam Name - Unique plugin name (must be a string literal like `'files'`)
 * @typeParam Paths - OpenAPI paths type from your generated types
 * @typeParam Ops - Operation bindings object (use `typeof MY_OPERATIONS`)
 * @typeParam Utils - Utility functions type (optional)
 * @typeParam Options - Configuration options type (optional)
 * @typeParam Routes - Navigation routes type (optional)
 *
 * @example
 * ```typescript
 * // Define the plugin type
 * export type FilesUiPlugin = DefineUiPlugin<
 *   'files',                    // Plugin name - used as runtime.plugins.files
 *   FilesPaths,                 // OpenAPI paths
 *   typeof FILES_OPERATIONS,    // Operation bindings
 *   FilesUiUtils,               // Utility functions
 *   FilesOptions                // Configuration
 * >;
 *
 * // Use in factory function signature
 * export function filesUiPlugin(options?: FilesOptions): UiPluginFactory<S, [FilesUiPlugin]>
 * ```
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
 * Any function that can be a plugin utility.
 */
export type PluginFunction = (...args: any[]) => unknown;

/**
 * Map of plugin utility functions.
 */
export type PluginFunctionMap = Record<string, PluginFunction>;

/**
 * Define utility functions for a plugin.
 *
 * Utilities are accessible via `runtime.plugins[name].utils`.
 * They can optionally extend the base `UiUtils` interface.
 *
 * @typeParam T - Object type containing your utility functions
 *
 * @example
 * ```typescript
 * type MyUtils = DefineUiUtils<{
 *   formatData: (data: RawData) => FormattedData;
 *   validateInput: (input: string) => boolean;
 * }>;
 * ```
 */
export type DefineUiUtils<T extends object = PluginFunctionMap> = T & Partial<UiUtils>;

// ============================================================================
// Plugin Runtime
// ============================================================================

/**
 * Runtime data contributed by an instantiated plugin.
 *
 * This is what gets stored in `runtime.plugins[name]` after a plugin factory runs.
 * It contains the actual API client, utility functions, and configuration.
 *
 * @typeParam Paths - OpenAPI paths type
 * @typeParam Ops - Operation bindings type
 * @typeParam Utils - Utility functions type
 * @typeParam Options - Configuration options type
 * @typeParam Routes - Navigation routes type
 */
export interface PluginRuntime<
  Paths extends AnyPaths,
  Ops extends OperationBindings<Paths, any>,
  Utils extends DefineUiUtils<any> = PluginFunctionMap,
  Options extends DefineOptions<any> = EmptyRecord,
  Routes extends DefineRoutes = DefineRoutes,
> {
  /** Typed API operations for this plugin */
  api?: TypedOperations<Paths, Ops>;
  /** Utility functions provided by this plugin */
  utils?: Utils;
  /** Configuration options passed to the plugin */
  options?: Options;
  /** Navigation routes registered by this plugin */
  routes?: Routes;
}

// ============================================================================
// Internal Plugin Types
// ============================================================================

/**
 * Internal type representing a UI plugin's contribution.
 *
 * @internal Use `DefineUiPlugin` instead when declaring plugin types.
 */
type UiPlugin<
  Name extends string,
  Paths extends AnyPaths,
  Ops extends OperationBindings<any, any>,
  Utils extends DefineUiUtils<any> = PluginFunctionMap,
  Options extends DefineOptions<any> = EmptyRecord,
  Routes extends DefineRoutes = DefineRoutes,
> = { name: Name; paths: Paths; ops: Ops; utils?: Utils; options?: Options; routes?: Routes };

/** Any UI plugin type (used for generic constraints). */
export type AnyUiPlugin = UiPlugin<string, any, any, any, any, any>;

/** Array of UI plugins (used for augments type parameter). */
export type AnyUiAugments = readonly UiPlugin<string, any, any, any, any, any>[];

/**
 * Merge multiple plugin augments into a single type-safe record.
 *
 * This recursive type extracts each plugin's name and creates a record
 * where `plugins[name]` returns the correctly typed `PluginRuntime`.
 *
 * @internal Used by the runtime to build the plugins record type.
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
 * Extract the complete plugins record type from an augments array.
 *
 * @internal Alias for `MergeUiAugments`.
 */
export type AllUiPlugins<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[],
> = MergeUiAugments<Schema, Augments>;
