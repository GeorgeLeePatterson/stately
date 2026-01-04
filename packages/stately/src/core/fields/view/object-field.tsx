import { DescriptionLabel, NotSet, SimpleLabel } from '@statelyjs/ui/components';
import type { FieldViewProps } from '@statelyjs/ui/registry';
import { useMemo } from 'react';
import { getAdditionalValues, getMergedValues } from '@/core/hooks/use-object-field';
import { useObjectSchema } from '@/core/hooks/use-object-schema';
import type { Schemas } from '@/core/schema';
import { CoreNodeType } from '@/core/schema/nodes';
import { BaseForm } from '@/form';
import { useStatelyUi } from '@/index';

export type ObjectViewProps<Schema extends Schemas = Schemas> = FieldViewProps<
  Schema,
  Schema['plugin']['Nodes']['object'],
  any
>;

export function ObjectView<Schema extends Schemas = Schemas>({
  value,
  node,
}: ObjectViewProps<Schema>) {
  const { schema, utils } = useStatelyUi<Schema>();

  const { fields, merged, additional, propertyKeys, mergedKeys, required } = useObjectSchema(node);

  // const propertyKeys = useMemo(() => new Set(Object.keys(node.properties)), [node.properties]);

  // Zip merged schemas with their values (each schema gets its own subset of formData)
  const mergedFieldsValues = useMemo(() => {
    return getMergedValues(merged, value);
  }, [merged, value]);

  // Derive additional fields value (not in properties, not in merged)
  const additionalFieldsValue = useMemo(() => {
    return getAdditionalValues(propertyKeys, mergedKeys, additional, value);
  }, [additional, value, propertyKeys, mergedKeys]);

  const hasMerged = Object.keys(mergedFieldsValues).length > 0;
  const hasAdditional = Object.keys(additionalFieldsValue).length > 0;

  return (
    <div className="flex-1 border-l-2 border-primary/30 rounded-xs pl-4 py-3 space-y-4">
      {fields.map(([propName, propSchema]) => {
        const typedSchema = propSchema as Schema['plugin']['AnyNode'];
        const propValue = value[propName];
        const valueDefined = propValue !== undefined && propValue !== null;
        const label = `${utils?.generateFieldLabel(propName)}:`;
        const description = typedSchema.description;
        const singleLine = !valueDefined || schema.plugins.core.isPrimitiveNodeLike(typedSchema);
        const valueDisplay = valueDefined ? (
          <BaseForm.FieldView<Schema> node={typedSchema} value={propValue} />
        ) : (
          <NotSet />
        );
        const wrappingClass = singleLine ? 'items-center' : 'flex-col space-y-2';

        return (
          <div className={`flex flex-1 gap-2 ${wrappingClass}`} key={propName}>
            <div className="flex flex-col justify-between">
              {label && (
                <SimpleLabel>
                  {label}
                  {required.has(propName) && <span className="text-destructive ml-1">*</span>}
                </SimpleLabel>
              )}
              {description && !singleLine && <DescriptionLabel>{description}</DescriptionLabel>}
            </div>
            <div className="flex-1">{valueDisplay}</div>
          </div>
        );
      })}

      {/* Render merged for dynamic keys */}
      {mergedFieldsValues && hasMerged && (
        <div className="flex flex-col space-y-2">
          {mergedFieldsValues.map(({ schema: mergedSchema, value: mergedValue }, i) => (
            <BaseForm.FieldView<Schema>
              key={`${mergedSchema.nodeType}-${i}`}
              node={mergedSchema}
              value={mergedValue}
            />
          ))}
        </div>
      )}

      {/* Render additionalProperties for dynamic keys */}
      {additional && additionalFieldsValue && hasAdditional && (
        <div className="flex flex-col space-y-2">
          <SimpleLabel>Additional Properties:</SimpleLabel>
          <BaseForm.FieldView<Schema>
            node={{ nodeType: CoreNodeType.Map, valueSchema: additional }}
            value={additionalFieldsValue}
          />
        </div>
      )}
    </div>
  );
}
