import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import { useCallback } from 'react';
import { EntitySelectEdit } from '../entity/entity-select-edit';
import type { LinkFor } from './link-edit-view';

export interface LinkRefEditProps<Config extends StatelyConfig = StatelyConfig> {
  /** Whether the form is readonly */
  isReadOnly?: boolean;
  /** Show loading indicator */
  isLoading?: boolean;
  /** The entity type being referenced (e.g., "source_driver", "input") */
  targetType: StatelySchemas<Config>['StateEntry'];
  /** List of entity refs */
  availableEntities: Array<Config['components']['schemas']['Summary']>;
  /** Schema for the inline entity */
  node: StatelySchemas<Config>['ObjectNode'];
  /** Current value from parent (either ref or inline) */
  value?: LinkFor<Config> | null;
  /** Called when save is clicked with new ref value */
  onChange: (value: LinkFor<Config>) => void;
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
export function LinkRefEdit<Config extends StatelyConfig = StatelyConfig>({
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
}: LinkRefEditProps<Config>) {
  const ref = value && 'ref' in value ? value.ref : isReadOnly ? 'default' : '';

  // Handle selection change
  const handleChange = useCallback(
    (selectedRef: string | null) => {
      onChange({ entity_type: targetType, ref: selectedRef } as LinkFor<Config>);
    },
    [targetType, onChange],
  );

  return (
    <EntitySelectEdit
      targetType={targetType}
      isReadOnly={isReadOnly}
      isLoading={isLoading}
      available={availableEntities}
      value={ref}
      onChange={handleChange}
      onRefresh={onRefresh}
      node={node}
      after={after}
      onEdit={onEditAsInline}
    />
  );
}
