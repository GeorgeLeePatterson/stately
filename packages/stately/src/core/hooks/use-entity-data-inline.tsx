import { Note } from '@statelyjs/ui/components';
import { useState } from 'react';
import type { CoreStateEntry } from '@/core';
import type { Schemas } from '@/core/schema';
import { useEntityData } from './use-entity-data';

/**
 * Fetch entity data with inline display support.
 *
 * Extends `useEntityData` with state management and UI helpers for inline
 * entity viewing. Useful for previewing linked entities without navigating away.
 *
 * @typeParam Schema - Your application's schema type
 *
 * @param options - Hook options
 * @param options.entity - The entity type name (e.g., 'Pipeline', 'SourceConfig')
 * @param options.disabled - Set to true to prevent fetching
 *
 * @returns An object with:
 *   - `inlineEntity` - The currently selected entity ID (if any)
 *   - `setInlineEntity` - Set an entity ID to fetch and display inline
 *   - `inlineNote` - A pre-built Note component showing status/errors
 *   - All properties from `useEntityData` (data, isLoading, error, etc.)
 *
 * @example
 * ```tsx
 * function LinkedEntityPreview({ entity }: { entity: string }) {
 *   const { inlineEntity, setInlineEntity, inlineNote, data } = useEntityDataInline<MySchemas>({
 *     entity,
 *   });
 *
 *   return (
 *     <div>
 *       <Button onClick={() => setInlineEntity('some-id')}>Preview</Button>
 *       {inlineNote}
 *       {data && <EntityView data={data.entity} />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useEntityDataInline<Schema extends Schemas = Schemas>({
  entity,
  disabled,
}: {
  entity: CoreStateEntry<Schema>;
  disabled?: boolean;
}) {
  const [inlineEntity, setInlineEntity] = useState<string>();
  const query = useEntityData<Schema>({ disabled, entity, identifier: inlineEntity });

  const fetchError = inlineEntity && !query.isLoading && (query.error || !query.data?.id);
  const inlineNote = fetchError ? (
    <Note
      message={`The configuration for '${inlineEntity}' could not be loaded. ${query.error ? `Details - ${query.error.message}` : 'Please try again.'}`}
      mode="error"
    />
  ) : inlineEntity ? (
    <Note message={`Viewing copy of ${inlineEntity}`} mode="info" />
  ) : null;

  return { inlineEntity, inlineNote, setInlineEntity, ...query };
}
