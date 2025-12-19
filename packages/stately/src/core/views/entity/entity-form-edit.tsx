import type { AnyRecord } from '@statelyjs/schema/helpers';
import { devLog, generateFieldFormId } from '@statelyjs/ui';
import { Field, FieldGroup, FieldSet } from '@statelyjs/ui/components/base/field';
import { Separator } from '@statelyjs/ui/components/base/separator';
import { Skeleton } from '@statelyjs/ui/components/base/skeleton';
import { BaseForm } from '@statelyjs/ui/form';
import { useId, useMemo } from 'react';
import type { CoreEntityData } from '@/core';
import type { Schemas } from '@/core/schema';
import { useStatelyUi } from '@/index';
import { EntityPropertyEdit } from './entity-property-edit';

export interface EntityFormEditProps<Schema extends Schemas = Schemas> {
  node: Schema['plugin']['Nodes']['object'];
  value?: CoreEntityData<Schema>;
  onChange: (value: CoreEntityData<Schema>) => void;
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
  const { schema, utils } = useStatelyUi<Schema>();
  const formId = useId();

  const formDisabled = 'name' in node.properties && isRootEntity && !value?.name;
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

  const fieldTypePrefix = isRootEntity ? 'Entity' : 'LinkedEntity';

  devLog.debug('Core', 'EntityFormEdit', { formDisabled, isLoading, isRootEntity, node, value });

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
                <BaseForm.FieldEdit<Schema>
                  formId={generateFieldFormId(fieldTypePrefix, 'name', formId)}
                  label="Name"
                  node={node.properties.name}
                  onChange={newValue =>
                    onChange({ ...entityData, name: newValue } as CoreEntityData<Schema>)
                  }
                  value={entityData.name ?? ''}
                />
              )}
            </Field>
          </EntityPropertyEdit>
          <Separator />
        </>
      )}

      <FieldSet className="group disabled:opacity-40 min-w-0" disabled={formDisabled}>
        {propertiesWithoutName.map(([fieldName, propNode], idx, arr) => {
          const isRequired = required.has(fieldName);
          const label = utils?.generateFieldLabel(fieldName);
          const fieldValue = entityData[fieldName];
          const fieldFormId = generateFieldFormId(
            `${fieldTypePrefix}-${propNode.nodeType}`,
            fieldName,
            formId,
          );

          const field = isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <BaseForm.FieldEdit<Schema, typeof propNode>
              formId={fieldFormId}
              isRequired={isRequired}
              label={label}
              node={propNode}
              onChange={newValue =>
                onChange({ ...(value ?? {}), [fieldName]: newValue } as CoreEntityData<Schema>)
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
