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
import { useCallback, useMemo, useRef, useState } from 'react';

const ROW_HEIGHT = 42;
const DATA_COLUMN_MAX_WIDTH = 320;

export interface ArrowTableColumnDescriptor {
  key: string;
  name: string;
  maxWidth?: number;
  getValue(rowIndex: number): unknown | undefined;
}

export interface ArrowTableDataView {
  columns: readonly ArrowTableColumnDescriptor[];
  rowCount: number;
}

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
  rowHeight = ROW_HEIGHT,
  overscan = 12,
  emptyState = 'No results to display.',
  ...rest
}: ArrowTableProps & React.HTMLAttributes<HTMLDivElement>) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [drawerRowIndex, setDrawerRowIndex] = useState<number | null>(null);

  const virtualizer = useVirtualizer({
    count: data.rowCount,
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

  const handleDrawerChange = useCallback((open: boolean) => {
    if (!open) setDrawerRowIndex(null);
  }, []);

  const drawerRowValues = useMemo(() => {
    if (drawerRowIndex === null) return [];
    return data.columns.map(column => ({
      key: column.key,
      name: column.name,
      value: formatValue(column.getValue(drawerRowIndex)),
    }));
  }, [data.columns, drawerRowIndex]);

  const containerClasses = 'flex flex-col max-h-[100dvh] overflow-hidden rounded-lg border';

  if (data.rowCount === 0) {
    return (
      <div
        {...rest}
        className={cn(
          'min-h-[240px] items-center justify-center',
          containerClasses,
          rest?.className,
        )}
      >
        <p className="text-sm text-muted-foreground">{emptyState}</p>
      </div>
    );
  }

  return (
    <>
      <div {...rest} className={cn('h-full min-h-[360px]', containerClasses, rest?.className)}>
        <div className="arrow-table flex-1 overflow-auto bg-background" ref={parentRef}>
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow>
                <TableHead className="w-[80px] max-w-[80px] bg-muted text-[11px] font-semibold uppercase tracking-wide sticky left-0 z-20">
                  Row
                </TableHead>
                {data.columns.map(column => (
                  <TableHead
                    className="bg-muted/30 text-[11px] font-semibold uppercase tracking-wide truncate"
                    key={column.key}
                    style={{ maxWidth: column.maxWidth ?? DATA_COLUMN_MAX_WIDTH }}
                  >
                    {column.name}
                  </TableHead>
                ))}
                <TableHead className="w-12 bg-muted/30 sticky right-0" />
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

                const rowCells = data.columns.map(column => {
                  const rawValue = column.getValue(rowIndex);
                  const formatted = formatValue(rawValue);
                  return { column, formatted };
                });

                return (
                  <TableRow
                    className={cn(
                      'group/row',
                      rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                    )}
                    key={rowIndex}
                    style={{ height: virtualRow.size }}
                  >
                    {/* Row index */}
                    <TableCell
                      className={cn(
                        'w-[80px] max-w-[80px] align-top sticky left-0',
                        rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted',
                      )}
                    >
                      <span className="font-mono text-xs text-muted-foreground">
                        {rowIndex.toLocaleString()}
                      </span>
                    </TableCell>

                    {rowCells.map(cell => (
                      <TableCell
                        className="align-top font-mono text-xs overflow-hidden"
                        key={`${rowIndex}-${cell.column.key}`}
                        style={{ maxWidth: cell.column.maxWidth ?? DATA_COLUMN_MAX_WIDTH }}
                      >
                        <span className="block truncate">{cell.formatted}</span>
                      </TableCell>
                    ))}

                    {/* Drawer button */}
                    <TableCell
                      className={cn(
                        'w-12 text-right align-top sticky right-0',
                        rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted',
                      )}
                    >
                      <Button
                        aria-label="View full row"
                        className="h-7 w-7 opacity-0 group-hover/row:opacity-100 focus:opacity-100 transition-opacity"
                        onClick={() => setDrawerRowIndex(rowIndex)}
                        size="icon"
                        variant="ghost"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
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
