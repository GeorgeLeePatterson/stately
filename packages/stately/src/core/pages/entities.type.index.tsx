import { Note } from '@statelyjs/ui/components';
import { Button } from '@statelyjs/ui/components/base/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@statelyjs/ui/components/base/empty';
import { Skeleton } from '@statelyjs/ui/components/base/skeleton';
import { useQueryClient } from '@tanstack/react-query';
import { FileText, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useEntityUrl, useListEntities, useRemoveEntity } from '@/core/hooks';
import type { Schemas } from '@/core/schema';
import { useStatelyUi } from '@/index';
import { Layout, type PageProps } from '@/layout';
import type { CoreStateEntry } from '..';
import { EntityList } from '../views/entity/entity-list-view';
import { EntityRemove } from '../views/entity/entity-remove';

export function EntityTypeListPage<Schema extends Schemas = Schemas>({
  entity,
  ...rest
}: { entity: CoreStateEntry<Schema> } & Partial<PageProps>) {
  const queryClient = useQueryClient();

  const { schema, plugins } = useStatelyUi<Schema>();

  const stateEntry = plugins.core.utils?.resolveEntityType(entity) ?? entity;
  const entityPath = schema.data.stateEntryToUrl[stateEntry] ?? entity;

  const resolveEntityUrl = useEntityUrl();
  const {
    data: listData,
    isLoading,
    isFetched,
    refetch,
    error: listError,
  } = useListEntities({ entity: stateEntry });

  // Get the entities for this type from the response
  const entities = listData?.entities?.[stateEntry] || [];

  // Format type name for display
  const typeName = schema.data.entityDisplayNames[stateEntry] ?? stateEntry;

  const {
    mutation: removeMutation,
    removeEntityId,
    setRemoveEntityId,
  } = useRemoveEntity({ entity: stateEntry, queryClient });

  const handleRemoveEntity = (entityId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRemoveEntityId(entityId);
  };

  const handleCopyEntity = (entityId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    window.location.href = resolveEntityUrl(
      { mode: 'new', type: entityPath },
      { template: entityId },
    );
  };

  const pageError = listError?.message;
  const pageReady = isFetched && !pageError;
  const dataReady = pageReady && !!listData;

  const pageErrorDisplay =
    isFetched && pageError ? (
      <div className="text-center py-8">
        <p className="text-destructive mb-2">Error loading entity</p>
        <p className="text-sm text-muted-foreground">{pageError}</p>
      </div>
    ) : null;

  const removeErrorDisplay = removeMutation.error?.message ? (
    <Note message={`Failed to delete ${typeName}: ${removeMutation.error?.message}`} mode="error" />
  ) : null;

  const pageLoaderDisplay = isLoading ? (
    <div className="space-y-3">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  ) : null;

  const noDataDisplay =
    dataReady && entities.length === 0 ? (
      <Empty className="border p-6 md:p-6">
        <EmptyHeader>
          <EmptyMedia className="hidden md:flex" variant="icon">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>No {typeName.toLowerCase()}s yet</EmptyTitle>
          <EmptyDescription>
            Get started by creating a new {typeName.toLowerCase()} configuration.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            nativeButton={false}
            render={
              <a href={resolveEntityUrl({ mode: 'new', type: entityPath })}>
                <Plus className="w-4 h-4 mr-2" />
                Add {typeName}
              </a>
            }
          />
        </EmptyContent>
      </Empty>
    ) : null;

  return (
    <Layout.Page
      {...rest}
      actions={
        rest?.actions ?? (
          <Button
            nativeButton={false}
            render={
              <a href={resolveEntityUrl({ mode: 'new', type: entityPath })}>
                <Plus className="w-4 h-4 mr-2" />
                Create New {typeName}
              </a>
            }
          />
        )
      }
      breadcrumbs={
        rest?.breadcrumbs ?? [
          { href: resolveEntityUrl({}), label: 'Configurations' },
          { label: typeName },
        ]
      }
      description={rest?.description ?? `Manage ${typeName.toLowerCase()} configurations`}
      title={rest?.title ?? typeName}
    >
      {/** Remove mutation error */}
      {removeErrorDisplay}

      {/*Page error */}
      {pageErrorDisplay}

      {/* Loading */}
      {pageLoaderDisplay}

      {/* No data */}
      {noDataDisplay}

      {/* List data */}
      {dataReady && entities.length > 0 && (
        <EntityList
          entities={entities}
          onCopyEntity={handleCopyEntity}
          onRemoveEntity={handleRemoveEntity}
          stateEntry={stateEntry}
        />
      )}

      <EntityRemove
        entityName={entities.find(e => e.id === removeEntityId)?.name || removeEntityId}
        isOpen={!!removeEntityId}
        onConfirm={() => {
          if (removeEntityId) {
            setRemoveEntityId(undefined);
            removeMutation.mutate(removeEntityId, {
              onSuccess: () => {
                toast(`Successfully deleted ${removeEntityId}`, { position: 'top-center' });
                refetch();
              },
            });
          }
        }}
        setIsOpen={() => setRemoveEntityId(undefined)}
        typeName={typeName}
      />
    </Layout.Page>
  );
}
