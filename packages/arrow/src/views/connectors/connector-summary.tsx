import { toTitleCase } from '@stately/ui/base';
import {
  Badge,
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  ScrollArea,
} from '@stately/ui/base/ui';
import { Activity, Search } from 'lucide-react';
import { useState } from 'react';
import { formatBytes } from '@/lib/utils';
import type { ListSummary, TableSummary } from '@/types/api';

const normalizeSummaryItem = (item: string | TableSummary) => ({
  name: typeof item === 'string' ? item : item.name,
  rows: typeof item === 'string' ? undefined : (item.rows ?? undefined),
  size_bytes: typeof item === 'string' ? undefined : (item.size_bytes ?? undefined),
});

export function ConnectorSummary({
  summary,
  isLoading,
  onSelectItem,
}: {
  summary?: ListSummary;
  isLoading?: boolean;
  onSelectItem: (type: ListSummary['type'], item: string) => void;
}) {
  const [search, setSearch] = useState('');

  if (!summary || summary.summary.length === 0) {
    return (
      <div className="p-2 text-center text-xs text-muted-foreground">List returned no items.</div>
    );
  }

  const { type: summaryType, summary: summaryItems } = summary;

  const filteredItems = summaryItems
    .filter(
      item =>
        !search ||
        (typeof item === 'string' ? item : item.name).toLowerCase().includes(search.toLowerCase()),
    )
    .map(normalizeSummaryItem);

  return (
    <div className="flex flex-col px-2 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="shrink-0 flex gap-2 text-xs font-semibold uppercase text-muted-foreground">
          {toTitleCase(summaryType)}
          {isLoading ? (
            <span className="inline-flex items-center gap-1 text-xs text-foreground">
              <Activity className="h-3 w-3 animate-spin" />
            </span>
          ) : (
            <span className="w-4">&nbsp;</span>
          )}
        </span>
      </div>

      {/* Filter */}
      <InputGroup className="relative">
        <InputGroupAddon>
          <InputGroupText>
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
          </InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          onChange={event => setSearch(event.target.value)}
          placeholder="Filter"
          value={search}
        />
      </InputGroup>

      {/* Results */}
      <ScrollArea className="h-28 rounded-lg border">
        {filteredItems.length === 0 ? (
          <div className="p-2 text-center text-xs text-muted-foreground">No items found</div>
        ) : (
          <div className="divide-y">
            {filteredItems?.map(({ name, rows, size_bytes }) => (
              <Button
                className="w-full text-left px-4 py-3 cursor-pointer rounded-none"
                key={`filter-items-${name}`}
                onClick={() => onSelectItem(summaryType, name)}
                type="button"
                variant="ghost"
              >
                <div className="flex-1 flex items-center justify-between text-xs font-medium text-left">
                  <span className="flex-auto truncate">{name}</span>
                  {rows && (
                    <Badge className="text-[10px] font-normal" variant="outline">
                      {rows?.toLocaleString() ?? '–'} rows
                    </Badge>
                  )}
                  {size_bytes && (
                    <div className="text-[11px] text-muted-foreground">
                      {formatBytes(size_bytes ?? 0)}
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
