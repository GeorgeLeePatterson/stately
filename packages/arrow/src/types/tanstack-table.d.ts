import type { RowData } from '@tanstack/table-core';

declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends RowData, TValue> {
    cellClassName?: string;
    headClassName?: string;
    maxWidth?: number;
  }
}

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    cellClassName?: string;
    headClassName?: string;
    maxWidth?: number;
  }
}
