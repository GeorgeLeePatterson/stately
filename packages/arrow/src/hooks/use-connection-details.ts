import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ConnectionDetailsRequest, ConnectionSearchQuery } from '@/types/api';
import { useArrowApi } from './use-arrow-api';

/**
 * Hook to fetch details for a specific connector.
 *
 * Retrieves connection metadata and configuration for a given connector ID,
 * with optional search filtering.
 *
 * @param connectorId - The ID of the connector to fetch details for
 * @param filters - Optional search filters to apply
 * @returns React Query result with connector details
 *
 * @example
 * ```typescript
 * function ConnectorDetails({ id }: { id: string }) {
 *   const { data, isLoading, error } = useConnectionDetails(id);
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return <div>{data?.name}</div>;
 * }
 * ```
 */
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

/**
 * Hook to fetch details for multiple connectors in a single request.
 *
 * Retrieves connection metadata for multiple connectors efficiently,
 * with optional error handling configuration.
 *
 * @param options - Request options containing connector IDs and error handling
 * @param options.connectors - Map of connector IDs to fetch
 * @param options.fail_on_error - Whether to fail the entire request if one connector fails
 * @returns React Query result with connection details map
 *
 * @example
 * ```typescript
 * function MultiConnectorView({ ids }: { ids: string[] }) {
 *   const connectorMap = Object.fromEntries(ids.map(id => [id, {}]));
 *   const { data } = useMultiConnectionDetails({
 *     connectors: connectorMap,
 *     fail_on_error: false,
 *   });
 *
 *   return <ConnectionList connections={data} />;
 * }
 * ```
 */
export function useMultiConnectionDetails({ connectors, fail_on_error }: ConnectionDetailsRequest) {
  const api = useArrowApi();
  return useQuery({
    enabled: Object.keys(connectors ?? {}).length > 0,
    placeholderData: keepPreviousData,
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
