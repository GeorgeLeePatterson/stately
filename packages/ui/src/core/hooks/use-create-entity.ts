import { type QueryClient, useMutation } from '@tanstack/react-query';
import { devLog } from '@/base';
import type { Schemas } from '@/core/schema';
import { useStatelyUi } from '@/index';
import type { CoreStateEntry } from '..';

export function useCreateEntity<Schema extends Schemas = Schemas>({
  entity,
  queryClient,
}: {
  entity: CoreStateEntry<Schema>;
  queryClient?: QueryClient;
}) {
  const runtime = useStatelyUi<Schema>();
  const coreApi = runtime.plugins.core?.api;

  return useMutation({
    mutationFn: async (formData: any) => {
      if (!coreApi) throw new Error('Core entity API is unavailable.');
      // Set the name in the entity data before creating
      const body = { data: formData, type: entity };
      const { data, error } = await coreApi.create_entity({ body });
      if (error) throw new Error('Failed to create entity');
      devLog.debug('Core', 'Successfully created entity', { data, entity });
      return data;
    },
    onSuccess: _ => queryClient?.invalidateQueries({ queryKey: ['entities', entity] }),
  });
}
