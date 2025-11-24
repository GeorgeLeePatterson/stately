import type { Schemas } from '@stately/schema';
import type { ObjectNode } from '@stately/schema/core/nodes';
import { useCallback } from 'react';
import type { CoreStateEntry } from '@/core';
import { EntitySelectEdit } from '../entity/entity-select-edit';
import type { LinkFor } from './link-edit-view';

export interface LinkRefEditProps<Schema extends Schemas = Schemas> {
  /** Whether the form is readonly */
  isReadOnly?: boolean;
  /** Show loading indicator */
  isLoading?: boolean;
  /** The entity type being referenced (e.g., "source_driver", "input") */
  targetType: CoreStateEntry<Schema>;
  /** List of entity refs */
  availableEntities: Array<Schema['config']['components']['schemas']['Summary']>;
  /** Schema for the inline entity */
  node: ObjectNode;
  /** Current value from parent (either ref or inline) */
  value?: LinkFor<Schema> | null;
  /** Called when save is clicked with new ref value */
  onChange: (value: LinkFor<Schema>) => void;
  /** Called when refresh is clicked */
  onRefresh: () => void;
  /** Render the mode toggle */
  after?: React.ReactNode;
  /** Callback to edit as inline */
  onEditAsInline?: (ref: string) => void;
}

/**
 * Component for editing Link<T> in reference mode
 *
 * Responsibilities:
 * - Manage its own formData and isDirty state
 * - Fetch available entities for the target type
 * - Display dropdown selector
 * - Handle save/cancel with proper validation
 */
export function LinkRefEdit<Schema extends Schemas = Schemas>({
  isReadOnly,
  isLoading,
  targetType,
  availableEntities,
  node,
  value,
  onChange,
  onRefresh,
  after,
  onEditAsInline,
}: LinkRefEditProps<Schema>) {
  const ref = value && 'ref' in value ? value.ref : isReadOnly ? 'default' : '';

  // Handle selection change
  const handleChange = useCallback(
    (selectedRef: string | null) => {
      onChange({ entity_type: targetType, ref: selectedRef } as LinkFor<Schema>);
    },
    [targetType, onChange],
  );

  return (
    <EntitySelectEdit
      after={after}
      available={availableEntities}
      isLoading={isLoading}
      isReadOnly={isReadOnly}
      node={node}
      onChange={handleChange}
      onEdit={onEditAsInline}
      onRefresh={onRefresh}
      targetType={targetType}
      value={ref}
    />
  );
}
