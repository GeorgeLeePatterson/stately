import {
  queryOptions,
  experimental_streamedQuery as streamedQuery,
  type UseQueryResult,
  useQuery,
} from '@tanstack/react-query';
import type { RecordBatch, Table } from 'apache-arrow';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { ArrowApi } from '@/api';
import { type ArrowTableView, createArrowView } from '@/lib/arrow-table-view';
import { streamQuery } from '@/lib/stream-query';
import { formatBytes } from '@/lib/utils';
import type { QueryRequest } from '@/types/api';
import { useArrowApi } from './use-arrow-api';

/** Query key for streaming queries - export for use with queryClient */
export const STREAMING_QUERY_KEY = ['arrow', 'streaming-query'] as const;

/**
 * Result type for useStreamingQuery hook.
 */
export interface UseStreamingQueryResult {
  /** The underlying React Query result for full API access */
  query: UseQueryResult<Table | null, Error>;
  /** ArrowView for accessing streamed data (stable reference) */
  view: ArrowTableView;
  /** Execute a streaming query */
  execute: (payload: QueryRequest) => void;
  /** Abort the current streaming query */
  abort: () => void;
  /** True if no query has been executed yet */
  isIdle: () => boolean;
  /** True if waiting for first batch */
  isPending: () => boolean;
  /** True if actively receiving batches */
  isStreaming: () => boolean;
  /** Label value pairs of streaming query stats */
  queryStats: { label: string; value: string }[];
}

/**
 * Hook for executing streaming Arrow queries.
 *
 * Uses React Query's experimental streamedQuery to handle streaming state,
 * combined with an ArrowView for data access and cursor navigation.
 *
 * @example
 * ```typescript
 * function DataViewer() {
 *   const { status, view, execute } = useStreamingQuery();
 *
 *   // Execute a query
 *   const handleRun = () => execute({ sql: 'SELECT * FROM large_table' });
 *
 *   // Access data for rendering
 *   const row = view.getRow(42);
 *   const window = view.slice(100, 200);
 *
 *   // Subscribe to changes for progress updates
 *   useEffect(() => view.subscribe(({ table }) => {
 *     console.log(`Loaded ${table?.numRows ?? 0} rows`);
 *   }), [view]);
 *
 *   return <VirtualizedTable view={view} />;
 * }
 * ```
 */
export function useStreamingQuery({
  subscribe,
}: {
  subscribe?: Parameters<ArrowTableView['subscribe']>[0];
}): UseStreamingQueryResult {
  const api = useArrowApi();
  const viewRef = useRef(createArrowView());

  const [queryRequest, setQueryRequest] = useState<QueryRequest>();

  const abortControllerRef = useRef<AbortController | null>(null);

  // Use useQuery with streamedQuery for the streaming functionality
  const query = useQuery(
    streamQueryOptions({
      abortController: abortControllerRef.current ?? undefined,
      api,
      payload: queryRequest,
      view: viewRef.current,
    }),
  );

  const execute = useCallback(
    (payload: QueryRequest) => {
      // Reset view state
      viewRef.current.reset();

      // Re-subscribe if provided
      subscribe && viewRef.current.subscribe(subscribe);

      // Re-set abort controller
      abortControllerRef.current = new AbortController();

      // Update query request
      setQueryRequest(payload);
    },
    [subscribe],
  );

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  // Helper functions for common status checks
  const isIdle = useCallback(
    () => query.fetchStatus === 'idle' && !query.data,
    [query.fetchStatus, query.data],
  );

  const isPending = useCallback(
    () => query.status === 'pending' && query.fetchStatus === 'fetching',
    [query.status, query.fetchStatus],
  );

  const isStreaming = useCallback(
    () => query.status === 'success' && query.fetchStatus === 'fetching',
    [query.status, query.fetchStatus],
  );

  const [table, metrics] = [viewRef.current.table, viewRef.current.metrics];
  const queryStats = useMemo(() => {
    if (!table) return [];
    return [
      { label: 'Rows', value: table.numRows.toLocaleString() },
      { label: 'Size', value: formatBytes(metrics.bytesReceived) },
      { label: 'Duration', value: `${metrics.elapsedMs.toFixed(1)} ms` },
    ];
  }, [table, metrics]);

  return {
    abort,
    execute,
    isIdle,
    isPending,
    isStreaming,
    query,
    queryStats,
    view: viewRef.current,
  };
}

export const streamQueryOptions = ({
  view,
  api,
  payload,
  abortController,
}: {
  view: ArrowTableView;
  api?: ArrowApi;
  payload?: QueryRequest;
  abortController?: AbortController;
}) =>
  queryOptions({
    enabled: !payload, // Only run when we have a payload
    queryFn: streamedQuery({
      initialValue: view.table,
      reducer: (_: Table, batch: RecordBatch): Table => {
        return view.appendBatch(batch);
      },
      refetchMode: 'replace', // Is this right?
      streamFn: async context => {
        if (!payload) throw new Error('No query request provided');
        if (!api) throw new Error('Arrow API is unavailable');

        // Combine React Query's signal with our abort controller
        context.signal.addEventListener('abort', () => abortController?.abort());

        return streamQuery(api, payload, abortController?.signal);
      },
    }),
    queryKey: [STREAMING_QUERY_KEY, payload?.sql, payload?.connector_id] as const,
  });
