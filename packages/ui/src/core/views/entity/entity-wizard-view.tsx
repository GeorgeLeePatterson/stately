import { useId } from 'react';
import type { CoreEntity } from '@/core';
import type { Schemas } from '@/core/schema';
import { ObjectWizardEdit } from '../../fields/edit/object-wizard';

export interface EntityWizardEditProps<Schema extends Schemas = Schemas> {
  node: Schema['plugin']['Nodes']['object'];
  value?: CoreEntity<Schema>['data'];
  onChange: (value: CoreEntity<Schema>['data']) => void;
  onComplete?: () => void;
  isLoading?: boolean;
  isRootEntity?: boolean;
}

/**
 * EntityWizardView - Step-by-step wizard for creating/editing entities
 * Walks through each top-level field one at a time
 */
export function EntityWizardEdit<Schema extends Schemas = Schemas>({
  node,
  value,
  onChange,
  onComplete,
  isLoading,
  isRootEntity,
}: EntityWizardEditProps<Schema>) {
  const formId = useId();
  // If the entity has a name property, ensure it's required if the entity is root
  const newNode =
    'name' in node.properties && isRootEntity
      ? { ...node, required: [...node.required, 'name'] }
      : node;
  return (
    <ObjectWizardEdit<Schema, Schema['plugin']['Nodes']['object'], CoreEntity<Schema>['data']>
      formId={formId}
      isLoading={isLoading}
      node={newNode}
      onChange={onChange}
      onComplete={onComplete}
      value={value}
    />
  );
}
