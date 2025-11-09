import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import type { ViewFieldProps } from '@/components/fields';
import { Skeleton } from '@/components/ui/skeleton';
import { useStatelyUi } from '@/context';
import { useEntityData } from '@/hooks/use-entity-data';
import type { LinkFor } from './link-edit-view';
import { LinkRefView } from './link-ref-view';
import { LinkInlineView } from './link-inline-view';

export type LinkViewProps<Config extends StatelyConfig = StatelyConfig> = ViewFieldProps<
  Config,
  StatelySchemas<Config>['LinkNode'],
  LinkFor<Config>
>;

export function LinkView<Config extends StatelyConfig = StatelyConfig>({
  value,
  node,
}: LinkViewProps<Config>) {
  const { integration } = useStatelyUi();

  // Extract entity_type and actual value
  const entityType = node?.targetType;
  const stateEntry = entityType || value?.entity_type;

  const identifier = value && 'ref' in value ? value.ref : undefined;

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
      <LinkRefView
        name={entity && 'name' in entity ? entity?.name : undefined}
        urlType={urlType}
        value={value}
        schema={node?.inlineSchema}
      />
    );
  }

  // Render inline configuration
  if ('inline' in value) {
    return (
      <LinkInlineView
        targetType={value.entity_type}
        node={node?.inlineSchema}
        value={value.inline}
      />
    );
  }

  console.warn('LinkView: value must have either ref or inline field');
  return null;
}
