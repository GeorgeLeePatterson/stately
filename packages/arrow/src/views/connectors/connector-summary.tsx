import { cn, toTitleCase } from '@statelyjs/ui';
import { Badge } from '@statelyjs/ui/components/base/badge';
import { Button } from '@statelyjs/ui/components/base/button';
import { ButtonGroup, ButtonGroupText } from '@statelyjs/ui/components/base/button-group';
import { FieldSet } from '@statelyjs/ui/components/base/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@statelyjs/ui/components/base/input-group';
import { Label } from '@statelyjs/ui/components/base/label';
import { ScrollArea } from '@statelyjs/ui/components/base/scroll-area';
import { ChevronRight, ListFilter, Search, X } from 'lucide-react';
import { useCallback, useId, useState } from 'react';
import { AnyIsLoading } from '@/components/any-is-loading';
import { formatBytes, isSearchEnabled } from '@/lib/utils';
import type { ConnectionKind, ConnectionSearchQuery, ListSummary, TableSummary } from '@/types/api';

const normalizeSummaryItem = (item: string | TableSummary) => ({
  name: typeof item === 'string' ? item : item.name,
  rows: typeof item === 'string' ? undefined : (item.rows ?? undefined),
  size_bytes: typeof item === 'string' ? undefined : (item.size_bytes ?? undefined),
});

const ConnectorItemRow = ({ item: { name, rows, size_bytes } }: { item: TableSummary }) => (
  <div className="flex-1 flex items-center justify-between text-xs font-medium text-left">
    <span className="flex-auto truncate">{name}</span>
    {rows && (
      <Badge className="text-[10px] font-normal" variant="outline">
        {rows?.toLocaleString() ?? '–'} rows
      </Badge>
    )}
    {size_bytes && (
      <div className="text-[11px] text-muted-foreground">{formatBytes(size_bytes ?? 0)}</div>
    )}
    <ChevronRight className="h-3.5 w-3.5" />
  </div>
);

// TODO (Ext): Allow plugin extension
export interface ConnectorSummarySearchProps {
  placeholder?: string;
  search?: string;
  onSearch: (search?: string) => void;
  onSubmit: () => void;
  isDisabled?: boolean;
}

export function ConnectorSummarySearch({
  placeholder,
  search,
  onSearch,
  onSubmit,
  isDisabled,
}: ConnectorSummarySearchProps) {
  return (
    <FieldSet
      className="@container/summaryfilter flex flex-row items-center gap-2"
      disabled={isDisabled}
    >
      <InputGroup className="bg-background">
        {/* Database or Path filter */}
        <InputGroupInput
          aria-label="Database"
          onChange={event => onSearch(event.target.value)}
          placeholder={placeholder ?? 'Search'}
          value={search || ''}
        />
        <InputGroupAddon align="inline-end">
          {/* Clear */}
          <Button
            className={cn('cursor-pointer', (isDisabled || !search) && 'hidden')}
            disabled={!search}
            onClick={() => onSearch(undefined)}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <X />
          </Button>
        </InputGroupAddon>
      </InputGroup>

      <Button
        className="cursor-pointer rounded-full"
        disabled={!search}
        onClick={onSubmit}
        size="icon-sm"
        type="button"
        variant="outline"
      >
        <ListFilter className="w-3.5 h-3.5" />
      </Button>
    </FieldSet>
  );
}

// TODO (Ext): Allow plugin extension
export interface ConnectorSummaryProps {
  connectorKind: ConnectionKind;
  summary?: ListSummary;
  isLoading?: boolean;
  onSearch: (search: ConnectionSearchQuery) => void;
  onSelectItem: (type: ListSummary['type'], name: string) => void;
}

export function ConnectorSummary({
  connectorKind,
  summary,
  isLoading,
  onSearch,
  onSelectItem,
  ...rest
}: ConnectorSummaryProps & React.HTMLAttributes<HTMLDivElement>) {
  const [search, setSearch] = useState<string>();
  const [listSearch, setListSearch] = useState('');

  const formId = useId();

  // TODO (Ext): Allow plugin extension
  const searchEnabled = isSearchEnabled(summary, connectorKind);

  const handleSearch = useCallback(
    (needle?: string) => {
      if (!searchEnabled && needle) return;
      setSearch(needle);
      onSearch({ search: needle });
    },
    [searchEnabled, onSearch],
  );

  const handleSelectItem = useCallback(
    (type: ListSummary['type'], name: string) => {
      onSelectItem(type, name);
      handleSearch(name);
    },
    [handleSearch, onSelectItem],
  );

  if (!summary)
    return (
      <div
        {...rest}
        className={cn(['h-full p-2 text-center text-xs text-muted-foreground', rest?.className])}
      >
        Empty
      </div>
    );

  if (summary.summary.length === 0)
    return (
      <div
        {...rest}
        className={cn(['p-2 text-center text-xs text-muted-foreground', rest?.className])}
      >
        List returned no items.
      </div>
    );

  const filteredItems = summary.summary
    .filter(
      item =>
        !listSearch ||
        (typeof item === 'string' ? item : item.name)
          .toLowerCase()
          .includes(listSearch.toLowerCase()),
    )
    .map(normalizeSummaryItem);

  let searchPlaceholder = 'Search';
  switch (typeof connectorKind === 'string' ? (connectorKind ?? '') : '') {
    case 'database':
      searchPlaceholder = 'Search Databases';
      break;
    case 'object_store':
      searchPlaceholder = 'Search in Path';
      break;
    default:
  }

  return (
    <div
      {...rest}
      className={cn(['h-full max-h-full space-y-2', 'flex flex-col', rest?.className])}
    >
      {searchEnabled ? (
        <ConnectorSummarySearch
          isDisabled={isLoading || !searchEnabled}
          onSearch={setSearch}
          onSubmit={() => handleSearch(search)}
          placeholder={searchPlaceholder}
          search={search}
        />
      ) : (
        <div className="flex-auto flex gap-2 h-9 items-center px-4 overflow-hidden">
          <span className="flex-auto truncate">Search: {search || ''}</span>
          <Button
            className="cursor-pointer"
            disabled={!search}
            onClick={() => handleSearch(undefined)}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <div className="connector-summary flex flex-col h-full space-y-2">
        {/* Simple list search */}
        <ButtonGroup className={cn('flex-auto w-full min-w-0')}>
          <ButtonGroupText asChild>
            <Label
              className="text-sm whitespace-nowrap"
              htmlFor={`connector-summary-filter-${formId}`}
            >
              {toTitleCase(summary.type)}
            </Label>
          </ButtonGroupText>

          {/* List search input */}
          <InputGroup className="relative bg-background">
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
              onChange={event => setListSearch(event.target.value)}
              placeholder="Filter"
              value={listSearch}
            />
          </InputGroup>
        </ButtonGroup>

        {/* Results */}
        <ScrollArea className="flex-auto min-h-8 max-h-dvh rounded-lg border">
          {filteredItems.length === 0 ? (
            <div className="p-2 text-center text-xs text-muted-foreground">No items found</div>
          ) : (
            <div className="divide-y">
              {filteredItems?.map(item => (
                <Button
                  className={cn('w-full text-left px-4 py-3 cursor-pointer rounded-none')}
                  key={`filter-items-${item.name}`}
                  onClick={() => handleSelectItem(summary.type, item.name)}
                  type="button"
                  variant="ghost"
                >
                  <ConnectorItemRow item={item} />
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
