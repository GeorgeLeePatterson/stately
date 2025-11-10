import type { SchemaAugment, StatelyConfig } from '../schema.js';
import type {
  ArrayNodeRaw,
  CoreNodeType,
  EnumNode,
  LinkNodeRaw,
  MapNodeRaw,
  NullableNodeRaw,
  ObjectNodeRaw,
  PrimitiveNode,
  RecursiveRefNodeRaw,
  TaggedUnionNodeRaw,
  TupleNodeRaw,
  UntaggedEnumNodeRaw,
} from './nodes.js';

type BaseComponentSchemas = StatelyConfig['components']['schemas'];

type CoreComponentShape = StatelyConfig['components'] & {
  schemas: BaseComponentSchemas & {
    StateEntry: string;
    Entity: { type: string; data: Record<string, unknown> };
    EntityId: string;
    Summary: Record<string, unknown>;
  };
};

export interface CoreStatelyConfig<
  Components extends CoreComponentShape = CoreComponentShape,
  Paths extends StatelyConfig['paths'] = StatelyConfig['paths'],
  Nodes = Record<string, unknown>,
> extends StatelyConfig<Components, Paths, Nodes> {}

type CoreSchemaExtras<Config extends CoreStatelyConfig> = {
  StateEntry: Config['components']['schemas']['StateEntry'];
  Entity: Config['components']['schemas']['Entity'];
  EntityData: Config['components']['schemas']['Entity']['data'];
  EntityId: Config['components']['schemas']['EntityId'];
  Summary: Config['components']['schemas']['Summary'];
};

type StateEntryType<Config extends CoreStatelyConfig> = Config['components']['schemas']['StateEntry'] extends string
  ? Config['components']['schemas']['StateEntry']
  : string;

type CoreNodeMap<Config extends CoreStatelyConfig> = {
  [CoreNodeType.Primitive]: PrimitiveNode;
  [CoreNodeType.Enum]: EnumNode;
  [CoreNodeType.Object]: ObjectNodeRaw<StateEntryType<Config>, string>;
  [CoreNodeType.Array]: ArrayNodeRaw<StateEntryType<Config>, string>;
  [CoreNodeType.Map]: MapNodeRaw<StateEntryType<Config>, string>;
  [CoreNodeType.Tuple]: TupleNodeRaw<StateEntryType<Config>, string>;
  [CoreNodeType.TaggedUnion]: TaggedUnionNodeRaw<StateEntryType<Config>, string>;
  [CoreNodeType.UntaggedEnum]: UntaggedEnumNodeRaw<StateEntryType<Config>, string>;
  [CoreNodeType.Link]: LinkNodeRaw<StateEntryType<Config>, string>;
  [CoreNodeType.Nullable]: NullableNodeRaw<StateEntryType<Config>, string>;
  [CoreNodeType.RecursiveRef]: RecursiveRefNodeRaw<string>;
};

export type CoreSchemaAugment<Config extends CoreStatelyConfig> = SchemaAugment<
  CoreNodeMap<Config>,
  CoreSchemaExtras<Config>
>;
