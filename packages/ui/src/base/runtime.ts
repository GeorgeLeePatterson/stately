import type { StatelySchemas } from '@stately/schema/schema';
import type { Stately } from '@stately/schema/stately';
import type { Client } from 'openapi-fetch';
import type { RouteOption } from './layout/navigation';
import { devLog } from './lib/utils';
import type { AllUiPlugins, AnyUiPlugin, UiPluginFactory } from './plugin';
import type { UiRegistry } from './registry';
import type { ThemeProviderProps } from './theme';
import { runtimeUtils, type UiUtils } from './utils';

/**
 * App-wide configuration, available via context
 *
 * @example
 * ```
 * const options = {
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
 *   }
 * }
 * ```
 */
export interface UiOptions {
  api?: { pathPrefix?: string };
  navigation?: UiNavigationOptions;
  theme?: { disabled?: boolean } & Partial<Omit<ThemeProviderProps, 'children'>>;
}

export interface UiNavigationOptions {
  /**
   * Base path to be prepended to all links
   */
  basePath?: string;
  /**
   * Any non-plugin routes to include throughout the application
   */
  routes?: { items?: RouteOption[] } & RouteOption;
  /**
   * Override any route configuration by specifying new mapping keyed by 'to', aka link.
   * This is useful for overriding automatic plugin provided routes.
   */
  routeOverrides?: Record<string, RouteOption>;
}

/**
 * Default app-wide configuration
 */
export const defaultUiOptions: UiOptions = { api: {}, navigation: {}, theme: { disabled: false } };

/**
 * Core StatelyUi configuration
 */
export interface StatelyUiConfiguration<Schema extends StatelySchemas<any, any>> {
  schema: Stately<Schema>;
  client: Client<Schema['config']['paths']>;
  options: UiOptions;
}

export interface UiPluginRuntime<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[] = readonly [],
> {
  registry: UiRegistry;
  utils: UiUtils;
  plugins: AllUiPlugins<Schema, Augments>;
}

/**
 * StatelyUi runtime type with augment-based plugin distribution.
 *
 * The Augments array drives type-safe plugin access via AugmentPlugins.
 * Each augment's Name becomes a key in the plugins record with full intellisense.
 */
export interface StatelyUiRuntime<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[] = readonly [],
> extends Readonly<StatelyUiConfiguration<Schema>>,
    UiPluginRuntime<Schema, Augments> {}

/**
 * StatelyUiBuilder provides the withPlugin chaining API.
 * Augments are declared upfront; withPlugin() populates runtime data.
 */
export interface StatelyUiBuilder<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[] = readonly [],
> extends StatelyUiRuntime<Schema, Augments> {
  withPlugin(plugin: UiPluginFactory<Schema, Augments>): StatelyUiBuilder<Schema, Augments>;
}

/**
 * Initialize StatelyUi builder with declared augments.
 * Augments type parameter specifies expected plugins upfront.
 *
 * @example
 * ```typescript
 * statelyUi<MySchemas, readonly [CoreUiPlugin<MySchemas>]>(schema, client, options)
 *   .withPlugin(coreUiPlugin());
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
        devLog.debug('merged w/ state: ', { state: nextState });
        return makeBuilder({ ...nextState, utils: runtimeUtils(nextState.plugins) });
      },
    });
  }

  return makeBuilder({
    client,
    options: { ...defaultUiOptions, ...options },
    plugins: {} as AllUiPlugins<Schema, Augments>,
    registry: { components: new Map(), functions: new Map(), transformers: new Map() },
    schema,
    utils: runtimeUtils({}),
  });
}

const logRuntime = <S extends StatelyUiBuilder<any, any>>(runtime: S): S => {
  const { withPlugin: _, ...rest } = runtime;
  devLog.log('Base', 'created new runtime', { runtime: rest });
  return runtime;
};
