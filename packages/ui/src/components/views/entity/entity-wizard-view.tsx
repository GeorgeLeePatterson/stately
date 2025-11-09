import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import type { AnyRecord } from '@stately/schema/helpers';
import { useId } from 'react';
import { ObjectWizard } from '../../fields/edit/object-wizard';

interface EntityWizardViewProps<Config extends StatelyConfig = StatelyConfig> {
  schema: StatelySchemas<Config>['ObjectNode'];
  value?: any;
  onChange: (value: AnyRecord) => void;
  onComplete?: () => void;
  isLoading?: boolean;
}

/**
 * EntityWizardView - Step-by-step wizard for creating/editing entities
 * Walks through each top-level field one at a time
 */
export function EntityWizardView<Config extends StatelyConfig = StatelyConfig>({
  schema,
  value,
  onChange,
  onComplete,
  isLoading,
}: EntityWizardViewProps<Config>) {
  const formId = useId();
  return (
    <ObjectWizard<Config>
      formId={formId}
      node={schema}
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      isLoading={isLoading}
    />
  );
}
