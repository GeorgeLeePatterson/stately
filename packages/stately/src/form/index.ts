/**
 * Base form components for rendering and editing schema-driven data.
 *
 * This module provides low-level form primitives that render fields based on
 * schema node types. These components handle the recursive rendering of complex
 * nested structures including objects, arrays, unions, and primitives.
 *
 * @example
 * ```tsx
 * import { BaseForm } from '@statelyjs/stately/form';
 *
 * // Render a read-only view of JSON data
 * <BaseForm.JsonView data={entity} schema={schema} />
 *
 * // Render an editable form
 * <BaseForm.JsonEdit
 *   data={entity}
 *   schema={schema}
 *   onChange={handleChange}
 * />
 * ```
 *
 * @module form
 */

import { FieldEdit } from './field-edit';
import { PropertyLabel } from './field-label';
import { FieldView } from './field-view';
import { FormActions } from './form-actions';
import { JsonEdit } from './json-edit';
import { JsonView } from './json-view';

export type { PropertyLabelProps } from './field-label';
export type { FormActionsProps } from './form-actions';
export type { JsonEditProps } from './json-edit';
export type { JsonViewProps } from './json-view';

export const BaseForm = { FieldEdit, FieldView, FormActions, JsonEdit, JsonView, PropertyLabel };
