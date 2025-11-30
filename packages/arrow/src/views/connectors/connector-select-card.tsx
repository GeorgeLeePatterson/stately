import { cn } from '@stately/ui/base';
import { Note } from '@stately/ui/base/components';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@stately/ui/base/ui';
import { Database } from 'lucide-react';
import { useCallback } from 'react';
import { AnyIsLoading } from '@/components/any-is-loading';
import { useArrowStatelyUi } from '@/context';
import type { ConnectionMetadata } from '@/types/api';

export interface ConnectorSelectCardProps {
  connectors: ConnectionMetadata[];
  currentConnector?: ConnectionMetadata;
  onSelect: (connector?: ConnectionMetadata) => void;
  error?: string;
  isLoading?: boolean;
}

export function ConnectorSelectCard({
  connectors,
  currentConnector,
  error,
  onSelect,
  isLoading,
  ...rest
}: ConnectorSelectCardProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'>) {
  const { utils } = useArrowStatelyUi();

  const handleSelect = useCallback(
    (id: string) => onSelect(connectors.find(connector => connector.id === id)),
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
              <SelectValue placeholder="Select connector" />
            </SelectTrigger>
            <SelectContent>
              {connectors.map(connector => (
                <SelectItem key={connector.id} value={connector.id}>
                  <div className="flex items-baseline">
                    <span className="items-center font-semi-bold text-sm">{connector.name}</span>
                    <span className="items-center text-xs text-muted-foreground truncate">
                      &nbsp; · {utils.toSpaceCase(connector.kind || 'memory')}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
