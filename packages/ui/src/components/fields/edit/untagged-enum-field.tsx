import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import { DescriptionLabel } from '@/components/base/description';
import { FieldSet } from '@/components/ui/field';
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

export type UntaggedEnumEditProps<Config extends StatelyConfig = StatelyConfig> = EditFieldProps<
  Config,
  StatelySchemas<Config>['UntaggedEnumNode'],
  any
>;

/**
 * Untagged Enum field component - handles Rust untagged enums
 * Example: { database: {...} } | { shell: {...} }
 * The tag is inferred from the single property key in the object
 * Uses explicit save pattern with dirty tracking
 */
export function UntaggedEnumEdit<Config extends StatelyConfig = StatelyConfig>({
  formId,
  label,
  node,
  value,
  onChange,
  isWizard,
}: UntaggedEnumEditProps<Config>) {
  const { integration } = useStatelyUi();
  // Extract current tag from the single property key
  let currentTag: string | null = null;

  if (typeof value === 'object' && value !== null && value !== undefined) {
    const keys = Object.keys(value);
    currentTag = keys.length > 0 ? keys[0] : null;
  }

  // Find the current variant schema
  const currentVariant = currentTag ? node.variants.find(v => v.tag === currentTag) : null;

  // Handle variant selection change
  const handleVariantChange = (newTag: string) => {
    const variant = node.variants.find(v => v.tag === newTag);
    if (!variant) return;
    // Get default value for the variant's schema and wrap with tag as key: { variant: {...} }
    onChange({ [newTag]: integration.helpers.getDefaultValue(variant.schema) });
  };

  // Handle field change - the child passes the complete variant data
  const handleFieldChange = (tag: string, fieldValue: any) => {
    // fieldValue is the complete data for this variant. Just wrap it with the tag key
    onChange({ [tag]: fieldValue });
  };

  return (
    <div className="space-y-3 border rounded-md p-2 min-w-0">
      <div className="flex flex-col gap-2">
        <Select value={currentTag || ''} onValueChange={handleVariantChange}>
          <SelectTrigger id={formId}>
            <SelectValue placeholder={`Select ${label || 'variant'}...`} />
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
        <FieldSet className="p-2 min-w-0">
          {/* Render the variant schema directly */}
          <FieldEdit
            formId={`untagged-enum-${currentTag}-${formId}`}
            node={currentVariant.schema}
            value={value[currentTag]}
            onChange={newValue => handleFieldChange(currentTag, newValue)}
            label={`${integration.helpers.generateFieldLabel(currentTag)} Configuration`}
            isWizard={isWizard}
          />
        </FieldSet>
      )}
    </div>
  );
}
