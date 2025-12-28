import { useQuery } from '@tanstack/react-query';
import type { CoreEntityWrapped, CoreStateEntry } from '@/core';
import { useStatelyUi } from '@/index';
import type { Schemas } from '@/schema';
import { log } from '@/utils';

const NON_RETRYABLE_CODES = [400, 401, 403, 404];

/**
 * Fetch a single entity by its ID.
 *
 * Uses React Query to fetch and cache entity data. The query is automatically
 * disabled when `identifier` is not provided or when `disabled` is true.
 *
 * @typeParam Schema - Your application's schema type
 *
 * @param options - Hook options
 * @param options.entity - The entity type name (e.g., 'Pipeline', 'SourceConfig')
 * @param options.identifier - The entity's unique ID
 * @param options.disabled - Set to true to prevent fetching
 *
 * @returns A React Query result with the entity data
 *
 * @example
 * ```tsx
 * function PipelineDetail({ id }: { id: string }) {
 *   const { data, isLoading, error } = useEntityData<MySchemas>({
 *     entity: 'Pipeline',
 *     identifier: id,
 *   });
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return <div>{data?.entity.data.name}</div>;
 * }
 * ```
 */
export function useEntityData<Schema extends Schemas = Schemas>({
  entity,
  identifier,
  disabled,
}: {
  entity: CoreStateEntry<Schema>;
  identifier?: string;
  disabled?: boolean;
}) {
  const runtime = useStatelyUi<Schema, []>();
  const coreApi = runtime.plugins.core?.api;
  const fetchEnabled = !!entity && !disabled && !!identifier;
  return useQuery({
    enabled: fetchEnabled,
    queryFn: async () => {
      if (!coreApi) throw new Error('Core entity API is unavailable.');
      if (!identifier) {
        console.warn("Identifier is missing, can't fetch entity");
        return;
      }

      if (!entity) {
        console.warn('Entity type is required', { identifier });
        throw new Error('Entity type is required');
      }

      const { data, error } = await coreApi.get_entity_by_id({
        params: { path: { id: identifier }, query: { type: entity } },
      });

      if (error) {
        console.error('API Error fetching entity:', error);
        if (typeof error === 'object' && 'error' in error) {
          throw new Error(`${error.error} [Code: ${error.status}]`);
        }
        if (typeof error === 'string') throw new Error(error);
        throw new Error('Failed to fetch entity');
      }

      log.debug('Core', 'Successfully fetched entity', { data });
      return data as { entity: CoreEntityWrapped<Schema>; id: string } | undefined;
    },
    queryKey: ['entity', entity, identifier],
    retry: (failureCount, error) => {
      if ((error?.message || '').startsWith('Failed to fetch')) return false;
      if (NON_RETRYABLE_CODES.some(c => error?.message?.includes(`[Code: ${c}]`))) {
        log.warn('Core', 'Non-retryable error encountered', { error });
        return false;
      }
      return failureCount <= 3;
    },
  });
}
