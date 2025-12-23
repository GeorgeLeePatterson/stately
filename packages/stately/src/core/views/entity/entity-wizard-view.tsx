import { useId } from 'react';
import type { CoreEntityData } from '@/core';
import { ObjectWizardEdit } from '@/core/fields/edit/object-wizard';
import type { Schemas } from '@/core/schema';

export interface EntityWizardEditProps<Schema extends Schemas = Schemas> {
  node: Schema['plugin']['Nodes']['object'];
  value?: CoreEntityData<Schema>;
  onChange: (value: CoreEntityData<Schema>) => void;
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
    <ObjectWizardEdit<Schema, Schema['plugin']['Nodes']['object'], CoreEntityData<Schema>>
      formId={formId}
      isLoading={isLoading}
      node={newNode}
      onChange={onChange}
      onComplete={onComplete}
      value={value}
    />
  );
}
