import type { Schemas } from '@stately/schema';
import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';
import { Button } from '@/base/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/base/ui/dialog';
import { ScrollArea } from '@/base/ui/scroll-area';
import { Separator } from '@/base/ui/separator';
import { Skeleton } from '@/base/ui/skeleton';
import type { CoreStateEntry } from '@/core';
import { useStatelyUi } from '@/core';
import { useEntityData } from '@/core/hooks/use-entity-data';
import { useEntitySchema } from '@/core/hooks/use-entity-schema';
import { EntityDetailView } from '../views/entity/entity-detail-view';

export interface LinkEntityProps<Schema extends Schemas = Schemas> {
  entityName: string;
  entityType: CoreStateEntry<Schema>;
  schema?: Schema['plugin']['Nodes']['object'];
}

export interface ViewLinkDialogProps<Schema extends Schemas = Schemas> {
  open?: boolean;
  onOpenChange: (open: boolean) => void;
  breadcrumbs?: LinkEntityProps<Schema>[];
  onNavigateToBreadcrumb?: (index: number) => void;
}

/**
 * Dialog to view a Link<T> reference (read-only)
 * Fetches the entity by name and type, then displays it inline
 */
export function ViewLinkDialog<Schema extends Schemas = Schemas>({
  entityType,
  entityName,
  schema,
  open,
  onOpenChange,
  breadcrumbs = [],
  onNavigateToBreadcrumb,
}: ViewLinkDialogProps<Schema> & LinkEntityProps<Schema>) {
  const { schema: statelySchema } = useStatelyUi();
  const entityDisplayNames = statelySchema.data.entityDisplayNames as
    | Record<CoreStateEntry<Schema>, string>
    | undefined;
  const entityDisplayName = entityDisplayNames?.[entityType] ?? String(entityType);
  const entitySchema = useEntitySchema(entityType, schema);

  const {
    data,
    isLoading,
    error: queryError,
  } = useEntityData<Schema>({
    disabled: !entitySchema.node,
    entity: entityType,
    identifier: entityName,
  });

  // Extract the entity data and remove id for display
  const entityData = data?.entity?.data;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-6xl w-[90vw] max-h-[90vh] min-w-[60vw] flex flex-col overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <span className="hidden lg:inline text-muted-foreground mr-1 whitespace-nowrap italic">
              Viewing {entityDisplayName}
            </span>
            <span className="truncate">{entityName}</span>
          </DialogTitle>
          <DialogDescription>Navigate around referenced configuration</DialogDescription>
        </DialogHeader>

        {/* Breadcrumb Navigation */}
        {breadcrumbs.length > 1 && (
          <>
            <div className="flex items-center gap-1 text-sm overflow-x-auto pb-2">
              {breadcrumbs.map((crumb, idx) => (
                <Fragment key={`${crumb.entityName}-${idx}`}>
                  {idx > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                  <Button
                    className="shrink-0 cursor-pointer"
                    disabled={idx === breadcrumbs.length - 1}
                    onClick={() => onNavigateToBreadcrumb?.(idx)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <span className="truncate max-w-[150px]">{crumb.entityType}</span>
                  </Button>
                </Fragment>
              ))}
            </div>
          </>
        )}

        <Separator />
        <ScrollArea className="rounded-md overflow-y-auto">
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
          ) : !entityData ? (
            // No entity type
            <p className="text-muted-foreground text-center py-8">Entity not found</p>
          ) : !entitySchema.node ? (
            // Entity schema error
            <div className="text-center py-8 text-destructive">
              {entitySchema.error || 'No entity found'}
            </div>
          ) : (
            <EntityDetailView
              entity={entityData}
              entityType={entityType}
              node={entitySchema.node}
            />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
