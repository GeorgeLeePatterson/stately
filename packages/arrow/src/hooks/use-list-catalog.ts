import { useQuery } from '@tanstack/react-query';
import { useArrowApi } from './use-arrow-api';

/** Query key for catalog list queries, used for cache invalidation. */
export const LIST_CATALOGS_QUERY_KEY = ['catalogs'] as const;

/**
 * Hook to list available catalogs.
 *
 * Fetches all catalogs from the Arrow API. Catalogs represent top-level
 * namespaces in the data source hierarchy.
 *
 * @param key - Optional additional key segment for query differentiation
 * @param disabled - Whether to disable the query
 * @returns React Query result with catalog list
 *
 * @example
 * ```typescript
 * function CatalogBrowser() {
 *   const { data: catalogs, isLoading } = useListCatalogs();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <ul>
 *       {catalogs?.map(catalog => (
 *         <li key={catalog}>{catalog}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useListCatalogs(key?: string, disabled?: boolean) {
  const api = useArrowApi();
  return useQuery({
    enabled: !disabled,
    queryFn: async () => {
      if (!api) throw new Error('Arrow API is unavailable');
      const { data, error } = await api.list_catalogs();
      if (error) throw error;
      return data ?? [];
    },
    queryKey: [...LIST_CATALOGS_QUERY_KEY, key],
  });
}
