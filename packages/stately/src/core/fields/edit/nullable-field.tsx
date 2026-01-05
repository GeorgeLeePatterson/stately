import { generateFieldFormId } from '@statelyjs/ui';
import { Checkbox } from '@statelyjs/ui/components/base/checkbox';
import { Field } from '@statelyjs/ui/components/base/field';
import type { FieldEditProps } from '@statelyjs/ui/registry';
import { useId, useState } from 'react';
import type { Schemas } from '@/core/schema';
import { CoreNodeType } from '@/core/schema/nodes';
import { isPrimitiveNodeLike } from '@/core/schema/utils';
import { BaseForm } from '@/form';
import { PropertyLabel } from '@/form/field-label';

function isValueNulled(value?: any) {
  return (
    value === null ||
    value === undefined ||
    (typeof value === 'object' && Object.keys(value).length === 0)
  );
}

export type NullableEditProps<Schema extends Schemas = Schemas> = FieldEditProps<
  Schema,
  Schema['plugin']['Nodes']['nullable']
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
  const [isIncluded_, setIsIncluded] = useState(!isValueNulled(value));

  // If a value is provided, it's included
  const isIncluded = isIncluded_ || !isValueNulled(value);

  const instanceId = useId();
  const nullableFormId = `nullable-${instanceId}`;

  const handleToggle = (checked: boolean) => {
    setIsIncluded(checked);
    if (!checked) {
      onChange(null);
    }
  };

  const innerSchema = node.innerSchema;
  const isPrimitive = isPrimitiveNodeLike(innerSchema);
  const isBoolean =
    innerSchema.nodeType === CoreNodeType.Primitive && innerSchema.primitiveType === 'boolean';

  const truncateLabel = label === null;

  const includeLabel = <span className="italic">Include</span>;
  const resolvedLabel = truncateLabel ? (
    includeLabel
  ) : (
    <>
      {includeLabel} {label}
    </>
  );
  const resolvedDescription =
    description === null ? description : description || node.description || innerSchema.description;

  const field = (
    <BaseForm.FieldEdit<Schema>
      formId={generateFieldFormId({
        fieldType: innerSchema.nodeType,
        formId,
        instanceFormId: nullableFormId,
        propertyName: label || '',
      })}
      isWizard={isWizard}
      label={label}
      node={innerSchema}
      onChange={onChange}
      value={value}
    />
  );

  const formField = !isPrimitive || truncateLabel ? field : <Field>{field}</Field>;

  return (
    <div className="p-4 border rounded-md space-y-3">
      {isBoolean ? (
        truncateLabel ? (
          formField
        ) : (
          <>
            <PropertyLabel
              description={resolvedDescription}
              fieldLabelProps={{
                className: 'cursor-pointer font-medium flex justify-between flex-1',
                htmlFor: `nullable-${formId}`,
              }}
              isRequired={isRequired}
              label={`Include ${label}`}
            />
            {formField}
          </>
        )
      ) : (
        <>
          <Field orientation="horizontal">
            <Checkbox
              checked={isIncluded}
              id={`nullable-${formId}`}
              onCheckedChange={handleToggle}
            />
            <PropertyLabel
              description={resolvedDescription}
              fieldLabelProps={{
                className: 'cursor-pointer font-medium flex justify-between flex-1',
                htmlFor: `nullable-${formId}`,
              }}
              isRequired={isRequired}
              label={resolvedLabel}
            />
          </Field>
          {isIncluded && formField}
        </>
      )}
    </div>
  );
}
