import type { Schemas } from '@stately/schema';
import type { AnyRecord } from '@stately/schema/helpers';
import { useId, useMemo } from 'react';
import { FieldEdit } from '@/base/form/field-edit';
import { Field, FieldGroup, FieldSet } from '@/base/ui/field';
import { Separator } from '@/base/ui/separator';
import { Skeleton } from '@/base/ui/skeleton';
import type { CoreEntity } from '@/core';
import { useStatelyUi } from '@/index';
import { EntityPropertyEdit } from './entity-property-edit';

export interface EntityFormEditProps<Schema extends Schemas = Schemas> {
  node: Schema['plugin']['Nodes']['object'];
  value?: CoreEntity<Schema>['data'];
  onChange: (value: CoreEntity<Schema>['data']) => void;
  isRootEntity?: boolean;
  isLoading?: boolean;
}

export function EntityFormEdit<Schema extends Schemas = Schemas>({
  node,
  value,
  onChange,
  isRootEntity,
  isLoading,
}: EntityFormEditProps<Schema>) {
  const { schema, utils } = useStatelyUi<Schema, []>();
  const formId = useId();

  const formEnabled = !('name' in node.properties) || (isRootEntity && !!value?.name);
  const entityData = (value ?? {}) as AnyRecord;

  const required = useMemo(() => new Set<string>(node.required || []), [node.required]);
  const propertiesWithoutName = useMemo(
    () =>
      schema.plugins.core.sortEntityProperties(
        Object.entries(node.properties)
          .filter(([name]) => name !== 'name')
          .map(([name, schemaNode]) => [name, schemaNode as Schema['plugin']['AnyNode']]),
        entityData,
        required,
      ) as Array<[string, Schema['plugin']['AnyNode']]>,
    [node.properties, entityData, required, schema.plugins.core.sortEntityProperties],
  );

  return (
    <FieldGroup>
      {'name' in node.properties && (
        <>
          <Separator />
          <EntityPropertyEdit compact fieldName={'Name'} node={node.properties.name}>
            <Field>
              {isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <FieldEdit<Schema>
                  formId={`name-${formId}`}
                  label="Name"
                  node={node.properties.name}
                  onChange={newValue =>
                    onChange({ ...entityData, name: newValue } as CoreEntity<Schema>['data'])
                  }
                  value={entityData.name ?? ''}
                />
              )}
            </Field>
          </EntityPropertyEdit>
          <Separator />
        </>
      )}

      <FieldSet className="group disabled:opacity-40 min-w-0" disabled={!formEnabled}>
        {propertiesWithoutName.map(([fieldName, propNode], idx, arr) => {
          const isRequired = required.has(fieldName);
          const label = utils?.generateFieldLabel(fieldName);
          const fieldValue = entityData[fieldName];
          const fieldId = `${fieldName}-${formId}`;

          const field = isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <FieldEdit<Schema, typeof propNode>
              formId={fieldId}
              isRequired={isRequired}
              label={label}
              node={propNode}
              onChange={newValue =>
                onChange({ ...(value ?? {}), [fieldName]: newValue } as CoreEntity<Schema>['data'])
              }
              value={fieldValue}
            />
          );

          return (
            <div className="space-y-3" key={fieldName}>
              <EntityPropertyEdit fieldName={fieldName} isRequired={isRequired} node={propNode}>
                {schema.plugins.core.isPrimitiveNode(propNode) ? <Field>{field}</Field> : field}
              </EntityPropertyEdit>
              {idx < arr.length - 1 && <Separator />}
            </div>
          );
        })}
      </FieldSet>
    </FieldGroup>
  );
}
