import { type StructRowProxy, Table } from 'apache-arrow';

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
export interface ArrowViewState {
  table: Table | null;
  cursor: number;
  metrics: StreamMetrics;
}

/**
 * A view into an Arrow Table with cursor-based navigation.
 * The underlying table may grow as streaming progresses.
 */
export interface ArrowView {
  /** The underlying Arrow Table (grows during streaming) */
  readonly table: Table | null;
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
  subscribe(callback: (state: ArrowViewState) => void): () => void;
}

/**
 * Updater functions for modifying ArrowView state.
 * Returned separately from createArrowView to keep the public ArrowView interface clean.
 */
export interface ArrowViewUpdater {
  setTable(table: Table | null): void;
  updateMetrics(metrics: Partial<StreamMetrics>): void;
}

/**
 * Result of createArrowView - the public view and internal updater.
 */
export interface CreateArrowViewResult {
  view: ArrowView;
  updater: ArrowViewUpdater;
}

/**
 * Create an ArrowView instance for navigating Arrow Table data.
 *
 * Returns both the public ArrowView interface and an updater for internal use.
 *
 * @param initialTable - Optional initial table
 * @returns Object with `view` (public) and `updater` (for streaming hook)
 */
export function createArrowView(initialTable?: Table | null): CreateArrowViewResult {
  let table: Table | null = initialTable ?? null;
  let cursor = 0;
  let metrics: StreamMetrics = { batchesReceived: 0, bytesReceived: 0, elapsedMs: 0 };
  const subscribers = new Set<(state: ArrowViewState) => void>();

  const notify = () => {
    const state: ArrowViewState = { cursor, metrics, table };
    for (const cb of subscribers) {
      cb(state);
    }
  };

  const view: ArrowView = {
    get cursor() {
      return cursor;
    },

    getRow(index: number) {
      if (!table || index < 0 || index >= table.numRows) return null;
      return table.get(index);
    },

    next(count = 100) {
      if (!table || cursor >= table.numRows) return null;
      const end = Math.min(cursor + count, table.numRows);
      const result = table.slice(cursor, end);
      cursor = end;
      return result;
    },

    setCursor(position: number) {
      cursor = Math.max(0, Math.min(position, table?.numRows ?? 0));
    },

    slice(start: number, end: number) {
      if (!table) return new Table();
      const safeStart = Math.max(0, start);
      const safeEnd = Math.min(end, table.numRows);
      return table.slice(safeStart, safeEnd);
    },

    subscribe(callback: (state: ArrowViewState) => void) {
      subscribers.add(callback);
      // Immediately call with current state
      callback({ cursor, metrics, table });
      return () => subscribers.delete(callback);
    },

    get table() {
      return table;
    },
  };

  const updater: ArrowViewUpdater = {
    setTable(newTable: Table | null) {
      table = newTable;
      notify();
    },

    updateMetrics(update: Partial<StreamMetrics>) {
      metrics = { ...metrics, ...update };
      notify();
    },
  };

  return { updater, view };
}
