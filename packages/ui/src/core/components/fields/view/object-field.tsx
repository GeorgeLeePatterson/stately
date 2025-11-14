import type { CoreObjectNode, CoreSchemas } from "@/core";
import { useStatelyUi } from "@/context";
import { DescriptionLabel } from "@/core/components/base/description";
import { NotSet } from "@/core/components/base/not-set";
import { SimpleLabel } from "@/core/components/base/simple-label";
import { FieldView } from "@/base/form/field-view";
import type { ViewFieldProps } from "@/base/form/field-view";
import { AnyRecord } from "@stately/schema/helpers";
import { useCoreStatelyUi } from "@/core";

export type ObjectViewProps<Schema extends CoreSchemas = CoreSchemas> =
  ViewFieldProps<Schema, CoreObjectNode<Schema>, any>;

export function ObjectView<Schema extends CoreSchemas = CoreSchemas>({
  value,
  node,
}: ObjectViewProps<Schema>) {
  const { schema, plugins } = useCoreStatelyUi();
  const required = new Set(node.required || []);
  const objValue = value as AnyRecord;

  return (
    <div className="flex-1 border-l-2 border-primary/30 rounded-xs pl-4 py-3 space-y-4">
      {Object.entries(node.properties).map(([propName, propSchema]) => {
        const typedSchema = propSchema as Schema['plugin']["AnyNode"];
        const propValue = objValue[propName];
        const valueDefined = propValue !== undefined && propValue !== null;
        const label = `${plugins.core.utils?.generateFieldLabel(propName)}:`;
        const description = typedSchema.description;
        const singleLine =
          !valueDefined || schema.plugins.core.isPrimitive(typedSchema);
        const valueDisplay = valueDefined ? (
          <FieldView node={typedSchema} value={propValue} />
        ) : (
          <NotSet />
        );
        const wrappingClass = singleLine
          ? "items-center"
          : "flex-col space-y-2";

        return (
          <div key={propName} className={`flex flex-1 gap-2 ${wrappingClass}`}>
            <div className="flex flex-col justify-between">
              {label && (
                <SimpleLabel>
                  {label}
                  {required.has(propName) && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </SimpleLabel>
              )}
              {description && !singleLine && (
                <DescriptionLabel>{description}</DescriptionLabel>
              )}
            </div>
            <div className="flex-1">{valueDisplay}</div>
          </div>
        );
      })}
    </div>
  );
}
