/**
 * @stately/arrow - Schema Extensions
 *
 * Defines the RelativePath node type for file path handling
 */

import type { BaseNode } from '@stately/schema/nodes';
import type { DefineData, DefineTypes } from '@stately/schema/plugin';
import type { components } from './generated-types';

/**
 * Arrow plugin types
 *
 * Currently no additional types needed beyond the node types.
 */
export type ArrowTypes = DefineTypes<components['schemas']>;

/**
 * Arrow plugin data
 *
 * Currently no runtime data needed (no caches or registries).
 */
export type ArrowData = DefineData;

/**
 * Node type for relative paths
 */
export const ArrowNodeType = { ArrowConnection: 'arrowConnection' } as const;

export type TArrowNodeType = (typeof ArrowNodeType)[keyof typeof ArrowNodeType];

/**
 * ArrowDataset : location of relative to app directory
 *
 * This can be:
 * - A string path: "path/to/file.txt"
 * - An object with dir/path: { dir: "upload", path: "file.txt" }
 */
export interface ArrowConnectionNode extends BaseNode {
  nodeType: typeof ArrowNodeType.ArrowConnection;
}

/**
 * Arrow node map for plugin augment
 */
export type ArrowNodeMap = { [ArrowNodeType.ArrowConnection]: ArrowConnectionNode };
