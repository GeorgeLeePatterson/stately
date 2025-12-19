import { type RecordBatch, Table } from '@statelyjs/apache-arrow';

/**
 * Metrics about the streaming query progress.
 */
export interface StreamMetrics {
  /** Number of bytes received (estimated from batch sizes) */
  bytesReceived: number;
  /** Number of batches received */
  batchesReceived: number;
  /** Elapsed time since query started in milliseconds */
  elapsedMs: number;
}

/**
 * Static snapshot of arrow data and underlying table
 */
export interface ArrowTableStoreSnapshot {
  table: Table;
  rowCount: number;
  metrics: StreamMetrics;
}

/**
 * A handle into an ephemeral and streaming Arrow Table
 */
export interface ArrowTableStore {
  readonly table: Table;
  readonly metrics: StreamMetrics;
  readonly timer: number;
  appendBatch(batch: RecordBatch): Table;
  reset(): number;
  startTimer(): void;
  subscribe(callback: (state: ArrowTableStoreSnapshot) => void): () => void;
  getSnapshot(): ArrowTableStoreSnapshot;
}

/**
 * Internal state container for Arrow streaming data.
 */
function createInternalStore(initialTable?: Table | null) {
  let table: Table = initialTable ?? new Table([]);
  const metrics: StreamMetrics = { batchesReceived: 0, bytesReceived: 0, elapsedMs: 0 };
  let timer = 0;
  const subscribers = new Set<(state: ArrowTableStoreSnapshot) => void>();

  let currentSnapshot: ArrowTableStoreSnapshot = {
    metrics: { ...metrics },
    rowCount: table.numRows,
    table,
  };

  const rebuildSnapshot = () => {
    currentSnapshot = { metrics: { ...metrics }, rowCount: table.numRows, table };
  };

  const notify = () => {
    if (!subscribers.size) return;
    rebuildSnapshot();
    for (const cb of subscribers) {
      cb(currentSnapshot);
    }
  };

  const appendBatch = (batch: RecordBatch) => {
    const batches = [...(table?.batches || []), batch];
    table = new Table(batches);
    metrics.batchesReceived++;
    metrics.bytesReceived += batch.data.byteLength;
    metrics.elapsedMs = performance.now() - timer;
    notify();
    return table;
  };

  const reset = () => {
    timer = performance.now();
    table = new Table([]);
    metrics.batchesReceived = 0;
    metrics.bytesReceived = 0;
    metrics.elapsedMs = 0;
    notify();
    return timer;
  };

  const startTimer = () => {
    timer = performance.now();
  };

  const subscribe = (callback: (state: ArrowTableStoreSnapshot) => void) => {
    subscribers.add(callback);
    callback(currentSnapshot);
    return () => subscribers.delete(callback);
  };

  const getSnapshot = () => currentSnapshot;

  return {
    appendBatch,
    getSnapshot,
    metrics,
    reset,
    startTimer,
    subscribe,
    get table() {
      return table;
    },
    get timer() {
      return timer;
    },
  };
}

export function createArrowTableStore(initialTable?: Table | null): ArrowTableStore {
  const store = createInternalStore(initialTable);

  return {
    appendBatch: store.appendBatch,
    getSnapshot: store.getSnapshot,
    get metrics() {
      return store.metrics;
    },
    reset: store.reset,
    startTimer: store.startTimer,
    subscribe: store.subscribe,
    get table() {
      return store.table;
    },
    get timer() {
      return store.timer;
    },
  };
}
