import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';
import { useStatelyUi } from '@/context';
import { useEntityData } from '@/hooks/use-entity-data';
import { useEntitySchema } from '@/hooks/use-entity-schema';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import { EntityDetailView } from '../views/entity/entity-detail-view';

export interface LinkEntityProps<Config extends StatelyConfig = StatelyConfig> {
  entityType: StatelySchemas<Config>['StateEntry'];
  entityName: string;
  schema?: StatelySchemas<Config>['ObjectNode'];
}

interface ViewLinkDialogProps<Config extends StatelyConfig = StatelyConfig> {
  open?: boolean;
  onOpenChange: (open: boolean) => void;
  breadcrumbs?: LinkEntityProps<Config>[];
  onNavigateToBreadcrumb?: (index: number) => void;
}

/**
 * Dialog to view a Link<T> reference (read-only)
 * Fetches the entity by name and type, then displays it inline
 */
export function ViewLinkDialog<Config extends StatelyConfig = StatelyConfig>({
  entityType,
  entityName,
  schema,
  open,
  onOpenChange,
  breadcrumbs = [],
  onNavigateToBreadcrumb,
}: ViewLinkDialogProps<Config> & LinkEntityProps<Config>) {
  const { integration } = useStatelyUi();
  const entityDisplayName = integration.entityDisplayNames[entityType];
  const entitySchema = useEntitySchema(entityType, schema);

  const {
    data,
    isLoading,
    error: queryError,
  } = useEntityData<Config>({ identifier: entityName, entity: entityType, disabled: !entitySchema });

  // Extract the entity data and remove id for display
  const entityData = data?.entity?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigateToBreadcrumb?.(idx)}
                    disabled={idx === breadcrumbs.length - 1}
                    className="shrink-0 cursor-pointer"
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
          ) : !entitySchema.schema ? (
            // Entity schema error
            <div className="text-center py-8 text-destructive">
              {entitySchema.error || 'No entity found'}
            </div>
          ) : (
            <EntityDetailView
              entityType={entityType}
              entity={entityData}
              node={entitySchema.schema}
            />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
