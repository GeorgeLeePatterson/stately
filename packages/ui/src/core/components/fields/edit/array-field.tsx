import { NodeType } from '@stately/schema';
import { Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useId, useState } from 'react';
import { useStatelyUi } from '@/context';
import { ArrayIndex } from '@/core/components/base/array';
import { Button } from '@/core/components/ui/button';
import { Field, FieldSet } from '@/core/components/ui/field';
import { cn } from '@/core/lib/utils';
import type { CoreArrayNode, CoreSchemas } from '@/core';
import { GlowingSave } from '../../base/glowing-save';
import { FieldEdit } from '../field-edit';
import type { EditFieldProps } from '../types';

export type ArrayEditProps<Schema extends CoreSchemas = CoreSchemas> = EditFieldProps<
  Schema,
  CoreArrayNode<Schema>,
  unknown[]
>;

/**
 * Array field component - handles Vec<T> in Rust
 * Uses explicit save pattern with dirty tracking
 */
export function ArrayEdit<Schema extends CoreSchemas = CoreSchemas>({
  label,
  node,
  value,
  onChange,
  isRequired,
  isWizard,
}: ArrayEditProps<Schema>) {
  const { schema } = useStatelyUi();

  // Defensive: ensure value is actually an array
  const safeValue = Array.isArray(value) ? value : [];

  // Initialize formData with value from parent
  const [formData, setFormData] = useState<any[]>(safeValue);
  const [isDirty, setIsDirty] = useState(false);

  const instanceFormId = useId();
  const arrayFormId = `array-${instanceFormId}`;

  const itemNode = node.items;

  // Update formData when value changes (e.g., when API data loads)
  useEffect(() => {
    if (Array.isArray(value) && !isDirty) {
      setFormData(value);
    }
  }, [value, isDirty]);

  // Check if this is a primitive array for compact rendering
  const isPrimitiveArray = itemNode.nodeType === NodeType.Primitive;

  // Get item label for Link types
  const getItemLabel = (index: number, item: any) => {
    if (itemNode.nodeType === NodeType.Link) {
      const targetName = schema.data.entityDisplayNames?.[itemNode.targetType] || 'Item';

      // If this is a reference mode Link, show the ref name
      if (item?.ref) {
        return `${targetName} ${index + 1}: ${item.ref}`;
      }

      // Otherwise show numbered label
      return `${targetName} ${index + 1}`;
    }
    return `Value ${index + 1}`;
  };

  // Validate array - just check presence if required (items validate themselves)
  const isValid = !isRequired || (Array.isArray(formData) && formData.length > 0);

  // Handle save - notify parent with current formData
  const handleSave = useCallback(() => {
    if (!isValid) return;
    onChange(formData);
    setIsDirty(false);
  }, [formData, onChange, isValid]);

  const handleAdd = () => {
    const defaultValue = schema.utils.getDefaultValue(node);
    setFormData((prev: any[]) => [...prev, defaultValue]);
    setIsDirty(true);
  };

  const handleRemove = (index: number) => {
    setFormData((prev: any[]) => prev.filter((_: any, i: number) => i !== index));
    setIsDirty(true);
  };

  const handleChange = (index: number, itemValue: any) => {
    setFormData((prev: any[]) => {
      const newValue = [...prev];
      newValue[index] = itemValue;
      return newValue;
    });
    setIsDirty(true);
  };

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
            {formData.map((item: any, index: number) =>
              isPrimitiveArray ? (
                <Field
                  key={`${node.nodeType}-${itemNode.primitiveType}-${index}`}
                  className="min-w-0 flex-row flex gap-2"
                >
                  <ArrayIndex index={index + 1} />

                  {/* Field */}
                  <div className="flex-auto">
                    <FieldEdit
                      formId={`${arrayFormId}-${index}`}
                      node={node}
                      value={item}
                      onChange={newValue => handleChange(index, newValue)}
                    />
                  </div>

                  {/* Remove */}
                  <div className="max-w-8">
                    <Button
                      size="icon-sm"
                      type="button"
                      variant="secondary"
                      onClick={() => handleRemove(index)}
                      className={cn(
                        'text-destructive cursor-pointer',
                        'hover:text-destructive hover:bg-destructive/10',
                      )}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </Field>
              ) : (
                <Field key={`${node.nodeType}-${index}`}>
                  <div className="flex items-center justify-between px-3 pt-2">
                    <h6 className="text-sm">{getItemLabel(index, item)}</h6>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-8 h-8" /> Remove
                    </Button>
                  </div>

                  {/*Field*/}
                  <FieldEdit
                    formId={`${arrayFormId}-${index}`}
                    node={node}
                    value={item}
                    onChange={newValue => handleChange(index, newValue)}
                    label={''}
                    isWizard={isWizard}
                  />
                </Field>
              ),
            )}
          </FieldSet>
        </div>
      )}

      {/* Add button */}
      <div className="flex items-center flex-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="h-8 flex-1 cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add New Item
        </Button>
      </div>

      {/* Save button */}
      {isDirty && (
        <GlowingSave
          mode="edit"
          size="sm"
          label={label ? `${label} Array` : 'Array'}
          isDisabled={!isValid}
          onSave={handleSave}
          onCancel={() => {
            setFormData(safeValue);
            setIsDirty(false);
          }}
        />
      )}
    </div>
  );
}
