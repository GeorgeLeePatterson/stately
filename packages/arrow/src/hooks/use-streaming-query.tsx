/**
 * Streaming Query Hook
 *
 * This module provides React hooks for executing streaming SQL queries
 * using Apache Arrow's columnar format. It leverages React Query's
 * experimental streaming support for efficient data loading.
 *
 * @module
 */

import {
  queryOptions,
  experimental_streamedQuery as streamedQuery,
  type UseQueryResult,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { RecordBatch, type Table } from 'apache-arrow';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { ArrowApi } from '@/api';
import {
  type ArrowTableStore,
  type ArrowTableStoreSnapshot,
  createArrowTableStore,
} from '@/lib/arrow-table-store';
import { streamQuery } from '@/lib/stream-query';
import { log } from '@/lib/utils';
import type { QueryRequest } from '@/types/api';
import { useArrowApi } from './use-arrow-api';

/**
 * Query key for streaming queries.
 *
 * Use this key with React Query's `queryClient` for cache invalidation
 * or manual query management.
 *
 * @example
 * ```typescript
 * // Invalidate all streaming queries
 * queryClient.invalidateQueries({ queryKey: STREAMING_QUERY_KEY });
 * ```
 */
export const STREAMING_QUERY_KEY = ['arrow', 'streaming-query'] as const;

/**
 * Result type for the {@link useStreamingQuery} hook.
 *
 * Provides comprehensive access to streaming query state, including
 * execution controls, status flags, and the underlying Arrow table data.
 */
export interface UseStreamingQueryResult {
  /** The underlying React Query result for full API access */
  query: UseQueryResult<Table | null, Error>;
  /** Current store snapshot with table and metrics */
  snapshot: ArrowTableStoreSnapshot;
  /** Subscribe to low-level store snapshots for fine-grained updates */
  onSnapshot: (cb: (snapshot: ArrowTableStoreSnapshot) => void) => () => void;
  /** Execute a streaming query with the given SQL and connector */
  execute: (payload: QueryRequest) => void;
  /** Reset the query state and clear the current query request */
  restart: () => void;
  /** Abort the current streaming query (cancels in-flight request) */
  abort: () => void;
  /** True if no query has been executed yet */
  isIdle: boolean;
  /** True if waiting for the first batch of results */
  isPending: boolean;
  /** True if actively receiving batches (query in progress) */
  isStreaming: boolean;
  /** True if a SQL query has been submitted */
  isActive: boolean;
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
 *   const { snapshot, execute } = useStreamingQuery({
 *     subscribe: ({ table }) => {
 *       console.log(`Loaded ${table?.numRows ?? 0} rows`);
 *     },
 *   });
 *
 *   // Execute a query
 *   const handleRun = () => execute({ sql: 'SELECT * FROM large_table' });
 *
 *   // Convert table to data view for rendering
 *   const view = useMemo(() => tableToDataView(snapshot.table), [snapshot.table]);
 *   return <ArrowTable data={view} />;
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

  const restart = useCallback(() => setQueryRequest(undefined), []);

  const execute = useCallback(
    (payload: QueryRequest) =>
      setQueryRequest(p =>
        p?.connector_id === payload.connector_id && p?.sql === payload.sql ? p : payload,
      ),
    [],
  );

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

  // Sync the arrow store updates with react state
  const snapshot = useSyncExternalStore(storeRef.current.subscribe, storeRef.current.getSnapshot);

  log.debug('Arrow', 'stream query props', {
    derived: `idle=${isIdle}, pending=${isPending}, streaming=${isStreaming}, active=${isActive}`,
    queryRequest,
    snapshot,
  });

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
    execute,
    isActive,
    isIdle,
    isPending,
    isStreaming,
    onSnapshot: cb => storeRef.current.subscribe(cb),
    query,
    restart,
    snapshot,
  };
}

/**
 * Creates React Query options for streaming Arrow queries.
 *
 * This is a lower-level API for advanced use cases where you need direct
 * control over the query configuration. Most users should prefer
 * {@link useStreamingQuery} instead.
 *
 * @param options - Configuration for the streaming query
 * @param options.store - The Arrow table store for accumulating results
 * @param options.api - The Arrow API client
 * @param options.payload - The query request (SQL and connector ID)
 * @returns React Query options object for use with `useQuery`
 *
 * @example
 * ```typescript
 * // Advanced: Use with React Query directly
 * const store = createArrowTableStore();
 * const options = streamQueryOptions({
 *   store,
 *   api: arrowApi,
 *   payload: { sql: 'SELECT * FROM table', connector_id: 'db1' },
 * });
 * const query = useQuery(options);
 * ```
 */
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
        log.debug('Arrow', 'stream fn*', { payload, store });

        if (!api) throw new Error('Arrow API is unavailable');

        // Reset store
        store.reset();

        if (!payload) {
          async function* emptyStream(): AsyncGenerator<RecordBatch> {
            yield new RecordBatch({});
          }
          return emptyStream();
        }

        // Use React Query's signal directly for cancellation
        return streamQuery(api, payload, context.signal);
      },
    }),
    queryKey: [STREAMING_QUERY_KEY, payload?.sql, payload?.connector_id] as const,
    retry: false,
    retryOnMount: false,
    staleTime: Number.POSITIVE_INFINITY,
  });
