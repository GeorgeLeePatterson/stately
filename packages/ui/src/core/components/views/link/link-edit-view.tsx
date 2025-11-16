import type { Schemas } from '@stately/schema';
import { SINGLETON_ID } from '@stately/schema/core/utils';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import type { EditFieldProps } from '@/base/form/field-edit';
import { Button } from '@/base/ui/button';
import { ButtonGroup } from '@/base/ui/button-group';
import { FieldGroup, FieldSet } from '@/base/ui/field';
import type { CoreEntity, CoreLinkNode, CoreStateEntry } from '@/core';
import { useStatelyUi } from '@/core';
import { useEditEntityData } from '@/core/hooks/use-edit-entity-data';
import { LinkInlineEdit } from './link-inline-edit-view';
import { LinkRefEdit } from './link-ref-edit-view';

// Type helpers for Link editing
export type LinkFor<Schema extends Schemas = Schemas> =
  | { entity_type: CoreStateEntry<Schema>; ref: string }
  | { entity_type: CoreStateEntry<Schema>; inline: CoreEntity<Schema>['data'] };

export type LinkEditProps<Schema extends Schemas = Schemas> = EditFieldProps<
  Schema,
  CoreLinkNode<Schema>,
  LinkFor<Schema> | null | undefined
>;

/**
 * Component for editing Link<T> fields
 * Orchestrates mode toggling and delegates save/cancel to child components
 */
export function LinkEdit<Schema extends Schemas = Schemas>({
  node,
  value,
  onChange,
  isWizard,
}: LinkEditProps<Schema>) {
  const { plugins } = useStatelyUi();
  const coreApi = plugins.core?.api;
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
    queryFn: async () => {
      if (!coreApi) {
        throw new Error('Core entity API is unavailable.');
      }
      const { data, error } = await coreApi.call(coreApi.operations.listEntitiesByType, {
        params: { query: { entity_type: targetType } },
      });
      if (error) throw new Error(`Failed to fetch ${targetType} entities`);
      return data;
    },
    queryKey: ['entity-list', targetType],
  });

  // Enable editing an existing entity inline
  const {
    editEntity: _,
    setEditEntity,
    editNote,
    data: editData,
  } = useEditEntityData<Schema>({ entity: targetType });

  const availableEntities = entitiesData?.entities?.[targetType] ?? [];
  const hasEntities = availableEntities.length > 0;

  const enableToggle = !isLoading && hasEntities;
  const effectiveMode = !isLoading && !hasEntities ? 'inline' : mode;

  const inlineData = useMemo(
    () =>
      editData
        ? ({ entity_type: editData.entity.type, inline: editData.entity.data } as LinkFor<Schema>)
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
    (value: LinkFor<Schema>) => {
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

  const isDefault = availableEntities.length === 1 && availableEntities[0].id === SINGLETON_ID;

  const modeToggle = enableToggle ? (
    <div className="flex justify-end">
      <ButtonGroup>
        <Button
          className="cursor-pointer"
          disabled={isLoading}
          onClick={() => setMode('ref')}
          size="sm"
          type="button"
          variant={mode === 'ref' ? 'default' : 'outline'}
        >
          Ref
        </Button>
        <Button
          className="cursor-pointer"
          disabled={isLoading}
          onClick={() => setMode('inline')}
          size="sm"
          type="button"
          variant={mode === 'inline' ? 'default' : 'outline'}
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
              after={modeToggle}
              availableEntities={availableEntities}
              isReadOnly={isDefault}
              node={node.inlineSchema}
              onChange={handleRefChange}
              onEditAsInline={onEditAsInline}
              onRefresh={refetch}
              targetType={targetType}
              value={value}
            />
          ) : (
            <LinkInlineEdit
              after={modeToggle}
              isWizard={isWizard}
              node={node.inlineSchema}
              onChange={onChange}
              targetType={targetType}
              value={inlineData}
            />
          )}
        </FieldSet>
      </FieldGroup>
    </>
  );
}
