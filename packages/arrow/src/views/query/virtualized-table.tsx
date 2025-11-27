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
import {
  createColumnHelper,
  type DisplayColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Table as ArrowTable } from 'apache-arrow';
import { MoreHorizontal } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';

const ROW_HEIGHT = 42;
const DATA_COLUMN_MAX_WIDTH = 320;
const CELL_CHAR_LIMIT = 140;

// TODO: Remove or use
interface HeaderMeta {
  cellClassName: string;
  headClassName: string;
  maxWidth: number;
}

export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') return value.toLocaleString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return `[${value.map(formatValue).join(', ')}]`;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function VirtualizedTable({ table }: { table: ArrowTable }) {
  const columns = useMemo(() => {
    return table.schema.fields.map((field, index) => ({
      key: field?.name || `column_${index}`,
      name: field?.name || `column_${index}`,
      vector: table.getChildAt(index),
    }));
  }, [table]);

  const rowIndices = useMemo(() => {
    return Array.from({ length: table.numRows }, (_, index) => index);
  }, [table]);

  const columnHelper = useMemo(() => createColumnHelper<number>(), []);

  const [drawerRowIndex, setDrawerRowIndex] = useState<number | null>(null);

  const rowHasOverflow = useCallback(
    (rowIndex: number) => {
      return columns.some(column => {
        const formattedValue = formatValue(column.vector?.get(rowIndex));
        return formattedValue.length > CELL_CHAR_LIMIT;
      });
    },
    [columns],
  );

  const handleOpenDrawer = useCallback((rowIndex: number) => {
    setDrawerRowIndex(rowIndex);
  }, []);

  const handleDrawerChange = useCallback((open: boolean) => {
    if (!open) {
      setDrawerRowIndex(null);
    }
  }, []);

  const tableColumns = useMemo<DisplayColumnDef<number>[]>(() => {
    const rowNumberColumn = columnHelper.display({
      cell: info => (
        <span className="font-mono text-xs text-muted-foreground">
          {info.row.index.toLocaleString()}
        </span>
      ),

      header: () => 'Row',
      id: '__row__',
      meta: {
        cellClassName: 'w-[80px] max-w-[80px]',
        headClassName: 'w-[80px] max-w-[80px]',
        maxWidth: 80,
      } as const,
      size: 80,
    });

    const arrowValueColumns = columns.map(column =>
      columnHelper.display({
        cell: info => (
          <span className="font-mono text-xs">
            {formatValue(column.vector?.get(info.row.original))}
          </span>
        ),
        header: () => column.name,
        id: column.key,
        meta: {
          cellClassName: 'max-w-[320px] truncate',
          headClassName: 'max-w-[320px]',
          maxWidth: DATA_COLUMN_MAX_WIDTH,
        } as const,
        size: 160,
      }),
    );

    const detailsColumn = columnHelper.display({
      cell: info => (
        <span className="inline-flex justify-end">
          {rowHasOverflow(info.row.original) && (
            <Button
              aria-label="View full row"
              className="h-7 w-7"
              onClick={() => handleOpenDrawer(info.row.original)}
              size="icon"
              variant="ghost"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </span>
      ),
      header: () => '',
      id: '__details__',
      meta: {
        cellClassName: 'w-12 text-right',
        headClassName: 'w-12 text-right',
        maxWidth: 48,
      } as const,
      size: 48,
    });

    return [rowNumberColumn, ...arrowValueColumns, detailsColumn];
  }, [columnHelper, columns, rowHasOverflow, handleOpenDrawer]);

  const parentRef = useRef<HTMLDivElement | null>(null);

  const tableInstance = useReactTable({
    columnResizeMode: 'onChange',
    columns: tableColumns,
    data: rowIndices,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = tableInstance.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => ROW_HEIGHT,
    getScrollElement: () => parentRef.current,
    overscan: 12,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end
      : 0;

  const drawerRowValues = useMemo(() => {
    if (drawerRowIndex === null) return [];
    return columns.map(column => ({
      key: column.key,
      name: column.name,
      value: formatValue(column.vector?.get(drawerRowIndex)),
    }));
  }, [columns, drawerRowIndex]);

  return (
    <>
      <div className="flex h-full min-h-[360px] flex-col overflow-hidden rounded-lg border">
        <div className="border-b bg-muted/50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Results
        </div>
        <div className="flex-1 overflow-auto bg-background" ref={parentRef}>
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
              {tableInstance.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead
                      className={cn(
                        'bg-muted/30 text-[11px] font-semibold uppercase tracking-wide',
                        header.column.columnDef.meta?.headClassName,
                      )}
                      key={header.id}
                      style={{
                        maxWidth: header.column.columnDef?.meta?.maxWidth,
                        width: header.column.columnDef?.meta?.maxWidth,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {paddingTop > 0 && (
                <TableRow>
                  <TableCell
                    className="p-0"
                    colSpan={tableColumns.length}
                    style={{ height: paddingTop }}
                  />
                </TableRow>
              )}
              {virtualRows.map(virtualRow => {
                const row = rows[virtualRow.index];
                return (
                  <TableRow
                    className={cn(virtualRow.index % 2 === 0 ? 'bg-background' : 'bg-muted/20')}
                    data-state={row.getIsSelected() ? 'selected' : undefined}
                    key={row.id}
                    style={{ height: virtualRow.size }}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell
                        className={cn('align-top', cell.column.columnDef.meta?.cellClassName)}
                        key={cell.id}
                        style={{
                          maxWidth: cell.column.columnDef.meta?.maxWidth ?? DATA_COLUMN_MAX_WIDTH,
                          width: cell.column.columnDef.meta?.maxWidth,
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
              {paddingBottom > 0 && (
                <TableRow>
                  <TableCell
                    className="p-0"
                    colSpan={tableColumns.length}
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
