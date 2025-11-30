import { useQuery } from '@tanstack/react-query';
import { devLog } from '@/base';
import type { CoreEntity, CoreStateEntry } from '@/core';
import type { Schemas } from '@/core/schema';
import { useStatelyUi } from '@/index';

export function useEntityData<Schema extends Schemas = Schemas>({
  entity,
  identifier,
  disabled,
}: {
  entity: CoreStateEntry<Schema>;
  identifier?: string;
  disabled?: boolean;
}) {
  const runtime = useStatelyUi<Schema>();
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
        throw new Error('Failed to fetch entity');
      }

      devLog.debug('Core', 'Successfully fetched entity', { data });
      return data as { entity: CoreEntity<Schema>['data']; id: string } | undefined;
    },
    queryKey: ['entity', entity, identifier],
  });
}
