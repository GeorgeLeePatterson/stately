import { cn, toTitleCase } from '@stately/ui/base';
import {
  Badge,
  Button,
  ButtonGroup,
  ButtonGroupText,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  Label,
  ScrollArea,
} from '@stately/ui/base/ui';
import { Search } from 'lucide-react';
import { useId, useState } from 'react';
import { formatBytes } from '@/lib/utils';
import type { ListSummary, TableSummary } from '@/types/api';
import { AnyIsLoading } from './any-is-loading';

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

  const formId = useId();

  if (!summary) {
    return <div className="p-2 text-center text-xs text-muted-foreground">Empty</div>;
  }

  if (summary.summary.length === 0) {
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
    <div className="connector-summary flex flex-col h-full px-2 space-y-2">
      {/* Filter */}
      <ButtonGroup className={cn('flex-auto w-full min-w-0')}>
        <ButtonGroupText asChild>
          <Label
            className="text-sm whitespace-nowrap"
            htmlFor={`connector-summary-filter-${formId}`}
          >
            {toTitleCase(summaryType)}
          </Label>
        </ButtonGroupText>
        <InputGroup className="relative">
          <InputGroupAddon>
            <InputGroupText>
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
            </InputGroupText>
          </InputGroupAddon>

          <InputGroupAddon align="inline-end">
            <InputGroupText>
              <AnyIsLoading isLoading={!!isLoading} loaderOnly />
            </InputGroupText>
          </InputGroupAddon>

          <InputGroupInput
            id={`connector-summary-filter-${formId}`}
            onChange={event => setSearch(event.target.value)}
            placeholder="Filter"
            value={search}
          />
        </InputGroup>
      </ButtonGroup>

      {/* Results */}
      <ScrollArea className="flex-auto h-28 rounded-lg border">
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

// TODO: Remove
// <div className="flex items-center justify-between">
//   <span className="shrink-0 flex gap-2 text-xs font-semibold uppercase text-muted-foreground">
//     {isLoading ? (
//     ) : (
//       <span className="w-4">&nbsp;</span>
//     )}
//   </span>
// </div>
