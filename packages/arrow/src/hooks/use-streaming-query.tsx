import { devLog } from '@stately/ui/base';
import {
  queryOptions,
  experimental_streamedQuery as streamedQuery,
  type UseQueryResult,
  useQuery,
} from '@tanstack/react-query';
import { RecordBatch, type Table } from 'apache-arrow';
import { Binary, SquareSigma, Timer } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { ArrowApi } from '@/api';
import type { QueryEditorStat } from '@/components/query-editor';
import {
  type ArrowTableStore,
  type ArrowTableStoreSnapshot,
  createArrowTableStore,
} from '@/lib/arrow-table-store';
import { streamQuery } from '@/lib/stream-query';
import { formatBytes } from '@/lib/utils';
import type { QueryRequest } from '@/types/api';
import { useArrowApi } from './use-arrow-api';

/** Query key for streaming queries - export for use with queryClient */
export const STREAMING_QUERY_KEY = ['arrow', 'streaming-query'] as const;

export interface ArrowTableColumnDescriptor {
  key: string;
  name: string;
  maxWidth?: number;
  getValue(rowIndex: number): unknown | undefined;
}

export interface ArrowTableDataView {
  columns: readonly ArrowTableColumnDescriptor[];
  loadedRowCount: number;
  totalRowCount?: number;
  isRowLoaded?: (rowIndex: number) => boolean;
  requestWindow?: (window: { start: number; end: number }) => void;
}

export interface CreateDataViewOptions {
  totalRowCount?: number;
  isRowLoaded?: ArrowTableDataView['isRowLoaded'];
  requestWindow?: ArrowTableDataView['requestWindow'];
}

/**
 * Result type for useStreamingQuery hook.
 */
export interface UseStreamingQueryResult {
  /** The underlying React Query result for full API access */
  query: UseQueryResult<Table | null, Error>;
  /** Derived Arrow view for table virtualization */
  snapshot: ArrowTableStoreSnapshot;
  /** Fetch a fresh data view with custom options */
  createDataView: (options?: CreateDataViewOptions) => ArrowTableDataView;
  /** Subscribe to low-level store snapshots */
  onSnapshot: (cb: (snapshot: ArrowTableStoreSnapshot) => void) => () => void;
  /** Execute a streaming query */
  execute: (payload: QueryRequest) => void;
  /** Call `reset` and additionally reset the query request value to undefined */
  restart: () => void;
  /** Abort the current streaming query */
  abort: () => void;
  /** True if no query has been executed yet */
  isIdle: () => boolean;
  /** True if waiting for first batch */
  isPending: boolean;
  /** True if actively receiving batches */
  isStreaming: boolean;
  /** True if a sql query has been run */
  isActive: boolean;
  /** Label value pairs of streaming query stats */
  queryStats: QueryEditorStat[];
}

/**
 * Hook for executing streaming Arrow queries.
 *
 * Uses React Query's experimental streamedQuery to handle streaming state,
 * combined with an ArrowTableStore for cursor-free data access.
 *
 * @example
 * ```typescript
 * function DataViewer() {
 *   const { dataView, execute } = useStreamingQuery({
 *     subscribe: ({ table }) => {
 *       console.log(`Loaded ${table?.numRows ?? 0} rows`);
 *     },
 *   });
 *
 *   // Execute a query
 *   const handleRun = () => execute({ sql: 'SELECT * FROM large_table' });
 *
 *   // Access data for rendering
 *   return <ArrowTable data={dataView} />;
 * }
 * ```
 */
export function useStreamingQuery({
  subscribe,
}: {
  subscribe?: Parameters<ArrowTableStore['subscribe']>[0];
}): UseStreamingQueryResult {
  const api = useArrowApi();
  const storeRef = useRef(createArrowTableStore());

  const [queryRequest, setQueryRequest] = useState<QueryRequest>();

  const abortControllerRef = useRef<AbortController | null>(null);
  const subscriptionCleanupRef = useRef<(() => void) | null>(null);

  // Use useQuery with streamedQuery for the streaming functionality
  const query = useQuery(
    streamQueryOptions({
      abortController: abortControllerRef.current ?? undefined,
      api,
      payload: queryRequest,
      store: storeRef.current,
    }),
  );

  const reset = useCallback(() => {
    // Reset store state
    storeRef.current.reset();

    // Re-set abort controller
    abortControllerRef.current = new AbortController();
  }, []);

  const restart = useCallback(() => {
    reset();
    setQueryRequest(undefined);
  }, [reset]);

  const execute = useCallback(
    (payload: QueryRequest) => {
      // TODO: Remove
      devLog.debug('Arrow', 'stream query execute', payload);

      reset();

      // Update query request
      setQueryRequest(payload);
    },
    [reset],
  );

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  // Helper functions for common status checks
  const isIdle = useCallback(
    () => query.fetchStatus === 'idle' && !query.data,
    [query.fetchStatus, query.data],
  );

  const isPending = useMemo(
    () => query.status === 'pending' && query.fetchStatus === 'fetching',
    [query.status, query.fetchStatus],
  );

  const isStreaming = useMemo(
    () => query.status === 'success' && query.fetchStatus === 'fetching',
    [query.status, query.fetchStatus],
  );

  const isActive = !!queryRequest?.sql;

  const snapshot = useSyncExternalStore(storeRef.current.subscribe, storeRef.current.getSnapshot);

  // TODO: Remove
  devLog.debug('Arrow', 'stream query props', {
    derived: `idle=${isIdle}, pending=${isPending}, streaming=${isStreaming}, active=${isActive}`,
    queryRequest,
    snapshot,
  });

  /**
   * =========================
   * These seem derivative and should probably be moved.
   * =========================
   */
  const createDataView = useCallback(
    (options: CreateDataViewOptions = {}): ArrowTableDataView => {
      const columns = snapshot.table.schema.fields.map((field, index) => {
        const vector = snapshot.table.getChildAt(index);
        const key = field?.name || `column_${index}`;
        return {
          getValue: (rowIndex: number) => {
            if (rowIndex < 0 || rowIndex >= snapshot.table.numRows) return undefined;
            return vector?.get(rowIndex);
          },
          key,
          name: field?.name || `column_${index}`,
        };
      });

      return {
        columns,
        isRowLoaded:
          options.isRowLoaded ?? ((rowIndex: number) => rowIndex < snapshot.table.numRows),
        loadedRowCount: snapshot.table.numRows,
        requestWindow: options.requestWindow,
        totalRowCount: options.totalRowCount,
      };
    },
    [snapshot.table],
  );

  const queryStats = useMemo<QueryEditorStat[]>(() => {
    const currentTable = storeRef.current.table;
    const currentMetrics = storeRef.current.metrics;
    if (!currentTable) return [];
    return [
      { label: SquareSigma, value: currentTable.numRows.toLocaleString() },
      { label: Binary, value: formatBytes(currentMetrics.bytesReceived) },
      { label: Timer, value: `${currentMetrics.elapsedMs.toFixed(1)} ms` },
    ];
  }, []);

  /**
   * =========================
   * =========================
   */

  useEffect(() => {
    subscriptionCleanupRef.current?.();

    if (subscribe) {
      subscriptionCleanupRef.current = storeRef.current.subscribe(subscribe);
    } else {
      subscriptionCleanupRef.current = null;
    }

    return () => {
      subscriptionCleanupRef.current?.();
      subscriptionCleanupRef.current = null;
    };
  }, [subscribe]);

  return {
    abort,
    createDataView,
    execute,
    isActive,
    isIdle,
    isPending,
    isStreaming,
    onSnapshot: cb => storeRef.current.subscribe(cb),
    query,
    queryStats,
    restart,
    snapshot,
  };
}

export const streamQueryOptions = ({
  store,
  api,
  payload,
  abortController,
}: {
  store: ArrowTableStore;
  api?: ArrowApi;
  payload?: QueryRequest;
  abortController?: AbortController;
}) =>
  queryOptions({
    enabled: !payload, // Only run when we have a payload
    queryFn: streamedQuery({
      initialValue: store.table,
      reducer: (_: Table, batch: RecordBatch): Table => {
        store.appendBatch(batch);
        return store.table;
      },
      refetchMode: 'replace', // Is this right?
      streamFn: async context => {
        // TODO: Remove
        devLog.debug('Arrow', 'stream fn*', { payload, store });

        if (!payload) {
          // No query request means reset the query
          async function* emptyStream(): AsyncGenerator<RecordBatch> {
            yield new RecordBatch({});
          }
          return emptyStream();
        }

        if (!api) throw new Error('Arrow API is unavailable');

        // Combine React Query's signal with our abort controller
        context.signal.addEventListener('abort', () => abortController?.abort());

        return streamQuery(api, payload, abortController?.signal);
      },
    }),
    queryKey: [STREAMING_QUERY_KEY, payload?.sql, payload?.connector_id] as const,
  });
