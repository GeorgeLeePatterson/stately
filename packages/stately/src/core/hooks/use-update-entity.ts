import { devLog } from '@statelyjs/ui';
import { type QueryClient, useMutation } from '@tanstack/react-query';
import type { Schemas } from '@/core/schema';
import { useStatelyUi } from '@/index';
import type { CoreEntityData, CoreStateEntry } from '..';

export function useUpdateEntity<Schema extends Schemas = Schemas>({
  entity,
  id,
  queryClient,
}: {
  entity: CoreStateEntry<Schema>;
  id: string;
  queryClient?: QueryClient;
}) {
  const runtime = useStatelyUi<Schema>();
  const coreApi = runtime.plugins.core?.api;

  return useMutation({
    mutationFn: async (entityData: CoreEntityData<Schema>) => {
      if (!coreApi) throw new Error('Core entity API is unavailable.');
      const body = { data: entityData, type: entity };
      const { data, error } = await coreApi.update_entity({ body, params: { path: { id } } });
      if (error) throw new Error('Failed to update entity');
      devLog.debug('Core', 'Successfully updated entity', { data, entity, id });
      return data;
    },
    onSuccess: data => {
      const updatedId = data?.id || id;
      queryClient?.invalidateQueries({ queryKey: ['entity', entity, updatedId] });
      queryClient?.invalidateQueries({ queryKey: ['entities', entity] });
    },
  });
}
