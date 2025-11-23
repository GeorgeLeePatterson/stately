import type { Schemas } from '@stately/schema';
import { type QueryClient, useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { devLog } from '@/base';
import { ConfirmDialog } from '@/base/dialogs/confirm-dialog';
import { useStatelyUi } from '@/index';
import type { CoreStateEntry } from '..';

export function useRemoveEntity<Schema extends Schemas = Schemas>({
  entity,
  queryClient,
  onConfirmed,
}: {
  entity: CoreStateEntry<Schema>;
  queryClient?: QueryClient;
  onConfirmed?: (id: string) => void;
}) {
  const runtime = useStatelyUi<Schema, []>();
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
      if (error) throw new Error('Failed to create entity');
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
          onConfirm={() => {
            removeMutation.mutate(removeEntityId, {
              onSuccess: () => handleOnConfirmed(removeEntityId),
            });
          }}
          open={!!removeEntityId}
          setOpen={o => setRemoveEntityId(id => (o ? id : undefined))}
        />
      );
    },
    [typeName, removeEntityId, removeMutation.mutate, handleOnConfirmed],
  );

  return { confirmRemove, mutation: removeMutation, removeEntityId, setRemoveEntityId };
}
