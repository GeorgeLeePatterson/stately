import { cn } from '@stately/ui/base/lib/utils';
import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@stately/ui/base/ui';
import { useVirtualizer } from '@tanstack/react-virtual';
import { MoreHorizontal } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ArrowTableDataView } from '@/hooks/use-streaming-query';

const ROW_HEIGHT = 42;
const DATA_COLUMN_MAX_WIDTH = 320;
const CELL_CHAR_LIMIT = 140;
const PREFETCH_PADDING_ROWS = 50;

export interface ArrowTableProps {
  data: ArrowTableDataView;
  className?: string;
  rowHeight?: number;
  overscan?: number;
  /** Message shown when no rows are available */
  emptyState?: string;
}

export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') return value.toLocaleString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return `[${value.map(formatValue).join(', ')}]`;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function ArrowTable({
  data,
  className,
  rowHeight = ROW_HEIGHT,
  overscan = 12,
  emptyState = 'No results to display.',
}: ArrowTableProps) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [drawerRowIndex, setDrawerRowIndex] = useState<number | null>(null);

  const isRowLoaded = useMemo(() => {
    if (data.isRowLoaded) return data.isRowLoaded;
    return (rowIndex: number) => rowIndex < data.loadedRowCount;
  }, [data.isRowLoaded, data.loadedRowCount]);

  const rowCount =
    typeof data.totalRowCount === 'number' ? Math.max(data.totalRowCount, 0) : data.loadedRowCount;

  const virtualizer = useVirtualizer({
    count: rowCount,
    estimateSize: () => rowHeight,
    getScrollElement: () => parentRef.current,
    overscan,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? virtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end
      : 0;

  useEffect(() => {
    if (!data.requestWindow || virtualRows.length === 0) return;
    const first = virtualRows[0].index;
    const last = virtualRows[virtualRows.length - 1].index;
    const window = {
      end: last + PREFETCH_PADDING_ROWS,
      start: Math.max(0, first - PREFETCH_PADDING_ROWS),
    };
    data.requestWindow(window);
  }, [data.requestWindow, virtualRows]);

  const handleDrawerChange = useCallback((open: boolean) => {
    if (!open) setDrawerRowIndex(null);
  }, []);

  const drawerRowValues = useMemo(() => {
    if (drawerRowIndex === null) return [];
    if (!isRowLoaded(drawerRowIndex)) return [];
    return data.columns.map(column => ({
      key: column.key,
      name: column.name,
      value: formatValue(column.getValue(drawerRowIndex)),
    }));
  }, [data.columns, drawerRowIndex, isRowLoaded]);

  if (rowCount === 0) {
    return (
      <div
        className={cn(
          'flex min-h-[240px] items-center justify-center rounded-lg border',
          className,
        )}
      >
        <p className="text-sm text-muted-foreground">{emptyState}</p>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          'flex h-full min-h-[360px] flex-col overflow-hidden rounded-lg border',
          className,
        )}
      >
        <div className="arrow-table flex-1 overflow-auto bg-background" ref={parentRef}>
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow>
                <TableHead className="w-[80px] max-w-[80px] bg-muted/30 text-[11px] font-semibold uppercase tracking-wide">
                  Row
                </TableHead>
                {data.columns.map(column => (
                  <TableHead
                    className={cn(
                      'bg-muted/30 text-[11px] font-semibold uppercase tracking-wide',
                      column.maxWidth && 'truncate',
                    )}
                    key={column.key}
                    style={{
                      maxWidth: column.maxWidth ?? DATA_COLUMN_MAX_WIDTH,
                      width: column.maxWidth,
                    }}
                  >
                    {column.name}
                  </TableHead>
                ))}
                <TableHead className="w-12 bg-muted/30" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paddingTop > 0 && (
                <TableRow>
                  <TableCell
                    className="p-0"
                    colSpan={data.columns.length + 2}
                    style={{ height: paddingTop }}
                  />
                </TableRow>
              )}
              {virtualRows.map(virtualRow => {
                const rowIndex = virtualRow.index;
                const loaded = isRowLoaded(rowIndex);

                const rowCells = loaded
                  ? data.columns.map(column => {
                      const rawValue = column.getValue(rowIndex);
                      const formatted = formatValue(rawValue);
                      return { column, formatted };
                    })
                  : data.columns.map(column => ({ column, formatted: null }));

                const rowHasOverflow = loaded
                  ? rowCells.some(cell => (cell.formatted?.length ?? 0) > CELL_CHAR_LIMIT)
                  : false;

                return (
                  <TableRow
                    className={cn(rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/20')}
                    key={rowIndex}
                    style={{ height: virtualRow.size }}
                  >
                    <TableCell className="w-[80px] max-w-[80px] align-top">
                      <span className="font-mono text-xs text-muted-foreground">
                        {rowIndex.toLocaleString()}
                      </span>
                    </TableCell>
                    {rowCells.map(cell => (
                      <TableCell
                        className={cn(
                          'align-top font-mono text-xs',
                          cell.column.maxWidth && 'truncate',
                        )}
                        key={`${rowIndex}-${cell.column.key}`}
                        style={{
                          maxWidth: cell.column.maxWidth ?? DATA_COLUMN_MAX_WIDTH,
                          width: cell.column.maxWidth,
                        }}
                      >
                        {loaded ? (
                          <span className="inline-block wrap-break-word">{cell.formatted}</span>
                        ) : (
                          <span className="inline-flex h-4 w-20 animate-pulse rounded bg-muted" />
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="w-12 text-right">
                      {rowHasOverflow && (
                        <Button
                          aria-label="View full row"
                          className="h-7 w-7"
                          onClick={() => setDrawerRowIndex(rowIndex)}
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {paddingBottom > 0 && (
                <TableRow>
                  <TableCell
                    className="p-0"
                    colSpan={data.columns.length + 2}
                    style={{ height: paddingBottom }}
                  />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Drawer onOpenChange={handleDrawerChange} open={drawerRowIndex !== null}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader>
            <DrawerTitle>
              Row {drawerRowIndex !== null ? (drawerRowIndex + 1).toLocaleString() : ''}
            </DrawerTitle>
            <DrawerDescription>Full values</DrawerDescription>
          </DrawerHeader>
          <div className="max-h-[60vh] overflow-auto px-4 pb-4">
            <dl className="space-y-4 text-sm">
              {drawerRowValues.map(cell => (
                <div className="space-y-1" key={cell.key}>
                  <dt className="text-muted-foreground font-medium">{cell.name}</dt>
                  <dd className="font-mono text-xs wrap-break-word rounded-md bg-muted/40 p-3">
                    {cell.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
