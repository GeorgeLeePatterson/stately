import type {
  SchemaAugment,
  SchemaAnyNode,
  SchemaEntity,
  SchemaNodeMap,
  SchemaStateEntry,
  Schemas,
  StatelyConfig,
} from '@stately/schema';
import * as base from './components/base';
import * as dialogs from './components/dialogs';
import * as fields from './components/fields';
import * as views from './components/views';
import * as context from './context';
import * as hooks from './hooks';

type NodesFromConfig<Config extends StatelyConfig> = Config['nodes'] extends SchemaNodeMap
  ? Config['nodes']
  : SchemaNodeMap;

type SchemaShape = {
  Nodes: SchemaNodeMap;
  StateEntry: unknown;
  Entity: unknown;
  EntityId: unknown;
  Summary: unknown;
  Paths: Record<string, unknown>;
  AnyNode: { nodeType: string };
};

type NormalizeSchema<
  Input,
  Augments extends readonly SchemaAugment<SchemaNodeMap>[],
> = Input extends SchemaShape
  ? Input
  : Input extends StatelyConfig
    ? Schemas<Input, NodesFromConfig<Input>, Augments>
    : never;

export type CoreSchemas<
  Config extends StatelyConfig = StatelyConfig,
  Augments extends readonly SchemaAugment<SchemaNodeMap>[] = [],
> = Schemas<Config, NodesFromConfig<Config>, Augments>;

export type CoreStateEntry<
  Input extends StatelyConfig | { Nodes: SchemaNodeMap; StateEntry: unknown } = StatelyConfig,
  Augments extends readonly SchemaAugment<SchemaNodeMap>[] = [],
> = SchemaStateEntry<NormalizeSchema<Input, Augments>>;

export type CoreEntity<
  Input extends StatelyConfig | { Nodes: SchemaNodeMap; StateEntry: unknown } = StatelyConfig,
  Augments extends readonly SchemaAugment<SchemaNodeMap>[] = [],
> = SchemaEntity<NormalizeSchema<Input, Augments>>;

export type CoreEntityId<
  Input extends StatelyConfig | { Nodes: SchemaNodeMap; StateEntry: unknown } = StatelyConfig,
  Augments extends readonly SchemaAugment<SchemaNodeMap>[] = [],
> = NormalizeSchema<Input, Augments>['EntityId'];

export type CoreSummary<
  Input extends StatelyConfig | { Nodes: SchemaNodeMap; StateEntry: unknown } = StatelyConfig,
  Augments extends readonly SchemaAugment<SchemaNodeMap>[] = [],
> = NormalizeSchema<Input, Augments>['Summary'];

export type CorePaths<
  Input extends StatelyConfig | { Nodes: SchemaNodeMap; StateEntry: unknown } = StatelyConfig,
  Augments extends readonly SchemaAugment<SchemaNodeMap>[] = [],
> = NormalizeSchema<Input, Augments>['Paths'];

export type CoreAnyNode<
  Input extends StatelyConfig | { Nodes: SchemaNodeMap; StateEntry: unknown } = StatelyConfig,
  Augments extends readonly SchemaAugment<SchemaNodeMap>[] = [],
> = SchemaAnyNode<NormalizeSchema<Input, Augments>>;

export type CoreNodeOfType<
  Input extends StatelyConfig | { Nodes: SchemaNodeMap; StateEntry: unknown } = StatelyConfig,
  Augments extends readonly SchemaAugment<SchemaNodeMap>[] = [],
  Type extends NormalizeSchema<Input, Augments>['AnyNode']['nodeType'] = NormalizeSchema<
    Input,
    Augments
  >['AnyNode']['nodeType'],
> = Extract<NormalizeSchema<Input, Augments>['AnyNode'], { nodeType: Type }>;

export type CorePrimitiveNode<
  Input extends StatelyConfig | { Nodes: SchemaNodeMap; StateEntry: unknown } = StatelyConfig,
  Augments extends readonly SchemaAugment<SchemaNodeMap>[] = [],
> = CoreNodeOfType<Input, Augments, 'primitive'>;
export type CoreEnumNode<
  Input extends StatelyConfig | { Nodes: SchemaNodeMap; StateEntry: unknown } = StatelyConfig,
  Augments extends readonly SchemaAugment<SchemaNodeMap>[] = [],
> = CoreNodeOfType<Input, Augments, 'enum'>;
export type CoreObjectNode<
  Input extends StatelyConfig | { Nodes: SchemaNodeMap; StateEntry: unknown } = StatelyConfig,
  Augments extends readonly SchemaAugment<SchemaNodeMap>[] = [],
> = CoreNodeOfType<Input, Augments, 'object'>;
export type CoreArrayNode<
  Input extends StatelyConfig | { Nodes: SchemaNodeMap; StateEntry: unknown } = StatelyConfig,
  Augments extends readonly SchemaAugment<SchemaNodeMap>[] = [],
> = CoreNodeOfType<Input, Augments, 'array'>;
export type CoreMapNode<
  Input extends StatelyConfig | { Nodes: SchemaNodeMap; StateEntry: unknown } = StatelyConfig,
  Augments extends readonly SchemaAugment<SchemaNodeMap>[] = [],
> = CoreNodeOfType<Input, Augments, 'map'>;
export type CoreTupleNode<
  Input extends StatelyConfig | { Nodes: SchemaNodeMap; StateEntry: unknown } = StatelyConfig,
  Augments extends readonly SchemaAugment<SchemaNodeMap>[] = [],
> = CoreNodeOfType<Input, Augments, 'tuple'>;
export type CoreTaggedUnionNode<
  Input extends StatelyConfig | { Nodes: SchemaNodeMap; StateEntry: unknown } = StatelyConfig,
  Augments extends readonly SchemaAugment<SchemaNodeMap>[] = [],
> = CoreNodeOfType<Input, Augments, 'taggedUnion'>;
export type CoreUntaggedEnumNode<
  Input extends StatelyConfig | { Nodes: SchemaNodeMap; StateEntry: unknown } = StatelyConfig,
  Augments extends readonly SchemaAugment<SchemaNodeMap>[] = [],
> = CoreNodeOfType<Input, Augments, 'untaggedEnum'>;
export type CoreLinkNode<
  Input extends StatelyConfig | { Nodes: SchemaNodeMap; StateEntry: unknown } = StatelyConfig,
  Augments extends readonly SchemaAugment<SchemaNodeMap>[] = [],
> = CoreNodeOfType<Input, Augments, 'link'>;
export type CoreNullableNode<
  Input extends StatelyConfig | { Nodes: SchemaNodeMap; StateEntry: unknown } = StatelyConfig,
  Augments extends readonly SchemaAugment<SchemaNodeMap>[] = [],
> = CoreNodeOfType<Input, Augments, 'nullable'>;
export type CoreRecursiveRefNode<
  Input extends StatelyConfig | { Nodes: SchemaNodeMap; StateEntry: unknown } = StatelyConfig,
  Augments extends readonly SchemaAugment<SchemaNodeMap>[] = [],
> = CoreNodeOfType<Input, Augments, 'recursiveRef'>;

export { base, dialogs, fields, views, context, hooks };
export type {
  SchemaAugment,
  SchemaAnyNode,
  SchemaEntity,
  SchemaNodeMap,
  SchemaStateEntry,
  Schemas,
} from '@stately/schema';
