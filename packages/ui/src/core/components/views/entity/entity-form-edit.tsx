import { useId, useMemo } from 'react';
import { useStatelyUi } from '@/context';
import { FieldEdit } from '@/core/components/fields/field-edit';
import { Field, FieldGroup, FieldSet } from '@/core/components/ui/field';
import { Separator } from '@/core/components/ui/separator';
import { Skeleton } from '@/core/components/ui/skeleton';
import type { CoreEntity, CoreObjectNode, CoreSchemas } from '@/core';
import type { AnyRecord } from '@/core/types';
import { EntityPropertyEdit } from './entity-property-edit';

export interface EntityFormEditProps<Schema extends CoreSchemas = CoreSchemas> {
  node: CoreObjectNode<Schema>;
  value?: CoreEntity<Schema>['data'];
  onChange: (value: CoreEntity<Schema>['data']) => void;
  isRootEntity?: boolean;
  isLoading?: boolean;
}

export function EntityFormEdit<Schema extends CoreSchemas = CoreSchemas>({
  node,
  value,
  onChange,
  isRootEntity,
  isLoading,
}: EntityFormEditProps<Schema>) {
  const { schema } = useStatelyUi();
  const formId = useId();

  const required = useMemo(() => new Set<string>(node.required || []), [node.required]);
  const propertiesWithoutName = useMemo(
    () =>
      schema.utils.sortEntityProperties(
        Object.entries(node.properties)
          .filter(([name]) => name !== 'name')
          .map(([name, schemaNode]) => [name, schemaNode as Schema['AnyNode']]),
        entityData,
        required,
      ) as Array<[string, Schema['AnyNode']]>,
    [node.properties, value, required, schema.utils.sortEntityProperties],
  );

  const formEnabled = !('name' in node.properties) || (isRootEntity && !!value?.name);
  const entityData = (value ?? {}) as AnyRecord;

  return (
    <FieldGroup>
      {'name' in node.properties && (
        <>
          <Separator />
          <EntityPropertyEdit fieldName={'Name'} node={node.properties.name} compact>
            <Field>
              {isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <FieldEdit<Schema>
                  formId={`name-${formId}`}
                  node={node.properties.name}
                  value={entityData.name ?? ''}
                  onChange={newValue => onChange({ ...entityData, name: newValue } as CoreEntity<Schema>['data'])}
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
          const label = schema.utils.generateFieldLabel(fieldName);
          const fieldValue = entityData[fieldName];
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
              <EntityPropertyEdit fieldName={fieldName} node={propNode} isRequired={isRequired}>
                {schema.utils.isPrimitive(propNode) ? <Field>{field}</Field> : field}
              </EntityPropertyEdit>
              {idx < arr.length - 1 && <Separator />}
            </div>
          );
        })}
      </FieldSet>
    </FieldGroup>
  );
}
