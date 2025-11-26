import { useMutation, useQuery } from '@tanstack/react-query';
import { type Table, Type, tableFromIPC } from 'apache-arrow';
import { useMemo } from 'react';
import { useArrowStatelyUi } from '@/context';
import type { components } from '@/generated-types';

export type ListFilters = components['schemas']['StatQuery'];
export type TableSummary = components['schemas']['TableSummary'];
export type ListSummary = components['schemas']['ListSummary'];
export type ConnectionMetadata = components['schemas']['ConnectionMetadata'];

export interface QueryExecutionResult {
  table: Table;
  rowCount: number;
  sizeBytes: number;
  elapsedMs: number;
}

export function useArrowApi() {
  const runtime = useArrowStatelyUi();
  return runtime.plugins.arrow?.api;
}

export function useViewerConnectors() {
  const api = useArrowApi();
  return useQuery({
    queryFn: async () => {
      if (!api) throw new Error('Arrow API is unavailable');
      const { data, error } = await api.list_connectors();
      if (error) throw error;
      return data ?? [];
    },
    queryKey: ['viewer', 'connectors'],
  });
}

export function useViewerCatalogs(currentCatalog?: string) {
  const api = useArrowApi();
  return useQuery({
    queryFn: async () => {
      if (!api) throw new Error('Arrow API is unavailable');
      const { data, error } = await api.list_catalogs();
      if (error) throw error;
      return data ?? [];
    },
    queryKey: ['viewer', 'catalogs', currentCatalog],
  });
}

export function useViewerConnectorStat(connectorId?: string, filters: ListFilters = {}) {
  const api = useArrowApi();
  return useQuery({
    enabled: Boolean(connectorId),
    queryFn: async () => {
      if (!api) throw new Error('Arrow API is unavailable');
      const { data, error } = await api.stat({
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

export type QueryRequest = components['schemas']['QueryRequest'];

export function useViewerQuery() {
  const api = useArrowApi();
  return useMutation<QueryExecutionResult, Error, QueryRequest>({
    mutationFn: async payload => {
      if (!api) throw new Error('Arrow API is unavailable');

      /**
       * Execute a viewer query and deserialize the Arrow IPC stream into an Arrow Table.
       * Note: This currently buffers the entire response. For very large result sets we
       *       should switch to a streaming reader + worker so we don't hold everything
       *       in JS memory at once.
       */
      const startedAt = performance.now();
      const { data: buffer, error } = await api.execute_query({
        body: payload,
        parseAs: 'arrayBuffer',
      });
      if (error) throw error;
      if (!buffer) throw new Error('No data returned from query');

      let table: Table;
      try {
        table = tableFromIPC(new Uint8Array(buffer));
      } catch (error) {
        if (error instanceof Error && error.message.includes('Unrecognized type')) {
          const match = /Unrecognized type: "([^"]*)" \((-?\d+)\)/.exec(error.message);
          const typeId = match ? Number(match[2]) : undefined;
          const knownTypeName =
            typeof typeId === 'number'
              ? (Type as unknown as Record<number, string>)[typeId]
              : undefined;
          console.error('[viewer] Arrow decode error', {
            inferredTypeId: typeId,
            knownTypeName,
            message: error.message,
            query: payload.sql,
          });
          if (typeof typeId === 'number' && Type[typeId] === undefined) {
            console.debug('[viewer] Arrow Type enum snapshot', Type);
          }
        } else {
          console.error('[viewer] Arrow decode error', error);
        }
        throw error;
      }
      const elapsedMs = performance.now() - startedAt;
      return { elapsedMs, rowCount: table.numRows, sizeBytes: buffer.byteLength, table };
    },
  });
}

export function useViewerRegister() {
  const api = useArrowApi();
  return useMutation<ConnectionMetadata | undefined, Error, string>({
    mutationFn: async connectorId => {
      if (!api) throw new Error('Arrow API is unavailable');
      const { data, error } = await api.register({
        params: { path: { connector_id: connectorId || '' } },
      });

      if (error) throw error;
      return data;
    },
  });
}

export function useViewerStats(result?: QueryExecutionResult | null) {
  return useMemo(() => {
    if (!result) return [];
    return [
      { label: 'Rows', value: result.rowCount.toLocaleString() },
      { label: 'Size', value: formatBytes(result.sizeBytes) },
      { label: 'Duration', value: `${result.elapsedMs.toFixed(1)} ms` },
    ];
  }, [result]);
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return '—';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}
