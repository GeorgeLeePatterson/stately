import { type RecordBatch, RecordBatchReader } from '@statelyjs/apache-arrow';
import type { ArrowApi } from '@/api';
import type { QueryRequest } from '@/types/api';
import { log } from './utils';

/**
 * Stream Arrow IPC data as RecordBatches from a query.
 *
 * This is the core primitive for streaming Arrow data. It yields RecordBatch
 * objects as they arrive from the server, enabling progressive loading.
 *
 * @param api - The Arrow API instance
 * @param payload - Query request with SQL and optional connector_id
 * @param signal - Optional AbortSignal to cancel the stream
 * @yields RecordBatch objects as they arrive
 *
 * @example
 * ```typescript
 * for await (const batch of streamQuery(api, { sql: 'SELECT * FROM t' })) {
 *   console.log(`Received batch with ${batch.numRows} rows`);
 * }
 * ```
 */
export async function* streamQuery(
  api: ArrowApi,
  payload: QueryRequest,
  signal?: AbortSignal,
): AsyncGenerator<RecordBatch> {
  log.debug('Arrow', 'running streamQuery', { payload });
  const { response, error } = await api.execute_query({ body: payload, parseAs: 'stream', signal });

  if (error) {
    const message = typeof error === 'string' ? error : JSON.stringify(error);
    throw new Error(message || 'Query execution failed');
  }

  try {
    const reader = await RecordBatchReader.from(response);
    log.debug('Arrow', 'created stream reader');

    for await (const batch of reader) {
      if (signal?.aborted) break;
      yield batch;
    }
  } catch (error) {
    log.error('Arrow', 'Error streaming record batches: ', { error, payload });
    throw error;
  } finally {
    log.debug('Arrow', 'Exiting record batch stream', { payload });
  }
}
