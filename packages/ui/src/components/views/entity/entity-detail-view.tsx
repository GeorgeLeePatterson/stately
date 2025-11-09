import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import { SINGLETON_ID } from '@stately/schema/helpers';
import { Fragment, useMemo, useState } from 'react';
import { SimpleLabel } from '@/components/base/simple-label';
import { Separator } from '@/components/ui/separator';
import { EntityPropertyView } from '@/components/views/entity/entity-property-view';
import { useStatelyUi } from '@/context';
import { FieldView } from '../../fields/field-view';
import { JsonView } from '../../fields/json-view';

export interface EntityDetailViewProps<Config extends StatelyConfig = StatelyConfig> {
  entityType: StatelySchemas<Config>['StateEntry'];
  node: StatelySchemas<Config>['ObjectNode'];
  entity: StatelySchemas<Config>['EntityData'];
  entityId?: string;
  disableJsonView?: boolean;
}

export function EntityDetailView<Config extends StatelyConfig = StatelyConfig>({
  entityType,
  node,
  entity,
  entityId,
  disableJsonView,
}: EntityDetailViewProps<Config>) {
  const { integration } = useStatelyUi();
  const [isJsonOpen, setIsJsonOpen] = useState(false);

  const required = new Set(node.required || []);

  const entityProperties = useMemo(
    () => Object.entries(node.properties).filter(([name, _]) => name !== 'name'),
    [node.properties],
  );

  const sortedProperties = useMemo(
    () =>
      integration.helpers.sortEntityProperties(
        entityProperties,
        entity,
        new Set(node.required || []),
      ),
    [entityProperties, entity, node.required, integration.helpers.sortEntityProperties],
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
