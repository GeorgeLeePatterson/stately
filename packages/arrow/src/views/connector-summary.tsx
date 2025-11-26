import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  ButtonGroup,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  Item,
  ItemActions,
  ItemContent,
  ScrollArea,
  Separator,
} from '@stately/ui/base/ui';
import { Activity, ChevronDown, ChevronRight, Database, Funnel, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useArrowStatelyUi } from '@/context';
import { formatBytes, messageFromError } from '@/lib/utils';
import type { ConnectionDetailQuery, ListSummary } from '@/types/api';

export interface ConnectorSummaryProps {
  listSummary: ListSummary;
  isLoading?: boolean;
  error?: Error | null;
  onSelectItem: (type: ListSummary['type'], item: string) => void;
  onFilter: (filter?: ConnectionDetailQuery) => void;
}

export function ConnectorSummary({
  listSummary,
  isLoading,
  error,
  onSelectItem,
  onFilter,
}: ConnectorSummaryProps) {
  const { utils } = useArrowStatelyUi();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [listFilters, setListFilters] = useState<ConnectionDetailQuery>();
  const [search, setSearch] = useState('');

  const summaryType = listSummary.type;
  const filteredItems = useMemo(() => {
    if (!search) return listSummary.summary || [];
    const needle = search.toLowerCase();
    return listSummary.summary.filter(item =>
      (typeof item === 'string' ? item : item.name).toLowerCase().includes(needle),
    );
  }, [listSummary.summary, search]);

  const listFiltersDisplay = useMemo(() => {
    if (!listFilters) return null;
    const display = [];
    if (listFilters.catalog) display.push(listFilters.catalog);
    if (listFilters.database) display.push(listFilters.database);
    if (listFilters.schema) display.push(listFilters.schema);
    return display.join('.');
  }, [listFilters]);

  return (
    <Collapsible onOpenChange={setFiltersOpen} open={filtersOpen}>
      <CollapsibleTrigger asChild>
        <Item
          className="cursor-pointer py-1"
          onClick={() => setFiltersOpen(!filtersOpen)}
          size="sm"
          variant="muted"
        >
          <ItemContent>
            <span className="flex items-center gap-2 font-semibold">
              <Funnel className="h-3 w-3" />
              Filter
              {listFiltersDisplay ? (
                <span className="text-xs text-muted-foreground italic">({listFiltersDisplay})</span>
              ) : null}
            </span>
          </ItemContent>

          <ItemActions>
            <Button size="sm" type="button" variant="ghost">
              {filtersOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </ItemActions>
        </Item>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-3 py-2 px-3 border-muted border rounded-md">
          <div className="flex gap-2 items-center @container">
            <Input
              aria-label="Database"
              onChange={event =>
                setListFilters(
                  (f): ConnectionDetailQuery => ({ ...f, database: event.target.value }),
                )
              }
              placeholder="Database"
              value={listFilters?.database || ''}
            />
            <Input
              aria-label="Schema"
              onChange={event =>
                setListFilters((f): ConnectionDetailQuery => ({ ...f, schema: event.target.value }))
              }
              placeholder="Schema"
              value={listFilters?.schema || ''}
            />

            {/* Submit/Cancel */}
            <ButtonGroup>
              <Button
                className="cursor-pointer"
                disabled={!listFilters || !(listFilters.database || listFilters.schema)}
                onClick={() => onFilter(listFilters)}
                size="sm"
                type="button"
                variant="outline"
              >
                <Database />
                <span className="hidden @md:inline">Submit</span>
              </Button>
              <Button
                className="cursor-pointer"
                disabled={!listFilters || !(listFilters.database || listFilters.schema)}
                onClick={() => {
                  setListFilters(undefined);
                  onFilter(undefined);
                }}
                size="icon-sm"
                type="button"
                variant="outline"
              >
                <X />
              </Button>
            </ButtonGroup>
          </div>

          <Separator />

          {filteredItems.length === 0 ? (
            <div className="p-2 text-center text-xs text-muted-foreground">No items found.</div>
          ) : (
            <>
              <div className="space-y-1">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {messageFromError(error) || 'Failed to list items for this connector.'}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Table Filter & Select */}
                <div className="flex flex-col px-2 space-y-2">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <span className="shrink-0 flex gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      {utils.toTitleCase(summaryType)}
                      {isLoading ? (
                        <span className="inline-flex items-center gap-1 text-xs text-foreground">
                          <Activity className="h-3 w-3 animate-spin" />
                        </span>
                      ) : (
                        <span className="w-4">&nbsp;</span>
                      )}
                    </span>

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
                  </div>

                  {/* Item list */}
                  <ScrollArea className="h-28 rounded-lg border">
                    <div className="divide-y">
                      {filteredItems.map(table => {
                        const name = typeof table === 'string' ? table : table.name;
                        const rows = typeof table === 'string' ? undefined : table.rows;
                        const size = typeof table === 'string' ? undefined : table.size_bytes;
                        return (
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
                              {size && (
                                <div className="text-[11px] text-muted-foreground">
                                  {formatBytes(size ?? 0)}
                                </div>
                              )}
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
