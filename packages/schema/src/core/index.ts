/**
 * Core plugin entrypoint.
 *
 * Treat this module like any other Stately plugin: it exposes the schema augment
 * (`CorePlugin`), the runtime plugin factory (`createCorePlugin`), and the
 * node helpers that plugin authors might want to reuse. Import everything from
 * here instead of reaching directly into ./augment or ./plugin.
 */
import { CORE_PLUGIN_NAME, corePlugin } from './plugin.js';

export type { CoreStatelyConfig, DefineCoreConfig } from './generated.js';
export type { NodeKey, StateEntry } from './helpers.js';
export type {
  ArrayNode,
  CoreNodeMap,
  EnumNode,
  LinkNode,
  MapNode,
  NullableNode,
  ObjectNode,
  PrimitiveNode,
  RecursiveRefNode,
  TaggedUnionNode,
  TCoreNodeType,
  TPrimitiveType,
  TupleNode,
  UntaggedEnumNode,
} from './nodes.js';
export type { CorePlugin } from './plugin.js';
export { corePlugin, CORE_PLUGIN_NAME };

// API operations
import { CORE_OPERATIONS } from './api.js';

export { CORE_OPERATIONS };
