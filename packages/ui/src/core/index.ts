import type { Schemas } from '@stately/schema';
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
import type { CoreTypes } from '@stately/schema/core/plugin';
import { createUseStatelyUi } from '@/context';
import { CORE_OPERATION_IDS } from './operations';
import { coreUiPlugin } from './plugin';
import { generateFieldLabel, getDefaultValue, getNodeTypeIcon } from './utils';

export type { CoreHttpBundle, CoreOperationMap } from './operations';
export type {
  CorePluginName,
  CorePluginRuntime,
  CorePluginUtils,
  CoreUiAugment,
} from './plugin';
export type { CoreUtils } from './utils';

export {
  CORE_OPERATION_IDS,
  getDefaultValue,
  generateFieldLabel,
  getNodeTypeIcon,
  coreUiPlugin as createCoreUiPlugin,
};

/**
 * Default Core hook for core plugin usage.
 * For better type safety, use createUseStatelyUi with your specific schema.
 *
 * @example
 * ```typescript
 * const runtime = useStatelyUi();
 * // runtime.plugins has type Record<string, PluginRuntime<...>>
 * ```
 */
export const useStatelyUi = createUseStatelyUi<Schemas>();

// Re-exports
export type { CorePlugin } from '@stately/schema/core/plugin';

type SchemaConfigOf<S extends Schemas<any, any>> = S['config'];
type SchemaTypesOf<S extends Schemas<any, any>> = CoreTypes<SchemaConfigOf<S>>;
type PluginInfoOf<S extends Schemas<any, any>> = S['plugin'];

export type CorePaths<S extends Schemas<any, any> = Schemas<any, any>> = SchemaConfigOf<S>['paths'];
export type CoreNodes<S extends Schemas<any, any> = Schemas<any, any>> = SchemaConfigOf<S>['nodes'];

// Use StateEntry from helpers instead of deriving from CoreTypes
export type CoreStateEntry<S extends Schemas<any, any> = Schemas<any, any>> = StateEntry<
  SchemaConfigOf<S>
>;
// EntityData is already the extracted data payload from Entity discriminated union
export type CoreEntity<S extends Schemas<any, any> = Schemas<any, any>> =
  SchemaTypesOf<S>['EntityData'];
export type CoreEntityData<S extends Schemas<any, any> = Schemas<any, any>> =
  SchemaTypesOf<S>['EntityData'];
// TODO: Remove
// export interface CoreSummary

export type CoreArrayNode<S extends Schemas<any, any> = Schemas<any, any>> = ArrayNode<
  SchemaConfigOf<S>
>;
export type CoreEnumNode = EnumNode;
export type CoreLinkNode<S extends Schemas<any, any> = Schemas<any, any>> = LinkNode<
  SchemaConfigOf<S>
>;
export type CoreMapNode<S extends Schemas<any, any> = Schemas<any, any>> = MapNode<
  SchemaConfigOf<S>
>;
export type CoreNullableNode<S extends Schemas<any, any> = Schemas<any, any>> = NullableNode<
  SchemaConfigOf<S>
>;
export type CoreObjectNode<S extends Schemas<any, any> = Schemas<any, any>> = ObjectNode<
  SchemaConfigOf<S>
>;
export type CorePrimitiveNode = PrimitiveNode;
export type CoreRecursiveRefNode<S extends Schemas<any, any> = Schemas<any, any>> =
  RecursiveRefNode<SchemaConfigOf<S>>;
export type CoreTaggedUnionNode<S extends Schemas<any, any> = Schemas<any, any>> = TaggedUnionNode<
  SchemaConfigOf<S>
>;
export type CoreTupleNode<S extends Schemas<any, any> = Schemas<any, any>> = TupleNode<
  SchemaConfigOf<S>
>;
export type CoreUntaggedEnumNode<S extends Schemas<any, any> = Schemas<any, any>> =
  UntaggedEnumNode<SchemaConfigOf<S>>;

export type CoreNodeMap<S extends Schemas<any, any> = Schemas<any, any>> = PluginInfoOf<S>['Nodes'];
export type CoreNodeUnion<S extends Schemas<any, any> = Schemas<any, any>> =
  PluginInfoOf<S>['AnyNode'];
export type CoreNodeNames<S extends Schemas<any, any> = Schemas<any, any>> =
  PluginInfoOf<S>['NodeNames'];
export type CoreNodeTypes<S extends Schemas<any, any> = Schemas<any, any>> =
  PluginInfoOf<S>['NodeTypes'];
