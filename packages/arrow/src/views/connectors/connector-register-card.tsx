import { Note } from '@stately/ui/base/components';
import { cn, messageFromError } from '@stately/ui/base/lib/utils';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Spinner,
} from '@stately/ui/base/ui';
import { PlugZap, SquareStack } from 'lucide-react';
import type React from 'react';
import { Fragment, useState } from 'react';
import { useArrowStatelyUi } from '@/context';
import { useListCatalogs } from '@/hooks/use-list-catalog';
import { useRegisterConnection } from '@/hooks/use-register-connection';
import type { ConnectionMetadata } from '@/types/api';

export interface ConnectorsRegisterCardProps {
  currentConnector?: ConnectionMetadata;
  connectors: ConnectionMetadata[];
  onClickConnector?: (id: string) => void;
}

export function ConnectorsRegisterCard({
  currentConnector,
  connectors,
  onClickConnector,
  ...rest
}: ConnectorsRegisterCardProps & React.HTMLAttributes<HTMLDivElement>) {
  const { utils } = useArrowStatelyUi();

  const [open, setOpen] = useState(false);

  // Catalogs
  const catalogsQuery = useListCatalogs(currentConnector?.catalog ?? undefined);

  const catalogs = catalogsQuery.data ?? [];
  const registered = connectors.filter(c => c.catalog && catalogs.includes(c.catalog));

  const isObjectStoreRegistered = registered.some(r => r.kind === 'object_store');

  // Registering
  const registerMutation = useRegisterConnection();
  const registerError = registerMutation.error
    ? messageFromError(registerMutation.error) || 'Failed to register connection.'
    : undefined;

  const isAnyLoading = catalogsQuery.isFetching || registerMutation.isPending;

  const registerButton = (
    <DropdownMenuTrigger asChild>
      <Button
        className={cn('text-xs')}
        disabled={registerMutation.isPending}
        onClick={() => setOpen(!open)}
        size="sm"
        variant="secondary"
      >
        {isAnyLoading ? <Spinner /> : <PlugZap />}
        <span className="hidden md:inline">{isAnyLoading ? 'Registering' : 'Register'}</span>
      </Button>
    </DropdownMenuTrigger>
  );

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <Card {...rest} className={cn('connectors-register-card', 'gap-4', rest?.className)}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <SquareStack className="h-4 w-4" />
              Registered Catalogs
            </div>
            {registerButton}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Catalog and connector badges */}
          <div className="text-sm flex flex-wrap gap-2">
            {registerError && <Note message={registerError} mode="error" />}

            {catalogs.map(c => (
              <Badge key={`catalog-${c}`} variant="outline">
                {c}
              </Badge>
            ))}

            {/* Registered connections (derived from catalogs) */}
            {registered.map(c => (
              <Fragment key={`connector-${c.id}`}>
                {c.kind === 'object_store' ? (
                  <Badge variant="secondary">object store</Badge>
                ) : (
                  <Badge asChild variant="default">
                    <a href={`#${c.id}`} onClick={() => onClickConnector?.(c.id)}>
                      {c.id}
                    </a>
                  </Badge>
                )}
              </Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Register connector menu content */}
      <DropdownMenuContent>
        {connectors.map(connection => (
          <DropdownMenuCheckboxItem
            checked={
              registered.some(r => r.id === connection.id) ||
              (isObjectStoreRegistered && connection.kind === 'object-store')
            }
            disabled={registerMutation.isPending || registered.some(r => r.id === connection.id)}
            key={connection.id}
            onCheckedChange={checked =>
              checked ? registerMutation.mutate(connection.id) : checked
            }
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
}
