import { toSpaceCase } from '@stately/ui/base';
import { createConnectionKindDisplay } from '@/lib/utils';
import type { ConnectionMetadata } from '@/types/api';

export function ConnectionItem({ connection }: { connection: ConnectionMetadata }) {
  return (
    <div className="flex items-baseline">
      <span className="items-center font-semi-bold text-sm">{connection.name}</span>
      <span className="items-center text-xs text-muted-foreground truncate">
        &nbsp; · {toSpaceCase(createConnectionKindDisplay(connection))}
      </span>
    </div>
  );
}
