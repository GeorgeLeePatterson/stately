import { devLog, Layout } from '@statelyjs/ui';
import { Button } from '@statelyjs/ui/components/base/button';
import { Skeleton } from '@statelyjs/ui/components/base/skeleton';
import type { PageProps } from '@statelyjs/ui/layout';
import { useQueryClient } from '@tanstack/react-query';
import { CopyPlus, Edit, Trash2 } from 'lucide-react';
import { useEntityData, useEntitySchema, useEntityUrl, useRemoveEntity } from '@/core/hooks';
import type { Schemas } from '@/core/schema';
import { EntityDetailView } from '@/core/views/entity';
import { useStatelyUi } from '@/index';
import type { CoreStateEntry } from '..';

export function EntityDetailsPage<Schema extends Schemas = Schemas>({
  id,
  entity: entityType,
  ...rest
}: { id: string; entity: CoreStateEntry<Schema> } & Partial<PageProps>) {
  const { schema, plugins } = useStatelyUi<Schema>();
  const stateEntry = plugins.core.utils?.resolveEntityType(entityType) ?? entityType;
  const entityPath = schema.data.stateEntryToUrl[stateEntry] ?? entityType;
  const typeName = schema.data.entityDisplayNames[stateEntry];

  // Convert URL type to StateEntry enum
  const queryClient = useQueryClient();
  const entitySchema = useEntitySchema(stateEntry);
  const resolveEntityUrl = useEntityUrl();
  const {
    data,
    isLoading,
    error: queryError,
  } = useEntityData({ entity: stateEntry, identifier: id });

  // Extract entity and name from the new response structure
  const entity = data?.entity;
  const entityId = data?.id || id;

  // Use type narrowing to check if name field exists (singletons don't have name, default to "default")
  const entityName =
    (entity?.data && 'name' in entity.data ? entity.data.name : 'default') || 'default';

  const { confirmRemove, setRemoveEntityId } = useRemoveEntity({
    entity: stateEntry,
    onConfirmed: () => {
      window.location.href = resolveEntityUrl({ type: entityPath });
    },
    queryClient,
  });

  devLog.debug('Core', 'EntityDetail', {
    data,
    entity,
    entityId,
    entityName,
    isLoading,
    queryError,
  });

  return (
    <Layout.Page
      {...rest}
      actions={
        rest?.actions ?? (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <a href={resolveEntityUrl({ id, mode: 'edit', type: entityPath })}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </a>
            </Button>
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
        )
      }
      breadcrumbs={
        rest?.breadcrumbs ?? [
          { href: resolveEntityUrl({}), label: 'Configurations' }, // TODO: Make label configurable
          { href: resolveEntityUrl({ type: entityPath }), label: typeName },
          { label: entityName },
        ]
      }
      description={rest?.description ?? `${typeName} configuration details`}
      title={
        rest?.title ?? (
          <>
            <span className="hidden lg:inline text-muted-foreground whitespace-nowrap">
              Viewing&nbsp;
            </span>
            <span className="truncate">{entityName}</span>
            {entityName !== 'default' && (
              <>
                &nbsp;
                <Button
                  asChild
                  className="cursor-pointer"
                  size="icon-sm"
                  type="button"
                  variant="link"
                >
                  <a href={resolveEntityUrl({ mode: 'new', type: entityPath }, { template: id })}>
                    <CopyPlus className="w-4 h-4" />
                  </a>
                </Button>
              </>
            )}
          </>
        )
      }
    >
      {isLoading ? (
        // Loading
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : queryError ? (
        // Entity fetch error
        <div className="text-center py-8">
          <p className="text-destructive mb-2">Error loading entity</p>
          <p className="text-sm text-muted-foreground">{queryError.message}</p>
        </div>
      ) : !entity ? (
        // No entity type
        <p className="text-muted-foreground text-center py-8">Entity not found</p>
      ) : !entitySchema.node ? (
        // Entity schema error
        <div className="text-center py-8 text-destructive">
          {entitySchema.error || 'No entity found'}
        </div>
      ) : (
        // Entity detail view
        <EntityDetailView
          entity={entity.data}
          entityId={entityId}
          entityType={stateEntry}
          node={entitySchema.node}
        />
      )}
      {confirmRemove(_ => entityName)}
    </Layout.Page>
  );
}
