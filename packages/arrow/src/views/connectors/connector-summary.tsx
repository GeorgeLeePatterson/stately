import { cn, toTitleCase } from '@stately/ui/base';
import {
  Badge,
  Button,
  ButtonGroup,
  ButtonGroupText,
  FieldSet,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  Label,
  ScrollArea,
} from '@stately/ui/base/ui';
import { ChevronRight, ListFilter, Search, X } from 'lucide-react';
import { useCallback, useId, useState } from 'react';
import { AnyIsLoading } from '@/components/any-is-loading';
import { formatBytes, isSearchEnabled } from '@/lib/utils';
import type {
  ConnectionKind,
  ConnectionMetadata,
  ConnectionSearchQuery,
  ListSummary,
  TableSummary,
} from '@/types/api';

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
  kind?: ConnectionKind;
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
      <InputGroup>
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
  connector?: ConnectionMetadata;
  summary?: ListSummary;
  isLoading?: boolean;
  onSearch: (search: ConnectionSearchQuery) => void;
  onSelectItem: (type: ListSummary['type'], name: string) => void;
}

export function ConnectorSummary({
  connector,
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
  const searchEnabled = isSearchEnabled(summary, connector);

  const handleSearch = useCallback(
    (needle?: string) => {
      if (!searchEnabled && needle) return;
      onSearch({ search: needle });
    },
    [searchEnabled, onSearch],
  );

  const handleSelectItem = useCallback(
    (type: ListSummary['type'], name: string) => {
      onSelectItem(type, name);
      setSearch(name);
      handleSearch(name);
    },
    [handleSearch, onSelectItem],
  );

  if (!summary) return <div className="p-2 text-center text-xs text-muted-foreground">Empty</div>;
  if (summary.summary.length === 0)
    return (
      <div className="p-2 text-center text-xs text-muted-foreground">List returned no items.</div>
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
  switch (typeof connector?.metadata.kind === 'string' ? (connector.metadata.kind ?? '') : '') {
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
      {searchEnabled && (
        <ConnectorSummarySearch
          isDisabled={isLoading}
          onSearch={setSearch}
          onSubmit={() => handleSearch(search)}
          placeholder={searchPlaceholder}
          search={search}
        />
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
              onChange={event => setListSearch(event.target.value)}
              placeholder="Filter"
              value={listSearch}
            />
          </InputGroup>
        </ButtonGroup>

        {/* Results */}
        <ScrollArea className="flex-auto h-28 max-h-dvh rounded-lg border">
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
