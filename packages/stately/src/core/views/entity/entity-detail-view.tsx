import { Tuple } from '@statelyjs/schema/helpers';
import { devLog } from '@statelyjs/ui';
import { SimpleLabel } from '@statelyjs/ui/components';
import { Separator } from '@statelyjs/ui/components/base/separator';
import { BaseForm } from '@statelyjs/ui/form';
import { Fragment, useMemo, useState } from 'react';
import type { CoreEntityData, CoreStateEntry } from '@/core';
import type { Schemas } from '@/core/schema';
import { SINGLETON_ID } from '@/core/schema';
import { EntityPropertyView } from '@/core/views/entity/entity-property-view';
import { useStatelyUi } from '@/index';

export interface EntityDetailViewProps<Schema extends Schemas = Schemas> {
  entityType: CoreStateEntry<Schema>;
  node: Schema['plugin']['Nodes']['object'];
  entity: CoreEntityData<Schema>;
  entityId?: string;
  disableJsonView?: boolean;
}

export function EntityDetailView<Schema extends Schemas = Schemas>({
  entityType,
  node,
  entity,
  entityId,
  disableJsonView,
}: EntityDetailViewProps<Schema>) {
  const { schema } = useStatelyUi<Schema>();
  const [isJsonOpen, setIsJsonOpen] = useState(false);

  const required = new Set(node.required || []);

  const entityProperties = useMemo(
    () =>
      Object.entries(node.properties)
        .filter(([name]) => name !== 'name')
        .map(([name, schemaNode]) => Tuple([name, schemaNode])),
    [node.properties],
  );

  const sortedProperties = useMemo(
    () =>
      schema.plugins.core.sortEntityProperties(
        entityProperties,
        entity,
        new Set<string>(node.required || []),
      ),
    [entityProperties, entity, node.required, schema.plugins.core.sortEntityProperties],
  );

  devLog.debug('Core', 'EntityDetailView', { entity, entityType, node, sortedProperties });

  return (
    <div className="space-y-4">
      {/* Entity ID (KSUID from HashMap key) */}
      {entityId && entityId !== SINGLETON_ID && (
        <div className="text-xs text-muted-foreground font-mono">
          <SimpleLabel>ID:</SimpleLabel> {entityId}
        </div>
      )}
      {'name' in node.properties && 'name' in entity && (
        <>
          <EntityPropertyView
            fieldName={
              <span>
                Name: <span className="italic">{entity?.name}</span>
              </span>
            }
            isRequired={true}
            node={node.properties.name}
          />
          <Separator />
        </>
      )}
      {/* Render all fields using schema */}
      {sortedProperties
        .map(
          ([fieldName, fieldSchema]): {
            fieldName: string;
            fieldSchema: Schema['plugin']['AnyNode'];
            fieldValue: unknown;
          } => {
            const fieldValue = entity[fieldName as keyof typeof entity] as unknown;
            console.debug('EntityDetailView rendering field:', fieldName, {
              fieldSchema,
              fieldValue,
            });
            return { fieldName, fieldSchema, fieldValue };
          },
        )
        .filter(property => property.fieldValue !== undefined && property.fieldValue !== null)
        .map((property, idx, arr) => {
          console.debug('EntityDetailView about to render JSX for field:', property.fieldName);
          return (
            <Fragment key={property.fieldName}>
              <EntityPropertyView
                fieldName={property.fieldName}
                isRequired={required.has(property.fieldName)}
                node={property.fieldSchema}
              >
                <BaseForm.FieldView node={property.fieldSchema} value={property.fieldValue} />
              </EntityPropertyView>
              {idx < arr.length - 1 && <Separator />}
            </Fragment>
          );
        })}

      {/* Json view */}
      {!disableJsonView && (
        <BaseForm.JsonView data={entity} isOpen={isJsonOpen} setIsOpen={setIsJsonOpen} />
      )}
    </div>
  );
}
