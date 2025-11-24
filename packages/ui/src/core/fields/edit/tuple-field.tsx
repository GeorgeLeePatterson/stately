import type { Schemas } from '@stately/schema';
import { useCallback, useState } from 'react';
import { GlowingSave } from '@/base/components/glowing-save';
import type { FieldEditProps } from '@/base/form/field-edit';
import { FieldEdit } from '@/base/form/field-edit';
import { FieldSet } from '@/base/ui/field';

export type TupleEditProps<Schema extends Schemas = Schemas> = FieldEditProps<
  Schema,
  Schema['plugin']['Nodes']['tuple'],
  unknown[]
>;

/**
 * Tuple field component - handles fixed-length heterogeneous arrays
 * Uses explicit save pattern with dirty tracking
 */
export function TupleEdit<Schema extends Schemas = Schemas>({
  formId,
  label,
  description,
  node,
  value,
  onChange,
  isRequired,
  isWizard,
}: TupleEditProps<Schema>) {
  const [formData, setFormData] = useState<any[]>(value || []);
  const [isDirty, setIsDirty] = useState(false);
  const [firstSet, setFirstSet] = useState(false);

  // Validate tuple - simple check that all items present if required (items validate themselves)
  const isValid = !isRequired || (Array.isArray(formData) && formData.length === node.items.length);

  const twoTuple = node.items.length === 2;

  // Handle save
  const handleSave = useCallback(() => {
    if (!isValid) return;
    onChange(formData);
    setIsDirty(false);
  }, [formData, isValid, onChange]);

  const handleFieldChange = useCallback(
    (index: number, newValue: any) => {
      const newArray = [...formData];
      newArray[index] = newValue;
      setFormData(newArray);
      setIsDirty(true);
      if (index === 0) {
        setFirstSet(true);
      }
    },
    [formData],
  );

  if (!Array.isArray(value) && typeof value !== 'object') {
    console.warn('TupleField edit, unable to render: ', { label, node, value });
    return null;
  }

  if (node.items.length === 0) {
    console.warn('TupleField edit, no items: ', { label, node, value });
    return null;
  }

  return (
    <div className="space-y-2 border-l-4 border-border rounded-xs pl-4 py-3">
      <div className="font-medium">{label}</div>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <div className="space-y-2">
        <FieldEdit<Schema>
          formId={formId}
          label={twoTuple ? 'Key' : `${label} 1`}
          node={node.items[0]}
          onChange={newValue => handleFieldChange(0, newValue)}
          value={formData[0]}
        />
        {node.items.length > 1 && (
          <FieldSet className="min-w-0" disabled={!firstSet}>
            {node.items.slice(1).map((itemNode: any, idx: number) => {
              const index = idx + 1;
              const itemLabel = twoTuple ? 'Value' : `${label} ${index + 1}`;
              return (
                <div key={`${itemLabel}-${index}`}>
                  <FieldEdit
                    formId={`tuple-${formId}-${idx}`}
                    isWizard={isWizard}
                    label={itemLabel}
                    node={itemNode}
                    onChange={newValue => handleFieldChange(index, newValue)}
                    value={formData[index]}
                  />
                </div>
              );
            })}
          </FieldSet>
        )}
      </div>

      {/* Save/Cancel buttons */}
      {!isWizard && isDirty && (
        <GlowingSave
          isDisabled={!isValid}
          label={label ? `${label} Tuple` : 'Tuple'}
          mode="edit"
          onCancel={() => {
            setFormData(value || []);
            setIsDirty(false);
          }}
          onSave={handleSave}
          size="sm"
        />
      )}
    </div>
  );
}
