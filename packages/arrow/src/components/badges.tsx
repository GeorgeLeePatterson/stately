import { Badge } from '@stately/ui/base/ui';
import type { ConnectionMetadata } from '@/types/api';

export function CatalogBadge({ catalog }: { catalog: string }) {
  return <Badge variant="outline">{catalog}</Badge>;
}

export function ConnectionBadge({ connector }: { connector: string }) {
  return <Badge variant="default">{connector}</Badge>;
}

export function ObjectStoreBadge({ connector }: { connector?: ConnectionMetadata }) {
  if (!connector || connector.kind !== 'object_store') return null;
  return <Badge variant="outline">object store</Badge>;
}
