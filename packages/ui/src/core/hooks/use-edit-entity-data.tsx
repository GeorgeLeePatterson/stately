import { useState } from 'react';
import { Note } from '@/core/components/base/note';
import type { CoreSchemas, CoreStateEntry } from '@/core';
import { useEntityData } from './use-entity-data';

export function useEditEntityData<
  Schema extends CoreSchemas = CoreSchemas,
>({
  entity,
  disabled,
}: {
  entity: CoreStateEntry<Schema>;
  disabled?: boolean;
}) {
  const [editEntity, setEditEntity] = useState<string>();
  const query = useEntityData<Schema>({ entity, identifier: editEntity, disabled });

  const fetchError = editEntity && !query.isLoading && (query.error || !query.data?.id);
  const editNote = fetchError ? (
    <Note
      mode="error"
      message={`The configuration for '${editEntity}' could not be loaded. ${query.error ? `Details - ${query.error.message}` : 'Please try again.'}`}
    />
  ) : editEntity ? (
    <Note mode="info" message={`Editing ${editEntity}`} />
  ) : null;

  return { editEntity, setEditEntity, editNote, ...query };
}
