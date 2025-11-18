import type { Schemas } from '@stately/schema';
import type { NullableNode } from '@stately/schema/core/nodes';
import { useId, useState } from 'react';
import { DescriptionLabel } from '@/base/components/description';
import type { EditFieldProps } from '@/base/form/field-edit';
import { FieldEdit } from '@/base/form/field-edit';
import { Checkbox } from '@/base/ui/checkbox';
import { Field, FieldContent, FieldLabel } from '@/base/ui/field';

function isValueNulled(value?: any) {
  return (
    value === null ||
    value === undefined ||
    (typeof value === 'object' && Object.keys(value).length === 0)
  );
}

export type NullableEditProps<Schema extends Schemas = Schemas> = EditFieldProps<
  Schema,
  NullableNode<Schema['plugin']['AnyNode']>
>;

/**
 * Nullable field component - handles Option<T> in Rust
 * Checkbox controls visibility; toggling OFF clears the value
 * Toggling ON initializes with default if currently null
 */
export function NullableEdit<Schema extends Schemas = Schemas>({
  formId,
  label,
  node,
  value,
  onChange,
  description,
  isRequired,
  isWizard,
}: NullableEditProps<Schema>) {
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
      <Field className="flex space-x-2" orientation="horizontal">
        <Checkbox checked={isIncluded} id={formId} onCheckedChange={handleToggle} />
        <FieldContent>
          <FieldLabel
            className="cursor-pointer font-medium flex justify-between flex-1"
            htmlFor={`nullable-${label}`}
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
        <FieldEdit<Schema>
          formId={nullableFormId}
          isWizard={isWizard}
          label={label}
          node={node}
          onChange={onChange}
          value={value}
        />
      )}
    </div>
  );
}
