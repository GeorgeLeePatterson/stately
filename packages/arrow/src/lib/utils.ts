import type { Table } from 'apache-arrow';
import type { ArrowTableDataView } from '@/components/arrow-table';

/**
 * Converts an Apache Arrow Table to an ArrowTableDataView for rendering.
 */
export function tableToDataView(table: Table): ArrowTableDataView {
  const columns = table.schema.fields.map((field, index) => {
    const vector = table.getChildAt(index);
    const key = field?.name || `column_${index}`;
    return {
      key,
      name: field?.name || `column_${index}`,
      getValue: (rowIndex: number) => {
        if (rowIndex < 0 || rowIndex >= table.numRows) return undefined;
        return vector?.get(rowIndex);
      },
    };
  });

  return {
    columns,
    rowCount: table.numRows,
  };
}

export function sanitizeIdentifier(name: string) {
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    return `'${name}'`;
  }
  return name.includes('"')
    ? `"${name.replace(/"/g, '""')}"`
    : name.includes('://')
      ? `'${name}'`
      : name;
}

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return '—';
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}
