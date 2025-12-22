import { Skeleton } from '@statelyjs/ui/components/base/skeleton';
import type { Schemas } from '@/schema';
import type { CoreEntityWrapped, CoreStateEntry } from '..';
import { useEntitySchema } from './use-entity-schema';

/**
 * Combines other hooks and common pre-processing for entity pages
 */
export function useEntityPage<Schema extends Schemas = Schemas>({
  stateEntry,
  isFetched,
  entity,
  isLoading,
  queryError,
}: {
  stateEntry: CoreStateEntry<Schema>;
  entity?: CoreEntityWrapped<Schema>;
  isFetched: boolean;
  isLoading: boolean;
  queryError: Error | null;
}) {
  const entitySchema = useEntitySchema(stateEntry);
  const pageError =
    queryError?.message || 'error' in entitySchema
      ? (queryError?.message ?? entitySchema.error ?? 'Unknown error')
      : undefined;
  const pageReady = isFetched && !pageError;
  const dataReady = !isLoading && isFetched && !pageError;

  const entityName = entity?.data
    ? 'name' in entity.data
      ? entity.data.name
      : 'default'
    : undefined;

  const errorDisplay =
    !isLoading && pageError ? (
      <div className="text-center py-8">
        <p className="text-destructive mb-2">Error loading entity</p>
        <p className="text-sm text-muted-foreground">{pageError}</p>
      </div>
    ) : null;

  const noDataDisplay =
    pageReady && !entity?.data ? (
      <p className="text-muted-foreground text-center py-8">Entity not found</p>
    ) : null;

  const pageLoaderDisplay = isLoading ? (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  ) : null;

  return {
    dataReady,
    entityName,
    entitySchema,
    errorDisplay,
    noDataDisplay,
    pageError,
    pageLoaderDisplay,
    pageReady,
  };
}
