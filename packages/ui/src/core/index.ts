import type { CoreSchemaTypes } from '@stately/schema/core/augment';
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
import type { UiAugment } from '@/plugin';
import type { StatelyRuntime } from '@/runtime';
import {
  CORE_PLUGIN_NAME,
  type CorePluginName,
  type CorePluginRuntime,
  type CorePluginUtils,
  type CoreSchemas,
  type CoreUiAugment,
  createCoreUiPlugin,
} from './plugin';

export type { CoreSchemaAugment, CoreStatelyConfig } from '@stately/schema/core/augment';
export {
  CORE_PLUGIN_NAME,
  type CorePluginName,
  type CorePluginRuntime,
  type CorePluginUtils,
  type CoreSchemas,
  type CoreUiAugment,
  createCoreUiPlugin,
  createUseStatelyUi,
};

/**
 * =============================================================================
 * RUNTIME & HELPER TYPES
 * =============================================================================
 */

/**
 * Runtime with core plugin installed.
 * The augments array includes CoreUiAugment plus any additional plugins.
 */
export type CoreStatelyRuntime<
  S extends CoreSchemas = CoreSchemas,
  ExtraAugments extends readonly UiAugment<string, S, any, any>[] = readonly [],
> = StatelyRuntime<S, readonly [CoreUiAugment<S>, ...ExtraAugments]>;

type SchemaConfigOf<S extends CoreSchemas> = S['config'];
type SchemaTypesOf<S extends CoreSchemas> = CoreSchemaTypes<SchemaConfigOf<S>>;
type PluginInfoOf<S extends CoreSchemas> = S['plugin'];

export type CorePaths<S extends CoreSchemas = CoreSchemas> = SchemaConfigOf<S>['paths'];
export type CoreNodes<S extends CoreSchemas = CoreSchemas> = SchemaConfigOf<S>['nodes'];

export type CoreStateEntry<S extends CoreSchemas = CoreSchemas> = SchemaTypesOf<S>['StateEntry'];
export type CoreEntity<S extends CoreSchemas = CoreSchemas> = SchemaTypesOf<S>['EntityData'];
export type CoreEntityData<S extends CoreSchemas = CoreSchemas> =
  SchemaTypesOf<S>['EntityData']['data'];
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
