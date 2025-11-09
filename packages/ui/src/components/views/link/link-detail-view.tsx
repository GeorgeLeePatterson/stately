import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import { useStatelyUi } from '@/context';
import { ViewLinkControl } from '@/context/link-explore-context';
import { useEntityData } from '@/hooks/use-entity-data';
import { cn } from '@/lib/utils';
import { EntityDetailView } from '../entity/entity-detail-view';
import type { LinkFor } from './link-edit-view';

interface LinkViewProps<Config extends StatelyConfig = StatelyConfig> {
  /**
   * The Link<T> value:
   * - { entity_type: "...", ref: "name" }
   * - { entity_type: "...", inline: {...} }
   */
  value: LinkFor<Config>;

  /**
   * Parsed schema for LinkNode
   */
  schema: StatelySchemas<Config>['LinkNode'];

  /**
   * Optional label for the configuration
   */
  label?: React.ReactNode;

  /**
   * Whether the configuration is required
   */
  isRequired?: boolean;
}

export function LinkView<Config extends StatelyConfig = StatelyConfig>({
  value,
  schema,
  label,
  isRequired,
}: LinkViewProps<Config>) {
  const { integration } = useStatelyUi();

  // Extract entity_type and actual value
  const entityType = schema?.targetType;
  const stateEntry = entityType || value.entity_type;

  const identifier = 'ref' in value ? value.ref : undefined;

  const { data, isLoading } = useEntityData<Config>({
    entity: stateEntry,
    identifier,
    disabled: !identifier,
  });

  if (!value || typeof value !== 'object') {
    console.warn('LinkView: value must be an object with entity_type and ref/inline');
    return null;
  }

  if (!stateEntry) {
    console.warn('LinkView: entity_type is required');
    return null;
  }

  // Convert StateEntry to URL-friendly format for routing
  const urlType = integration.stateEntryToUrl[stateEntry];
  if (!urlType) {
    console.warn(`LinkView: unknown entity type ${stateEntry}`);
    return null;
  }

  if (identifier && isLoading) {
    return <Skeleton className="w-full flex-1 min-w-0" />;
  }

  // Render as a reference with a link
  if ('ref' in value) {
    const entity = data?.entity?.data;
    return (
      <LinkRef
        label={label}
        name={entity && 'name' in entity ? entity?.name : undefined}
        urlType={urlType}
        value={value}
        schema={schema?.inlineSchema}
        isRequired={isRequired}
      />
    );
  }

  // Render inline configuration
  if ('inline' in value) {
    return (
      <LinkInline
        targetType={value.entity_type}
        schema={schema?.inlineSchema}
        value={value.inline}
      />
    );
  }

  console.warn('LinkView: value must have either ref or inline field');
  return null;
}

function LinkRef<Config extends StatelyConfig = StatelyConfig>({
  label,
  name,
  urlType,
  value,
  schema,
  isRequired,
}: {
  label?: React.ReactNode;
  name?: string;
  urlType: string;
  value: { entity_type: StatelySchemas<Config>['StateEntry']; ref: string };
  schema?: StatelySchemas<Config>['ObjectNode'];
  isRequired?: boolean;
}) {
  return (
    <>
      <Item
        className={cn('flex-1 bg-muted', isRequired && !value?.ref ? 'border-red-500' : '')}
        size="sm"
      >
        <ItemContent>
          <ItemTitle>
            Name:{' '}
            {name ||
              value.ref ||
              (isRequired ? <span className="text-red-500">Invalid, missing ref</span> : 'Unknown')}
          </ItemTitle>
          {label && <ItemDescription>{label} Configuration</ItemDescription>}
        </ItemContent>
        <ItemActions>
          {/* Convenience button to view configuration */}
          {schema && value?.ref && (
            <ViewLinkControl
              entityType={value.entity_type}
              entityName={value.ref}
              schema={schema}
            />
          )}

          {value?.ref && (
            <Button
              variant="default"
              size="icon-sm"
              className="rounded-full cursor-pointer"
              asChild
            >
              <a href={`/entities/${urlType}/${value.ref}`} target="_blank" rel="noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}
        </ItemActions>
      </Item>
    </>
  );
}

export function LinkInline<Config extends StatelyConfig = StatelyConfig>({
  targetType,
  schema,
  value,
}: {
  targetType: StatelySchemas<Config>['StateEntry'];
  schema: StatelySchemas<Config>['ObjectNode'];
  value: StatelySchemas<Config>['EntityData'];
}) {
  return (
    <div className={'border-l-4 border-primary/20 pl-3 space-y-3'}>
      <EntityDetailView entityType={targetType} schema={schema} entity={value} disableJsonView />
    </div>
  );
}
