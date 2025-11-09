import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import { useState } from 'react';
import { Note } from '@/components/base/note';
import { useEntityData } from './use-entity-data';

export function useEditEntityData<
  Config extends StatelyConfig = StatelyConfig,
>({
  entity,
  disabled,
}: {
  entity: StatelySchemas<Config>['StateEntry'];
  disabled?: boolean;
}) {
  const [editEntity, setEditEntity] = useState<string>();
  const query = useEntityData<Config>({ entity, identifier: editEntity, disabled });

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
