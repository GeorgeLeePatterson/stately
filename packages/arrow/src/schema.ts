/**
 * Arrow plugin schema extensions.
 *
 * This module defines the `ArrowConnection` node type for representing
 * data connections in Stately schemas. The node type is automatically
 * registered when you add the arrow plugin to your schema.
 *
 * @module schema
 */

import type { BaseNode, DefineData, DefineTypes } from '@statelyjs/stately/schema';
import type { components } from './generated/types';

/**
 * Type definitions provided by the arrow plugin.
 *
 * Includes all component schemas from the Arrow API specification.
 */
export type ArrowTypes = DefineTypes<components['schemas']>;

/**
 * Runtime data for the arrow plugin.
 *
 * Currently empty - no runtime caches or registries are needed.
 */
export type ArrowData = DefineData;

/**
 * Node type identifiers for the arrow plugin.
 */
export const ArrowNodeType = {
  /** Represents an Arrow data connection reference */
  ArrowConnection: 'arrowConnection',
} as const;

/** Union type of all arrow plugin node types */
export type TArrowNodeType = (typeof ArrowNodeType)[keyof typeof ArrowNodeType];

/**
 * Schema node for Arrow data connections.
 *
 * Used in schemas to represent references to registered data connections.
 * The connection can be identified by its connector ID.
 *
 * @example Schema definition (from OpenAPI)
 * ```yaml
 * DataSource:
 *   type: string
 *   x-stately-node: arrowConnection
 * ```
 *
 * @example Usage in forms
 * The ArrowConnection field component provides a dropdown of available
 * connections that the user can select from.
 */
export interface ArrowConnectionNode extends BaseNode {
  nodeType: typeof ArrowNodeType.ArrowConnection;
}

/**
 * Node map for arrow plugin augmentation.
 *
 * Maps node type identifiers to their node definitions for the plugin system.
 */
export type ArrowNodeMap = { [ArrowNodeType.ArrowConnection]: ArrowConnectionNode };
