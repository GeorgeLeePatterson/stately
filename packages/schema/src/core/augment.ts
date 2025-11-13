import type {
  DefineComponentSchemas,
  DefineComponents,
  DefineGeneratedNodes,
  StatelyConfig,
} from '../generated.js';
import type { BaseNode } from '../nodes.js';
import type { DefineTypes, SchemaAugment } from '../plugin.js';
import type { CoreData } from './data.js';
import type { CoreNodeMap, ObjectNode, TaggedUnionNode } from './nodes.js';
import type { CorePaths } from './paths.js';
import type { CoreUtils } from './utils.js';

type StateEntryEnum<Config extends CoreStatelyConfig> =
  Config['components']['schemas']['StateEntry'] extends { enum: readonly (infer E)[] } ? E : string;
type StateEntryValue<Config extends CoreStatelyConfig> = Extract<
  StateEntryEnum<Config>,
  string
> extends never
  ? string
  : Extract<StateEntryEnum<Config>, string>;

type EntityNode<Config extends CoreStatelyConfig> = Config['nodes'] extends { Entity: infer Node }
  ? Node
  : never;
type SummaryNode<Config extends CoreStatelyConfig> = Config['nodes'] extends { Summary: infer Node }
  ? Node
  : never;

export type CoreSchemaTypes<Config extends CoreStatelyConfig> = DefineTypes<{
  StateEntry: StateEntryValue<Config>;
  Entity: EntityNode<Config>;
  EntityData: { type: StateEntryValue<Config>; data: { name?: string; [key: string]: any } };
  Summary: SummaryNode<Config>;
}>;

/**
 * Define the minimum expected schema, enough to allow the plugin to operate over the configuration.
 */
type CoreComponents = DefineComponents<{
  schemas: DefineComponentSchemas<{
    StateEntry: { type: 'string'; enum: string[] };
    Entity: {
      oneOf: {
        type: 'object';
        required: ['data', 'type'];
        properties: { data: { $ref: string }; type: { type: 'string'; enum: [string] } };
      }[];
    };
    EntityId: { type: 'string' };
    Summary: { type: 'object'; properties: Record<string, { type: 'string' }> };
  }>;
}>;

type CoreComponentInput = StatelyConfig['components'] & CoreComponents;
type CorePathsInput = StatelyConfig['paths'] & CorePaths;

/**
 * Core configuration type that plugin authors can specialize with their own
 * components, paths, and additional nodes. The nodes property automatically
 * includes CoreGenerated nodes merged with any custom nodes passed in.
 */
export interface CoreStatelyConfig<
  C extends CoreComponentInput = CoreComponentInput,
  P extends CorePathsInput = CorePathsInput,
  N extends DefineGeneratedNodes<{}> = Record<never, BaseNode>
> extends StatelyConfig<C, P, DefineGeneratedNodes<{
  Entity: TaggedUnionNode<CoreStatelyConfig>;
  EntityData: ObjectNode<CoreStatelyConfig>;
}> & N> {}

export type CoreSchemaAugment<Config extends CoreStatelyConfig> = SchemaAugment<
  'core',
  CoreNodeMap<Config>,
  CoreSchemaTypes<Config>,
  CoreData<Config>,
  CoreUtils<Config>
>;
