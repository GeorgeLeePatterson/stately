import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import { useQuery } from '@tanstack/react-query';
import { useStatelyUi } from '@/context';

type SchemasFor<Config extends StatelyConfig> = StatelySchemas<Config>;

type EntityResponse<Config extends StatelyConfig> = {
  id: SchemasFor<Config>['EntityId'];
  entity: SchemasFor<Config>['Entity'];
};

export function useEntityData<Config extends StatelyConfig = StatelyConfig>({
  entity,
  identifier,
  disabled,
}: {
  entity: SchemasFor<Config>['StateEntry'];
  identifier?: string;
  disabled?: boolean;
}) {
  const { api } = useStatelyUi();
  const fetchEnabled = !!entity && !disabled && !!identifier;
  return useQuery({
    queryKey: ['entity', entity, identifier],
    queryFn: async () => {
      if (!identifier) {
        console.warn("Identifier is missing, can't fetch entity");
        return;
      }

      if (!entity) {
        console.warn('Entity type is required', { identifier });
        throw new Error(`Unknown entity type: ${entity}`);
      }

      const { data, error } = await api.entity.get({ id: identifier, type: entity });

      if (error) {
        console.error('API Error fetching entity:', error);
        throw new Error('Failed to fetch entity');
      }

      console.debug('Successfully fetched entity', { data });
      return data as EntityResponse<Config>;
    },
    enabled: fetchEnabled,
  });
}
