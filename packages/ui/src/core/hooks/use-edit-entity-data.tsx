import type { Schemas } from '@stately/schema';
import { useState } from 'react';
import { Note } from '@/base/components/note';
import type { CoreStateEntry } from '@/core';
import { useEntityData } from './use-entity-data';

export function useEditEntityData<Schema extends Schemas = Schemas>({
  entity,
  disabled,
}: {
  entity: CoreStateEntry<Schema>;
  disabled?: boolean;
}) {
  const [editEntity, setEditEntity] = useState<string>();
  const query = useEntityData<Schema>({ disabled, entity, identifier: editEntity });

  const fetchError = editEntity && !query.isLoading && (query.error || !query.data?.id);
  const editNote = fetchError ? (
    <Note
      message={`The configuration for '${editEntity}' could not be loaded. ${query.error ? `Details - ${query.error.message}` : 'Please try again.'}`}
      mode="error"
    />
  ) : editEntity ? (
    <Note message={`Editing ${editEntity}`} mode="info" />
  ) : null;

  return { editEntity, editNote, setEditEntity, ...query };
}
