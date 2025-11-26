import { useQuery } from '@tanstack/react-query';
import type { components } from '@/generated-types';
import { useArrowApi } from './use-arrow-api';

export type ConnectionDetailQuery = components['schemas']['ConnectionDetailQuery'];

export function useConnectionDetails(connectorId?: string, filters: ConnectionDetailQuery = {}) {
  const api = useArrowApi();
  return useQuery({
    enabled: Boolean(connectorId),
    queryFn: async () => {
      if (!api) throw new Error('Arrow API is unavailable');
      const { data, error } = await api.list({
        params: {
          path: { connector_id: connectorId || '' },
          query: { database: filters.database, schema: filters.schema },
        },
      });

      if (error) throw error;
      return data;
    },
    queryKey: ['viewer', 'stat', connectorId, filters],
  });
}
