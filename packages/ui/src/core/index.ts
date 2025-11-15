import type { CoreTypes } from '@stately/schema/core/plugin';
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
import type { StatelyRuntime } from '@/runtime';
import {
  type CorePluginName,
  type CorePluginRuntime,
  type CorePluginUtils,
  type CoreUiAugment,
  createCoreUiPlugin,
} from './plugin';
import { Schemas } from '@stately/schema';

export type { CorePlugin } from '@stately/schema/core/plugin';
export {
  type CorePluginName,
  type CorePluginRuntime,
  type CorePluginUtils,
  type CoreUiAugment,
  createCoreUiPlugin,
  createUseStatelyUi,
};

/**
 * =============================================================================
 * RUNTIME & HELPER TYPES
 * =============================================================================
 */


type SchemaConfigOf<S extends Schemas<any, any>> = S['config'];
type SchemaTypesOf<S extends Schemas<any, any>> = CoreTypes<SchemaConfigOf<S>>;
type PluginInfoOf<S extends Schemas<any, any>> = S['plugin'];

export type CorePaths<S extends Schemas<any, any> = Schemas<any, any>> = SchemaConfigOf<S>['paths'];
export type CoreNodes<S extends Schemas<any, any> = Schemas<any, any>> = SchemaConfigOf<S>['nodes'];

// Use StateEntry from helpers instead of deriving from CoreTypes
export type CoreStateEntry<S extends Schemas<any, any> = Schemas<any, any>> = StateEntry<SchemaConfigOf<S>>;
// EntityData is already the extracted data payload from Entity discriminated union
export type CoreEntity<S extends Schemas<any, any> = Schemas<any, any>> = SchemaTypesOf<S>['EntityData'];
export type CoreEntityData<S extends Schemas<any, any> = Schemas<any, any>> = SchemaTypesOf<S>['EntityData'];
export interface CoreSummary {
  id: string;
  name: string;
  description?: string;
}

export type CoreArrayNode<S extends Schemas<any, any> = Schemas<any, any>> = ArrayNode<SchemaConfigOf<S>>;
export type CoreEnumNode = EnumNode;
export type CoreLinkNode<S extends Schemas<any, any> = Schemas<any, any>> = LinkNode<SchemaConfigOf<S>>;
export type CoreMapNode<S extends Schemas<any, any> = Schemas<any, any>> = MapNode<SchemaConfigOf<S>>;
export type CoreNullableNode<S extends Schemas<any, any> = Schemas<any, any>> = NullableNode<SchemaConfigOf<S>>;
export type CoreObjectNode<S extends Schemas<any, any> = Schemas<any, any>> = ObjectNode<SchemaConfigOf<S>>;
export type CorePrimitiveNode = PrimitiveNode;
export type CoreRecursiveRefNode<S extends Schemas<any, any> = Schemas<any, any>> = RecursiveRefNode<
  SchemaConfigOf<S>
>;
export type CoreTaggedUnionNode<S extends Schemas<any, any> = Schemas<any, any>> = TaggedUnionNode<
  SchemaConfigOf<S>
>;
export type CoreTupleNode<S extends Schemas<any, any> = Schemas<any, any>> = TupleNode<SchemaConfigOf<S>>;
export type CoreUntaggedEnumNode<S extends Schemas<any, any> = Schemas<any, any>> = UntaggedEnumNode<
  SchemaConfigOf<S>
>;

export type CoreNodeMap<S extends Schemas<any, any> = Schemas<any, any>> = PluginInfoOf<S>['Nodes'];
export type CoreNodeUnion<S extends Schemas<any, any> = Schemas<any, any>> = PluginInfoOf<S>['AnyNode'];
export type CoreNodeNames<S extends Schemas<any, any> = Schemas<any, any>> = PluginInfoOf<S>['NodeNames'];
export type CoreNodeTypes<S extends Schemas<any, any> = Schemas<any, any>> = PluginInfoOf<S>['NodeTypes'];
