import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import type { AnyRecord } from '@stately/schema/helpers';
import { useId } from 'react';
import { ObjectWizardEdit } from '../../fields/edit/object-wizard';

export interface EntityWizardViewProps<Config extends StatelyConfig = StatelyConfig> {
  node: StatelySchemas<Config>['ObjectNode'];
  value?: StatelySchemas<Config>['EntityData'];
  onChange: (value: StatelySchemas<Config>['EntityData']) => void;
  onComplete?: () => void;
  isLoading?: boolean;
  isRootEntity?: boolean;
}

/**
 * EntityWizardView - Step-by-step wizard for creating/editing entities
 * Walks through each top-level field one at a time
 */
export function EntityWizardView<Config extends StatelyConfig = StatelyConfig>({
  node,
  value,
  onChange,
  onComplete,
  isLoading,
  isRootEntity,
}: EntityWizardViewProps<Config>) {
  const formId = useId();
  // If the entity has a name property, ensure it's required if the entity is root
  const newNode =
    'name' in node.properties && isRootEntity
      ? { ...node, required: [...node.required, 'name'] }
      : node;
  return (
    <ObjectWizardEdit<Config>
      formId={formId}
      node={newNode}
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      isLoading={isLoading}
    />
  );
}
