import type { CoreSchemas } from '@/core';

export interface ViewFieldProps<
  Schema extends CoreSchemas = CoreSchemas,
  N extends Schema['AnyNode'] = Schema['AnyNode'],
  V = unknown,
> {
  node: N;
  value: V;
}

export interface EditFieldProps<
  Schema extends CoreSchemas = CoreSchemas,
  N extends Schema['AnyNode'] = Schema['AnyNode'],
  V = unknown,
> {
  formId: string;
  node: N;
  value?: V;
  onChange: (value: V) => void;
  label?: string;
  description?: string;
  placeholder?: string;
  isRequired?: boolean;
  isWizard?: boolean;
}
