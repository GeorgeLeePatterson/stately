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
import { useState } from 'react';
import { useListCatalogs } from '@/hooks/use-list-catalog';
import { useRegisterConnection } from '@/hooks/use-register-connection';
import type { ConnectionMetadata } from '@/types/api';
import { ConnectionItem } from './connection-item';

export interface ConnectorsRegisterCardProps {
  catalogKey?: string;
  currentConnector?: ConnectionMetadata;
  connectors: ConnectionMetadata[];
  onClickConnector?: (id: string) => void;
}

export function ConnectorsRegisterCard({
  catalogKey,
  currentConnector,
  connectors,
  onClickConnector,
  ...rest
}: ConnectorsRegisterCardProps & React.HTMLAttributes<HTMLDivElement>) {
  const [open, setOpen] = useState(false);

  // TODO: Remove - finish this logic
  // const [objectStoreRegistered, setObjectStoreRegistered] = useState(
  //   currentConnector?.metadata.kind === 'object_store',
  // );

  // Catalogs
  const derivedCatalogKey = [catalogKey ?? '', currentConnector?.catalog ?? ''].join();
  const catalogsQuery = useListCatalogs(derivedCatalogKey);

  const catalogs = catalogsQuery.data ?? [];
  const registered = connectors.filter(c => c.catalog && catalogs.includes(c.catalog));

  const isObjectStoreRegistered = registered.some(r => r.metadata.kind === 'object_store');

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
        variant="ghost"
      >
        {isAnyLoading ? <Spinner /> : <PlugZap />}
        <span className="hidden md:inline">{isAnyLoading ? 'Registering' : 'Register'}</span>
      </Button>
    </DropdownMenuTrigger>
  );

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <Card
        {...rest}
        className={cn(
          'connectors-register-card @container/connectorregister',
          'gap-4',
          rest?.className,
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <SquareStack className="h-4 w-4" />
              <span className="hidden @md/connectorregister:inline">Registered&nbsp;</span>Catalogs
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
            {/*{registered.map(c => (
              <Fragment key={`connector-${c.id}`}>
                {c.metadata.kind === 'object_store' ? (
                  <Badge variant="secondary">object store</Badge>
                ) : (
                  <Badge asChild variant="default">
                    <a href={`#${c.id}`} onClick={() => onClickConnector?.(c.id)}>
                      {c.name}
                    </a>
                  </Badge>
                )}
              </Fragment>
            ))}*/}
          </div>
        </CardContent>
      </Card>

      {/* Register connector menu content */}
      <DropdownMenuContent>
        {connectors.map(connection => (
          <DropdownMenuCheckboxItem
            checked={
              registered.some(r => r.id === connection.id) ||
              // If one object store is registered, then all object stores are registered
              (isObjectStoreRegistered && connection.metadata.kind === 'object_store')
            }
            disabled={registerMutation.isPending || registered.some(r => r.id === connection.id)}
            key={connection.id}
            onCheckedChange={checked =>
              checked ? registerMutation.mutate(connection.id) : checked
            }
          >
            <ConnectionItem connection={connection} />
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
