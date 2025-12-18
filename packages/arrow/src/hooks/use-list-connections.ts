import { useQuery } from '@tanstack/react-query';
import { useArrowApi } from './use-arrow-api';

/**
 * Hook to list all available connectors.
 *
 * Fetches metadata for all configured data source connectors. This includes
 * databases, object stores, and other Arrow-compatible data sources.
 *
 * @returns React Query result with connector metadata list
 *
 * @example
 * ```typescript
 * function ConnectorList() {
 *   const { data: connectors, isLoading } = useListConnectors();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <ul>
 *       {connectors?.map(c => (
 *         <li key={c.id}>{c.name} ({c.metadata.kind})</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useListConnectors() {
  const api = useArrowApi();
  return useQuery({
    queryFn: async () => {
      if (!api) throw new Error('Arrow API is unavailable');
      const { data, error } = await api.list_connectors();
      if (error) throw error;
      return data ?? [];
    },
    queryKey: ['connectors'],
  });
}
