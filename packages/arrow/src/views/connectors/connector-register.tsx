import { Note } from '@stately/ui/base/components';
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@stately/ui/base/ui';
import { SquareStack } from 'lucide-react';
import { useState } from 'react';
import { CatalogBadge, ConnectionBadge } from '@/components/badges';
import { useArrowStatelyUi } from '@/context';
import type { ConnectionMetadata } from '@/types/api';

export interface RegisterConnectorsProps {
  connectors: ConnectionMetadata[];
  catalogs: string[];
  register: (connectorId: string) => Promise<ConnectionMetadata | undefined>;
  error?: string;
  isPending?: boolean;
}

export function RegisterConnectors({
  connectors,
  catalogs,
  register,
  error,
  isPending,
}: RegisterConnectorsProps) {
  const { utils } = useArrowStatelyUi();

  const [open, setOpen] = useState(false);

  const registered = connectors.filter(c => c.catalog && catalogs.includes(c.catalog));

  return (
    <div>
      <h2 className="flex items-center gap-2">
        <SquareStack className="h-4 w-4" />
        Registered Catalogs &amp; Connections
      </h2>
      <p>Currently registered catalogs</p>
      <div>
        <DropdownMenu onOpenChange={setOpen} open={open}>
          <DropdownMenuTrigger asChild>
            <Button disabled={isPending} onClick={() => setOpen(!open)} variant="secondary">
              Register...
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {connectors.map(connection => (
              <DropdownMenuCheckboxItem
                checked={registered.some(r => r.id === connection.id)}
                disabled={isPending || registered.some(r => r.id === connection.id)}
                key={connection.id}
                onCheckedChange={checked => (checked ? register(connection.id) : checked)}
              >
                <span className="items-center font-semi-bold text-sm">{connection.name}</span>
                <span className="items-center text-xs text-muted-foreground truncate">
                  &nbsp; · {utils.toSpaceCase(connection.kind || 'memory')}
                </span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="text-sm flex flex-wrap gap-2">
        {error && <Note message={error} mode="error" />}

        {catalogs.map(c => (
          <CatalogBadge catalog={c} key={`catalog-${c}`} />
        ))}

        {/* Registered connections (derived from catalogs) */}
        {registered.map(c => (
          <ConnectionBadge connector={c} key={`connector-${c.id}`} />
        ))}
      </div>
    </div>
  );
}
