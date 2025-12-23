import { useArrowStatelyUi } from '@/context';

/**
 * Hook to access the Arrow API client.
 *
 * Provides typed access to all Arrow API operations including connection
 * management, catalog browsing, and query execution.
 *
 * @returns The Arrow API client, or undefined if the Arrow plugin is not configured
 *
 * @example
 * ```typescript
 * function CatalogList() {
 *   const api = useArrowApi();
 *
 *   const fetchCatalogs = async () => {
 *     if (!api) return;
 *     const { data, error } = await api.list_catalogs();
 *     if (error) throw error;
 *     return data;
 *   };
 * }
 * ```
 */
export function useArrowApi() {
  const { plugins } = useArrowStatelyUi();
  return plugins.arrow?.api;
}
