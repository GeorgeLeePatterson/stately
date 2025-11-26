import {
  experimental_streamedQuery as streamedQuery,
  type UseQueryResult,
  useQuery,
} from '@tanstack/react-query';
import { type RecordBatch, Table } from 'apache-arrow';
import { useCallback, useRef } from 'react';
import { type ArrowView, type ArrowViewUpdater, createArrowView } from '@/lib/arrow-view';
import { streamQuery } from '@/lib/stream-query';
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
  view: ArrowView;
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
export function useStreamingQuery(): UseStreamingQueryResult {
  const api = useArrowApi();
  const { view, updater } = useRef(createArrowView()).current;
  const viewRef = useRef<ArrowView>(view);
  const updaterRef = useRef<ArrowViewUpdater>(updater);
  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);

  // Use useQuery with streamedQuery for the streaming functionality
  const query = useQuery({
    enabled: false, // Manual execution only
    meta: { payload: null as QueryRequest | null },
    queryFn: streamedQuery({
      initialValue: null,
      reducer: (table: Table | null, batch: RecordBatch): Table | null => {
        const newTable = table ? new Table([...table.batches, batch]) : new Table([batch]);
        updaterRef.current.setTable(newTable);
        return newTable;
      },
      refetchMode: 'reset',
      async *streamFn(context) {
        if (!api) throw new Error('Arrow API is unavailable');

        startTimeRef.current = performance.now();
        abortControllerRef.current = new AbortController();

        // Combine React Query's signal with our abort controller
        const signal = abortControllerRef.current.signal;
        context.signal.addEventListener('abort', () => abortControllerRef.current?.abort());

        let batchCount = 0;
        let bytesReceived = 0;

        for await (const batch of streamQuery(api, context.meta?.payload as QueryRequest, signal)) {
          batchCount++;
          bytesReceived += batch.data.byteLength;

          updaterRef.current.updateMetrics({
            batchesReceived: batchCount,
            bytesReceived,
            elapsedMs: performance.now() - startTimeRef.current,
          });

          yield batch;
        }
      },
    }),
    queryKey: STREAMING_QUERY_KEY,
  });

  const execute = useCallback(
    (payload: QueryRequest) => {
      // Reset view state
      updaterRef.current.setTable(null);
      updaterRef.current.updateMetrics({ batchesReceived: 0, bytesReceived: 0, elapsedMs: 0 });
      viewRef.current.setCursor(0);

      // Trigger refetch with new payload via meta
      query.refetch({ meta: { payload } } as any);
    },
    [query],
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

  return { abort, execute, isIdle, isPending, isStreaming, query, view: viewRef.current };
}
