import { useQuery } from '@tanstack/react-query';
import type { ConnectionDetailsRequest, ConnectionSearchQuery } from '@/types/api';
import { useArrowApi } from './use-arrow-api';

export function useConnectionDetails(connectorId?: string, filters: ConnectionSearchQuery = {}) {
  const api = useArrowApi();
  return useQuery({
    enabled: Boolean(connectorId),
    queryFn: async () => {
      if (!api) throw new Error('Arrow API is unavailable');
      const { data, error } = await api.connector_list({
        params: { path: { connector_id: connectorId || '' }, query: { search: filters.search } },
      });

      if (error) throw error;
      return data;
    },
    queryKey: ['list', connectorId, filters],
  });
}

export function useMultiConnectionDetails({ connectors, fail_on_error }: ConnectionDetailsRequest) {
  const api = useArrowApi();
  return useQuery({
    enabled: Object.keys(connectors ?? {}).length > 0,
    queryFn: async () => {
      if (!api) throw new Error('Arrow API is unavailable');
      if (!connectors) return;

      const { data, error } = await api.connector_list_many({
        body: { connectors, fail_on_error },
      });

      if (error) throw error;
      return data?.connections;
    },
    queryKey: ['list_many', connectors],
  });
}
