import { CoreNodeType } from "@stately/schema/core/nodes";
import {
  ChevronsDownUp,
  ChevronsUpDown,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useId, useState } from "react";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent } from "@/core/components/ui/card";
import {
  Field,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/core/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/core/components/ui/input-group";
import { Item, ItemContent, ItemGroup } from "@/core/components/ui/item";
import { Separator } from "@/core/components/ui/separator";
import { useViewMore } from "@/base/hooks/use-view-more";
import type { CoreMapNode, CoreNodeUnion, CoreSchemas } from "@/core";
import { GlowingSave } from "@/base/components/glowing-save";
import { FieldEdit } from "@/base/form/field-edit";
import { FieldView } from "@/base/form/field-view";
import type { EditFieldProps } from "@/base/form/field-edit";
import { KeyValue } from "../view/map-field";
import { AnyRecord } from "@stately/schema/helpers";
import { cn } from "@/base/lib/utils";

const generateSaveLabels = (
  label?: string,
  formData?: any,
  value?: any,
  isEditDirty?: boolean,
): { edit: string; save: string; saveAll: string } => {
  const newVariables = Object.keys(formData || {}).filter(
    (k) => !value || !(k in value),
  );
  const hasNewVariable = newVariables.length > 0;
  const hasNewVariables = newVariables.length > 1;
  const pluralize = (hasNewVariable && isEditDirty) || hasNewVariables;

  const saveFormLabel = label ? `New ${label} Variable` : "New Variable";
  const editFormLabel = label ? `Edited ${label} Variable` : "Edited Variable";

  let saveLabelPrefix = "";
  if (!!formData && !!value && (hasNewVariable || isEditDirty)) {
    saveLabelPrefix =
      hasNewVariable && !isEditDirty
        ? "New "
        : !hasNewVariable
          ? "Edited "
          : "";
  }
  const saveAllFormLabel = label
    ? `${saveLabelPrefix}${label} Variable${pluralize ? "s" : ""}`
    : `${saveLabelPrefix}Variable${pluralize ? "s" : ""}`;
  return {
    edit: editFormLabel,
    save: saveFormLabel,
    saveAll: saveAllFormLabel,
  };
};

export type MapEditProps<Schema extends CoreSchemas = CoreSchemas> =
  EditFieldProps<Schema, CoreMapNode<Schema>, AnyRecord>;

/**
 * Map/Dictionary field component - handles HashMap<String, T> in Rust
 * Uses explicit save pattern with dirty tracking
 */
export function MapEdit<Schema extends CoreSchemas = CoreSchemas>({
  formId: parentFormId,
  label,
  node,
  value,
  onChange,
  isRequired,
  isWizard,
}: MapEditProps<Schema>) {
  // Initialize formData with value from parent
  const [formData, setFormData] = useState<Record<string, any>>(value ?? {});
  const [newKey, setNewKey] = useState<string>();
  const [newValue, setNewValue] = useState<any>();
  const [editKey, setEditKey] = useState<string>();
  const [editValue, setEditValue] = useState<any>();
  const [isDirty, setIsDirty] = useState(false);
  const [isEditDirty, setIsEditDirty] = useState(false);

  const formId = useId();

  const [existingView, viewMore, setViewMore] = useViewMore(formData, 3);

  // Validate map and create save label
  const isValid = !isRequired || Object.keys(formData).length > 0;

  const saveLabels = generateSaveLabels(label, formData, value, isEditDirty);

  const newKeys =
    formData &&
    Object.keys(formData).filter((k) => !Object.keys(value || {}).includes(k));

  // Handle save
  const handleSave = useCallback(() => {
    if (!isValid) return;
    onChange(formData);
    setIsDirty(false);
    setIsEditDirty(false);
  }, [formData, isValid, onChange]);

  const onAddEdit = useCallback(
    (valueToAdd: any) => {
      if (!editKey) return;
      setFormData((prev) => ({ ...prev, [editKey]: valueToAdd }));
      setEditKey("");
      setEditValue("");
      setIsDirty(true);
      setIsEditDirty(true);
    },
    [editKey],
  );

  const onAddNew = useCallback(
    (valueToAdd: any) => {
      if (!newKey) return;
      setFormData((prev) => ({ ...prev, [newKey]: valueToAdd }));
      setNewKey("");
      setNewValue("");
      setIsDirty(true);
    },
    [newKey],
  );

  const onRemove = (key: string) => {
    if (key === editKey) {
      setEditKey("");
    }
    setFormData((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
    if (!!value && key in value) {
      setIsDirty(true);
    }
  };

  return (
    <>
      <div
        id={parentFormId}
        className={cn(
          "flex flex-col gap-2",
          "border-l-3 border-l-border border-dotted ",
          "pl-3",
        )}
      >
        {/*View Existing Items*/}
        {Object.entries(formData).length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                No entries yet. Add a new key and value to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          // View and Edit Existing Items
          <div className="space-y-2">
            <ItemGroup className="space-y-3 min-w-0 flex-1">
              {existingView.map(([key, itemValue]) => (
                <KeyValue
                  key={`${key}-${key === editKey ? String(editValue) : ""}`}
                  active={newKeys.includes(key)}
                  itemKey={key}
                  open={key === editKey}
                  after={
                    <span className="inline-flex gap-2">
                      {/* Edit or cancel */}
                      {editKey === key ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditKey(undefined)}
                          className="h-8 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditKey(key);
                            setEditValue(itemValue);
                          }}
                          className="h-8 cursor-pointer"
                          disabled={!!editKey}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}

                      {/* Remove */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(key)}
                        className="h-8 cursor-pointer text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </span>
                  }
                >
                  {key === editKey ? (
                    <ValueEdit
                      formId={formId}
                      label={saveLabels.edit}
                      node={node}
                      hasKey={true}
                      newValue={editValue}
                      setNewValue={setEditValue}
                      handleAdd={onAddEdit}
                      isWizard={isWizard}
                    />
                  ) : (
                    <FieldView node={node} value={itemValue} />
                  )}
                </KeyValue>
              ))}

              {/* View More */}
              <Item size="sm" variant="muted" className="p-1">
                <ItemContent
                  className={cn(
                    "flex flex-nowrap flex-1 justify-center w-full",
                    "text-xs font-mono",
                  )}
                >
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setViewMore((v) => !v)}
                    className="cursor-pointer font-mono text-sm"
                  >
                    {viewMore ? <ChevronsDownUp /> : <ChevronsUpDown />}
                    View {viewMore ? "Less" : "More"}
                  </Button>
                </ItemContent>
              </Item>
            </ItemGroup>
          </div>
        )}

        <Separator />

        {/*Add New Item*/}
        <div className="space-y-2">
          <FieldLegend variant="label">Add New Item</FieldLegend>
          <Field>
            {/* Key */}
            <InputGroup className="flex gap-2">
              <InputGroupInput
                id={`input-${formId}`}
                placeholder="New key..."
                value={newKey || ""}
                onChange={(e) => setNewKey(e.target.value)}
              />
            </InputGroup>
          </Field>

          {/*Value*/}
          <ValueEdit<Schema>
            formId={formId}
            label={saveLabels.save}
            node={node}
            isDisabled={!!editKey}
            hasKey={!!newKey}
            newValue={newValue}
            setNewValue={setNewValue}
            handleAdd={(val) => onAddNew(val ?? newValue)}
            isWizard={isWizard}
          />
        </div>

        {isDirty && (
          <>
            <FieldSeparator />
            <GlowingSave
              size="sm"
              label={saveLabels.saveAll}
              isDisabled={!isValid}
              onSave={handleSave}
              onCancel={() => {
                setFormData(value ?? {});
                setIsDirty(false);
              }}
            />
          </>
        )}
      </div>
    </>
  );
}

function ValueEdit<Schema extends CoreSchemas = CoreSchemas>({
  formId,
  node,
  label,
  hasKey,
  newValue,
  setNewValue,
  handleAdd,
  isDisabled,
  isWizard,
}: {
  formId: string;
  node: CoreNodeUnion<Schema>;
  label?: string;
  hasKey?: boolean;
  newValue?: any;
  setNewValue: (value: string) => void;
  handleAdd: (value: any) => void;
  isDisabled?: boolean;
  isWizard?: boolean;
}) {
  return (
    <FieldSet className="min-w-0" disabled={!hasKey}>
      <Field>
        {/* Primitive value */}
        {node.nodeType === CoreNodeType.Primitive ? (
          <div className="grid w-full gap-4">
            <InputGroup>
              {/* Textarea */}
              <InputGroupTextarea
                id={`text-area-${formId}`}
                placeholder="Value..."
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => {
                  if (!isDisabled && e.key === "Enter" && e.shiftKey) {
                    e.preventDefault();
                    handleAdd(newValue);
                  }
                }}
              />

              {/* Add button */}
              <InputGroupAddon align="block-end">
                <InputGroupText className="text-xs text-muted-foreground italic">
                  {hasKey ? "Create a new key value pair" : "Set the key first"}
                </InputGroupText>
                <InputGroupButton
                  size="xs"
                  className="ml-auto cursor-pointer"
                  variant={isDisabled || !hasKey ? "ghost" : "default"}
                  disabled={isDisabled}
                  onClick={() => handleAdd(newValue)}
                >
                  Add <Plus />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
        ) : (
          // Complex value
          <div className="flex flex-col border-border border rounded-md">
            <div
              className={cn(
                "py-2 px-3 flex justify-between items-center",
                "text-sm",
                "rounded-t-md",
                hasKey
                  ? "text-accent-foreground bg-muted"
                  : "text-muted-foreground bg-accent",
              )}
            >
              <span>Value... </span>
              {!hasKey && (
                <span className="text-xs italic">(Set the key first)</span>
              )}
            </div>
            {node.description && (
              <div className="bg-muted text-xs italic p-2">
                {node.description}
              </div>
            )}
            <div className="p-2 flex-1 w-full min-w-0">
              <FieldEdit
                formId={formId}
                label={label}
                node={node}
                onChange={(val) => {
                  setNewValue(val);
                  handleAdd(val);
                }}
                value={newValue}
                isWizard={isWizard}
                isRequired
              />
            </div>
          </div>
        )}
      </Field>
    </FieldSet>
  );
}
