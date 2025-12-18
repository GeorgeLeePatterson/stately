import { Note } from '@statelyjs/ui/components';
import { Badge } from '@statelyjs/ui/components/base/badge';
import { Button } from '@statelyjs/ui/components/base/button';
import { Card, CardContent, CardHeader, CardTitle } from '@statelyjs/ui/components/base/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@statelyjs/ui/components/base/dropdown-menu';
import { Spinner } from '@statelyjs/ui/components/base/spinner';
import { cn, messageFromError } from '@statelyjs/ui/lib/utils';
import { PlugZap, SquareStack } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useListRegistered } from '@/hooks';
import { useListCatalogs } from '@/hooks/use-list-catalog';
import { useRegisterConnection } from '@/hooks/use-register-connection';
import type { ConnectionMetadata } from '@/types/api';
import { ConnectionItem } from './connection-item';

export interface ConnectorsRegisterCardProps {
  catalogKey?: string;
  currentConnector?: ConnectionMetadata;
  connectors: ConnectionMetadata[];
  onClickConnector?: (id: string) => void;
  isLoading?: boolean;
}

export function ConnectorsRegisterCard({
  catalogKey,
  currentConnector,
  connectors,
  onClickConnector,
  isLoading,
  ...rest
}: ConnectorsRegisterCardProps & React.HTMLAttributes<HTMLDivElement>) {
  const [open, setOpen] = useState(false);

  // Registering
  const registerMutation = useRegisterConnection();
  const registerError = registerMutation.error
    ? messageFromError(registerMutation.error) || 'Failed to register connection.'
    : undefined;

  const recentlyRegistered = registerMutation.data ?? [];

  // Catalogs
  const derivedCatalogKey = [catalogKey ?? '', currentConnector?.catalog ?? ''].join();
  const catalogsQuery = useListCatalogs(derivedCatalogKey, !!isLoading);
  const catalogs = catalogsQuery.data ?? [];

  const currentCatalog = currentConnector?.catalog;
  const currentKind = currentConnector?.metadata.kind;

  const {
    allRegistered,
    registeredCatalogs,
    query: registerQuery,
  } = useListRegistered({ catalogs, disabled: !!isLoading, key: catalogKey, recentlyRegistered });

  const isAnyLoading =
    registerQuery.isFetching || catalogsQuery.isFetching || registerMutation.isPending;

  const isCurrentCatalog = (c: string) =>
    currentCatalog === c ? true : currentKind === 'object_store' && currentCatalog?.includes(c);

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
              <span>
                <span className="hidden @md/connectorregister:inline">Registered&nbsp;</span>
                Catalogs
              </span>
            </div>
            {registerButton}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Catalog and connector badges */}
          <div className="text-sm flex flex-wrap gap-2">
            {registerError && <Note message={registerError} mode="error" />}

            {/* Catalogs */}
            {[...registeredCatalogs.catalogs.values()].map(c => (
              <Badge key={`catalog-${c}`} variant={isCurrentCatalog(c) ? 'default' : 'outline'}>
                {c}
              </Badge>
            ))}

            {/* Databases */}
            {[...registeredCatalogs.database.values()].map(c => (
              <Badge key={`catalog-${c}`} variant={isCurrentCatalog(c) ? 'default' : 'secondary'}>
                {c}
              </Badge>
            ))}

            {/* Object store */}
            {[...registeredCatalogs.object_store.values()].map(c => (
              <Badge
                className={isCurrentCatalog(c) ? '' : 'bg-accent'}
                key={`catalog-${c}`}
                variant={isCurrentCatalog(c) ? 'default' : 'secondary'}
              >
                {c}
              </Badge>
            ))}

            {/* Other */}
            {[...registeredCatalogs.other.values()].map(c => (
              <Badge key={`catalog-${c}`} variant="outline">
                {c}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Register connector menu content */}
      <DropdownMenuContent>
        {connectors.map(connection => {
          const isRegistered =
            allRegistered.some(c => c.id === connection.id) ||
            // If one object store is registered, then all object stores are registered
            (allRegistered.some(_ => connection.metadata.kind === 'object_store') &&
              connection.metadata.kind === 'object_store');

          return (
            <DropdownMenuCheckboxItem
              checked={isRegistered}
              disabled={registerMutation.isPending || isRegistered}
              key={connection.id}
              onCheckedChange={checked =>
                checked ? registerMutation.mutate(connection.id) : checked
              }
            >
              <ConnectionItem connection={connection} />
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
