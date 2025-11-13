import type { CoreSchemas } from './index';

export interface CoreUtils<Schema extends CoreSchemas = CoreSchemas> {
  generateFieldLabel(field: string): string;
  getDefaultValue(node: Schema['plugin']['AnyNode']): unknown;
  sortEntityProperties(
    properties: Array<[string, Schema['plugin']['AnyNode']]>,
    value: any,
    required: Set<string>,
  ): Array<[string, Schema['plugin']['AnyNode']]>;
  extractNodeType(node: Schema['plugin']['AnyNode']): Schema['plugin']['AnyNode']['nodeType'];
}
