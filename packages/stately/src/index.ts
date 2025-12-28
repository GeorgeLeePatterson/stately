/**
 * @statelyjs/stately - Full Stately runtime with core plugin and codegen
 *
 * This is the main package for Stately applications. It provides:
 * - **Core Plugin**: Entity CRUD operations, hooks, views, and field components
 * - **Codegen CLI**: Generate TypeScript types from OpenAPI specs (`pnpm exec stately`)
 * - **Schema Re-exports**: Convenient access to `@statelyjs/schema` types
 *
 * Most users should install this package rather than `@statelyjs/ui` directly.
 * The base `@statelyjs/ui` package provides layout, theming, and plugin infrastructure
 * but has no knowledge of Stately's entity system.
 *
 * @example Basic Setup
 * ```typescript
 * import { stately } from '@statelyjs/schema';
 * import { statelyUi, statelyUiProvider, useStatelyUi } from '@statelyjs/stately';
 * import { PARSED_SCHEMAS } from './generated/schemas';
 * import type { components, paths, operations } from './generated/types';
 *
 * // Create schema runtime
 * const schema = stately<MySchemas>(openapiDoc, PARSED_SCHEMAS);
 *
 * // Create UI runtime with core plugin pre-installed
 * export const runtime = statelyUi<MySchemas>({
 *   client: api,
 *   schema,
 *   core: { api: { pathPrefix: '/entity' } },
 *   options: { api: { pathPrefix: '/api/v1' } },
 * });
 *
 * // Create typed provider and hook for your app
 * export const AppProvider = statelyUiProvider<MySchemas>();
 * export const useAppStatelyUi = () => useStatelyUi<MySchemas>();
 * ```
 *
 * @example Adding Plugins
 * ```typescript
 * import { filesUiPlugin } from '@statelyjs/files';
 * import { arrowUiPlugin } from '@statelyjs/arrow';
 *
 * const runtime = statelyUi<MySchemas>({ ... })
 *   .withPlugin(filesUiPlugin({ api: { pathPrefix: '/files' } }))
 *   .withPlugin(arrowUiPlugin({ api: { pathPrefix: '/arrow' } }));
 * ```
 *
 * @packageDocumentation
 */

import {
  type AnyUiPlugin,
  createStatelyUi,
  type StatelyUiBuilder,
  type StatelyUiConfiguration,
  type StatelyUiRuntime,
} from '@statelyjs/ui';
import { createUseStatelyUi } from './context.js';
import { statelyUiProvider as coreStatelyUiProvider } from './core/context.js';
import { type CoreUiOptions, type CoreUiPlugin, coreUiPlugin } from './core/index.js';
import type { Schemas } from './schema.js';

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration for creating a Stately runtime.
 *
 * Extends the base `StatelyUiConfiguration` with core plugin options.
 *
 * @typeParam Schema - Your application's schema type (from `Schemas<DefineConfig<...>>`)
 *
 * @property schema - The schema runtime created with `stately()` from `@statelyjs/schema`
 * @property client - An `openapi-fetch` client for API requests
 * @property options - Global options including API path prefix
 * @property core - Core plugin options (entity icons, API path prefix)
 */
export type StatelyConfiguration<Schema extends Schemas<any, any> = Schemas> = Readonly<
  Omit<StatelyUiConfiguration<Schema>, 'options'> & {
    options?: StatelyUiConfiguration<Schema>['options'];
  }
> & {
  /**
   * Core plugin configuration options.
   *
   * @property api.pathPrefix - Base path for entity CRUD endpoints (e.g., '/entity')
   * @property entities.icons - Map of entity type names to icon components
   */
  core?: CoreUiOptions;
};

/**
 * The Stately runtime type with core plugin installed.
 *
 * This is the return type of `statelyUi()`. It includes the core plugin
 * and any additional plugins you've added via `withPlugin()`.
 *
 * @typeParam S - Your application's schema type
 * @typeParam Augments - Additional plugins beyond core (inferred from `withPlugin` calls)
 *
 * @example Accessing the runtime
 * ```typescript
 * const runtime: StatelyUi<MySchemas> = statelyUi({ ... });
 *
 * // Access core plugin
 * runtime.plugins.core.api.operations.listEntities({ ... });
 * runtime.plugins.core.utils.getEntityIcon('Pipeline');
 *
 * // Access other plugins
 * runtime.plugins.files?.api.operations.listFiles({ ... });
 * ```
 */
export type StatelyUi<
  S extends Schemas<any, any> = Schemas,
  Augments extends readonly AnyUiPlugin[] = readonly [],
> = StatelyUiRuntime<S, readonly [CoreUiPlugin, ...Augments]>;

// ============================================================================
// Runtime Factory
// ============================================================================

/**
 * Create a Stately runtime with the core plugin pre-installed.
 *
 * This is the main entry point for creating a Stately UI runtime. It returns
 * a builder that can be extended with additional plugins via `withPlugin()`.
 *
 * The core plugin provides:
 * - Entity CRUD API operations (`list_entities`, `get_entity_by_id`, `create_entity`, etc.)
 * - Field components for all schema node types (primitives, objects, arrays, etc.)
 * - Entity navigation routes for the sidebar
 * - Utility functions for entity display and URL generation
 *
 * @typeParam Schema - Your application's schema type
 * @typeParam Augments - Additional plugin types (usually inferred)
 *
 * @param config - Runtime configuration (see {@link StatelyConfiguration})
 * @returns A runtime builder with core plugin installed. Chain `.withPlugin()` to add more.
 *
 * @example Basic usage
 * ```typescript
 * const runtime = statelyUi<MySchemas>({
 *   client: createClient<paths>({ baseUrl: '/api/v1' }),
 *   schema: stately<MySchemas>(openapiDoc, PARSED_SCHEMAS),
 *   core: {
 *     api: { pathPrefix: '/entity' },
 *     entities: {
 *       icons: {
 *         Pipeline: PipelineIcon,
 *         SourceConfig: DatabaseIcon,
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * @example With additional plugins
 * ```typescript
 * const runtime = statelyUi<MySchemas>({ ... })
 *   .withPlugin(filesUiPlugin({ api: { pathPrefix: '/files' } }))
 *   .withPlugin(arrowUiPlugin({ api: { pathPrefix: '/arrow' } }));
 * ```
 */
export function statelyUi<
  Schema extends Schemas<any, any>,
  Augments extends readonly AnyUiPlugin[] = readonly [],
>({
  core,
  ...stately
}: StatelyConfiguration<Schema>): StatelyUiBuilder<Schema, readonly [CoreUiPlugin, ...Augments]> {
  return createStatelyUi<Schema, readonly [CoreUiPlugin, ...Augments]>({
    ...stately,
    options: stately.options ?? {},
  }).withPlugin(coreUiPlugin<Schema, readonly [CoreUiPlugin, ...Augments]>(core));
}

// ============================================================================
// Context & Hooks
// ============================================================================

/**
 * Access the Stately runtime from React context.
 *
 * Use this hook in components to access the runtime's plugins, utilities,
 * and configuration. The runtime must be provided via `statelyUiProvider`.
 *
 * @typeParam Schema - Your application's schema type
 * @typeParam ExtraAugments - Additional plugins beyond core
 *
 * @returns The current Stately runtime from context
 *
 * @throws If called outside of a `StatelyUiProvider`
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const runtime = useStatelyUi<MySchemas>();
 *
 *   // Access core plugin utilities
 *   const icon = runtime.plugins.core.utils.getEntityIcon('Pipeline');
 *
 *   // Access schema information
 *   const entities = runtime.schema.utils.getStateEntries();
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useStatelyUi<
  Schema extends Schemas<any, any>,
  ExtraAugments extends readonly AnyUiPlugin[] = [],
>() {
  return createUseStatelyUi<Schema, readonly [CoreUiPlugin, ...ExtraAugments]>()();
}

/**
 * Create a typed React context provider for your Stately runtime.
 *
 * Call this once in your app setup to create a provider component.
 * The provider also includes theming support.
 *
 * @typeParam Schema - Your application's schema type
 * @typeParam Augments - Plugin types (usually inferred from your runtime)
 *
 * @returns A React context provider component
 *
 * @example
 * ```typescript
 * // lib/stately.ts
 * export const AppStatelyProvider = statelyUiProvider<MySchemas>();
 *
 * // app/layout.tsx
 * import { AppStatelyProvider, runtime } from '@/lib/stately';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <QueryClientProvider client={queryClient}>
 *       <AppStatelyProvider value={runtime}>
 *         {children}
 *       </AppStatelyProvider>
 *     </QueryClientProvider>
 *   );
 * }
 * ```
 */
export const statelyUiProvider = coreStatelyUiProvider;
