import { generateFieldFormId } from '@statelyjs/ui';
import { DescriptionLabel } from '@statelyjs/ui/components';
import { Card, CardContent } from '@statelyjs/ui/components/base/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@statelyjs/ui/components/base/select';
import { BaseForm, type FieldEditProps } from '@statelyjs/ui/form';
import { useEffect, useState } from 'react';
import type { Schemas } from '@/core/schema';
import { useStatelyUi } from '@/index';

export type TaggedUnionEditProps<Schema extends Schemas = Schemas> = FieldEditProps<
  Schema,
  Schema['plugin']['Nodes']['taggedUnion']
>;

/**
 * Tagged union field component - handles Rust enums with explicit discriminator
 * Example: #[serde(tag = "type")] produces { type: "foo", ...fields }
 *
 * Data structure:
 * - discriminator field (e.g., "type") contains the variant tag
 * - Additional fields are the variant's data
 * - Example: { type: "database", host: "localhost", port: 5432 }
 *
 * Uses inline onChange pattern - the discriminant and value are resolved
 * through inner field saves, so no additional save button is needed here
 */
export function TaggedUnionEdit<Schema extends Schemas = Schemas>({
  formId,
  node,
  value,
  onChange,
  isWizard,
}: TaggedUnionEditProps<Schema>) {
  const { plugins, utils } = useStatelyUi<Schema>();
  const discriminatorField = node.discriminator;

  // Local state for current data
  const [formData, setFormData] = useState<any>(value ?? {});

  // Update formData when value changes (e.g., when API data loads)
  useEffect(() => {
    if (value) setFormData(value);
  }, [value]);

  // Extract current tag from discriminator field
  const currentTag: string | null = formData[discriminatorField] || null;

  // Find the current variant schema
  const currentVariant = currentTag
    ? node.variants.find((variant: (typeof node.variants)[number]) => variant.tag === currentTag)
    : null;

  // Handle discriminator change - propagate immediately
  const handleDiscriminatorChange = (newTag: string) => {
    const variant = node.variants.find(
      (candidate: (typeof node.variants)[number]) => candidate.tag === newTag,
    );
    if (!variant) return;

    // Create new value with discriminator and default values for variant fields
    const defaultVariantData = variant.schema
      ? plugins.core.utils?.getDefaultValue(variant.schema)
      : {};

    // Merge discriminator with variant data
    const newValue = {
      [discriminatorField]: newTag,
      ...(typeof defaultVariantData === 'object' && defaultVariantData !== null
        ? defaultVariantData
        : {}),
    };

    setFormData(newValue);
    onChange(newValue);
  };

  // Handle field change within the selected variant - propagate immediately
  const handleFieldChange = (fieldName: string, fieldValue: any) => {
    // Preserve discriminator and update the specific field
    const newValue = { ...formData, [fieldName]: fieldValue };
    setFormData(newValue);
    onChange(newValue);
  };

  const discriminatorLabel = utils?.generateFieldLabel(discriminatorField);

  return (
    <div className="space-y-3 min-w-0">
      <div className="flex flex-col gap-2">
        <Select onValueChange={handleDiscriminatorChange} value={currentTag || ''}>
          <SelectTrigger id={formId}>
            <SelectValue
              placeholder={`Select ${discriminatorLabel?.toLowerCase() || 'Variant'}...`}
            />
          </SelectTrigger>
          <SelectContent>
            {node.variants.map((variant: (typeof node.variants)[number]) => (
              <SelectItem key={variant.tag} value={variant.tag}>
                {utils?.generateFieldLabel(variant.tag)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {currentVariant?.schema?.description && (
          <DescriptionLabel>{currentVariant.schema.description}</DescriptionLabel>
        )}
      </div>

      {currentVariant?.schema && currentTag && (
        <Card>
          <CardContent className="space-y-4">
            {currentVariant.schema.nodeType === 'object' &&
              Object.entries(currentVariant.schema.properties || {}).map(
                ([fieldName, fieldSchema]) => {
                  const isRequired = currentVariant.schema?.required?.includes(fieldName);
                  const fieldValue = formData[fieldName];
                  const fieldFormId = generateFieldFormId(fieldSchema.nodeType, fieldName, formId);

                  return (
                    <div key={fieldName}>
                      <BaseForm.FieldEdit<Schema>
                        formId={fieldFormId}
                        isRequired={isRequired}
                        isWizard={isWizard}
                        label={utils?.generateFieldLabel(fieldName)}
                        node={fieldSchema}
                        onChange={newValue => handleFieldChange(fieldName, newValue)}
                        value={fieldValue}
                      />
                    </div>
                  );
                },
              )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
