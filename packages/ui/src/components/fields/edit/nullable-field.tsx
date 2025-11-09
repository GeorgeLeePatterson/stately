import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import { useId, useState } from 'react';
import { DescriptionLabel } from '@/components/base/description';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldContent, FieldLabel } from '@/components/ui/field';
import { FieldEdit } from '../field-edit';
import type { EditFieldProps } from '../types';

function isValueNulled(value?: any) {
  return (
    value === null ||
    value === undefined ||
    (typeof value === 'object' && Object.keys(value).length === 0)
  );
}

export type NullableEditProps<Config extends StatelyConfig = StatelyConfig> = EditFieldProps<
  Config,
  StatelySchemas<Config>['NullableNode']
>;

/**
 * Nullable field component - handles Option<T> in Rust
 * Checkbox controls visibility; toggling OFF clears the value
 * Toggling ON initializes with default if currently null
 */
export function NullableEdit<Config extends StatelyConfig = StatelyConfig>({
  formId,
  label,
  node,
  value,
  onChange,
  description,
  isRequired,
  isWizard,
}: NullableEditProps<Config>) {
  // Track whether the field should be visible
  const [isIncluded, setIsIncluded] = useState(!isValueNulled(value));

  const instanceId = useId();
  const nullableFormId = `nullable-${instanceId}-${formId}`;

  const handleToggle = (checked: boolean) => {
    setIsIncluded(checked);
    if (!checked) {
      onChange(null);
    }
  };

  return (
    <div className="p-4 border rounded-md space-y-3">
      <Field orientation="horizontal" className="flex space-x-2">
        <Checkbox id={formId} checked={isIncluded} onCheckedChange={handleToggle} />
        <FieldContent>
          <FieldLabel
            htmlFor={`nullable-${label}`}
            className="cursor-pointer font-medium flex justify-between flex-1"
          >
            <span>
              Include {label}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </span>
          </FieldLabel>
          {(node.description || description) && (
            <DescriptionLabel>{node.description || description}</DescriptionLabel>
          )}
        </FieldContent>
      </Field>

      {isIncluded && (
        <FieldEdit
          formId={nullableFormId}
          node={node}
          value={value}
          onChange={onChange}
          label={label}
          isWizard={isWizard}
        />
      )}
    </div>
  );
}
