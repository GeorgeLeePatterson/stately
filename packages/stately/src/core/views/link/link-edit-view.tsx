import { Button } from '@statelyjs/ui/components/base/button';
import { ButtonGroup } from '@statelyjs/ui/components/base/button-group';
import { FieldGroup, FieldSet } from '@statelyjs/ui/components/base/field';
import type { FieldEditProps } from '@statelyjs/ui/form';
import { useCallback, useMemo, useState } from 'react';
import type { CoreEntityData, CoreStateEntry } from '@/core';
import { useListEntities } from '@/core/hooks';
import { useEntityDataInline } from '@/core/hooks/use-entity-data-inline';
import type { Schemas } from '@/core/schema';
import { SINGLETON_ID } from '@/core/schema';
import type { LinkNode } from '@/core/schema/nodes';
import { LinkInlineEdit } from './link-inline-edit';
import { LinkRefEdit } from './link-ref-edit';

// Type helpers for Link editing
export type LinkFor<Schema extends Schemas = Schemas> =
  | { entity_type: CoreStateEntry<Schema>; ref: string }
  | { entity_type: CoreStateEntry<Schema>; inline: CoreEntityData<Schema> };

export type LinkEditViewProps<Schema extends Schemas = Schemas> = FieldEditProps<
  Schema,
  LinkNode,
  LinkFor<Schema> | null | undefined
>;

/**
 * Component for editing Link<T> fields
 * Orchestrates mode toggling and delegates save/cancel to child components
 */
export function LinkEditView<Schema extends Schemas = Schemas>({
  node,
  value,
  onChange,
  isWizard,
}: LinkEditViewProps<Schema>) {
  const targetType = node.targetType as CoreStateEntry<Schema>;

  // Mode state - undefined until entities are fetched
  const [mode, setMode] = useState<'ref' | 'inline'>(
    (!!value && ('inline' in value ? 'inline' : 'ref')) || 'ref',
  );

  // Fetch entities to determine what ref modes are available

  const { data: entitiesData, isLoading, error, refetch } = useListEntities({ entity: targetType });

  // Enable editing an existing entity inline
  const {
    inlineEntity: _,
    setInlineEntity: setEditEntity,
    inlineNote: editNote,
    data: editData,
  } = useEntityDataInline<Schema>({ entity: targetType });

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
  );
}
