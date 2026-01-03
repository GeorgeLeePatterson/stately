/**
 * Stately Plugin System.
 *
 * This module provides the infrastructure for creating UI plugins that extend
 * the Stately runtime. Plugins can add:
 * - API operations (typed fetch clients)
 * - Utility functions
 * - Navigation routes
 * - Custom components for node types
 * - Custom configuration options
 *
 * ## For Most Users
 *
 * Use `statelyUi` from `@statelyjs/stately` to create runtimes with the core
 * plugin included, then add additional plugins via `withPlugin()`:
 *
 * @example
 * ```typescript
 * import { statelyUi } from '@statelyjs/stately';
 * import { type FilesUiPlugin, filesUiPlugin } from '@statelyjs/files';
 *
 * const runtime = statelyUi<MySchemas, readonly [FilesUiPlugin]>({
 *   schema,
 *   client,
 *   options
 * }).withPlugin(filesUiPlugin({ api: { pathPrefix: '/files' } }));
 *
 * // Access plugin functionality
 * runtime.plugins.core.api.operations.list_entities(...); // Core plugin
 * runtime.plugins.files.api.operations.list_files(...);   // Files plugin
 * ```
 *
 * ## For Plugin Authors
 *
 * Use `createUiPlugin` to build plugins with an ergonomic API:
 *
 * 1. Define your plugin's type using `DefineUiPlugin`:
 *
 * @example
 * ```typescript
 * import type { DefineUiPlugin, DefineOptions } from '@statelyjs/ui';
 *
 * export type MyPlugin = DefineUiPlugin<
 *   'my-plugin',           // Unique plugin name (must be string literal)
 *   MyPaths,               // OpenAPI paths type (generated from Rust OpenAPI)
 *   typeof MY_OPERATIONS,  // Operation bindings (generated from Rust OpenAPI)
 *   MyUtils,               // Utility functions type
 *   MyOptions              // Configuration options type
 * >;
 * ```
 *
 * 2. Create the plugin factory using `createUiPlugin`:
 *
 * @example
 * ```typescript
 * import { createUiPlugin } from '@statelyjs/ui';
 *
 * export const myUiPlugin = createUiPlugin<MyPlugin>({
 *   name: 'my-plugin',
 *   operations: MY_OPERATIONS,
 *   routes: myDefaultRoutes,
 *   utils: myUtils,
 *
 *   setup: (ctx, options) => {
 *     // Register custom components
 *     ctx.registerComponent('MyNodeType', 'edit', MyEditComponent);
 *     ctx.registerComponent('MyNodeType', 'view', MyViewComponent);
 *
 *     // Extend extension points
 *     someExtension.extend(myTransformer);
 *
 *     return {};
 *   },
 * });
 * ```
 *
 * The `createUiPlugin` helper provides:
 * - **No manual spreading** - Return only what's being added
 * - **Automatic API creation** - Provide operations, get typed API
 * - **Simplified component registration** - `ctx.registerComponent()` handles keys
 * - **Path prefix merging** - Handled automatically
 * - **Single type parameter** - Derive everything from your `DefineUiPlugin` type
 *
 * @module plugin
 */

import type { StatelySchemas } from '@statelyjs/schema';
import type { AnyPaths, OperationBindings } from '@statelyjs/schema/api';
import type { AnyRecord, EmptyRecord, RequireLiteral } from '@statelyjs/schema/helpers';
import { createOperations, type TypedOperations } from './api';
import { devLog } from './lib/logging';
import type { ComponentRegistry, RegistryMode } from './registry';
import type { StatelyUiRuntime, UiNavigationOptions } from './runtime';
import { mergePathPrefixOptions, type UiUtils } from './utils';

// ============================================================================
// Plugin Factory
// ============================================================================

/**
 * Configuration for creating a UI plugin.
 *
 * @typeParam Plugin - The plugin type (extends AnyUiPlugin)
 */
export interface UiPluginConfig<Plugin extends AnyUiPlugin> {
  /**
   * Unique plugin name. Must match the name in your DefineUiPlugin type.
   *
   * @example FILES_PLUGIN_NAME, ARROW_PLUGIN_NAME
   */
  name: Plugin['name'];

  /**
   * Operation bindings for creating typed API operations.
   * If provided, the plugin will automatically create typed operations.
   */
  operations?: Plugin['ops'];

  /**
   * Default navigation routes for this plugin.
   * Can be overridden by user options.
   */
  routes?: Plugin['routes'];

  /** Static utility functions provided by this plugin */
  utils?: Plugin['utils'];

  /**
   * Setup function called when the plugin is installed.
   *
   * Receives a context object with access to the runtime and helpers.
   * Returns only the parts the plugin is adding - no spreading required.
   *
   * @param ctx - Plugin context with runtime access and helpers
   * @param options - User-provided options for this plugin
   * @returns The plugin's contributions (api, utils, routes)
   */
  setup: (
    ctx: UiPluginContext<StatelySchemas<any, any>, readonly [Plugin, ...AnyUiPlugin[]]>,
    options: Plugin['options'] | undefined,
  ) => UiPluginResult<Plugin>;
}

/**
 * The result returned from a plugin setup function.
 *
 * Plugins only return what they're adding - no need to spread runtime or plugins.
 * The framework handles merging automatically.
 *
 * @typeParam Plugin - The plugin type (extends AnyUiPlugin)
 */
export interface UiPluginResult<Plugin extends AnyUiPlugin> {
  /** Typed API operations (optional - created automatically if operations provided) */
  api?: TypedOperations<Plugin['paths'], Plugin['ops']>;
  /** Navigation routes for this plugin that might need access to runtime. */
  routes?: Plugin['routes'];
  /** Additional utility functions provided by this plugin that might need access to runtime */
  utils?: Plugin['utils'];
}

/**
 * Context provided to plugin setup functions.
 *
 * Gives plugins access to the runtime for reading configuration,
 * registering components, and accessing utilities.
 *
 * @typeParam Schema - The application's schema type
 */
export interface UiPluginContext<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[] = readonly [],
> {
  /**
   * Get a typed view of the runtime.
   *
   * Use this when you need access to runtime properties with proper typing.
   * The type parameter should match your plugin's schema requirements.
   */
  getRuntime<
    S extends StatelySchemas<any, any>,
    A extends readonly AnyUiPlugin[] = readonly [],
  >(): StatelyUiRuntime<S, A>;

  /** The openapi-fetch client for API calls */
  readonly client: StatelyUiRuntime<Schema, Augments>['client'];

  /** Resolved path prefix (merged from runtime and plugin options) */
  readonly pathPrefix: string;

  /**
   * Register a component for a node type.
   *
   * Simplified API that handles key generation automatically.
   *
   * @param nodeType - The node type name (e.g., 'RelativePath', 'Primitive')
   * @param mode - 'edit' or 'view'
   * @param component - The React component to register
   *
   * @example
   * ```typescript
   * ctx.registerComponent('RelativePath', 'edit', RelativePathEdit);
   * ctx.registerComponent('RelativePath', 'view', RelativePathView);
   * ```
   */
  registerComponent(
    nodeType: string,
    mode: RegistryMode,
    component: React.ComponentType<any>,
  ): void;

  /**
   * Direct access to the component registry for advanced use cases.
   */
  readonly registry: ComponentRegistry;
}

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
 * @see {@link createUiPlugin}
 */
export type UiPluginFactory<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[] = readonly [],
> = (runtime: StatelyUiRuntime<Schema, Augments>) => StatelyUiRuntime<Schema, Augments>;

/**
 * Configurable UI Plugin Factory Function.
 *
 * Called by end users to provide initial configuration to a plugin.
 * Returns a `UiPluginFactory` that passes through the augments unchanged.
 *
 * Users declare all plugins in their type parameters upfront, and the
 * factories simply operate on that declared type.
 */
export type UiPluginFactoryFn<Plugin extends AnyUiPlugin> = <
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[],
>(
  options?: Plugin['options'],
) => UiPluginFactory<Schema, Augments>;

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
 *   items: [
 *     // Any additional sub-routes
 *   ]
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
 * export function filesUiPlugin(options?: FilesOptions): UiPluginFactory<S, readonly [FilesUiPlugin]>
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
 *
 * @internal
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

/**
 * Create a UI plugin with ergonomic API.
 *
 * This helper wraps the low-level plugin pattern with:
 * - **No manual spreading** - Return only what you're adding
 * - **Automatic API creation** - Provide operations, get typed API
 * - **Simplified component registration** - `ctx.registerComponent()` instead of `makeRegistryKey`
 * - **Path prefix merging** - Handled automatically
 * - **Single type parameter** - Derive everything from your `DefineUiPlugin` type
 *
 * ## Example
 *
 * @example
 * ```typescript
 * import { createUiPlugin } from '@statelyjs/ui';
 *
 * // Define the plugin type (as before)
 * export type FilesUiPlugin = DefineUiPlugin<
 *   typeof FILES_PLUGIN_NAME,
 *   FilesPaths,
 *   typeof FILES_OPERATIONS,
 *   FilesUiUtils,
 *   FilesOptions,
 *   typeof filesRoutes
 * >;
 *
 * // Create the plugin factory with a single type parameter
 * export const filesUiPlugin = createUiPlugin<FilesUiPlugin>({
 *   name: FILES_PLUGIN_NAME,
 *   operations: FILES_OPERATIONS,
 *   defaultRoutes: filesRoutes,
 *
 *   setup: (ctx, options) => {
 *     // Register components - no makeRegistryKey needed
 *     ctx.registerComponent('RelativePath', 'edit', RelativePathEdit);
 *     ctx.registerComponent('RelativePath', 'view', RelativePathView);
 *
 *     // Extend other extension points
 *     stringModes.extend(filesStringExtension);
 *
 *     // Return only what you're adding - no spreading
 *     return { utils: filesUiUtils };
 *   },
 * });
 *
 * // Usage in user's application
 * const runtime = statelyUi({ ... })
 *   .withPlugin(filesUiPlugin({ api: { pathPrefix: '/files' } }));
 * ```
 *
 * @typeParam Plugin - The plugin type created with DefineUiPlugin
 *
 * @param {UiPluginConfig<Plugin>} config - Plugin configuration
 * @returns A factory function that accepts options and returns a UiPluginFactory
 */
export function createUiPlugin<Plugin extends AnyUiPlugin>(
  config: UiPluginConfig<Plugin>,
): UiPluginFactoryFn<Plugin> {
  return <Schema extends StatelySchemas<any, any>, Augments extends readonly AnyUiPlugin[]>(
    options?: Plugin['options'],
  ): UiPluginFactory<Schema, Augments> => {
    return (runtime: StatelyUiRuntime<Schema, Augments>): StatelyUiRuntime<Schema, Augments> => {
      devLog.debug(config.name, 'registering plugin', { options });

      // Merge path prefixes
      const basePathPrefix = runtime.options?.api?.pathPrefix;
      const pluginPathPrefix = options?.api?.pathPrefix;
      const pathPrefix = mergePathPrefixOptions(basePathPrefix, pluginPathPrefix);

      // Call setup function
      const result =
        config.setup(
          // Plugin context
          {
            client: runtime.client,
            getRuntime<S extends StatelySchemas<any, any>, A extends readonly AnyUiPlugin[]>() {
              return runtime as unknown as StatelyUiRuntime<S, A>;
            },
            pathPrefix,
            registerComponent(
              nodeType: string,
              mode: RegistryMode,
              component: React.ComponentType<any>,
            ) {
              const key = `${nodeType}::${mode}::component`;
              runtime.registry.components.set(key, component);
            },
            registry: runtime.registry.components,
          },
          options,
        ) ?? {};

      // Create API operations if operations config provided and not already created
      let api = result.api;
      if (!api && config.operations) {
        api = createOperations<Plugin['paths'], Plugin['ops']>(
          runtime.client,
          config.operations,
          pathPrefix,
        );
      }

      // Merge routes with defaults
      const routes = {
        ...(config.routes ?? {}),
        ...(result.routes ?? {}),
        ...(options?.navigation?.routes ?? {}),
      };

      // Merge runtime utils with static utils
      const utils = { ...(config.utils ?? {}), ...(result.utils ?? {}) };

      // Build plugin runtime
      const pluginRuntime: PluginRuntime<
        Plugin['paths'],
        Plugin['ops'],
        Plugin['utils'],
        Plugin['options'],
        Plugin['routes']
      > = { api, options, routes, utils };

      devLog.debug(config.name, 'registered plugin', { pathPrefix, pluginRuntime });

      // Return merged runtime
      return {
        ...runtime,
        plugins: {
          ...runtime.plugins,
          [config.name]: { api, options, routes, utils: result.utils },
        },
      };
    };
  };
}
