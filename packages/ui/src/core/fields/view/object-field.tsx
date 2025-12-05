import type { AnyRecord } from '@stately/schema/helpers';
import { useMemo } from 'react';
import { DescriptionLabel } from '@/base/components/description-label';
import { NotSet } from '@/base/components/not-set';
import { SimpleLabel } from '@/base/components/simple-label';
import type { FieldViewProps } from '@/base/form/field-view';
import { FieldView } from '@/base/form/field-view';
import type { Schemas } from '@/core/schema';
import { CoreNodeType } from '@/core/schema/nodes';
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
  const required = new Set(node.required || []);
  const objValue = value as AnyRecord;

  // For additionalProperties: extract extra keys not in fixed properties
  const knownKeys = useMemo(() => new Set(Object.keys(node.properties)), [node.properties]);
  const extraFieldsValue = useMemo(() => {
    if (!node.additionalProperties || !objValue) return {};
    return Object.fromEntries(Object.entries(objValue).filter(([k]) => !knownKeys.has(k)));
  }, [node.additionalProperties, objValue, knownKeys]);
  const hasExtraFields = Object.keys(extraFieldsValue).length > 0;

  return (
    <div className="flex-1 border-l-2 border-primary/30 rounded-xs pl-4 py-3 space-y-4">
      {Object.entries(node.properties).map(([propName, propSchema]) => {
        const typedSchema = propSchema as Schema['plugin']['AnyNode'];
        const propValue = objValue[propName];
        const valueDefined = propValue !== undefined && propValue !== null;
        const label = `${utils?.generateFieldLabel(propName)}:`;
        const description = typedSchema.description;
        const singleLine = !valueDefined || schema.plugins.core.isPrimitiveNode(typedSchema);
        const valueDisplay = valueDefined ? (
          <FieldView<Schema> node={typedSchema} value={propValue} />
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

      {/* Render additionalProperties for dynamic keys */}
      {node.additionalProperties && hasExtraFields && (
        <div className="flex flex-col space-y-2">
          <SimpleLabel>Additional Properties:</SimpleLabel>
          <FieldView<Schema>
            node={{ nodeType: CoreNodeType.Map, valueSchema: node.additionalProperties }}
            value={extraFieldsValue}
          />
        </div>
      )}
    </div>
  );
}
