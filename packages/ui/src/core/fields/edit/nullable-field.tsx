import { useId, useState } from 'react';
import { DescriptionLabel } from '@/base/components/description-label';
import type { FieldEditProps } from '@/base/form/field-edit';
import { FieldEdit } from '@/base/form/field-edit';
import { Checkbox } from '@/base/ui/checkbox';
import { Field, FieldContent, FieldLabel } from '@/base/ui/field';
import { generateFieldFormId } from '@/base/utils';
import type { Schemas } from '@/core/schema';
import { CoreNodeType } from '@/core/schema/nodes';
import { EntityPropertyEdit } from '@/core/views/entity/entity-property-edit';

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
  const [isIncluded, setIsIncluded] = useState(!isValueNulled(value));

  const instanceId = useId();
  const nullableFormId = `nullable-${instanceId}-${formId}`;

  const handleToggle = (checked: boolean) => {
    setIsIncluded(checked);
    if (!checked) {
      onChange(null);
    }
  };

  const innerSchema = node.innerSchema;
  const isPrimitive = innerSchema.nodeType === CoreNodeType.Primitive;
  const isBoolean = isPrimitive && innerSchema.primitiveType === 'boolean';

  const field = (
    <FieldEdit<Schema>
      formId={generateFieldFormId(innerSchema.nodeType, label || '', nullableFormId)}
      isWizard={isWizard}
      label={label}
      node={innerSchema}
      onChange={onChange}
      value={value}
    />
  );

  const formField = isPrimitive ? (
    <EntityPropertyEdit fieldName={label} isRequired={isRequired} node={innerSchema}>
      <Field>{field}</Field>
    </EntityPropertyEdit>
  ) : (
    field
  );

  return (
    <div className="p-4 border rounded-md space-y-3">
      {isBoolean ? (
        formField
      ) : (
        <>
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
          {isIncluded && formField}
        </>
      )}
    </div>
  );
}
