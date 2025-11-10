/**
 * Core plugin entrypoint.
 *
 * Treat this module like any other Stately plugin: it exposes the schema augment
 * (`CoreSchemaAugment`), the runtime plugin factory (`createCorePlugin`), and the
 * node helpers that plugin authors might want to reuse. Import everything from
 * here instead of reaching directly into ./augment or ./plugin.
 */
import { createCorePlugin } from './plugin.js';

export type { CoreSchemaAugment, CoreStatelyConfig } from './augment.js';
export { createCorePlugin };
export type {
  ArrayNodeRaw,
  EnumNode,
  LinkNodeRaw,
  MapNodeRaw,
  NullableNodeRaw,
  ObjectNodeRaw,
  PrimitiveNode,
  RecursiveRefNodeRaw,
  TaggedUnionNodeRaw,
  TCoreNodeType,
  TPrimitiveType,
  TupleNodeRaw,
  UntaggedEnumNodeRaw,
} from './nodes.js';
