import { type RecordBatch, type StructRowProxy, Table } from 'apache-arrow';

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
 * State snapshot provided to ArrowView subscribers.
 */
export interface ArrowTableViewState {
  table: Table | null;
  cursor: number;
  metrics: StreamMetrics;
}

/**
 * A view into an Arrow Table with cursor-based navigation.
 * The underlying table may grow as streaming progresses.
 */
export interface ArrowTableView {
  /** The underlying Arrow Table (grows during streaming) */
  readonly table: Table;
  /** Current cursor position for sequential navigation */
  readonly cursor: number;

  /** Set the cursor position for sequential navigation */
  setCursor(position: number): void;
  /** Get the next N rows from current cursor position, advances cursor */
  next(count?: number): Table | null;
  /** Get a single row by index (O(log batches) via binary search) */
  getRow(index: number): StructRowProxy | null;
  /** Get a slice of rows as a Table (zero-copy) */
  slice(start: number, end: number): Table;
  /** Subscribe to state changes, returns unsubscribe function */
  subscribe(callback: (state: ArrowTableViewState) => void): () => void;

  /**
   * Timer events
   */
  timer: number;
  startTimer(): void;

  /**
   * Metric events
   */
  readonly metrics: StreamMetrics;

  /**
   * Updater functions for modifying ArrowView state.
   * Returned separately from createArrowView to keep the public ArrowView interface clean.
   */
  setTable(table: Table | null): void;
  appendBatch(batch: RecordBatch): Table;
  reset(): number;
}

/**
 * Create an ArrowView instance for navigating Arrow Table data.
 *
 * Returns both the public ArrowView interface and an updater for internal use.
 *
 * @param initialTable - Optional initial table
 * @returns Object with `view` (public) and `updater` (for streaming hook)
 */
export function createArrowView(initialTable?: Table | null): ArrowTableView {
  let table: Table = initialTable ?? new Table([]);
  let cursor = 0;
  const metrics: StreamMetrics = { batchesReceived: 0, bytesReceived: 0, elapsedMs: 0 };
  let timer = 0;
  const subscribers = new Set<(state: ArrowTableViewState) => void>();

  const notify = () => {
    for (const cb of subscribers) {
      cb({ cursor, metrics, table });
    }
  };

  const setCursor = (position: number) => {
    cursor = Math.max(0, Math.min(position, table?.numRows ?? 0));
  };

  const setTable = (newTable: Table) => {
    table = newTable;
    notify();
  };

  const startTimer = () => {
    timer = performance.now();
  };

  const view: ArrowTableView = {
    appendBatch(batch: RecordBatch) {
      const newTable = new Table([...(table?.batches || []), batch]);
      setTable(newTable);

      metrics.batchesReceived++;
      metrics.bytesReceived += batch.data.byteLength;
      metrics.elapsedMs = performance.now() - timer;
      notify();

      return newTable;
    },

    get cursor() {
      return cursor;
    },

    getRow(index: number) {
      if (!table || index < 0 || index >= table.numRows) return null;
      return table.get(index);
    },

    get metrics() {
      return metrics;
    },

    next(count = 100) {
      if (!table || cursor >= table.numRows) return null;
      const end = Math.min(cursor + count, table.numRows);
      const result = table.slice(cursor, end);
      cursor = end;
      return result;
    },

    reset() {
      startTimer();
      setCursor(0);
      setTable(new Table([]));
      metrics.batchesReceived = 0;
      metrics.bytesReceived = 0;
      metrics.elapsedMs = 0;
      return timer;
    },

    setCursor,

    setTable,

    slice(start: number, end: number) {
      if (!table) return new Table();
      const safeStart = Math.max(0, start);
      const safeEnd = Math.min(end, table.numRows);
      return table.slice(safeStart, safeEnd);
    },

    startTimer,

    subscribe(callback: (state: ArrowTableViewState) => void) {
      subscribers.add(callback);
      // Immediately call with current state
      callback({ cursor, metrics, table });
      return () => subscribers.delete(callback);
    },

    get table() {
      return table;
    },

    timer,
  };

  return view;
}
