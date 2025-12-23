/**
 * Arrow plugin API operations.
 *
 * Defines the typed API operations for the Arrow plugin. These operations
 * are available via `runtime.plugins.arrow.api` when the plugin is installed.
 *
 * ## Available Operations
 *
 * - `list_connectors` - List all available data connectors
 * - `connector_list` - Get details for a specific connector
 * - `connector_list_many` - Get details for multiple connectors
 * - `list_catalogs` - List available data catalogs
 * - `list_registered` - List registered connections
 * - `register` - Register a connector for use
 * - `execute_query` - Execute a SQL query
 *
 * @example
 * ```typescript
 * const { plugins } = useStatelyUi();
 *
 * // List connectors
 * const { data } = await plugins.arrow.api.list_connectors();
 *
 * // Execute a query
 * const result = await plugins.arrow.api.execute_query({
 *   body: { sql: 'SELECT * FROM users LIMIT 10' }
 * });
 * ```
 *
 * @module api
 */

import type { DefinePaths } from '@statelyjs/stately/schema';
import { createOperationBindingsFactory, type DefineOperations } from '@statelyjs/stately/schema';
import type { TypedOperations } from '@statelyjs/ui';
import type { operations, paths } from './generated/types';

/** OpenAPI paths type for the arrow plugin */
export type ArrowPaths = DefinePaths<paths>;

/** OpenAPI operations type for the arrow plugin */
export type ArrowOperations = DefineOperations<operations>;

/**
 * Arrow plugin operation bindings.
 *
 * Maps friendly operation names to their HTTP method and path.
 * Paths do NOT include any prefix - that's provided via plugin options.
 */
export const ARROW_OPERATIONS = createOperationBindingsFactory<paths, operations>()({
  /** Get details for a specific connector */
  connector_list: { method: 'get', path: '/connectors/{connector_id}' },
  /** Get details for multiple connectors */
  connector_list_many: { method: 'post', path: '/connectors' },
  /** Execute a SQL query against connected data */
  execute_query: { method: 'post', path: '/query' },
  /** List available data catalogs */
  list_catalogs: { method: 'get', path: '/catalogs' },
  /** List all available data connectors */
  list_connectors: { method: 'get', path: '/connectors' },
  /** List registered connections */
  list_registered: { method: 'get', path: '/register' },
  /** Register a connector for use */
  register: { method: 'get', path: '/register/{connector_id}' },
} as const);

/**
 * Typed API client for Arrow operations.
 *
 * Access via `runtime.plugins.arrow.api`.
 */
export type ArrowApi = TypedOperations<ArrowPaths, typeof ARROW_OPERATIONS>;
