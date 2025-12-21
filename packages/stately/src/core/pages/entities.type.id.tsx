import { devLog, Layout } from '@statelyjs/ui';
import { Button } from '@statelyjs/ui/components/base/button';
import type { PageProps } from '@statelyjs/ui/layout';
import { useQueryClient } from '@tanstack/react-query';
import { CopyPlus, Edit, Trash2 } from 'lucide-react';
import { useEntityData, useEntityUrl, useRemoveEntity } from '@/core/hooks';
import type { Schemas } from '@/core/schema';
import { EntityDetailView } from '@/core/views/entity';
import { useStatelyUi } from '@/index';
import type { CoreStateEntry } from '..';
import { useEntityPage } from '../hooks/use-entity-page';

export function EntityDetailsPage<Schema extends Schemas = Schemas>({
  id,
  entity: entityType,
  ...rest
}: { id: string; entity: CoreStateEntry<Schema> } & Partial<PageProps>) {
  const { schema, plugins, options } = useStatelyUi<Schema>();
  const stateEntry = plugins.core.utils?.resolveEntityType<Schema>(entityType) ?? entityType;
  const entityPath = schema.data.stateEntryToUrl[stateEntry] ?? entityType;
  const typeName = schema.data.entityDisplayNames[stateEntry];

  // Convert URL type to StateEntry enum
  const queryClient = useQueryClient();
  const resolveEntityUrl = useEntityUrl();
  const {
    data,
    isLoading,
    isFetched,
    error: queryError,
  } = useEntityData({ entity: stateEntry, identifier: id });

  // Extract entity and name from the new response structure
  const entityId = data?.id || id;

  const { confirmRemove, setRemoveEntityId } = useRemoveEntity({
    entity: stateEntry,
    onConfirmed: () => {
      window.location.href = resolveEntityUrl({ type: entityPath });
    },
    queryClient,
  });

  const {
    noDataDisplay,
    entityName,
    pageLoaderDisplay,
    dataReady,
    pageReady,
    entitySchema,
    errorDisplay,
  } = useEntityPage<Schema>({ entity: data?.entity, isFetched, isLoading, queryError, stateEntry });

  devLog.debug('Core', 'EntityDetail', { data, entityId, entityName, isLoading, queryError });

  return (
    <Layout.Page
      {...rest}
      actions={
        rest?.actions ||
        (pageReady ? (
          <div className="flex gap-2">
            <Button
              nativeButton={false}
              render={
                <a href={resolveEntityUrl({ id, mode: 'edit', type: entityPath })}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </a>
              }
              size="sm"
              variant="outline"
            />
            <Button
              disabled={isLoading || !!queryError || !!entitySchema.error}
              onClick={() => setRemoveEntityId(id)}
              size="sm"
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        ) : null)
      }
      backLink={{ href: resolveEntityUrl({ type: entityPath }) }}
      breadcrumbs={
        rest?.breadcrumbs ??
        (pageReady && entityName
          ? [
              { href: resolveEntityUrl({}), label: 'Configurations' }, // TODO: Make label configurable
              { href: resolveEntityUrl({ type: entityPath }), label: typeName },
              { label: entityName },
            ]
          : [])
      }
      description={rest?.description ?? `${typeName} configuration details`}
      disableThemeToggle={options?.theme?.disabled}
      title={
        rest?.title ?? (
          <>
            <span className="hidden lg:inline text-muted-foreground whitespace-nowrap">
              Viewing&nbsp;
            </span>
            {entityName && <span className="truncate">{entityName}</span>}
            {entityName && entityName !== 'default' && (
              <>
                &nbsp;
                <Button
                  className="cursor-pointer"
                  nativeButton={false}
                  render={
                    <a href={resolveEntityUrl({ mode: 'new', type: entityPath }, { template: id })}>
                      <CopyPlus className="w-4 h-4" />
                    </a>
                  }
                  size="icon-sm"
                  variant="link"
                />
              </>
            )}
          </>
        )
      }
    >
      {/* Loading */}
      {pageLoaderDisplay}

      {/* Error fetching or parsing entity schema */}
      {errorDisplay}

      {/* Data fetched, nothing returned */}
      {noDataDisplay}

      {/* Entity form */}
      {dataReady && entitySchema.node && data?.entity?.data && (
        <EntityDetailView entity={data?.entity.data} entityId={entityId} node={entitySchema.node} />
      )}

      {confirmRemove(_ => entityName)}
    </Layout.Page>
  );
}
