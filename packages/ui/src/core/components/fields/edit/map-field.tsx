import type { Schemas } from '@stately/schema';
import { CoreNodeType } from '@stately/schema/core/nodes';
import type { AnyRecord } from '@stately/schema/helpers';
import { ChevronsDownUp, ChevronsUpDown, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useId, useState } from 'react';
import { GlowingSave } from '@/base/components/glowing-save';
import type { EditFieldProps } from '@/base/form/field-edit';
import { FieldEdit } from '@/base/form/field-edit';
import { FieldView } from '@/base/form/field-view';
import { useViewMore } from '@/base/hooks/use-view-more';
import { cn } from '@/base/lib/utils';
import { Button } from '@/base/ui/button';
import { Card, CardContent } from '@/base/ui/card';
import { Field, FieldLegend, FieldSeparator, FieldSet } from '@/base/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/base/ui/input-group';
import { Item, ItemContent, ItemGroup } from '@/base/ui/item';
import { Separator } from '@/base/ui/separator';
import type { CoreNodeUnion } from '@/core';
import { KeyValue } from '../view/map-field';

const MAX_ITEMS_VIEW_DEFAULT = 3;

const generateSaveLabels = (
  label?: string,
  formData?: any,
  value?: any,
  isEditDirty?: boolean,
): { edit: string; save: string; saveAll: string } => {
  const newVariables = Object.keys(formData || {}).filter(k => !value || !(k in value));
  const hasNewVariable = newVariables.length > 0;
  const hasNewVariables = newVariables.length > 1;
  const pluralize = (hasNewVariable && isEditDirty) || hasNewVariables;

  const saveFormLabel = label ? `New ${label} Variable` : 'New Variable';
  const editFormLabel = label ? `Edited ${label} Variable` : 'Edited Variable';

  let saveLabelPrefix = '';
  if (!!formData && !!value && (hasNewVariable || isEditDirty)) {
    saveLabelPrefix = hasNewVariable && !isEditDirty ? 'New ' : !hasNewVariable ? 'Edited ' : '';
  }
  const saveAllFormLabel = label
    ? `${saveLabelPrefix}${label} Variable${pluralize ? 's' : ''}`
    : `${saveLabelPrefix}Variable${pluralize ? 's' : ''}`;
  return { edit: editFormLabel, save: saveFormLabel, saveAll: saveAllFormLabel };
};

export type MapEditProps<Schema extends Schemas = Schemas> = EditFieldProps<
  Schema,
  Schema['plugin']['Nodes']['map'],
  AnyRecord
>;

/**
 * Map/Dictionary field component - handles HashMap<String, T> in Rust
 * Uses explicit save pattern with dirty tracking
 */
export function MapEdit<Schema extends Schemas = Schemas>({
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

  const [existing, viewMore, setViewMore] = useViewMore(formData, MAX_ITEMS_VIEW_DEFAULT);

  // Validate map and create save label
  const isValid = !isRequired || Object.keys(formData).length > 0;

  const saveLabels = generateSaveLabels(label, formData, value, isEditDirty);

  const newKeys =
    formData && Object.keys(formData).filter(k => !Object.keys(value || {}).includes(k));

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
      setFormData(prev => ({ ...prev, [editKey]: valueToAdd }));
      setEditKey('');
      setEditValue('');
      setIsDirty(true);
      setIsEditDirty(true);
    },
    [editKey],
  );

  const onAddNew = useCallback(
    (valueToAdd: any) => {
      if (!newKey) return;
      setFormData(prev => ({ ...prev, [newKey]: valueToAdd }));
      setNewKey('');
      setNewValue('');
      setIsDirty(true);
    },
    [newKey],
  );

  const onRemove = (key: string) => {
    if (key === editKey) {
      setEditKey('');
    }
    setFormData(prev => {
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
        className={cn('flex flex-col gap-2', 'border-l-3 border-l-border border-dotted ', 'pl-3')}
        id={parentFormId}
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
              {existing.map(([key, itemValue]) => (
                <KeyValue
                  active={newKeys.includes(key)}
                  after={
                    <span className="inline-flex gap-2">
                      {/* Edit or cancel */}
                      {editKey === key ? (
                        <Button
                          className="h-8 cursor-pointer"
                          onClick={() => setEditKey(undefined)}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          className="h-8 cursor-pointer"
                          disabled={!!editKey}
                          onClick={() => {
                            setEditKey(key);
                            setEditValue(itemValue);
                          }}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}

                      {/* Remove */}
                      <Button
                        className="h-8 cursor-pointer text-destructive hover:text-destructive"
                        onClick={() => onRemove(key)}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </span>
                  }
                  itemKey={key}
                  key={`${key}-${key === editKey ? String(editValue) : ''}`}
                  open={key === editKey}
                >
                  {key === editKey ? (
                    <ValueEdit
                      formId={formId}
                      handleAdd={onAddEdit}
                      hasKey={true}
                      isWizard={isWizard}
                      label={saveLabels.edit}
                      newValue={editValue}
                      node={node.valueSchema}
                      setNewValue={setEditValue}
                    />
                  ) : (
                    <FieldView<Schema> node={node.valueSchema} value={itemValue} />
                  )}
                </KeyValue>
              ))}

              {/* View More/Less */}
              {(existing || []).length > MAX_ITEMS_VIEW_DEFAULT && (
                <Item className="p-1" size="sm" variant="muted">
                  <ItemContent
                    className={cn(
                      'flex flex-nowrap flex-1 justify-center w-full',
                      'text-xs font-mono',
                    )}
                  >
                    <Button
                      className="cursor-pointer font-mono text-sm"
                      onClick={() => setViewMore(v => !v)}
                      type="button"
                      variant="link"
                    >
                      {viewMore ? <ChevronsDownUp /> : <ChevronsUpDown />}
                      View {viewMore ? 'Less' : 'More'}
                    </Button>
                  </ItemContent>
                </Item>
              )}
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
                onChange={e => setNewKey(e.target.value)}
                placeholder="New key..."
                value={newKey || ''}
              />
            </InputGroup>
          </Field>

          {/*Value*/}
          <ValueEdit<Schema>
            formId={formId}
            handleAdd={val => onAddNew(val ?? newValue)}
            hasKey={!!newKey}
            isDisabled={!!editKey}
            isWizard={isWizard}
            label={saveLabels.save}
            newValue={newValue}
            node={node.valueSchema}
            setNewValue={setNewValue}
          />
        </div>

        {isDirty && (
          <>
            <FieldSeparator />
            <GlowingSave
              isDisabled={!isValid}
              label={saveLabels.saveAll}
              onCancel={() => {
                setFormData(value ?? {});
                setIsDirty(false);
              }}
              onSave={handleSave}
              size="sm"
            />
          </>
        )}
      </div>
    </>
  );
}

function ValueEdit<Schema extends Schemas = Schemas>({
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
                onChange={e => setNewValue(e.target.value)}
                onKeyDown={e => {
                  if (!isDisabled && e.key === 'Enter' && e.shiftKey) {
                    e.preventDefault();
                    handleAdd(newValue);
                  }
                }}
                placeholder="Value..."
                value={newValue}
              />

              {/* Add button */}
              <InputGroupAddon align="block-end">
                <InputGroupText className="text-xs text-muted-foreground italic">
                  {hasKey ? 'Create a new key value pair' : 'Set the key first'}
                </InputGroupText>
                <InputGroupButton
                  className="ml-auto cursor-pointer"
                  disabled={isDisabled}
                  onClick={() => handleAdd(newValue)}
                  size="xs"
                  variant={isDisabled || !hasKey ? 'ghost' : 'default'}
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
                'py-2 px-3 flex justify-between items-center',
                'text-sm',
                'rounded-t-md',
                hasKey ? 'text-accent-foreground bg-muted' : 'text-muted-foreground bg-accent',
              )}
            >
              <span>Value... </span>
              {!hasKey && <span className="text-xs italic">(Set the key first)</span>}
            </div>
            {node.description && (
              <div className="bg-muted text-xs italic p-2">{node.description}</div>
            )}
            <div className="p-2 flex-1 w-full min-w-0">
              <FieldEdit<Schema, CoreNodeUnion<Schema>, string>
                formId={formId}
                isRequired
                isWizard={isWizard}
                label={label}
                node={node}
                onChange={val => {
                  setNewValue(val);
                  handleAdd(val);
                }}
                value={newValue}
              />
            </div>
          </div>
        )}
      </Field>
    </FieldSet>
  );
}
