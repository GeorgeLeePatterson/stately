import { Note } from '@stately/ui/base/components';
import { cn } from '@stately/ui/base/lib/utils';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Spinner,
} from '@stately/ui/base/ui';
import { PlugZap, SquareStack } from 'lucide-react';
import { useCallback, useState } from 'react';
import { CatalogBadge, ConnectionBadge } from '@/components/badges';
import { useArrowStatelyUi } from '@/context';
import { useListCatalogs } from '@/hooks/use-list-catalog';
import { useRegisterConnection } from '@/hooks/use-register-connection';
import { messageFromError } from '@/lib/utils';
import type { ConnectionMetadata } from '@/types/api';

export interface ConnectorsRegisterCardProps {
  currentConnector?: ConnectionMetadata;
  connectors: ConnectionMetadata[];
}

export function ConnectorsRegisterCard({
  currentConnector,
  connectors,
  ...rest
}: ConnectorsRegisterCardProps & React.HTMLAttributes<HTMLDivElement>) {
  const { utils } = useArrowStatelyUi();

  const [open, setOpen] = useState(false);
  const [registering, setRegistering] = useState(false);

  const registerMutation = useRegisterConnection();
  const catalogsQuery = useListCatalogs(currentConnector?.catalog ?? undefined);

  const catalogs = catalogsQuery.data ?? [];
  const registered = connectors.filter(c => c.catalog && catalogs.includes(c.catalog));

  const registerError = registerMutation.error
    ? messageFromError(registerMutation.error) || 'Failed to register connection.'
    : undefined;

  const handleRegister = useCallback(
    (id: string) => {
      setRegistering(true);
      registerMutation.mutate(id, { onSettled: () => setRegistering(false) });
    },
    [registerMutation],
  );

  const registerButton = (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger asChild>
        <Button
          className="text-xs"
          disabled={registerMutation.isPending}
          onClick={() => setOpen(!open)}
          size="sm"
          variant="secondary"
        >
          {registering ? (
            <>
              <Spinner />
              Registering...
            </>
          ) : (
            <>
              <PlugZap />
              Register...
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {connectors.map(connection => (
          <DropdownMenuCheckboxItem
            checked={registered.some(r => r.id === connection.id)}
            disabled={registerMutation.isPending || registered.some(r => r.id === connection.id)}
            key={connection.id}
            onCheckedChange={checked => (checked ? handleRegister(connection.id) : checked)}
          >
            <span className="items-center font-semi-bold text-sm">{connection.name}</span>
            <span className="items-center text-xs text-muted-foreground truncate">
              &nbsp; · {utils.toSpaceCase(connection.kind || 'memory')}
            </span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <Card {...rest} className={cn(['connectors-register-card gap-4', rest?.className])}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <SquareStack className="h-4 w-4" />
            Registered
          </div>
          {registerButton}
        </CardTitle>
        <CardDescription>Currently registered catalogs</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Catalog and connector badges */}
        <div className="text-sm flex flex-wrap gap-2">
          {registerError && <Note message={registerError} mode="error" />}

          {catalogs.map(c => (
            <CatalogBadge catalog={c} key={`catalog-${c}`} />
          ))}

          {/* Registered connections (derived from catalogs) */}
          {registered.map(c => (
            <ConnectionBadge connector={c} key={`connector-${c.id}`} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
