import { coreUiPlugin } from './plugin';
import type { Schemas } from './schema';
import { CORE_PLUGIN_NAME, CoreNodeType, corePlugin, PrimitiveType, stately } from './schema';
import type { StateEntry } from './schema/helpers';
import type { CoreTypes } from './schema/plugin';
import * as coreSchemaUtils from './schema/utils';
import * as coreUiUtils from './utils';

// ------------
// Schema exports
export type {
  CoreNodeMap,
  CoreNodes,
  CorePlugin,
  CoreStatelyConfig,
  DefineCoreConfig,
  PluginNodeUnion,
  SchemaConfig,
} from './schema';
export type { Schemas };
export { corePlugin, stately, CORE_PLUGIN_NAME, coreSchemaUtils, CoreNodeType, PrimitiveType };

// Use StateEntry from helpers instead of deriving from CoreTypes
export type CoreStateEntry<S extends Schemas<any, any> = Schemas<any, any>> = StateEntry<
  S['config']
>;

// EntityData is already the extracted data payload from Entity discriminated union
export type CoreEntity<S extends Schemas = Schemas> = S['types']['EntityData'];
export type CoreEntityData<S extends Schemas<any, any> = Schemas<any, any>> = CoreTypes<
  S['config']
>['EntityData'];
export type CoreNodeUnion<S extends Schemas<any, any> = Schemas<any, any>> = S['plugin']['AnyNode'];

// ------------
// UI exports
export type { CoreApi } from './api';
export type { CoreUiOptions, CoreUiPlugin } from './plugin';
export type { CoreUiUtils } from './utils';
export { coreUiUtils, coreUiPlugin };
