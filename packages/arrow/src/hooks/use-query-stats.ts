import { useMemo } from 'react';

export function useQueryStats(result?: QueryExecutionResult | null) {
  return useMemo(() => {
    if (!result) return [];
    return [
      { label: 'Rows', value: result.rowCount.toLocaleString() },
      { label: 'Size', value: formatBytes(result.sizeBytes) },
      { label: 'Duration', value: `${result.elapsedMs.toFixed(1)} ms` },
    ];
  }, [result]);
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return '—';
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
