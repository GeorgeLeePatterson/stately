import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useStatelyUi } from "@/context";
import { Button } from "@/core/components/ui/button";
import { ButtonGroup } from "@/core/components/ui/button-group";
import { FieldGroup, FieldSet } from "@/core/components/ui/field";
import type {
  CoreEntity,
  CoreLinkNode,
  CoreSchemas,
  CoreStateEntry,
} from "@/core";
import { useEditEntityData } from "@/core/hooks/use-edit-entity-data";
import { LinkInlineEdit } from "./link-inline-edit-view";
import { LinkRefEdit } from "./link-ref-edit-view";
import { EditFieldProps } from "@/base/form/field-edit";
import { useCoreStatelyUi } from "@/core";
import { SINGLETON_ID } from "@stately/schema/core/utils";

// Type helpers for Link editing
export type LinkFor<Schema extends CoreSchemas = CoreSchemas> =
  | { entity_type: CoreStateEntry<Schema>; ref: string }
  | {
      entity_type: CoreStateEntry<Schema>;
      inline: CoreEntity<Schema>["data"];
    };

export type LinkEditProps<Schema extends CoreSchemas = CoreSchemas> =
  EditFieldProps<
    Schema,
    CoreLinkNode<Schema>,
    LinkFor<Schema> | null | undefined
  >;

/**
 * Component for editing Link<T> fields
 * Orchestrates mode toggling and delegates save/cancel to child components
 */
export function LinkEdit<Schema extends CoreSchemas = CoreSchemas>({
  node,
  value,
  onChange,
  isWizard,
}: LinkEditProps<Schema>) {
  const { schema, plugins }= useCoreStatelyUi();
  const coreApi = plugins.core?.api;
  const targetType = node.targetType;

  // Mode state - undefined until entities are fetched
  const [mode, setMode] = useState<"ref" | "inline">(
    (!!value && ("inline" in value ? "inline" : "ref")) || "ref",
  );

  // Fetch entities to determine what ref modes are available
  const {
    data: entitiesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["entity-list", targetType],
    queryFn: async () => {
      if (!coreApi) {
        throw new Error("Core entity API is unavailable.");
      }
      const { data, error } = await coreApi.call(
        coreApi.operations.listEntitiesByType,
        { params: { query: { entity_type: targetType } } }
      );
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
  } = useEditEntityData<Schema>({ entity: targetType });

  const availableEntities = entitiesData?.entities?.[targetType] ?? [];
  const hasEntities = availableEntities.length > 0;

  const enableToggle = !isLoading && hasEntities;
  const effectiveMode = !isLoading && !hasEntities ? "inline" : mode;

  const inlineData = useMemo(
    () =>
      editData
        ? ({
            entity_type: editData.entity.type,
            inline: editData.entity.data,
          } as LinkFor<Schema>)
        : value,
    [value, editData],
  );

  const onEditAsInline = useCallback(
    (ref: string) => {
      if (!ref) return;
      setEditEntity(ref);
      setMode("inline");
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
        <div className="text-sm text-destructive">
          Error loading entities: {error.message}
        </div>
      </div>
    );
  }

  const isDefault =
    availableEntities.length === 1 && availableEntities[0].id === SINGLETON_ID;

  const modeToggle = enableToggle ? (
    <div className="flex justify-end">
      <ButtonGroup>
        <Button
          type="button"
          variant={mode === "ref" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("ref")}
          className="cursor-pointer"
          disabled={isLoading}
        >
          Ref
        </Button>
        <Button
          type="button"
          variant={mode === "inline" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("inline")}
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
          {effectiveMode === "ref" ? (
            <LinkRefEdit
              isReadOnly={isDefault}
              targetType={targetType}
              availableEntities={availableEntities}
              node={node.inlineSchema}
              value={value}
              onChange={handleRefChange}
              onRefresh={refetch}
              after={modeToggle}
              onEditAsInline={onEditAsInline}
            />
          ) : (
            <LinkInlineEdit
              targetType={targetType}
              node={node.inlineSchema}
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
