/** @import { ExtensionPoint } from "./extension" */
/**
 * Feature Plugin System
 *
 * Provides a user-friendly facade for enabling optional features that extend
 * Stately's functionality. Feature plugins wrap extension points with a simple
 * `.enable()` API and handle lazy loading of heavy dependencies.
 *
 * For details on the lower level extension apis, refer to the {@link ExtensionPoint} interface.
 *
 * @remarks
 * ## User-Facing Plugin API
 *
 * Feature plugins sit above the extension system and provides:
 * - Simple `.enable()` API for users
 * - Lazy loading of heavy components
 * - Dependency management between plugins
 * - `lazyComponent` for consuming lazy components
 *
 * ## For Users
 *
 * @example
 * ```typescript
 * import { codemirror } from '@statelyjs/stately/plugins';
 *
 * // Enable with defaults
 * codemirror.enable();
 *
 * // Or with options
 * codemirror.enable({
 *   themes: ['github', 'vscode'],
 *   languages: ['json', 'yaml', 'sql'],
 * });
 * ```
 *
 * ## For Plugin Authors
 *
 * @example
 * ```typescript
 * import { createFeaturePlugin } from '@statelyjs/ui/feature-plugin';
 * import { addStringModes } from './extensions';
 *
 * export const myPlugin = createFeaturePlugin({
 *   id: 'myPlugin',
 *   component: () => import('./heavy-component'),
 *   setup: (ctx, options) => {
 *     addStringModes.extend(state => ({
 *       component: state.mode === 'custom' ? ctx.Component : state.component,
 *     }));
 *   },
 * });
 * ```
 *
 * @module
 */

import { type ComponentType, type JSX, type LazyExoticComponent, lazy, Suspense } from 'react';

/**
 * Context passed to the setup function during plugin initialization.
 *
 * @typeParam TComponentProps - The component type that will be lazy loaded
 */
export interface FeaturePluginContext<TComponentProps> {
  /**
   * The lazy-wrapped component, ready for use in React.
   * This is `null` until `.enable()` is called.
   */
  Component: LazyExoticComponent<ComponentType<TComponentProps>> | null;

  /**
   * Whether the plugin has been enabled.
   */
  isEnabled: boolean;
}

/**
 * Configuration for creating a feature plugin.
 *
 * @typeParam TOptions - Options accepted by `.enable()`
 * @typeParam TComponentProps - Props type for the lazy-loaded component
 * @typeParam TExtras - Additional properties to expose on the plugin object
 */
export interface FeaturePluginConfig<TOptions, TComponentProps, TExtras extends object = never> {
  /**
   * Unique identifier for this plugin.
   *
   * @example 'codemirror'
   * @example 'markdown-editor'
   */
  id: string;

  /**
   * Dynamic import for the heavy component.
   * Only loaded when the plugin is enabled and the component is rendered.
   *
   * @example
   * ```typescript
   * component: () => import('@uiw/react-codemirror'),
   * ```
   */
  component?: () => Promise<{ default: ComponentType<TComponentProps> }>;

  /**
   * Setup function called once when `.enable()` is invoked.
   * Use this to register extensions, configure behavior, etc.
   *
   * Optionally return an object with additional properties (extras) that will
   * be spread onto the plugin object, making them accessible as `plugin.extraName`.
   *
   * @param ctx - Plugin context with lazy component and state
   * @param options - Options passed to `.enable()`
   * @returns Optional extras object to merge into the plugin
   *
   * @example
   * ```typescript
   * setup: (ctx, options) => {
   *   // Register extensions...
   *
   *   // Return extras that become plugin properties
   *   return {
   *     ToggledEditor: (props) => <MyToggled {...options} {...props} />,
   *   };
   * },
   * ```
   */
  setup: (ctx: FeaturePluginContext<TComponentProps>, options: TOptions) => TExtras | undefined;

  /**
   * Default options applied when `.enable()` is called without arguments.
   */
  defaults?: Partial<TOptions>;

  /**
   * Default extras if `.enable()` is never called.
   */
  defaultExtras: TExtras;
}

/**
 * A feature plugin instance with `.enable()`, `.lazyComponent`, and other APIs.
 *
 * @typeParam TOptions - Options accepted by `.enable()`
 * @typeParam TComponentProps - Props type for the lazy-loaded component
 * @typeParam TExtras - Extras object, initialized via `FeaturePluginConfig.defaultExtras` or `.setup()`.
 */
export interface FeaturePlugin<TOptions, TComponentProps, TExtras extends object = never> {
  /**
   * Unique identifier for this plugin.
   */
  readonly id: string;

  /**
   * Enable the plugin with optional configuration.
   *
   * This should be called once at application startup, before rendering.
   * Calling multiple times is safe (subsequent calls are no-ops).
   *
   * @param options - Plugin-specific configuration options
   *
   * @example
   * ```typescript
   * // In your app entry point
   * codemirror.enable({ themes: ['github'] });
   * ```
   */
  enable(options?: TOptions): void;

  /**
   * Check if the plugin has been enabled.
   */
  isEnabled(): boolean;

  /**
   * Getter to access the lazy-loaded component.
   *
   * Returns `null` if the plugin hasn't been enabled.
   * The component is wrapped with `React.lazy()` for automatic code splitting.
   *
   * @returns The lazy component or null if not enabled
   *
   * @example
   * ```typescript
   * function MyEditor(props) {
   *   const CodeMirror = codemirror.lazyComponent;
   *
   *   if (!CodeMirror) {
   *     return <div>CodeMirror not enabled</div>;
   *   }
   *
   *   return (
   *     <Suspense fallback={<Spinner />}>
   *       <CodeMirror {...props} />
   *     </Suspense>
   *   );
   * }
   * ```
   */
  lazyComponent: LazyExoticComponent<ComponentType<TComponentProps>> | null;

  /**
   * Get the options that were passed to `.enable()`.
   * Returns undefined if not enabled.
   */
  getOptions(): TOptions | undefined;

  /**
   * Get the extras from `FeaturePluginConfig.defaultExtras` or `.setup()`.
   * Returns undefined if not enabled.
   */
  extras: TExtras;
} /**
 * Create a feature plugin with a user-friendly `.enable()` API.
 *
 * Feature plugins are the recommended way to expose optional functionality
 * that requires heavy dependencies or complex setup. They provide:
 *
 * - **Simple activation**: Users call `.enable()` once at startup
 * - **Lazy loading**: Heavy dependencies only load when rendered
 * - **Type-safe options**: Configuration is typed and validated
 * - **Idempotent**: Safe to call `.enable()` multiple times
 *
 * ## Example: Creating a Plugin
 *
 * @example
 * ```typescript
 * import { createFeaturePlugin } from '@statelyjs/ui/feature-plugin';
 * import { addStringModes } from '@statelyjs/stately/core/extensions';
 *
 * interface MyPluginOptions {
 *   theme?: 'light' | 'dark';
 * }
 *
 * export const myPlugin = createFeaturePlugin<MyPluginOptions, MyComponentProps>({
 *   id: 'myPlugin',
 *
 *   // Heavy component - lazy loaded
 *   component: () => import('./MyHeavyComponent'),
 *
 *   // Setup runs once on .enable()
 *   setup: (ctx, options) => {
 *     // Register with extension points
 *     addStringModes.extend(state => ({
 *       component: state.mode === 'myMode' ? ctx.Component : state.component,
 *     }));
 *   },
 *
 *   // Default options
 *   defaults: {
 *     theme: 'light',
 *   },
 * });
 * ```
 *
 * ## Example: Using a Plugin
 *
 * @example
 * ```typescript
 * // At app startup
 * import { myPlugin } from '@my-org/my-plugin';
 *
 * myPlugin.enable({ theme: 'dark' });
 *
 * // In a component
 * function Editor() {
 *   const MyComponent = myPlugin.lazyComponent;
 *   // ...
 * }
 * ```
 *
 * @typeParam TOptions - Options accepted by `.enable()`
 * @typeParam TComponentProps - Props type for the lazy-loaded component
 * @typeParam TExtras - Optional additional data provided by the plugin
 * @param {FeaturePluginConfig} config - Plugin configuration
 * @returns {FeaturePlugin} A feature plugin instance
 */
export function createFeaturePlugin<
  TOptions = void,
  TComponentProps = unknown,
  TExtras extends object = never,
>(
  config: FeaturePluginConfig<TOptions, TComponentProps, TExtras>,
): FeaturePlugin<TOptions, TComponentProps, TExtras> {
  // Plugin state
  let enabled = false;
  let lazyComponent: LazyExoticComponent<ComponentType<TComponentProps>> | null = null;
  let enabledOptions: TOptions | undefined;
  let extras = config.defaultExtras;

  return {
    enable(options?: TOptions): void {
      // Idempotent - only run setup once
      if (enabled) return;

      // Merge with defaults
      const mergedOptions = { ...(config.defaults ?? {}), ...(options ?? {}) } as TOptions;

      enabledOptions = mergedOptions;

      // Create lazy component if provided
      if (config.component) {
        lazyComponent = lazy(config.component);
      }

      // Build context
      const ctx: FeaturePluginContext<TComponentProps> = {
        Component: lazyComponent,
        isEnabled: true,
      };

      // Run setup, initialize extras if present
      const providedExtras = config.setup(ctx, mergedOptions);
      if (providedExtras) {
        extras = providedExtras;
      }

      enabled = true;
    },

    get extras(): TExtras {
      return extras;
    },

    getOptions(): TOptions | undefined {
      return enabledOptions;
    },
    id: config.id,

    isEnabled(): boolean {
      return enabled;
    },

    get lazyComponent(): LazyExoticComponent<ComponentType<TComponentProps>> | null {
      return lazyComponent;
    },
  };
}

/**
 * Props for the FeatureComponent wrapper.
 * @expand
 */
export interface FeatureComponentProps<TProps extends JSX.IntrinsicAttributes> {
  /**
   * The feature plugin to render the component from.
   */
  plugin: FeaturePlugin<any, TProps>;

  /**
   * Props to pass to the lazy-loaded component.
   */
  props: TProps;

  /**
   * Fallback to show while the component is loading.
   * @default null
   */
  fallback?: React.ReactNode;

  /**
   * Content to show if the plugin is not enabled.
   * @default null
   */
  notEnabled?: React.ReactNode;
}

/**
 * Wrapper component that handles Suspense and enabled checks for feature plugins.
 *
 * @example
 * ```typescript
 * <FeatureComponent
 *   plugin={codemirror}
 *   props={{ value, onChange }}
 *   fallback={<Spinner />}
 *   notEnabled={<div>Enable CodeMirror to use this feature</div>}
 * />
 * ```
 */
export function FeatureComponent<TProps extends JSX.IntrinsicAttributes>({
  plugin,
  props,
  fallback = null,
  notEnabled = null,
}: FeatureComponentProps<TProps>): React.ReactNode {
  const Component = plugin.lazyComponent;

  if (!Component) {
    return notEnabled;
  }

  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
}
