import { Badge } from '@stately/ui/base/ui';
import type { ConnectionMetadata } from '@/types/api';

export function CatalogBadge({ catalog }: { catalog: string }) {
  return <Badge variant="outline">{catalog}</Badge>;
}

export function ConnectionBadge({ connector }: { connector: ConnectionMetadata }) {
  if (!connector) return null;
  return connector.kind !== 'object_store' ? (
    <Badge variant="outline">object store</Badge>
  ) : (
    <Badge variant="default">{connector.id}</Badge>
  );
}
