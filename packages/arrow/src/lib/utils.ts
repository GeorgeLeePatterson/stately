import { devLogger, stripLeading, stripTrailing } from '@statelyjs/ui';
import type { Table } from 'apache-arrow';
import type { ArrowTableDataView } from '@/components/arrow-table';
import type { ConnectionKind, ConnectionMetadata, ListSummary } from '@/types/api';

/**
 * Re-export logger for plugin
 */
export const log = devLogger('@statelyjs/arrow');

/**
 * Converts an Apache Arrow Table to an ArrowTableDataView for rendering.
 */
export function tableToDataView(table: Table): ArrowTableDataView {
  const columns = table.schema.fields.map((field, index) => {
    const vector = table.getChildAt(index);
    const key = field?.name || `column_${index}`;
    return {
      getValue: (rowIndex: number) => {
        if (rowIndex < 0 || rowIndex >= table.numRows) return undefined;
        return vector?.get(rowIndex);
      },
      key,
      name: field?.name || `column_${index}`,
    };
  });

  return { columns, rowCount: table.numRows };
}

/**
 * Simple helper to format the "kind" of a connection for display
 */
export const createConnectionKindDisplay = (connection: ConnectionMetadata) => {
  const { metadata } = connection;
  return (typeof metadata.kind === 'string' ? metadata.kind : metadata.kind.other) ?? 'memory';
};

/**
 * Whether additional "searching" is available based on the Connector and ListSummary type
 */
export const isSearchEnabled = (summary?: ListSummary, connectorKind?: ConnectionKind) => {
  if (!summary) return false;
  if (summary?.type === 'tables' || summary?.type === 'files') return false;
  return !connectorKind || connectorKind === 'database' || connectorKind === 'object_store';
};

/**
 * Given a connector, filters, type, and name, create a valid DB identifier for the item.
 */
export const createConnectionItemIdentifier = ({
  sep,
  catalog,
  database,
  name,
}: {
  catalog?: string;
  database?: string | null;
  name: string;
  sep: string;
}): string => {
  let identifiers = '';
  if (catalog) identifiers = `${identifiers}${stripTrailing(catalog, sep)}${sep}`;
  if (database) identifiers = `${identifiers}${stripTrailing(database, sep)}${sep}`;
  const itemName = identifiers ? stripLeading(name, sep) : name;
  return sanitizeIdentifier(`${identifiers}${itemName}`);
};

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
