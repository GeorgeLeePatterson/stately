import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import { SINGLETON_ID } from '@stately/schema/helpers';
import { Fragment, useMemo, useState } from 'react';
import { SimpleLabel } from '@/components/base/simple-label';
import { Separator } from '@/components/ui/separator';
import { EntityProperty } from '@/components/views/entity/entity-property';
import { useStatelyUi } from '@/context';
import { FieldView } from '../../fields/field-view';
import { JsonView } from '../../fields/json-view';

interface EntityDetailViewProps<Config extends StatelyConfig = StatelyConfig> {
  entityType: StatelySchemas<Config>['StateEntry'];
  schema: StatelySchemas<Config>['ObjectNode'];
  entity: StatelySchemas<Config>['EntityData'];
  entityId?: string;
  disableJsonView?: boolean;
}

export function EntityDetailView<Config extends StatelyConfig = StatelyConfig>({
  entityType,
  schema,
  entity,
  entityId,
  disableJsonView,
}: EntityDetailViewProps<Config>) {
  const { integration } = useStatelyUi();
  const [isJsonOpen, setIsJsonOpen] = useState(false);

  const required = new Set(schema.required || []);

  const entityProperties = useMemo(
    () => Object.entries(schema.properties).filter(([name, _]) => name !== 'name'),
    [schema.properties],
  );

  const sortedProperties = useMemo(
    () =>
      integration.helpers.sortEntityProperties(
        entityProperties,
        entity,
        new Set(schema.required || []),
      ),
    [entityProperties, entity, schema.required, integration.helpers.sortEntityProperties],
  );

  console.debug('EntityDetailView: ', { entityType, entity, schema });

  return (
    <div className="space-y-4">
      {/* Entity ID (KSUID from HashMap key) */}
      {entityId && entityId !== SINGLETON_ID && (
        <div className="text-xs text-muted-foreground font-mono">
          <SimpleLabel>ID:</SimpleLabel> {entityId}
        </div>
      )}
      {'name' in schema.properties && 'name' in entity && (
        <>
          <EntityProperty
            fieldName={
              <span>
                Name: <span className="italic">{entity?.name}</span>
              </span>
            }
            schema={schema.properties.name}
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
            <EntityProperty
              fieldName={fieldName}
              schema={fieldSchema}
              isRequired={required.has(fieldName)}
            >
              <FieldView node={fieldSchema} value={fieldValue} />
            </EntityProperty>
            {idx < arr.length - 1 && <Separator />}
          </Fragment>
        ))}

      {/* Json view */}
      {!disableJsonView && <JsonView data={entity} isOpen={isJsonOpen} setIsOpen={setIsJsonOpen} />}
    </div>
  );
}
