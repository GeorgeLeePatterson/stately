import type { Schemas } from '@stately/schema';
import { useQuery } from '@tanstack/react-query';
import type { CoreEntity, CoreStateEntry } from '@/core';
import { useStatelyUi } from '@/core';

type EntityResponse<Schema extends Schemas<any, any>> = { id: string; entity: CoreEntity<Schema> };

export function useEntityData<Schema extends Schemas = Schemas>({
  entity,
  identifier,
  disabled,
}: {
  entity: CoreStateEntry<Schema>;
  identifier?: string;
  disabled?: boolean;
}) {
  const runtime = useStatelyUi();
  const coreApi = runtime.plugins.core?.api;
  const fetchEnabled = !!entity && !disabled && !!identifier;
  return useQuery({
    enabled: fetchEnabled,
    queryFn: async () => {
      if (!coreApi) {
        throw new Error('Core entity API is unavailable.');
      }
      if (!identifier) {
        console.warn("Identifier is missing, can't fetch entity");
        return;
      }

      if (!entity) {
        console.warn('Entity type is required', { identifier });
        throw new Error(`Unknown entity type: ${entity}`);
      }

      const { data, error } = await coreApi.call(coreApi.operations.getEntityById, {
        params: { path: { entity_id: identifier }, query: { entity_type: entity } },
      });

      if (error) {
        console.error('API Error fetching entity:', error);
        throw new Error('Failed to fetch entity');
      }

      console.debug('Successfully fetched entity', { data });
      return data as EntityResponse<Schema>;
    },
    queryKey: ['entity', entity, identifier],
  });
}
