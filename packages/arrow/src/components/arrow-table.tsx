import { cn } from '@statelyjs/ui/base/lib/utils';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@statelyjs/ui/base/ui';
import {
  type ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { MoreHorizontal, ScanSearch } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { TableRowDrawer } from './table-row-drawer';
import { TableViewOptions } from './table-view-options';

const ROW_HEIGHT = 42;
const DATA_COLUMN_MAX_WIDTH = 320;
const OVERSCAN = 12;

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
  emptyState?: React.ReactNode;
}

export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') return value.toLocaleString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return `[${value.map(formatValue).join(', ')}]`;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/** Row type for react-table - just the row index since we fetch values dynamically */
interface ArrowRowData {
  _rowIndex: number;
}

export function ArrowTable({
  data,
  rowHeight = ROW_HEIGHT,
  overscan = OVERSCAN,
  emptyState = 'No results to display.',
  ...rest
}: ArrowTableProps & React.HTMLAttributes<HTMLDivElement>) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [drawerRowIndex, setDrawerRowIndex] = useState<number | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Create row data - just indices since we use getValue() for actual data
  const rowData = useMemo<ArrowRowData[]>(
    () => Array.from({ length: data.rowCount }, (_, i) => ({ _rowIndex: i })),
    [data.rowCount],
  );

  // Build react-table column definitions from ArrowTableColumnDescriptor
  const columns = useMemo<ColumnDef<ArrowRowData, unknown>[]>(() => {
    const columnHelper = createColumnHelper<ArrowRowData>();

    return data.columns.map(col =>
      columnHelper.accessor(row => col.getValue(row._rowIndex), {
        cell: info => formatValue(info.getValue()),
        header: col.name,
        id: col.key,
        meta: { maxWidth: col.maxWidth },
      }),
    );
  }, [data.columns]);

  const table = useReactTable({
    columns,
    data: rowData,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: { columnVisibility },
  });

  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows.length,
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

  // For drawer, show ALL columns (including hidden) so user can see full row
  const drawerTitle = `Row ${drawerRowIndex !== null ? (drawerRowIndex + 1).toLocaleString() : ''}`;
  const drawerDescription = 'Full values';
  const drawerRowValues = useMemo(() => {
    if (drawerRowIndex === null) return [];
    return data.columns.map(column => ({
      key: column.key,
      name: column.name,
      value: formatValue(column.getValue(drawerRowIndex)),
    }));
  }, [data.columns, drawerRowIndex]);

  const visibleColumns = table.getVisibleLeafColumns();
  const totalColumnCount = visibleColumns.length + 2; // +2 for row index and actions columns

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
        {typeof emptyState === 'string' ? (
          <p className="text-sm text-muted-foreground">{emptyState}</p>
        ) : (
          emptyState
        )}
      </div>
    );
  }

  return (
    <>
      <div {...rest} className={cn('h-full min-h-[360px]', containerClasses, rest?.className)}>
        {/* Table options */}
        {data.columns.length > 0 && (
          <div className="w-full px-3 py-2 flex items-center justify-end border-b">
            <TableViewOptions table={table} />
          </div>
        )}

        {/* Data table */}
        <div
          className="arrow-table max-h-dvh flex-1 overflow-auto bg-background **:data-[slot=table-container]:overflow-visible"
          ref={parentRef}
        >
          <Table>
            {/* Header */}
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow className="sticky top-0 z-20" key={headerGroup.id}>
                  {/* Row index column */}
                  <TableHead
                    className={cn(
                      'w-[80px] max-w-[80px]',
                      'bg-muted',
                      'text-[11px] font-semibold uppercase tracking-wide',
                      'sticky top-0 left-0 z-30',
                    )}
                  >
                    Row
                  </TableHead>

                  {/* Data columns */}
                  {headerGroup.headers.map(header => {
                    const maxWidth =
                      (header.column.columnDef.meta as { maxWidth?: number })?.maxWidth ??
                      DATA_COLUMN_MAX_WIDTH;

                    return (
                      <TableHead
                        className={cn(
                          'bg-muted',
                          'text-[11px] font-semibold uppercase tracking-wide truncate',
                        )}
                        key={header.id}
                        style={{ maxWidth }}
                        title={
                          typeof header.column.columnDef.header === 'string'
                            ? header.column.columnDef.header
                            : header.id
                        }
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}

                  {/* View more column */}
                  <TableHead className={cn('w-12 bg-muted', 'top-0 right-0 sticky z-30')}>
                    <span className="flex justify-center">
                      <ScanSearch className="h-4 w-4" />
                    </span>
                  </TableHead>
                </TableRow>
              ))}
            </TableHeader>

            {/* Body */}
            <TableBody>
              {paddingTop > 0 && (
                <TableRow>
                  <TableCell
                    className="p-0"
                    colSpan={totalColumnCount}
                    style={{ height: paddingTop }}
                  />
                </TableRow>
              )}

              {/* Data rows */}
              {virtualRows.map(virtualRow => {
                const row = rows[virtualRow.index];
                const rowIndex = row.original._rowIndex;

                return (
                  <TableRow
                    className={cn(
                      'group/row',
                      rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                    )}
                    key={row.id}
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

                    {/* Row data */}
                    {row.getVisibleCells().map(cell => {
                      const maxWidth =
                        (cell.column.columnDef.meta as { maxWidth?: number })?.maxWidth ??
                        DATA_COLUMN_MAX_WIDTH;

                      return (
                        <TableCell
                          className="align-top font-mono text-xs overflow-hidden"
                          key={cell.id}
                          style={{ maxWidth }}
                        >
                          <span className="block truncate">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </span>
                        </TableCell>
                      );
                    })}

                    {/* Drawer button */}
                    <TableCell
                      className={cn(
                        'w-12 text-right align-top sticky right-0',
                        rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted',
                      )}
                    >
                      <Button
                        aria-label="View full row"
                        className="h-7 w-7 opacity-100 sm:opacity-0 group-hover/row:opacity-100 focus:opacity-100 transition-opacity"
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
                    colSpan={totalColumnCount}
                    style={{ height: paddingBottom }}
                  />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Row details drawer */}
      <TableRowDrawer
        description={drawerDescription}
        onOpen={handleDrawerChange}
        open={drawerRowIndex !== null}
        title={drawerTitle}
        values={drawerRowValues}
      />
    </>
  );
}
