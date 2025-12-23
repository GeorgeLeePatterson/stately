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

// Entity types:
// - CoreEntityWrapped: The full discriminated union { type: string, data: {...} }
// - CoreEntityData: Just the data payload extracted from the Entity union
export type CoreEntityWrapped<S extends Schemas<any, any> = Schemas<any, any>> =
  S['config']['components']['schemas']['Entity'];
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
