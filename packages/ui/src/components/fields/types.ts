import type { StatelyConfig, StatelySchemas } from '@stately/schema';

export interface ViewFieldProps<
  Config extends StatelyConfig = StatelyConfig,
  N extends StatelySchemas<Config>['AnySchemaNode'] = StatelySchemas<Config>['AnySchemaNode'],
  V = unknown,
> {
  node: N;
  value: V;
}

export interface EditFieldProps<
  Config extends StatelyConfig = StatelyConfig,
  N extends StatelySchemas<Config>['AnySchemaNode'] = StatelySchemas<Config>['AnySchemaNode'],
  V = unknown,
> {
  formId: string;
  node: N;
  value: V;
  onChange: (value: V) => void;
  label?: string;
  description?: string;
  placeholder?: string;
  isRequired?: boolean;
  isWizard?: boolean;
}
