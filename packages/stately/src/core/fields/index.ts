/**
 * Field rendering components organized by mode (view/edit).
 *
 * This module provides the field renderer registries that map schema node types
 * to their corresponding React components. `ViewFields` contains read-only
 * renderers, while `EditFields` contains form input renderers.
 *
 * These are used internally by the form system but can be accessed directly
 * for custom field rendering or to extend with additional node type handlers.
 *
 * @example
 * ```tsx
 * import { EditFields, ViewFields } from '@statelyjs/stately/core/fields';
 *
 * // Access the array field editor component
 * const ArrayEditor = EditFields.ArrayField;
 *
 * // Access the object field viewer component
 * const ObjectViewer = ViewFields.ObjectField;
 * ```
 *
 * @module core/fields
 */

import { EditFields } from './edit';
import { ViewFields } from './view';

export { EditFields, ViewFields };
