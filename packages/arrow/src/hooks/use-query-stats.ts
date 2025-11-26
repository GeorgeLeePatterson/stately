import { useMemo } from 'react';
import type { ArrowViewState } from '@/lib/arrow-view';
import { formatBytes } from '@/lib/utils';

/**
 * Format query statistics for display.
 *
 * @param state - ArrowViewState from a streaming query (or null)
 * @returns Array of label/value pairs for display
 */
export function useQueryStats(state?: ArrowViewState | null) {
  return useMemo(() => {
    if (!state?.table) return [];
    return [
      { label: 'Rows', value: state.table.numRows.toLocaleString() },
      { label: 'Size', value: formatBytes(state.metrics.bytesReceived) },
      { label: 'Duration', value: `${state.metrics.elapsedMs.toFixed(1)} ms` },
    ];
  }, [state]);
}
