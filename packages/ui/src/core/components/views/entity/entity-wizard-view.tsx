import type { Schemas } from '@stately/schema';
import { useId } from 'react';
import type { CoreEntity, CoreObjectNode } from '@/core';
import { ObjectWizardEdit } from '../../fields/edit/object-wizard';

export interface EntityWizardViewProps<Schema extends Schemas = Schemas> {
  node: CoreObjectNode<Schema>;
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
export function EntityWizardView<Schema extends Schemas = Schemas>({
  node,
  value,
  onChange,
  onComplete,
  isLoading,
  isRootEntity,
}: EntityWizardViewProps<Schema>) {
  const formId = useId();
  // If the entity has a name property, ensure it's required if the entity is root
  const newNode =
    'name' in node.properties && isRootEntity
      ? { ...node, required: [...node.required, 'name'] }
      : node;
  return (
    <ObjectWizardEdit<Schema>
      formId={formId}
      isLoading={isLoading}
      node={newNode}
      onChange={onChange}
      onComplete={onComplete}
      value={value}
    />
  );
}
