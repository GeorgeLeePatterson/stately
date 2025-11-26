import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@stately/ui/base/ui';
import { useCallback, useState } from 'react';
import { useArrowStatelyUi } from '@/context';
import type { ConnectionMetadata } from '@/types/api';

export interface RegisterConnectionProps {
  connections: ConnectionMetadata[];
  register: (connectorId: string) => Promise<ConnectionMetadata | undefined>;
  isPending?: boolean;
}

export function RegisterConnection({ connections, register, isPending }: RegisterConnectionProps) {
  const { utils } = useArrowStatelyUi();

  const [open, setOpen] = useState(false);
  const [registered, setRegistered] = useState<ConnectionMetadata[]>([]);
  const registerConnector = useCallback(
    (connectorId: string) => {
      register(connectorId)
        .then(data => {
          if (data) {
            setRegistered(r => [...r, data]);
          }
        })
        .catch((error: { message: string }) => {
          console.error('Failed to register connector: ', { connectorId, error });
        });
    },
    [register],
  );

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger asChild>
        <Button disabled={isPending} onClick={() => setOpen(!open)} variant="secondary">
          Register...
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {connections.map(connection => (
          <DropdownMenuCheckboxItem
            checked={registered.some(r => r.id === connection.id)}
            disabled={isPending || registered.some(r => r.id === connection.id)}
            key={connection.id}
            onCheckedChange={checked => (checked ? registerConnector(connection.id) : checked)}
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
