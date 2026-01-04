import { cn, generateFieldFormId } from '@statelyjs/ui';
import { ArrayIndex, GlowingSave } from '@statelyjs/ui/components';
import { Button } from '@statelyjs/ui/components/base/button';
import { Field, FieldSet } from '@statelyjs/ui/components/base/field';
import type { FieldEditProps } from '@statelyjs/ui/registry';
import { Dot, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useId, useState } from 'react';
import type { Schemas } from '@/core/schema';
import { CoreNodeType } from '@/core/schema/nodes';
import { isPrimitiveNodeLike } from '@/core/schema/utils';
import { BaseForm } from '@/form';
import { useStatelyUi } from '@/index';
import { log } from '@/utils';

/*
TODOs:
1. Empty array should NOT disable save unless value differs from formData
*/

export type ArrayEditProps<Schema extends Schemas = Schemas> = FieldEditProps<
  Schema,
  Schema['plugin']['Nodes']['array'],
  unknown[]
>;

/**
 * Array field component - handles Vec<T> in Rust
 * Uses explicit save pattern with dirty tracking
 */
export function ArrayEdit<Schema extends Schemas = Schemas>({
  formId,
  label,
  node,
  value,
  onChange,
  isRequired,
  isWizard,
}: ArrayEditProps<Schema>) {
  const { schema, plugins } = useStatelyUi<Schema>();

  // Defensive: ensure value is actually an array
  const safeValue = Array.isArray(value) ? value : [];

  if (!Array.isArray(safeValue)) {
    log.error('Core', 'ArrayEdit received non-array value');
  }

  // Initialize formData with value from parent
  const [formData, setFormData] = useState<any[]>(safeValue);
  const [isDirty, setIsDirty] = useState(false);

  const instanceFormId = useId();

  const itemNode = node.items;

  // Update formData when value changes (e.g., when API data loads)
  useEffect(() => {
    if (Array.isArray(value) && !isDirty) {
      setFormData(value);
    }
  }, [value, isDirty]);

  // Get item label for Link types
  const getItemLabel = (index: number, item: any) => {
    if (itemNode.nodeType === CoreNodeType.Link) {
      const targetName =
        schema.data.entityDisplayNames?.[itemNode.targetType] || 'Link Array Value';

      // If this is a reference mode Link, show the ref name
      if (item?.ref) {
        return `${targetName} ${index + 1}: ${item.ref}`;
      }

      // Otherwise show numbered label
      return `${targetName} ${index + 1}`;
    }
    return `Array Value ${index + 1}`;
  };

  // Validate array - just check presence if required (items validate themselves)
  const isValid = !isRequired || (Array.isArray(formData) && formData.length > 0);

  // Handle save - notify parent with current formData
  const handleSave = useCallback(() => {
    if (!isValid) return;
    onChange(formData);
    setIsDirty(false);
  }, [formData, onChange, isValid]);

  const handleAdd = useCallback(() => {
    const defaultValue = plugins.core.utils?.getDefaultValue(itemNode);
    setFormData((prev: any[]) => [...prev, defaultValue]);
    setIsDirty(true);
  }, [itemNode, plugins.core.utils?.getDefaultValue]);

  const handleRemove = useCallback((index: number) => {
    setFormData((prev: any[]) => prev.filter((_: any, i: number) => i !== index));
    setIsDirty(true);
  }, []);

  const handleChange = useCallback((index: number, itemValue: any) => {
    setFormData((prev: any[]) => {
      const newValue = [...prev];
      newValue[index] = itemValue;
      return newValue;
    });
    setIsDirty(true);
  }, []);

  const isItemPrimitive = isPrimitiveNodeLike(node.items);
  const itemPrimitiveType =
    node.items.nodeType === CoreNodeType.Primitive ? node.items.primitiveType : null;

  // Render compact version for primitive arrays (strings, numbers, booleans)
  // Full card rendering for complex arrays (objects, nested structures)
  return (
    <div className="space-y-3">
      {formData.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center">
          No items yet. Click "Add Item" to get started.
        </p>
      ) : (
        <div className="space-y-4 p-4 border-2 border-dashed border-border bg-muted/10 rounded-lg">
          <FieldSet className="min-w-0 flex-1">
            {formData.map((item: any, index: number) => {
              const itemLabel = getItemLabel(index, item);
              const fieldFormId = generateFieldFormId({
                fieldType: itemNode.nodeType,
                formId,
                instanceFormId,
                propertyName: itemLabel,
              });

              // Primitive displays differently
              return isItemPrimitive ? (
                <Field
                  className="min-w-0 flex-row flex gap-2"
                  key={`${node.nodeType}-${itemNode.nodeType}-${itemPrimitiveType ?? 'other'}-${index}`}
                >
                  <ArrayIndex index={index + 1} />

                  {/* Field */}
                  <div className="flex-auto">
                    <BaseForm.FieldEdit
                      formId={fieldFormId}
                      node={itemNode}
                      onChange={newValue => handleChange(index, newValue)}
                      value={item}
                    />
                  </div>

                  {/* Remove */}
                  <div className="max-w-8">
                    <Button
                      className={cn(
                        'text-destructive cursor-pointer',
                        'hover:text-destructive hover:bg-destructive/10',
                      )}
                      onClick={() => handleRemove(index)}
                      size="icon-sm"
                      type="button"
                      variant="secondary"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </Field>
              ) : (
                // Complex fields
                <Field key={`${itemNode.nodeType}-${index}`}>
                  <div className="flex items-center justify-between px-3 pt-2">
                    <h6 className="text-sm font-mono flex items-center">
                      <Dot />
                      {itemLabel}
                    </h6>
                    <Button
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemove(index)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <Trash2 className="w-8 h-8" /> Remove
                    </Button>
                  </div>

                  {/*Field*/}
                  <BaseForm.FieldEdit
                    formId={fieldFormId}
                    isWizard={isWizard}
                    label={itemLabel}
                    node={itemNode}
                    onChange={newValue => handleChange(index, newValue)}
                    value={item}
                  />
                </Field>
              );
            })}
          </FieldSet>
        </div>
      )}

      {/* Add button */}
      <div className="flex items-center flex-1">
        <Button
          className="h-8 flex-1 cursor-pointer"
          onClick={handleAdd}
          size="sm"
          type="button"
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add New Item
        </Button>
      </div>

      {/* TODO: Remove - Showing the button when not valid is wrong */}
      {/* Save button */}
      {isDirty && (
        <GlowingSave
          isDisabled={!isValid}
          label={label ? `'${label}' Array` : 'Array'}
          mode="edit"
          onCancel={() => {
            setFormData(safeValue);
            setIsDirty(false);
          }}
          onSave={handleSave}
          size="sm"
        />
      )}
    </div>
  );
}
