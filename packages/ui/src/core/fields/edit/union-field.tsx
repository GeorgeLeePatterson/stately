import { useState } from 'react';
import { DescriptionLabel } from '@/base/components/description-label';
import type { FieldEditProps } from '@/base/form/field-edit';
import { FieldEdit } from '@/base/form/field-edit';
import { FieldSet } from '@/base/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/base/ui/select';
import { generateFieldFormId } from '@/base/utils';
import { CoreNodeType, PrimitiveType, type Schemas } from '@/core/schema';
import { useStatelyUi } from '@/index';

export type UnionEditProps<Schema extends Schemas = Schemas> = FieldEditProps<
  Schema,
  Schema['plugin']['Nodes']['union'],
  any
>;

/**
 * Generate a label for a union variant.
 *
 * Priority:
 * 1. variant.label (from codegen, sourced from OpenAPI description)
 * 2. schema.description
 * 3. Schema-derived hint (field names, type)
 *
 * Always prefixed with "Option N:" for stable reference.
 */
function generateVariantLabel(variant: { schema: any; label?: string }, index: number): string {
  const prefix = `Option ${index + 1}`;
  const schema = variant.schema;

  // Use explicit label from codegen (OpenAPI description at variant level)
  if (variant.label) return `${prefix}: ${variant.label}`;

  // Use schema's own description
  if (schema?.description) return `${prefix}: ${schema.description}`;

  // Fall back to schema-derived hints
  if (schema?.nodeType === CoreNodeType.Object && schema.properties) {
    const keys = Object.keys(schema.properties);
    if (keys.length > 0) {
      const hint = keys.slice(0, 3).join(', ') + (keys.length > 3 ? '...' : '');
      return `${prefix}: ${hint}`;
    }
  }

  if (schema?.nodeType === CoreNodeType.Primitive) return `${prefix}: ${schema.primitiveType}`;
  if (schema?.nodeType === CoreNodeType.Array) return `${prefix}: Array`;
  if (schema?.nodeType === CoreNodeType.Enum) return `${prefix}: Enum`;

  return prefix;
}

/**
 * Attempt to detect which variant the current value matches
 */
function detectCurrentVariant(
  value: any,
  variants: ReadonlyArray<{ schema: any; label?: string }>,
): number | null {
  if (value === undefined || value === null) return null;

  for (let i = 0; i < variants.length; i++) {
    const schema = variants[i].schema;
    if (!schema) continue;

    // Simple heuristics to match value to schema
    if (schema.nodeType === CoreNodeType.Primitive) {
      if (schema.primitiveType === PrimitiveType.String && typeof value === 'string') return i;
      if (schema.primitiveType === PrimitiveType.Number && typeof value === 'number') return i;
      if (schema.primitiveType === PrimitiveType.Integer && typeof value === 'number') return i;
      if (schema.primitiveType === PrimitiveType.Boolean && typeof value === 'boolean') return i;
    }

    if (
      schema.nodeType === CoreNodeType.Object &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      // Check if value has the required properties
      const required = schema.required || [];
      const hasRequired = required.every((key: string) => key in value);
      if (hasRequired) return i;
    }

    if (schema.nodeType === CoreNodeType.Array && Array.isArray(value)) return i;
  }

  return null;
}

/**
 * Union field component - handles generic oneOf/anyOf unions
 *
 * Used when the parser couldn't identify a specific tagged/untagged pattern.
 * User selects which variant shape to use, then fills in that schema.
 * The value is the raw data for the selected variant - no tag wrapping.
 */
export function UnionEdit<Schema extends Schemas = Schemas>({
  formId,
  label,
  node,
  value,
  onChange,
  isWizard,
}: UnionEditProps<Schema>) {
  const { plugins } = useStatelyUi<Schema>();

  // Track selected variant index
  const detectedIndex = detectCurrentVariant(value, node.variants);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(detectedIndex);

  const currentVariant = selectedIndex !== null ? node.variants[selectedIndex] : null;

  // Handle variant selection change
  const handleVariantChange = (indexStr: string) => {
    const newIndex = Number.parseInt(indexStr, 10);
    setSelectedIndex(newIndex);

    const variant = node.variants[newIndex];
    if (!variant) return;

    // Get default value for the variant's schema
    const defaultValue = variant.schema
      ? plugins.core.utils?.getDefaultValue(variant.schema)
      : null;
    onChange(defaultValue);
  };

  return (
    <div className="space-y-3 border rounded-md p-2 min-w-0">
      <div className="flex flex-col gap-2 max-w-full min-w-0">
        <Select onValueChange={handleVariantChange} value={selectedIndex?.toString() ?? ''}>
          <SelectTrigger className="max-w-full" id={formId}>
            <SelectValue placeholder={`Select ${label || 'variant'}...`} />
          </SelectTrigger>
          <SelectContent className="max-w-[80dvw] overflow-hidden">
            {node.variants.map((variant, index) => (
              <SelectItem
                className="flex flex-nowrap max-w-full overflow-hidden"
                key={`${variant.label ?? variant.schema.nodeType}-${index}`}
                value={index.toString()}
              >
                <span className="flex-1 shrink-0 truncate p-r-4">
                  {generateVariantLabel(variant, index)}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {currentVariant?.schema?.description && (
          <DescriptionLabel>{currentVariant.schema.description}</DescriptionLabel>
        )}
      </div>

      {currentVariant?.schema && selectedIndex !== null && (
        <FieldSet className="p-2 min-w-0">
          <FieldEdit<Schema>
            formId={generateFieldFormId(
              currentVariant.schema.nodeType,
              `${currentVariant?.label || 'union-field'}-${selectedIndex}`,
              formId,
            )}
            isWizard={isWizard}
            label={generateVariantLabel(currentVariant, selectedIndex)}
            node={currentVariant.schema}
            onChange={onChange}
            value={value}
          />
        </FieldSet>
      )}
    </div>
  );
}
