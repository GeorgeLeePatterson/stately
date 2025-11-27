import {
  Button,
  ButtonGroup,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Input,
  Item,
  ItemActions,
  ItemContent,
} from '@stately/ui/base/ui';
import { ChevronDown, ChevronRight, Database, Funnel, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ConnectionDetailQuery } from '@/types/api';

export function ConnectorSummaryFilter({
  onFilter,
  children,
}: React.PropsWithChildren<{ onFilter: (filters: ConnectionDetailQuery) => void }>) {
  const [listFilters, setListFilters] = useState<ConnectionDetailQuery>();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const listFiltersDisplay = useMemo(() => {
    if (!listFilters) return null;
    const display = [];
    if (listFilters.catalog) display.push(listFilters.catalog);
    if (listFilters.database) display.push(listFilters.database);
    if (listFilters.schema) display.push(listFilters.schema);
    return <span className="text-xs text-muted-foreground italic">({display.join('.')}</span>;
  }, [listFilters]);

  return (
    <Collapsible onOpenChange={setFiltersOpen} open={filtersOpen}>
      {/* Header */}
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
              Summary &amp; Filter
              {listFiltersDisplay}
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

      {/* Details */}
      <CollapsibleContent>
        <div className="space-y-3 py-2 px-3 border-muted border rounded-md">
          <div className="flex gap-2 items-center @container">
            {/* Database filter */}
            <Input
              aria-label="Database"
              onChange={event => setListFilters(f => ({ ...f, database: event.target.value }))}
              placeholder="Database"
              value={listFilters?.database || ''}
            />

            {/* Schema filter */}
            <Input
              aria-label="Schema"
              onChange={event => setListFilters(f => ({ ...f, schema: event.target.value }))}
              placeholder="Schema"
              value={listFilters?.schema || ''}
            />

            {/* Submit/Cancel */}
            <ButtonGroup>
              <Button
                className="cursor-pointer"
                disabled={!listFilters || !(listFilters.database || listFilters.schema)}
                onClick={() => {
                  if (!listFilters) return;
                  onFilter(listFilters);
                }}
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
                onClick={() => setListFilters(undefined)}
                size="icon-sm"
                type="button"
                variant="outline"
              >
                <X />
              </Button>
            </ButtonGroup>
          </div>

          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
