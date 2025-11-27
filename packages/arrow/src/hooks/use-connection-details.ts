import { useQuery } from '@tanstack/react-query';
import type { ConnectionDetailQuery } from '@/types/api';
import { useArrowApi } from './use-arrow-api';

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
    queryKey: ['list', connectorId, filters],
  });
}
