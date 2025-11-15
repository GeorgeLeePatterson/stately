import { useId, useMemo } from "react";
import { useStatelyUi } from "@/context";
import { Field, FieldGroup, FieldSet } from "@/core/components/ui/field";
import { Separator } from "@/core/components/ui/separator";
import { Skeleton } from "@/core/components/ui/skeleton";
import type { CoreEntity, CoreObjectNode } from "@/core";
import { EntityPropertyEdit } from "./entity-property-edit";
import { useCoreStatelyUi } from "@/context";
import { AnyRecord } from "@stately/schema/helpers";
import { FieldEdit } from "@/base/form/field-edit";
import { Schemas } from "@stately/schema";

export interface EntityFormEditProps<Schema extends Schemas = Schemas> {
  node: CoreObjectNode<Schema>;
  value?: CoreEntity<Schema>["data"];
  onChange: (value: CoreEntity<Schema>["data"]) => void;
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
  const { schema, plugins } = useCoreStatelyUi();
  const formId = useId();

  const required = useMemo(
    () => new Set<string>(node.required || []),
    [node.required],
  );
  const propertiesWithoutName = useMemo(
    () =>
      schema.plugins.core.sortEntityProperties(
        Object.entries(node.properties)
          .filter(([name]) => name !== "name")
          .map(([name, schemaNode]) => [name, schemaNode as Schema['plugin']["AnyNode"]]),
        entityData,
        required,
      ) as Array<[string, Schema['plugin']["AnyNode"]]>,
    [node.properties, value, required, schema.plugins.core.sortEntityProperties],
  );

  const formEnabled =
    !("name" in node.properties) || (isRootEntity && !!value?.name);
  const entityData = (value ?? {}) as AnyRecord;

  return (
    <FieldGroup>
      {"name" in node.properties && (
        <>
          <Separator />
          <EntityPropertyEdit
            fieldName={"Name"}
            node={node.properties.name}
            compact
          >
            <Field>
              {isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <FieldEdit<Schema>
                  formId={`name-${formId}`}
                  node={node.properties.name}
                  value={entityData.name ?? ""}
                  onChange={(newValue) =>
                    onChange({
                      ...entityData,
                      name: newValue,
                    } as CoreEntity<Schema>["data"])
                  }
                  label="Name"
                />
              )}
            </Field>
          </EntityPropertyEdit>
          <Separator />
        </>
      )}

      <FieldSet
        disabled={!formEnabled}
        className="group disabled:opacity-40 min-w-0"
      >
        {propertiesWithoutName.map(([fieldName, propNode], idx, arr) => {
          const isRequired = required.has(fieldName);
          const label = plugins.core.utils?.generateFieldLabel(fieldName);
          const fieldValue = entityData[fieldName];
          const fieldId = `${fieldName}-${formId}`;

          const field = isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <FieldEdit
              formId={fieldId}
              node={propNode}
              value={fieldValue}
              onChange={(newValue) =>
                onChange({ ...(value ?? {}), [fieldName]: newValue })
              }
              label={label}
              isRequired={isRequired}
            />
          );

          return (
            <div key={fieldName} className="space-y-3">
              <EntityPropertyEdit
                fieldName={fieldName}
                node={propNode}
                isRequired={isRequired}
              >
                {schema.plugins.core.isPrimitive(propNode) ? (
                  <Field>{field}</Field>
                ) : (
                  field
                )}
              </EntityPropertyEdit>
              {idx < arr.length - 1 && <Separator />}
            </div>
          );
        })}
      </FieldSet>
    </FieldGroup>
  );
}
