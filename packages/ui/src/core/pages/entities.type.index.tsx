import type { Schemas } from '@stately/schema';
import { Note } from '@stately/ui/base/components';
import { useListEntities, useRemoveEntity } from '@stately/ui/core/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { CopyPlus, ExternalLink, FileText, Plus, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { Page } from '@/base/layout/page';
import { cn } from '@/base/lib/utils';
import { Button } from '@/base/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/base/ui/empty';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemTitle,
} from '@/base/ui/item';
import { Skeleton } from '@/base/ui/skeleton';
import { useStatelyUi } from '@/index';
import type { CoreStateEntry } from '..';

// TODO: Move to stately/tanstack
// export const Route = createFileRoute('/entities/$type/')({ component: EntityList });

export function EntityList<Schema extends Schemas = Schemas>({
  entity,
}: {
  entity: CoreStateEntry<Schema>;
}) {
  const queryClient = useQueryClient();

  const { schema, plugins } = useStatelyUi<Schema>();
  const isSingletonId = schema.plugins.core.isSingletonId;

  const stateEntry = plugins.core.utils?.resolveEntityType(entity, schema.data) ?? entity;
  const entityPath = schema.data.stateEntryToUrl[stateEntry] ?? entity;

  const { data: listData, isLoading, refetch } = useListEntities({ entity: stateEntry });

  // Get the entities for this type from the response
  const entities = listData?.entities?.[stateEntry] || [];

  // Format type name for display
  const typeName = schema.data.entityDisplayNames[stateEntry];

  const {
    confirmRemove,
    mutation: deleteMutation,
    removeEntityId,
    setRemoveEntityId,
  } = useRemoveEntity({
    entity: stateEntry,
    onConfirmed: id => {
      toast(`Successfully deleted ${id}`);
      refetch();
    },
    queryClient,
  });

  const handleRemoveEntity = (entityId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRemoveEntityId(entityId);
  };

  const handleCopyEntity = (entityId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    window.location.href = `/entities/${entityPath}/new?template=${entityId}`;
  };

  return (
    <>
      <Page
        actions={
          <Button asChild>
            <a href={`/entities/${entityPath}/new`}>
              <Plus className="w-4 h-4 mr-2" />
              Create New {typeName}
            </a>
          </Button>
        }
        breadcrumbs={[{ href: '/entities', label: 'Configurations' }, { label: typeName }]}
        description={`Manage ${typeName.toLowerCase()} configurations`}
        title={`${typeName}s`}
      >
        {deleteMutation.error && (
          <Note
            message={`Failed to delete ${typeName}: ${deleteMutation.error.message}`}
            mode="error"
          />
        )}

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : entities.length > 0 ? (
          <div className="flex flex-col flex-1 w-full min-w-0 gap-4">
            {entities
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(entity => (
                <Item
                  asChild
                  className="@container transition-all hover:shadow-md"
                  key={entity.id}
                  size="sm"
                  variant="muted"
                >
                  <a
                    className="group"
                    href={`/entities/${entityPath}/${isSingletonId(entity.id) ? 'singleton' : entity.id}`}
                  >
                    <ItemHeader className="items-center">
                      <ItemContent>
                        <ItemTitle className="text-base group-hover:text-primary transition-colors">
                          {/* View only link button */}
                          <Button
                            className="cursor-pointer hidden @md:flex"
                            size="icon-sm"
                            type="button"
                            variant="ghost"
                          >
                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </Button>
                          {isSingletonId(entity.id) ? 'view configuration' : entity.name}
                        </ItemTitle>
                        <ItemDescription>
                          <span className="text-xs hidden @md:flex text-muted-foreground font-mono">
                            {isSingletonId(entity.id) ? '' : entity.id}
                          </span>
                        </ItemDescription>
                      </ItemContent>

                      <ItemActions className="flex flex-nowrap gap-2 items-center">
                        {/* Actions */}
                        {entity.id !== 'default' && (
                          <div className={cn('flex flex-row flex-1 justify-end gap-3')}>
                            <Button
                              className="cursor-pointer rounded-full"
                              onClick={e => handleCopyEntity(entity.id, e)}
                              size="icon-sm"
                              type="button"
                              variant="ghost"
                            >
                              <CopyPlus className="w-4 h-4" />
                            </Button>
                            <Button
                              className={cn(
                                'text-destructive cursor-pointer',
                                'hover:text-white hover:bg-destructive no-underline!',
                              )}
                              onClick={e => handleRemoveEntity(entity.id, e)}
                              size="icon-sm"
                              type="button"
                              variant="ghost"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </ItemActions>
                    </ItemHeader>
                  </a>
                </Item>
              ))}
          </div>
        ) : (
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
              <Button asChild>
                <a href={`/entities/${entityPath}/new`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add {typeName}
                </a>
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </Page>

      {confirmRemove(id => entities.find(e => e.id === removeEntityId)?.name || id)}
    </>
  );
}
