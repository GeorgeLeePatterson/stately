import type { CoreSchemas } from './index';

export const SINGLETON_ID = '00000000-0000-0000-0000-000000000000';

export interface CoreSchemaUtils<Schema extends CoreSchemas = CoreSchemas> {
  generateFieldLabel(field: string): string;
  getDefaultValue(node: Schema['AnyNode']): unknown;
  isPrimitive(node: Schema['AnyNode']): boolean;
  sortEntityProperties(
    properties: Array<[string, Schema['AnyNode']]>,
    value: any,
    required: Set<string>,
  ): Array<[string, Schema['AnyNode']]>;
  extractNodeType(node: Schema['AnyNode']): Schema['AnyNode']['nodeType'];
}

export interface CoreSchemaData {
  entityDisplayNames: Record<string, string>;
  stateEntryToUrl: Record<string, string>;
  urlToStateEntry: Record<string, string>;
  entitySchemaCache: Record<string, unknown>;
}
