import { Note } from '@statelyjs/ui/components';
import { useState } from 'react';
import type { CoreStateEntry } from '@/core';
import type { Schemas } from '@/core/schema';
import { useEntityData } from './use-entity-data';

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
    <Note message={`Viewing data for ${inlineEntity}`} mode="info" />
  ) : null;

  return { inlineEntity, inlineNote, setInlineEntity, ...query };
}
