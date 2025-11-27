import type { Table as ArrowTable } from 'apache-arrow';
import { VirtualizedTable } from './virtualized-table';

interface QueryResultsProps {
  table?: ArrowTable | null;
  isLoading?: boolean;
  error?: string | null;
}

export function QueryResults({ table, isLoading, error }: QueryResultsProps) {
  if (isLoading) {
    return (
      <div className="flex h-full min-h-[360px] items-center justify-center rounded-lg border bg-muted/30 text-sm text-muted-foreground">
        Running query…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[360px] items-center justify-center rounded-lg border bg-destructive/5 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!table || table.numRows === 0) {
    return (
      <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Run a query to see results</p>
        <p className="max-w-sm text-xs text-muted-foreground">
          Large result sets are rendered with virtualization so scrolling billions of rows stays
          silky.
        </p>
      </div>
    );
  }

  return <VirtualizedTable table={table} />;
}
