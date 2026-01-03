/**
 * Entity view components for displaying and editing schema-driven entities.
 *
 * This module provides React components for rendering entity data in various
 * modes: detail views for read-only display, edit views for form-based editing,
 * and wizard views for step-by-step entity creation.
 *
 * @example
 * ```tsx
 * import { EntityDetailView, EntityEditView, EditMode } from '@statelyjs/stately/core/views/entity';
 *
 * // Display entity details (read-only)
 * <EntityDetailView entityType="User" entityId={userId} />
 *
 * // Edit an entity with a form
 * <EntityEditView
 *   entityType="User"
 *   entityId={userId}
 *   mode={EditMode.Form}
 * />
 * ```
 *
 * @module core/views/entity
 */

import { EntityDetailView } from './entity-detail-view';
import { EditMode, EntityEditView } from './entity-edit-view';
import { EntityFormEdit } from './entity-form-edit';
import {
  EntityJsonView,
  EntityProperty,
  EntityPropertyLabel,
  useEntityProperties,
} from './entity-properties';
import { EntityRemove } from './entity-remove';
import { EntitySelectEdit } from './entity-select-edit';
import { EntityWizardEdit } from './entity-wizard-view';

export type { EntityDetailViewProps } from './entity-detail-view';
export type { EntityEditViewProps } from './entity-edit-view';
export type { EntityFormEditProps } from './entity-form-edit';
export type { EntityFormProps, EntityPropertyProps } from './entity-properties';
export type { EntitySelectEditProps } from './entity-select-edit';
export type { EntityWizardEditProps } from './entity-wizard-view';

export { EditMode };
export { EntityRemove };
export { EntityProperty, EntityJsonView, EntityPropertyLabel, useEntityProperties };
export { EntityFormEdit, EntityWizardEdit, EntitySelectEdit };
export { EntityDetailView, EntityEditView };
