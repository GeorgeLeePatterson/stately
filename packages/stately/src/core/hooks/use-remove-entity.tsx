import { devLog } from '@statelyjs/ui';
import { ConfirmDialog } from '@statelyjs/ui/dialogs';
import { type QueryClient, useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import type { Schemas } from '@/core/schema';
import { useStatelyUi } from '@/index';
import type { CoreStateEntry } from '..';

/**
 * Remove an entity with confirmation dialog support.
 *
 * Returns a mutation for deleting entities along with state and helpers
 * for rendering a confirmation dialog. Call `setRemoveEntityId(id)` to
 * trigger the confirmation flow, then render `confirmRemove()` in your component.
 *
 * @typeParam Schema - Your application's schema type
 *
 * @param options - Hook options
 * @param options.entity - The entity type name (e.g., 'Pipeline', 'SourceConfig')
 * @param options.queryClient - Optional QueryClient for cache invalidation
 * @param options.onConfirmed - Callback fired after successful deletion
 *
 * @returns An object with:
 *   - `mutation` - The React Query mutation
 *   - `removeEntityId` - The ID currently pending removal (if any)
 *   - `setRemoveEntityId` - Set an ID to trigger the confirmation dialog
 *   - `confirmRemove` - Render function for the confirmation dialog
 *
 * @example
 * ```tsx
 * function PipelineList() {
 *   const queryClient = useQueryClient();
 *   const { setRemoveEntityId, confirmRemove } = useRemoveEntity<MySchemas>({
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
 *       {confirmRemove(id => pipelines.find(p => p.id === id)?.name)}
 *     </>
 *   );
 * }
 * ```
 */
export function useRemoveEntity<Schema extends Schemas = Schemas>({
  entity,
  queryClient,
  onConfirmed,
}: {
  entity: CoreStateEntry<Schema>;
  queryClient?: QueryClient;
  onConfirmed?: (id: string) => void;
}) {
  const runtime = useStatelyUi<Schema>();
  const coreApi = runtime.plugins.core?.api;

  const [removeEntityId, setRemoveEntityId] = useState<string>();

  // Memoize onConfirmed callback in case it is not
  const handleOnConfirmed = useCallback(
    (id: string) => {
      setRemoveEntityId(id);
      onConfirmed?.(id);
    },
    [onConfirmed],
  );

  const removeMutation = useMutation({
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

  const typeName = runtime.schema.data.entityDisplayNames[entity];

  const confirmRemove = useCallback(
    (cb: (id?: string) => string | undefined) => {
      if (!removeEntityId) return null;

      const description = `This will permanently delete the ${typeName.toLowerCase()}`;
      const descriptionAfter = 'This action cannot be undone.';
      const entityName = cb(removeEntityId);

      return (
        <ConfirmDialog
          actionLabel="Delete"
          description={
            entityName
              ? `${description} "${entityName}". ${descriptionAfter}`
              : `${description}. ${descriptionAfter}`
          }
          mode="destructive"
          onConfirm={() => {
            removeMutation.mutate(removeEntityId, {
              onSuccess: () => handleOnConfirmed(removeEntityId),
            });
          }}
          // TODO: Remove - this has a bug, it doesn't close when removed
          open={!!removeEntityId}
          setOpen={o => setRemoveEntityId(id => (o ? id : undefined))}
        />
      );
    },
    [typeName, removeEntityId, removeMutation.mutate, handleOnConfirmed],
  );

  return { confirmRemove, mutation: removeMutation, removeEntityId, setRemoveEntityId };
}
