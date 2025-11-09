import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import { useId, useMemo } from 'react';
import { FieldEdit } from '@/components/fields/field-edit';
import { Field, FieldGroup, FieldSet } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useStatelyUi } from '@/context';
import { EntityPropertyEdit } from './entity-property-edit';

export interface EntityFormEditProps<Config extends StatelyConfig = StatelyConfig> {
  node: StatelySchemas<Config>['ObjectNode'];
  value?: StatelySchemas<Config>['EntityData'];
  onChange: (value: StatelySchemas<Config>['EntityData']) => void;
  isRootEntity?: boolean;
  isLoading?: boolean;
}

export function EntityFormEdit<Config extends StatelyConfig = StatelyConfig>({
  node,
  value,
  onChange,
  isRootEntity,
  isLoading,
}: EntityFormEditProps<Config>) {
  const { integration } = useStatelyUi();
  const formId = useId();

  const required = new Set(node.required || []);
  const propertiesWithoutName = useMemo(
    () =>
      integration.helpers.sortEntityProperties(
        Object.entries(node.properties).filter(([name, _]) => name !== 'name'),
        value,
        required,
      ),
    [node.properties, value, required, integration.helpers.sortEntityProperties],
  );

  const formEnabled = !('name' in node.properties) || (isRootEntity && !!value?.name);

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
                <FieldEdit<Config, StatelySchemas<Config>['AnySchemaNode'], string>
                  formId={`name-${formId}`}
                  node={node.properties.name}
                  value={value?.name || ''}
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
          const fieldValue = value?.[fieldName as keyof StatelySchemas<Config>['EntityData']];
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
