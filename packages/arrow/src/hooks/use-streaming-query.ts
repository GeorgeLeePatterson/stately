import { experimental_streamedQuery as streamedQuery, useQuery } from '@tanstack/react-query';
import { type RecordBatch, Table } from 'apache-arrow';
import { useCallback, useRef } from 'react';
import { type ArrowView, createArrowView } from '@/lib/arrow-view';
import { type QueryRequest, streamQuery } from '@/lib/stream-query';
import { useArrowApi } from './use-arrow-api';

/**
 * Result type for useStreamingQuery hook.
 */
export interface UseStreamingQueryResult {
  /** Current status of the streaming query */
  status: 'idle' | 'pending' | 'streaming' | 'complete' | 'error';
  /** Error if status is 'error' */
  error: Error | null;
  /** ArrowView for accessing streamed data (stable reference) */
  view: ArrowView;
  /** Execute a streaming query */
  execute: (payload: QueryRequest) => void;
  /** Abort the current streaming query */
  abort: () => void;
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
  const viewRef = useRef<ArrowViewInternal>(createArrowView());
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
        viewRef.current._setTable(newTable);
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

          viewRef.current._updateMetrics({
            batchesReceived: batchCount,
            bytesReceived,
            elapsedMs: performance.now() - startTimeRef.current,
          });

          yield batch;
        }
      },
    }),
    queryKey: ['arrow', 'streaming-query'] as const,
  });

  const execute = useCallback(
    (payload: QueryRequest) => {
      // Reset view state
      viewRef.current._setTable(null);
      viewRef.current._updateMetrics({ batchesReceived: 0, bytesReceived: 0, elapsedMs: 0 });
      viewRef.current.setCursor(0);

      // Trigger refetch with new payload via meta
      query.refetch({ meta: { payload } } as any);
    },
    [query],
  );

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  // Derive our status from React Query's state
  const status: UseStreamingQueryResult['status'] = query.isError
    ? 'error'
    : query.isPending && query.fetchStatus === 'idle'
      ? 'idle'
      : query.isPending && query.fetchStatus === 'fetching'
        ? 'pending'
        : query.isSuccess && query.fetchStatus === 'fetching'
          ? 'streaming'
          : query.isSuccess
            ? 'complete'
            : 'idle';

  return { abort, error: query.error, execute, status, view: viewRef.current };
}
