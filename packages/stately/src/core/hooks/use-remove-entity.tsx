import { devLog } from '@statelyjs/ui';
import { type QueryClient, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import type { Schemas } from '@/core/schema';
import { useStatelyUi } from '@/index';
import type { CoreStateEntry } from '..';

/**
 * Remove an entity with confirmation dialog support.
 *
 * Returns a mutation for deleting entities along with state and helpers
 * for triggering a confirmation dialog.
 *
 * @typeParam Schema - Your application's schema type
 *
 * @param options - Hook options
 * @param options.entity - The entity type name (e.g., 'Pipeline', 'SourceConfig')
 * @param options.queryClient - Optional QueryClient for cache invalidation
 *
 * @returns An object with:
 *   - `mutation` - The React Query mutation
 *   - `removeEntityId` - The ID currently pending removal (if any)
 *   - `setRemoveEntityId` - Set an ID to trigger the confirmation dialog
 *
 * @example
 * ```tsx
 * function PipelineList() {
 *   const queryClient = useQueryClient();
 *   const { removeEntityId, setRemoveEntityId, confirmRemove } = useRemoveEntity<MySchemas>({
 *     entity: 'Pipeline',
 *     queryClient,
 *     onConfirmed: () => toast.success('Pipeline deleted'),
 *   });
 *
 *   return (
 *     <>
 *       <ul>
 *         {pipelines.map(p => (
 *           <li key={p.id}>
 *             {p.name}
 *             <Button onClick={() => setRemoveEntityId(p.id)}>Delete</Button>
 *           </li>
 *         ))}
 *       </ul>
 *       <ConfirmModal open={!!removeEntityId} {...otherProps} />
 *     </>
 *   );
 * }
 * ```
 */
export function useRemoveEntity<Schema extends Schemas = Schemas>({
  entity,
  queryClient,
}: {
  entity: CoreStateEntry<Schema>;
  queryClient?: QueryClient;
}) {
  const runtime = useStatelyUi<Schema>();
  const coreApi = runtime.plugins.core?.api;

  const [removeEntityId, setRemoveEntityId] = useState<string>();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      if (!coreApi) throw new Error('Core entity API is unavailable.');
      const { data, error } = await coreApi.remove_entity({
        params: { path: { entry: entity, id } },
      });
      if (error) throw new Error('Failed to remove entity');
      devLog.debug('Core', 'Successfully removed entity', { data, entity, id });
      return data;
    },
    onSuccess: _ => queryClient?.invalidateQueries({ queryKey: ['entities', entity] }),
  });

  return { mutation, removeEntityId, setRemoveEntityId };
}
