import type { CoreSchemaTypes } from '@stately/schema/core/augment';
import type { StateEntry } from '@stately/schema/core/helpers';
import type {
  ArrayNode,
  EnumNode,
  LinkNode,
  MapNode,
  NullableNode,
  ObjectNode,
  PrimitiveNode,
  RecursiveRefNode,
  TaggedUnionNode,
  TupleNode,
  UntaggedEnumNode,
} from '@stately/schema/core/nodes';
import { createUseStatelyUi } from '@/context';
import {
  type CorePluginName,
  type CorePluginRuntime,
  type CorePluginUtils,
  type CoreSchemas,
  type CoreUiAugment,
  createCoreUiPlugin,
} from './plugin';

export type { CoreSchemaAugment, CoreStatelyConfig } from '@stately/schema/core/augment';
export {
  type CorePluginName,
  type CorePluginRuntime,
  type CorePluginUtils,
  type CoreSchemas,
  type CoreUiAugment,
  createCoreUiPlugin,
  createUseStatelyUi,
};

/**
 * Stately UI Context Provider with core included
 *
 * This hook is both used in core's plugin code but also serves as an example for how to customize
 * the application's Stately context with any plugin augmentations.
 */
export const useCoreStatelyUi = createUseStatelyUi<CoreSchemas, readonly [CoreUiAugment]>();

/**
 * =============================================================================
 * RUNTIME & HELPER TYPES
 * =============================================================================
 */


type SchemaConfigOf<S extends CoreSchemas> = S['config'];
type SchemaTypesOf<S extends CoreSchemas> = CoreSchemaTypes<SchemaConfigOf<S>>;
type PluginInfoOf<S extends CoreSchemas> = S['plugin'];

export type CorePaths<S extends CoreSchemas = CoreSchemas> = SchemaConfigOf<S>['paths'];
export type CoreNodes<S extends CoreSchemas = CoreSchemas> = SchemaConfigOf<S>['nodes'];

// Use StateEntry from helpers instead of deriving from CoreSchemaTypes
export type CoreStateEntry<S extends CoreSchemas = CoreSchemas> = StateEntry<SchemaConfigOf<S>>;
// EntityData is already the extracted data payload from Entity discriminated union
export type CoreEntity<S extends CoreSchemas = CoreSchemas> = SchemaTypesOf<S>['EntityData'];
export type CoreEntityData<S extends CoreSchemas = CoreSchemas> = SchemaTypesOf<S>['EntityData'];
export interface CoreSummary {
  id: string;
  name: string;
  description?: string;
}

export type CoreArrayNode<S extends CoreSchemas = CoreSchemas> = ArrayNode<SchemaConfigOf<S>>;
export type CoreEnumNode = EnumNode;
export type CoreLinkNode<S extends CoreSchemas = CoreSchemas> = LinkNode<SchemaConfigOf<S>>;
export type CoreMapNode<S extends CoreSchemas = CoreSchemas> = MapNode<SchemaConfigOf<S>>;
export type CoreNullableNode<S extends CoreSchemas = CoreSchemas> = NullableNode<SchemaConfigOf<S>>;
export type CoreObjectNode<S extends CoreSchemas = CoreSchemas> = ObjectNode<SchemaConfigOf<S>>;
export type CorePrimitiveNode = PrimitiveNode;
export type CoreRecursiveRefNode<S extends CoreSchemas = CoreSchemas> = RecursiveRefNode<
  SchemaConfigOf<S>
>;
export type CoreTaggedUnionNode<S extends CoreSchemas = CoreSchemas> = TaggedUnionNode<
  SchemaConfigOf<S>
>;
export type CoreTupleNode<S extends CoreSchemas = CoreSchemas> = TupleNode<SchemaConfigOf<S>>;
export type CoreUntaggedEnumNode<S extends CoreSchemas = CoreSchemas> = UntaggedEnumNode<
  SchemaConfigOf<S>
>;

export type CoreNodeMap<S extends CoreSchemas = CoreSchemas> = PluginInfoOf<S>['Nodes'];
export type CoreNodeUnion<S extends CoreSchemas = CoreSchemas> = PluginInfoOf<S>['AnyNode'];
export type CoreNodeNames<S extends CoreSchemas = CoreSchemas> = PluginInfoOf<S>['NodeNames'];
export type CoreNodeTypes<S extends CoreSchemas = CoreSchemas> = PluginInfoOf<S>['NodeTypes'];
