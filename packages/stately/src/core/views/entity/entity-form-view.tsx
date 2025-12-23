import { BaseForm } from '@statelyjs/ui/form';
import type { Schemas } from '@/schema';
import { type EntityFormProps, EntityProperty, useEntityProperties } from './entity-properties';

export function EntityFormView<Schema extends Schemas = Schemas>({
  node,
  entity,
}: EntityFormProps<Schema>) {
  const { name, required, sortedProperties } = useEntityProperties({ entity, node });

  return (
    <div>
      {/* Name field */}
      {name && (
        <EntityProperty fieldName="name" isRequired={true} node={node.properties.name}>
          {entity?.name}
        </EntityProperty>
      )}

      {/* Render all fields using schema */}
      {sortedProperties
        .map(([fieldName, fieldSchema]) => ({
          fieldName,
          fieldSchema,
          fieldValue: entity?.[fieldName],
        }))
        .filter(property => property.fieldValue !== undefined && property.fieldValue !== null)
        .map(property => (
          <EntityProperty
            fieldName={property.fieldName}
            isRequired={required.has(property.fieldName)}
            key={property.fieldName}
            node={property.fieldSchema}
          >
            <BaseForm.FieldView node={property.fieldSchema} value={property.fieldValue} />
          </EntityProperty>
        ))}
    </div>
  );
}
