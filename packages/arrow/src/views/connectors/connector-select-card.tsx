import { cn } from '@statelyjs/ui';
import { Note } from '@statelyjs/ui/components';
import { Card, CardContent, CardHeader, CardTitle } from '@statelyjs/ui/components/base/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@statelyjs/ui/components/base/select';
import { Database } from 'lucide-react';
import { useCallback } from 'react';
import { AnyIsLoading } from '@/components/any-is-loading';
import type { ConnectionMetadata } from '@/types/api';
import { ConnectionItem } from './connection-item';

export interface ConnectorSelectCardProps {
  connectors: ConnectionMetadata[];
  currentConnector?: ConnectionMetadata;
  onSelect: (connector?: ConnectionMetadata) => void;
  error?: string;
  isLoading?: boolean;
}

/**
 * A card w/ a dropdown for selecting connectors. Not used by default, provided for convenience.
 */
export function ConnectorSelectCard({
  connectors,
  currentConnector,
  error,
  onSelect,
  isLoading,
  ...rest
}: ConnectorSelectCardProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'>) {
  const handleSelect = useCallback(
    (id: string | null) => onSelect(connectors.find(connector => connector.id === id)),
    [connectors, onSelect],
  );

  return (
    <Card {...rest} className={cn(['connector-select-card gap-4', rest?.className])}>
      <CardHeader>
        {/* Connector Details */}
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Connectors
          </span>

          <AnyIsLoading isLoading={!!isLoading} loaderOnly />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-auto flex flex-col space-y-2">
        {/* Connector error */}
        {error && <Note message={error} mode="error" />}

        {/* Connector dropdown */}
        <div className="flex flex-col">
          <Select onValueChange={handleSelect} value={currentConnector?.id || ''}>
            <SelectTrigger
              className="w-full min-w-0 flex-1"
              disabled={isLoading}
              id="connector-selector"
            >
              <SelectValue>{value => value ?? 'Select connector'}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {connectors.map(connector => (
                <SelectItem key={connector.id} value={connector.id}>
                  <ConnectionItem connection={connector} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
