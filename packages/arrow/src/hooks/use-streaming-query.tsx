import { devLog } from '@stately/ui/base';
import {
  queryOptions,
  experimental_streamedQuery as streamedQuery,
  type UseQueryResult,
  useQuery,
  useQueryClient,
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
  isIdle: boolean;
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
  const queryClient = useQueryClient();
  const storeRef = useRef(createArrowTableStore());

  const [queryRequest, setQueryRequest] = useState<QueryRequest>();

  const subscriptionCleanupRef = useRef<(() => void) | null>(null);

  const streamOptions = useMemo(
    () => ({ api, payload: queryRequest, store: storeRef.current }),
    [api, queryRequest],
  );

  // Use useQuery with streamedQuery for the streaming functionality
  const query = useQuery(streamQueryOptions(streamOptions));

  const restart = useCallback(() => {
    storeRef.current.reset();
    setQueryRequest(undefined);
  }, []);

  const execute = useCallback((payload: QueryRequest) => {
    // TODO: Remove
    devLog.debug('Arrow', 'stream query execute', payload);

    storeRef.current.reset();

    // Update query request
    setQueryRequest(payload);
  }, []);

  const abort = useCallback(() => {
    queryClient.cancelQueries({ queryKey: STREAMING_QUERY_KEY });
  }, [queryClient]);

  // Helper functions for common status checks
  const isIdle = useMemo(
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
}: {
  store: ArrowTableStore;
  api?: ArrowApi;
  payload?: QueryRequest;
}) =>
  queryOptions({
    enabled: !!payload, // Only run when we have a payload
    queryFn: streamedQuery({
      initialValue: store.table,
      reducer: (_: Table, batch: RecordBatch): Table => {
        store.appendBatch(batch);
        return store.table;
      },
      streamFn: async context => {
        devLog.debug('Arrow', 'stream fn*', { payload, store });

        if (!payload) {
          async function* emptyStream(): AsyncGenerator<RecordBatch> {
            yield new RecordBatch({});
          }
          return emptyStream();
        }

        if (!api) throw new Error('Arrow API is unavailable');

        // Use React Query's signal directly for cancellation
        return streamQuery(api, payload, context.signal);
      },
    }),
    queryKey: [STREAMING_QUERY_KEY, payload?.sql, payload?.connector_id] as const,
    retry: false,
    retryOnMount: false,
    staleTime: Number.POSITIVE_INFINITY,
  });
