import { Button, ButtonGroup, FieldSet, Input } from '@stately/ui/base/ui';
import { Database, X } from 'lucide-react';
import { useState } from 'react';
import type { ConnectionDetailQuery } from '@/types/api';

export function ConnectorSummaryFilter({
  onFilter,
  isDisabled,
}: {
  onFilter: (filters: ConnectionDetailQuery) => void;
  isDisabled?: boolean;
}) {
  const [listFilters, setListFilters] = useState<ConnectionDetailQuery>();

  return (
    <FieldSet
      className="@container/summaryfilter flex flex-row gap-2 items-center"
      disabled={isDisabled}
    >
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
          <span className="hidden @md/summaryfilter:inline">Submit</span>
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
    </FieldSet>
  );
}
