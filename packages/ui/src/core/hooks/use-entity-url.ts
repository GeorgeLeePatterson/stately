import type { Schemas } from '@stately/schema';
import { useCallback } from 'react';
import { useStatelyUi } from '@/index';
import { resolveEntityUrl as coreResolveEntityUrl, type EntityUrlParts } from '../utils';

export function useEntityUrl<Schema extends Schemas = Schemas>() {
  const runtime = useStatelyUi<Schema>();
  const resolveEntityUrl =
    runtime.plugins.core.utils?.resolveEntityUrl ||
    (coreResolveEntityUrl<Schema>).bind(null, runtime);
  const resolveUrl = useCallback(
    (parts: EntityUrlParts, params?: Record<string, string>, omitBasePath?: boolean) => {
      return resolveEntityUrl(parts, params, omitBasePath);
    },
    [resolveEntityUrl],
  );

  return resolveUrl;
}
