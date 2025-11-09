import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import type { EditFieldProps } from '@/components/fields';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { FieldGroup, FieldSet } from '@/components/ui/field';
import { useStatelyUi } from '@/context';
import { useEditEntityData } from '@/hooks/use-edit-entity-data';
import { LinkInlineEdit } from './link-inline-edit-view';
import { LinkRefEdit } from './link-ref-edit-view';

// Type helpers for Link editing
export type LinkFor<Config extends StatelyConfig = StatelyConfig> =
  | { entity_type: StatelySchemas<Config>['StateEntry']; ref: string }
  | {
      entity_type: StatelySchemas<Config>['StateEntry'];
      inline: StatelySchemas<Config>['EntityData'];
    };

/**
 * Component for editing Link<T> fields
 * Orchestrates mode toggling and delegates save/cancel to child components
 */
export function LinkEdit<Config extends StatelyConfig = StatelyConfig>({
  node,
  value,
  onChange,
  isWizard,
}: EditFieldProps<Config, StatelySchemas<Config>['LinkNode'], LinkFor<Config> | null> & {
  isWizard?: boolean;
}) {
  const { api } = useStatelyUi();
  const targetType = node.targetType;

  // Mode state - undefined until entities are fetched
  const [mode, setMode] = useState<'ref' | 'inline'>(
    (!!value && ('inline' in value ? 'inline' : 'ref')) || 'ref',
  );

  // Fetch entities to determine what ref modes are available
  const {
    data: entitiesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['entity-list', targetType],
    queryFn: async () => {
      const { data, error } = await api.entity.listByType({ type: targetType });
      if (error) throw new Error(`Failed to fetch ${targetType} entities`);
      return data;
    },
  });

  // Enable editing an existing entity inline
  const {
    editEntity: _,
    setEditEntity,
    editNote,
    data: editData,
  } = useEditEntityData({ entity: targetType });

  const availableEntities = entitiesData?.entities?.[targetType] ?? [];
  const hasEntities = availableEntities.length > 0;

  const enableToggle = !isLoading && hasEntities;
  const effectiveMode = !isLoading && !hasEntities ? 'inline' : mode;

  const inlineData = useMemo(
    () =>
      editData
        ? ({ entity_type: editData.entity.type, inline: editData.entity.data } as LinkFor<Config>)
        : value,
    [value, editData],
  );

  const onEditAsInline = useCallback(
    (ref: string) => {
      if (!ref) return;
      setEditEntity(ref);
      setMode('inline');
    },
    [setEditEntity],
  );

  const handleRefChange = useCallback(
    (value: LinkFor<Config>) => {
      setEditEntity(undefined);
      onChange(value);
    },
    [setEditEntity, onChange],
  );

  if (isLoading) {
    return (
      <div className="space-y-2 bg-muted/60 rounded-sm p-3">
        <div className="text-sm text-muted-foreground">Loading entities...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-2 bg-muted/60 rounded-sm p-3">
        <div className="text-sm text-destructive">Error loading entities: {error.message}</div>
      </div>
    );
  }

  const isDefault = availableEntities.length === 1 && availableEntities[0].id === 'default';

  const modeToggle = enableToggle ? (
    <div className="flex justify-end">
      <ButtonGroup>
        <Button
          type="button"
          variant={mode === 'ref' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('ref')}
          className="cursor-pointer"
          disabled={isLoading}
        >
          Ref
        </Button>
        <Button
          type="button"
          variant={mode === 'inline' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('inline')}
          className="cursor-pointer"
          disabled={isLoading}
        >
          Inline
        </Button>
      </ButtonGroup>
    </div>
  ) : undefined;

  return (
    <>
      <FieldGroup className="space-y-2 bg-muted/60 rounded-sm p-3">
        <FieldSet className="min-w-0">
          {editNote}

          {/* Render active mode component */}
          {effectiveMode === 'ref' ? (
            <LinkRefEdit
              isReadOnly={isDefault}
              targetType={targetType}
              availableEntities={availableEntities}
              schema={node.inlineSchema}
              value={value}
              onChange={handleRefChange}
              onRefresh={refetch}
              after={modeToggle}
              onEditAsInline={onEditAsInline}
            />
          ) : (
            <LinkInlineEdit
              targetType={targetType}
              schema={node.inlineSchema}
              value={inlineData}
              onChange={onChange}
              after={modeToggle}
              isWizard={isWizard}
            />
          )}
        </FieldSet>
      </FieldGroup>
    </>
  );
}
