import type { Schemas } from '@stately/schema';
import type { StateEntry } from '@stately/schema/core/helpers';
import type { CoreTypes } from '@stately/schema/core/plugin';
import { coreUiPlugin } from './plugin';
import * as coreUtils from './utils';

// Re-exports
export type { CoreApi } from './api';
export type { CoreUiOptions, CoreUiPlugin } from './plugin';
export type { CoreUiUtils } from './utils';
export { coreUtils, coreUiPlugin };

// Helper types
type SchemaConfigOf<S extends Schemas<any, any>> = S['config'];
type SchemaTypesOf<S extends Schemas<any, any>> = CoreTypes<SchemaConfigOf<S>>;
type PluginInfoOf<S extends Schemas<any, any>> = S['plugin'];

// Use StateEntry from helpers instead of deriving from CoreTypes
export type CoreStateEntry<S extends Schemas<any, any> = Schemas<any, any>> = StateEntry<
  SchemaConfigOf<S>
>;

// EntityData is already the extracted data payload from Entity discriminated union
export type CoreEntity<S extends Schemas = Schemas> = S['types']['EntityData'];
export type CoreEntityData<S extends Schemas<any, any> = Schemas<any, any>> =
  SchemaTypesOf<S>['EntityData'];
export type CoreNodeUnion<S extends Schemas<any, any> = Schemas<any, any>> =
  PluginInfoOf<S>['AnyNode'];
