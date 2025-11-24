import { FieldEdit } from './field-edit';
import { FieldView } from './field-view';
import { FormActions } from './form-actions';
import { JsonEdit } from './json-edit';
import { JsonView } from './json-view';

export type * from './field-edit';
export type * from './field-view';
export type * from './form-actions';
export type * from './json-edit';
export type * from './json-view';

export const BaseForm = { FieldEdit, FieldView, FormActions, JsonEdit, JsonView };
