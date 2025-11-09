import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import { useEffect, useState } from 'react';
import { DescriptionLabel } from '@/components/base/description';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStatelyUi } from '@/context';
import { FieldEdit } from '../field-edit';
import type { EditFieldProps } from '../types';

export type TaggedUnionEditProps<Config extends StatelyConfig = StatelyConfig> = EditFieldProps<
  Config,
  StatelySchemas<Config>['TaggedUnionNode']
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
export function TaggedUnionEdit<Config extends StatelyConfig = StatelyConfig>({
  formId,
  node,
  value,
  onChange,
  isWizard,
}: TaggedUnionEditProps<Config>) {
  const { integration } = useStatelyUi();
  const discriminatorField = node.discriminator;

  // Local state for current data
  const [formData, setFormData] = useState<any>(value ?? {});

  // Update formData when value changes (e.g., when API data loads)
  useEffect(() => {
    if (value) {
      setFormData(value);
    }
  }, [value]);

  // Extract current tag from discriminator field
  const currentTag: string | null = formData[discriminatorField] || null;

  // Find the current variant schema
  const currentVariant = currentTag ? node.variants.find(v => v.tag === currentTag) : null;

  // Handle discriminator change - propagate immediately
  const handleDiscriminatorChange = (newTag: string) => {
    const variant = node.variants.find(v => v.tag === newTag);
    if (!variant) return;

    // Create new value with discriminator and default values for variant fields
    const defaultVariantData = integration.helpers.getDefaultValue(variant.schema);

    // Merge discriminator with variant data
    const newValue = { [discriminatorField]: newTag, ...defaultVariantData };

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

  const discriminatorLabel = integration.helpers.generateFieldLabel(discriminatorField);

  return (
    <div className="space-y-3 min-w-0">
      <div className="flex flex-col gap-2">
        <Select value={currentTag || ''} onValueChange={handleDiscriminatorChange}>
          <SelectTrigger id={formId}>
            <SelectValue placeholder={`Select ${discriminatorLabel.toLowerCase()}...`} />
          </SelectTrigger>
          <SelectContent>
            {node.variants.map(variant => (
              <SelectItem key={variant.tag} value={variant.tag}>
                {integration.helpers.generateFieldLabel(variant.tag)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {currentVariant?.schema.description && (
          <DescriptionLabel>{currentVariant.schema.description}</DescriptionLabel>
        )}
      </div>

      {currentVariant && currentTag && (
        <Card>
          <CardContent className="space-y-4">
            {/* TODO: Remove - why is this only handling objects? */}
            {currentVariant.schema.nodeType === 'object' &&
              Object.entries(currentVariant.schema.properties || {}).map(
                ([fieldName, fieldSchema]) => {
                  const isRequired = currentVariant.schema.required?.includes(fieldName);
                  const fieldValue = formData[fieldName];
                  const fieldFormId = `${fieldName}-tagged-union-${formId}`;

                  return (
                    <div key={fieldName}>
                      <FieldEdit
                        formId={fieldFormId}
                        label={integration.helpers.generateFieldLabel(fieldName)}
                        node={fieldSchema}
                        value={fieldValue}
                        onChange={newValue => handleFieldChange(fieldName, newValue)}
                        isRequired={isRequired}
                        isWizard={isWizard}
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
