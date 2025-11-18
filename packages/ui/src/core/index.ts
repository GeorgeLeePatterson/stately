import type { Schemas } from '@stately/schema';
import type { StateEntry } from '@stately/schema/core/helpers';
import type { CoreTypes } from '@stately/schema/core/plugin';
import { coreUiPlugin } from './plugin';
import { generateFieldLabel, getDefaultValue, getNodeTypeIcon } from './utils';

// TODO: Revisit this file, might be mostly junk

export type { CoreApi } from './api';
export type {
  CorePluginUtils,
  CoreUiPlugin as CoreUiAugment,
} from './plugin';
export type { CoreUtils } from './utils';

export { getDefaultValue, generateFieldLabel, getNodeTypeIcon, coreUiPlugin };

type SchemaConfigOf<S extends Schemas<any, any>> = S['config'];
type SchemaTypesOf<S extends Schemas<any, any>> = CoreTypes<SchemaConfigOf<S>>;
type PluginInfoOf<S extends Schemas<any, any>> = S['plugin'];

export type CoreSchemaPaths<S extends Schemas<any, any> = Schemas<any, any>> =
  SchemaConfigOf<S>['paths'];
export type CoreSchemaNodes<S extends Schemas<any, any> = Schemas<any, any>> =
  SchemaConfigOf<S>['nodes'];

// Use StateEntry from helpers instead of deriving from CoreTypes
export type CoreStateEntry<S extends Schemas<any, any> = Schemas<any, any>> = StateEntry<
  SchemaConfigOf<S>
>;

// EntityData is already the extracted data payload from Entity discriminated union
export type CoreEntity<S extends Schemas = Schemas> = S['types']['EntityData'];
export type CoreEntityData<S extends Schemas<any, any> = Schemas<any, any>> =
  SchemaTypesOf<S>['EntityData'];

export type CoreNodeMap<S extends Schemas<any, any> = Schemas<any, any>> = PluginInfoOf<S>['Nodes'];
export type CoreNodeUnion<S extends Schemas<any, any> = Schemas<any, any>> =
  PluginInfoOf<S>['AnyNode'];
export type CoreNodeNames<S extends Schemas<any, any> = Schemas<any, any>> =
  PluginInfoOf<S>['NodeNames'];
export type CoreNodeTypes<S extends Schemas<any, any> = Schemas<any, any>> =
  PluginInfoOf<S>['NodeTypes'];
