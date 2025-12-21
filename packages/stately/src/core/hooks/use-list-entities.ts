import { devLog } from '@statelyjs/ui';
import { useQuery } from '@tanstack/react-query';
import type { Schemas } from '@/core/schema';
import { useStatelyUi } from '@/index';
import type { CoreStateEntry } from '..';

/**
 * Fetch all entities of a given type.
 *
 * Uses React Query to fetch and cache the entity list. The query key is
 * `['entities', entity]`, so it will be automatically invalidated when
 * entities are created, updated, or removed.
 *
 * @typeParam Schema - Your application's schema type
 *
 * @param options - Hook options
 * @param options.entity - The entity type name (e.g., 'Pipeline', 'SourceConfig')
 *
 * @returns A React Query result with an array of entity summaries
 *
 * @example
 * ```tsx
 * function PipelineList() {
 *   const { data, isLoading } = useListEntities<MySchemas>({
 *     entity: 'Pipeline',
 *   });
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <ul>
 *       {data?.map(item => (
 *         <li key={item.id}>{item.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useListEntities<Schema extends Schemas = Schemas>({
  entity,
}: {
  entity: CoreStateEntry<Schema>;
}) {
  const runtime = useStatelyUi<Schema, []>();
  const coreApi = runtime.plugins.core?.api;
  return useQuery({
    queryFn: async () => {
      if (!coreApi) throw new Error('Core entity API is unavailable.');
      const { data, error } = await coreApi.list_entities({ params: { path: { type: entity } } });
      if (error) throw new Error('Failed to list entities');
      devLog.debug('Core', 'Successfully listed entities', { data, entity });
      return data;
    },
    queryKey: ['entities', entity],
  });
}
