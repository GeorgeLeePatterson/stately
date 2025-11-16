/**
 * NOTE: These types are the *internal* building blocks for the public API that
 * lives in `src/index.ts`. Consumers and plugin authors should import from
 * `@stately/schema` rather than referencing this module directly. Keeping the
 * internals in one place makes it easier to reason about how the Generated/Plugin
 * views are assembled while still presenting a clean surface at the package root.
 */
import type { GeneratedNodeMap, StatelyConfig } from './generated';
import type { AnyRecord, EmptyRecord, NeverRecord, UnionToIntersection } from './helpers';
import type { NodeInformation, NodeMap } from './nodes';
import type { PluginAugment, PluginNodeTypes, PluginNodeUnion } from './plugin';

/**
 * Type guard for narrowing plugin node unions by nodeType.
 *
 * Use this helper when you need to narrow a `PluginNodeUnion<S>` to a specific node type
 * based on its `nodeType` discriminator. This is particularly useful in validation functions
 * and other plugin code that needs to handle different node types.
 *
 * @example
 * ```typescript
 * function processNode(schema: PluginNodeUnion<MySchemas>) {
 *   if (isNodeOfType(schema, 'object')) {
 *     // schema is now narrowed to ObjectNode
 *     console.log(schema.properties);
 *   }
 * }
 * ```
 */
export function isNodeOfType<S extends StatelySchemas<any, any>, Type extends PluginNodeTypes<S>>(
  schema: PluginNodeUnion<S>,
  nodeType: Type,
): schema is Extract<PluginNodeUnion<S>, { nodeType: Type }> {
  return schema.nodeType === nodeType;
}

type AugmentPluginNodes<Augments> = Augments extends readonly PluginAugment<
  any,
  infer Nodes,
  any,
  any,
  any
>[]
  ? UnionToIntersection<Nodes>
  : NodeMap;

type AugmentPluginTypes<Augments> = Augments extends readonly PluginAugment<
  any,
  any,
  infer Types,
  any,
  any
>[]
  ? UnionToIntersection<Types>
  : EmptyRecord;
// &
//   AnyRecord;

type AugmentPluginData<Augments> = (Augments extends readonly PluginAugment<
  any,
  any,
  any,
  infer Data,
  any
>[]
  ? UnionToIntersection<Data>
  : EmptyRecord) &
  AnyRecord;

type AugmentPluginUtils<Augments> = Augments extends readonly [
  ...infer Rest extends readonly PluginAugment<string>[],
  infer Last extends PluginAugment<string>,
]
  ? AugmentPluginUtils<Rest> & PluginUtilsOf<Last>
  : NeverRecord;

type PluginUtilsOf<Augment> = Augment extends PluginAugment<infer Name, any, any, any, infer Utils>
  ? { [K in Name]: Utils }
  : AnyRecord;

/**
 * Base schema builder – derives shared surface area without core additions.
 *
 * This type helper is the core type helper, without any assumptions baked in, not even "core".
 * Prefer the exported `Schemas` in the entrypoint of the package.
 *
 * Variance annotation enforces that Config can only be used covariantly, preventing
 * invariant-causing patterns like `keyof Config['nodes']` from being introduced.
 */
export type StatelySchemas<
  out Config extends StatelyConfig,
  Augments extends readonly PluginAugment<string, NodeMap>[] = [],
> = {
  /** Store raw configuration and plugin augmentations */
  config: Config;
  augments: Augments;
  generated: NodeInformation<GeneratedNodeMap<Config>>;
  plugin: NodeInformation<AugmentPluginNodes<Augments>>;
  types: AugmentPluginTypes<Augments>;
  data: AugmentPluginData<Augments>;
  utils: AugmentPluginUtils<Augments>;
};

export type StatelySchemaConfig<S> = S extends StatelySchemas<infer Config, any> ? Config : never;
