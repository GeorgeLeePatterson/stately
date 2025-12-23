import { useCallback } from 'react';
import type { Schemas } from '@/core/schema';
import { useStatelyUi } from '@/index';
import { resolveEntityUrl as coreResolveEntityUrl, type EntityUrlParts } from '../utils';

/**
 * Build URLs for entity navigation.
 *
 * Returns a memoized function for generating entity URLs based on the
 * configured base path and entity routing conventions.
 *
 * @typeParam Schema - Your application's schema type
 *
 * @returns A function `(parts, params?, omitBasePath?) => string` for building URLs
 *
 * @example
 * ```tsx
 * function PipelineLink({ id, name }: { id: string; name: string }) {
 *   const resolveUrl = useEntityUrl<MySchemas>();
 *
 *   // Generate URL like "/entities/pipelines/abc123"
 *   const url = resolveUrl({ type: 'Pipeline', id });
 *
 *   // With query params: "/entities/pipelines/abc123?tab=settings"
 *   const urlWithParams = resolveUrl({ type: 'Pipeline', id }, { tab: 'settings' });
 *
 *   return <Link to={url}>{name}</Link>;
 * }
 * ```
 */
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
