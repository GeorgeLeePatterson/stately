import { Fragment, useMemo, useState } from "react";
import { useStatelyUi } from "@/context";
import { SimpleLabel } from "@/core/components/base/simple-label";
import { Separator } from "@/core/components/ui/separator";
import { EntityPropertyView } from "@/core/components/views/entity/entity-property-view";
import type {
  CoreEntity,
  CoreObjectNode,
  CoreSchemas,
  CoreStateEntry,
} from "@/core";
import { useCoreStatelyUi } from "@/core/context";
import { SINGLETON_ID } from "@stately/schema/core/utils";
import { FieldView } from "@/base/form/field-view";
import { JsonView } from "@/base/form/json-view";

export interface EntityDetailViewProps<
  Schema extends CoreSchemas = CoreSchemas,
> {
  entityType: CoreStateEntry<Schema>;
  node: CoreObjectNode<Schema>;
  entity: CoreEntity<Schema>["data"];
  entityId?: string;
  disableJsonView?: boolean;
}

export function EntityDetailView<Schema extends CoreSchemas = CoreSchemas>({
  entityType,
  node,
  entity,
  entityId,
  disableJsonView,
}: EntityDetailViewProps<Schema>) {
  const { schema } = useCoreStatelyUi();
  const [isJsonOpen, setIsJsonOpen] = useState(false);

  const required = new Set(node.required || []);

  const entityProperties = useMemo<Array<[string, Schema['plugin']["AnyNode"]]>>(
    () =>
      Object.entries(node.properties)
        .filter(([name]) => name !== "name")
        .map(([name, schemaNode]) => [name, schemaNode as Schema['plugin']["AnyNode"]]),
    [node.properties],
  );

  const sortedProperties = useMemo<Array<[string, Schema['plugin']["AnyNode"]]>>(
    () =>
      schema.plugins.core.sortEntityProperties(
        entityProperties,
        entity,
        new Set<string>(node.required || []),
      ),
    [
      entityProperties,
      entity,
      node.required,
      schema.plugins.core.sortEntityProperties,
    ],
  );

  console.debug("EntityDetailView: ", { entityType, entity, schema: node });

  return (
    <div className="space-y-4">
      {/* Entity ID (KSUID from HashMap key) */}
      {entityId && entityId !== SINGLETON_ID && (
        <div className="text-xs text-muted-foreground font-mono">
          <SimpleLabel>ID:</SimpleLabel> {entityId}
        </div>
      )}
      {"name" in node.properties && "name" in entity && (
        <>
          <EntityPropertyView
            fieldName={
              <span>
                Name: <span className="italic">{entity?.name}</span>
              </span>
            }
            node={node.properties.name}
            isRequired={true}
          />
          <Separator />
        </>
      )}
      {/* Render all fields using schema */}
      {sortedProperties
        .map(
          ([fieldName, fieldSchema]): {
            fieldName: string;
            fieldSchema: Schema['plugin']["AnyNode"];
            fieldValue: unknown;
          } => ({
            fieldName,
            fieldSchema,
            fieldValue: entity[fieldName as keyof typeof entity] as unknown,
          }),
        )
        .filter(
          (property) =>
            property.fieldValue !== undefined && property.fieldValue !== null,
        )
        .map((property, idx, arr) => (
          <Fragment key={property.fieldName}>
            <EntityPropertyView
              fieldName={property.fieldName}
              node={property.fieldSchema}
              isRequired={required.has(property.fieldName)}
            >
              <FieldView
                node={property.fieldSchema}
                value={property.fieldValue}
              />
            </EntityPropertyView>
            {idx < arr.length - 1 && <Separator />}
          </Fragment>
        ))}

      {/* Json view */}
      {!disableJsonView && (
        <JsonView data={entity} isOpen={isJsonOpen} setIsOpen={setIsJsonOpen} />
      )}
    </div>
  );
}
