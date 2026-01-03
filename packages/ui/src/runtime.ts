/**
 * Low-level StatelyUi runtime configuration and builder.
 *
 * This module provides the base runtime types and factory function for
 * creating a StatelyUi instance **without** the core plugin. These are
 * intended for plugin authors and advanced use cases.
 *
 * ## For Most Users
 *
 * **Use `statelyUi` from `@statelyjs/stately` instead.** It includes the
 * core plugin automatically and provides a simpler API:
 *
 * ```typescript
 * import { statelyUi } from '@statelyjs/stately';
 *
 * const runtime = statelyUi<MySchemas>({
 *   schema,
 *   client,
 *   options: { api: { pathPrefix: '/api/v1' } }
 * });
 * ```
 *
 * ## For Plugin Authors
 *
 * Use `createStatelyUi` when building plugins that need to work with
 * the base runtime before the core plugin is applied:
 *
 * ```typescript
 * import { createStatelyUi } from '@statelyjs/ui/runtime';
 *
 * const baseRuntime = createStatelyUi<MySchemas, [MyPlugin]>({
 *   schema,
 *   client,
 *   options: {}
 * }).withPlugin(myPlugin());
 * ```
 *
 * @module runtime
 */

import type { StatelySchemas } from '@statelyjs/schema';
import type { Stately } from '@statelyjs/schema/stately';
import type { Client } from 'openapi-fetch';
import { devLog } from './lib/logging';
import type { AllUiPlugins, AnyUiPlugin, UiPluginFactory } from './plugin';
import type { UiRegistry } from './registry';
import type { ThemeProviderProps } from './theme';
import { runtimeUtils, type UiUtils } from './utils';

/**
 * App-wide configuration options for StatelyUi.
 *
 * Configure API path prefixes, navigation structure, and theme settings.
 * These options are available throughout the application via context.
 *
 * @example
 * ```typescript
 * const options: UiOptions = {
 *   api: { pathPrefix: '/api/v1' },
 *   navigation: {
 *     basePath: 'app',
 *     routes: {
 *       label: 'Application',
 *       to: '/',
 *       items: [{
 *         icon: Cog,
 *         label: 'Pipelines',
 *         to: '/pipelines',
 *       }]
 *     },
 *     routeOverrides: {
 *       ['/entities/source']: {
 *         icon: Cog,
 *         label: 'Source',
 *         to: '/source-driver',
 *       }
 *     }
 *   },
 *   theme: { defaultTheme: 'dark' }
 * };
 * ```
 */
export interface UiOptions {
  /** API configuration options */
  api?: {
    /** Path prefix prepended to all API calls */
    pathPrefix?: string;
  };
  /** Navigation configuration for sidebar and routing */
  navigation?: UiNavigationOptions;
  /** Theme configuration for light/dark mode */
  theme?: {
    /** Set to true to disable the theme provider */
    disabled?: boolean;
  } & Partial<Omit<ThemeProviderProps, 'children'>>;
}

/**
 * Route and navigation option for an individual route.
 *
 * Primarily represented in the application's navigation but may be used elsewhere.
 */
export interface RouteOption {
  icon?: React.ComponentType<any>;
  label: string;
  to: string;
  badge?: React.ComponentType<Omit<RouteOption, 'badge'>> | null;
}

/**
 * Navigation configuration for the application.
 *
 * Controls the sidebar navigation structure, base paths for links,
 * and allows overriding plugin-provided routes.
 */
export interface UiNavigationOptions {
  /** Base path prepended to all navigation links */
  basePath?: string;
  /** Primary navigation routes displayed in the sidebar */
  routes?: { items?: RouteOption[] } & RouteOption;
  /**
   * Override specific route configurations by path.
   *
   * Keys are the original `to` path, values are the replacement route config.
   * Useful for customizing plugin-provided navigation items.
   *
   * @example
   * ```typescript
   * routeOverrides: {
   *   '/entities/user': {
   *     icon: UserIcon,
   *     label: 'Team Members',
   *     to: '/team'
   *   }
   * }
   * ```
   */
  routeOverrides?: Record<string, RouteOption>;
}

/**
 * Default UI options applied when not specified.
 */
export const defaultUiOptions: UiOptions = { api: {}, navigation: {}, theme: { disabled: false } };

/**
 * Core configuration required to create a StatelyUi runtime.
 *
 * @typeParam Schema - The application's StatelySchemas type
 */
export interface StatelyUiConfiguration<Schema extends StatelySchemas<any, any>> {
  /** The Stately schema instance containing type definitions */
  schema: Stately<Schema>;
  /** An openapi-fetch client for making API calls */
  client: Client<Schema['config']['paths']>;
  /** UI configuration options */
  options: UiOptions;
}

/**
 * Plugin-provided runtime additions.
 *
 * Contains the component registry, utility functions, and plugin instances
 * that are added to the runtime through plugins.
 *
 * @typeParam Schema - The application's StatelySchemas type
 * @typeParam Augments - Tuple of plugin types that are installed
 */
export interface UiPluginRuntime<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[] = readonly [],
> {
  /** Component and transformer registry for dynamic rendering */
  registry: UiRegistry;
  /** Utility functions available throughout the application */
  utils: UiUtils;
  /** Installed plugins accessible by name */
  plugins: AllUiPlugins<Schema, Augments>;
}

/**
 * The complete StatelyUi runtime.
 *
 * Combines the base configuration with plugin-provided runtime additions.
 * This is what gets passed to the StatelyUiProvider and is accessible
 * via the useStatelyUi hook.
 *
 * @typeParam Schema - The application's StatelySchemas type
 * @typeParam Augments - Tuple of plugin types that are installed
 *
 * @example
 * ```typescript
 * // Access runtime in components
 * const runtime = useStatelyUi();
 * runtime.schema // Schema instance
 * runtime.client // API client
 * runtime.plugins.core // Core plugin
 * runtime.registry // Component registry
 * ```
 */
export interface StatelyUiRuntime<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[] = readonly [],
> extends Readonly<StatelyUiConfiguration<Schema>>,
    UiPluginRuntime<Schema, Augments> {}

/**
 * Builder interface for constructing a StatelyUi runtime.
 *
 * Extends the runtime with `withPlugin()` for chaining plugin installation.
 * After all plugins are added, the builder can be used as the runtime.
 *
 * @typeParam Schema - The application's StatelySchemas type
 * @typeParam Augments - Tuple of plugin types that will be installed
 */
export interface StatelyUiBuilder<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[] = readonly [],
> extends StatelyUiRuntime<Schema, Augments> {
  /**
   * Install a plugin into the runtime.
   *
   * @param plugin - Plugin factory function
   * @returns Builder with the plugin installed
   */
  withPlugin(plugin: UiPluginFactory<Schema, Augments>): StatelyUiBuilder<Schema, Augments>;
}

/**
 * Create a new base StatelyUi runtime builder (without core plugin).
 *
 * This is a **low-level API** for plugin authors and advanced use cases.
 * It returns a builder that allows chaining plugin installations via `withPlugin()`.
 *
 * ## For Most Users
 *
 * **Use `statelyUi` from `@statelyjs/stately` instead**, which includes
 * the core plugin automatically:
 *
 * ```typescript
 * import { statelyUi } from '@statelyjs/stately';
 *
 * const runtime = statelyUi<MySchemas>({ schema, client, options });
 * ```
 *
 * ## For Plugin Authors
 *
 * Use this when you need the base runtime without core:
 *
 * @typeParam Schema - The application's StatelySchemas type
 * @typeParam Augments - Tuple of plugin types that will be installed
 *
 * @param config - Core configuration with schema, client, and options
 * @returns A builder for installing plugins and creating the runtime
 *
 * @example
 * ```typescript
 * import { createStatelyUi } from '@statelyjs/ui';
 *
 * const baseRuntime = createStatelyUi<MySchemas, [MyPlugin]>({
 *   schema,
 *   client,
 *   options: {}
 * }).withPlugin(myPlugin());
 * ```
 */
export function createStatelyUi<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[] = readonly [],
>({
  schema,
  client,
  options,
}: Readonly<StatelyUiConfiguration<Schema>>): StatelyUiBuilder<Schema, Augments> {
  devLog.debug('Base', 'initializing w/ options: ', { defaultUiOptions, options });

  function makeBuilder(
    state: StatelyUiRuntime<Schema, Augments>,
  ): StatelyUiBuilder<Schema, Augments> {
    return logRuntime({
      ...state,
      withPlugin(plugin: UiPluginFactory<Schema, Augments>): StatelyUiBuilder<Schema, Augments> {
        const nextState = plugin(state);
        devLog.debug('Base', 'merged w/ state: ', { state: nextState });
        return makeBuilder({ ...nextState, utils: runtimeUtils(nextState.plugins) });
      },
    });
  }

  return makeBuilder({
    client,
    options: { ...defaultUiOptions, ...(options ?? {}) },
    plugins: {} as AllUiPlugins<Schema, Augments>,
    registry: { components: new Map() },
    schema,
    utils: runtimeUtils({}),
  });
}

const logRuntime = <S extends StatelyUiBuilder<any, any>>(runtime: S): S => {
  const { withPlugin: _, ...rest } = runtime;
  devLog.log('Base', 'created new runtime', { runtime: rest });
  return runtime;
};
