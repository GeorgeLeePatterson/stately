import type { Schemas } from '@stately/schema';
import { type QueryClient, useMutation } from '@tanstack/react-query';
import { useStatelyUi } from '@/index';
import type { CoreStateEntry } from '..';

export function useEditEntity<Schema extends Schemas = Schemas>({
  id,
  entity,
  queryClient,
}: {
  id: string;
  entity: CoreStateEntry<Schema>;
  queryClient?: QueryClient;
}) {
  const runtime = useStatelyUi<Schema, []>();
  const coreApi = runtime.plugins.core?.api;

  // TODO: Leverage
  // const handleSave = useCallback(() => {
  //   if (!formData) return;
  //   updateMutation.mutate({ data: formData, type: stateEntryType });
  // }, [updateMutation, stateEntryType, formData]);

  return useMutation({
    mutationFn: async (entity: {
      type: CoreStateEntry<Schema>;
      data: any; // TODO: Remove 'any'
    }) => {
      if (!coreApi) throw new Error('Core entity API is unavailable.');
      const { data, error } = await coreApi.update_entity({
        body: entity as any,
        params: { path: { id } },
      });
      if (error) throw new Error('Failed to update entity');
      return data;
    },
    onSuccess: data => {
      const updatedId = data?.id || id;
      queryClient?.invalidateQueries({ queryKey: ['entity', entity, updatedId] });
      queryClient?.invalidateQueries({ queryKey: ['entities', entity] });
    },
  });
}
