import { Fragment, useMemo, useState } from 'react';
import { useStatelyUi } from '@/context';
import { SimpleLabel } from '@/core/components/base/simple-label';
import { Separator } from '@/core/components/ui/separator';
import { EntityPropertyView } from '@/core/components/views/entity/entity-property-view';
import type { CoreEntity, CoreObjectNode, CoreSchemas, CoreStateEntry } from '@/core';
import { SINGLETON_ID } from '@/core/types';
import type { AnyRecord } from '@/core/types';
import { FieldView } from '../../fields/field-view';
import { JsonView } from '../../fields/json-view';

export interface EntityDetailViewProps<Schema extends CoreSchemas = CoreSchemas> {
  entityType: CoreStateEntry<Schema>;
  node: CoreObjectNode<Schema>;
  entity: CoreEntity<Schema>['data'];
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
  const { schema } = useStatelyUi();
  const [isJsonOpen, setIsJsonOpen] = useState(false);

  const required = new Set(node.required || []);

  const entityProperties = useMemo(
    () =>
      Object.entries(node.properties)
        .filter(([name]) => name !== 'name')
        .map(([name, schemaNode]) => [name, schemaNode as Schema['AnyNode']]) as Array<[
        string,
        Schema['AnyNode'],
      ]>,
    [node.properties],
  );

  const sortedProperties = useMemo(
    () =>
      schema.utils.sortEntityProperties(
        entityProperties,
        entity as AnyRecord,
        new Set<string>(node.required || []),
      ),
    [entityProperties, entity, node.required, schema.utils.sortEntityProperties],
  );

  console.debug('EntityDetailView: ', { entityType, entity, schema: node });

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
            node={node.properties.name}
            isRequired={true}
          />
          <Separator />
        </>
      )}
      {/* Render all fields using schema */}
      {sortedProperties
        .map(([fieldName, fieldSchema]) => {
          const fieldValue = entity[fieldName as keyof typeof entity] as unknown;
          // Skip undefined/null values
          return [fieldName, fieldSchema, fieldValue] as const;
        })
        .filter(([_, __, value]) => value !== undefined && value !== null)
        .map(([fieldName, fieldSchema, fieldValue], idx, arr) => (
          <Fragment key={fieldName}>
            <EntityPropertyView
              fieldName={fieldName}
              node={fieldSchema}
              isRequired={required.has(fieldName)}
            >
              <FieldView node={fieldSchema} value={fieldValue} />
            </EntityPropertyView>
            {idx < arr.length - 1 && <Separator />}
          </Fragment>
        ))}

      {/* Json view */}
      {!disableJsonView && <JsonView data={entity} isOpen={isJsonOpen} setIsOpen={setIsJsonOpen} />}
    </div>
  );
}
