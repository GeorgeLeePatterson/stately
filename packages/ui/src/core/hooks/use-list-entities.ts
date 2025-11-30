import { useQuery } from '@tanstack/react-query';
import { devLog } from '@/base';
import type { Schemas } from '@/core/schema';
import { useStatelyUi } from '@/index';
import type { CoreStateEntry } from '..';

export function useListEntities<Schema extends Schemas = Schemas>({
  entity,
}: {
  entity: CoreStateEntry<Schema>;
}) {
  const runtime = useStatelyUi<Schema>();
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
