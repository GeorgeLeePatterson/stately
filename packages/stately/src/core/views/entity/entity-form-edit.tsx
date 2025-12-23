import { devLog, generateFieldFormId } from '@statelyjs/ui';
import { Field, FieldSet } from '@statelyjs/ui/components/base/field';
import { Skeleton } from '@statelyjs/ui/components/base/skeleton';
import { BaseForm } from '@statelyjs/ui/form';
import { useId } from 'react';
import type { CoreEntityData } from '@/core';
import type { Schemas } from '@/core/schema';
import { useStatelyUi } from '@/index';
import { type EntityFormProps, EntityProperty, useEntityProperties } from './entity-properties';

export interface EntityFormEditProps<Schema extends Schemas = Schemas> {
  onChange: (value: CoreEntityData<Schema>) => void;
  isRootEntity?: boolean;
  isLoading?: boolean;
}

export function EntityFormEdit<Schema extends Schemas = Schemas>({
  node,
  entity,
  onChange,
  isRootEntity,
  isLoading,
}: EntityFormEditProps<Schema> & EntityFormProps<Schema>) {
  const { schema, utils } = useStatelyUi<Schema>();
  const formId = useId();

  const { name, required, sortedProperties } = useEntityProperties({ entity, node });

  const fieldTypePrefix = isRootEntity ? 'Entity' : 'LinkedEntity';
  const formDisabled = 'name' in node.properties && isRootEntity && !entity?.name;

  devLog.debug('Core', 'EntityFormEdit', {
    formDisabled,
    isLoading,
    isRootEntity,
    node,
    value: entity,
  });

  return (
    <div>
      {name && (
        <EntityProperty fieldName="name" isRequired={isRootEntity} node={name.node}>
          <Field>
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <BaseForm.FieldEdit<Schema, Schema['plugin']['Nodes']['primitive'], string>
                formId={generateFieldFormId(fieldTypePrefix, 'name', formId)}
                label="name"
                node={name.node}
                onChange={newValue => onChange({ ...(entity ?? {}), name: newValue })}
                value={entity?.name ?? ''}
              />
            )}
          </Field>
        </EntityProperty>
      )}

      <FieldSet className="group disabled:opacity-40 min-w-0 gap-0" disabled={formDisabled}>
        {sortedProperties.map(([fieldName, propNode]) => {
          const isRequired = required.has(fieldName);
          const label = utils?.generateFieldLabel(fieldName);
          const fieldValue = entity?.[fieldName];
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
              onChange={newValue => onChange({ ...(entity ?? {}), [fieldName]: newValue })}
              value={fieldValue}
            />
          );

          return (
            <EntityProperty
              fieldName={fieldName}
              isRequired={isRequired}
              key={fieldName}
              node={propNode}
            >
              {schema.plugins.core.isPrimitiveNodeLike(propNode) ? <Field>{field}</Field> : field}
            </EntityProperty>
          );
        })}
      </FieldSet>
    </div>
  );
}
