import type { StatelySchemas } from '@stately/schema';
import { useId, useMemo } from 'react';
import { FieldEdit } from '@/components/fields/field-edit';
import { Field, FieldGroup, FieldSet } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useStatelyUi } from '@/context';
import { EntityPropertyEdit } from './entity-property';

export function EntityEditForm<Schemas extends StatelySchemas = StatelySchemas>({
  schema,
  value,
  onChange,
  isRootEntity,
  isLoading,
}: {
  schema: Schemas['ObjectNode'];
  value?: any;
  onChange: (value: Schemas['EntityData']) => void;
  isRootEntity?: boolean;
  isLoading?: boolean;
}) {
  const { integration } = useStatelyUi();
  const formId = useId();

  const required = new Set(schema.required || []);
  const propertiesWithoutName = useMemo(
    () =>
      integration.helpers.sortEntityProperties(
        Object.entries(schema.properties).filter(([name, _]) => name !== 'name'),
        value,
        required,
      ),
    [schema.properties, value, required, integration.helpers.sortEntityProperties],
  );

  const formEnabled = !('name' in schema.properties) || (isRootEntity && !!value?.name);

  return (
    <FieldGroup>
      {'name' in schema.properties && (
        <>
          <Separator />
          <EntityPropertyEdit fieldName={'Name'} schema={schema.properties.name} compact>
            <Field>
              {isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <FieldEdit
                  formId={`name-${formId}`}
                  node={schema.properties.name}
                  value={value?.name}
                  onChange={newValue => onChange({ ...(value ?? {}), name: newValue })}
                  label="Name"
                />
              )}
            </Field>
          </EntityPropertyEdit>
          <Separator />
        </>
      )}

      <FieldSet disabled={!formEnabled} className="group disabled:opacity-40 min-w-0">
        {propertiesWithoutName.map(([fieldName, propNode], idx, arr) => {
          const isRequired = required.has(fieldName);
          const label = integration.helpers.generateFieldLabel(fieldName);
          const fieldValue = value?.[fieldName as keyof Schemas['EntityData']];
          const fieldId = `${fieldName}-${formId}`;

          const field = isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <FieldEdit
              formId={fieldId}
              node={propNode}
              value={fieldValue}
              onChange={newValue => onChange({ ...(value ?? {}), [fieldName]: newValue })}
              label={label}
              isRequired={isRequired}
            />
          );

          return (
            <div key={fieldName} className="space-y-3">
              <EntityPropertyEdit fieldName={fieldName} schema={propNode} isRequired={isRequired}>
                {integration.helpers.isPrimitive(propNode) ? <Field>{field}</Field> : field}
              </EntityPropertyEdit>
              {idx < arr.length - 1 && <Separator />}
            </div>
          );
        })}
      </FieldSet>
    </FieldGroup>
  );
}
