import { generateFieldFormId } from '@statelyjs/ui';
import { DescriptionLabel } from '@statelyjs/ui/components';
import { FieldSet } from '@statelyjs/ui/components/base/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@statelyjs/ui/components/base/select';
import { BaseForm, type FieldEditProps } from '@statelyjs/ui/form';
import type { Schemas } from '@/core/schema';
import { useStatelyUi } from '@/index';

export type UntaggedEnumEditProps<Schema extends Schemas = Schemas> = FieldEditProps<
  Schema,
  Schema['plugin']['Nodes']['untaggedEnum'],
  any
>;

/**
 * Untagged Enum field component - handles Rust untagged enums
 * Example: { database: {...} } | { shell: {...} }
 * The tag is inferred from the single property key in the object
 * Uses explicit save pattern with dirty tracking
 */
export function UntaggedEnumEdit<Schema extends Schemas = Schemas>({
  formId,
  label,
  node,
  value,
  onChange,
  isWizard,
}: UntaggedEnumEditProps<Schema>) {
  const { plugins, utils } = useStatelyUi<Schema>();

  // Extract current tag from the single property key
  let currentTag: string | null = null;

  if (typeof value === 'object' && value !== null && value !== undefined) {
    const keys = Object.keys(value);
    currentTag = keys.length > 0 ? keys[0] : null;
  }

  // Find the current variant schema
  const currentVariant = currentTag
    ? node.variants.find((variant: (typeof node.variants)[number]) => variant.tag === currentTag)
    : null;

  // Handle variant selection change
  const handleVariantChange = (newTag: string) => {
    const variant = node.variants.find(
      (candidate: (typeof node.variants)[number]) => candidate.tag === newTag,
    );
    if (!variant) return;
    // Get default value for the variant's schema and wrap with tag as key: { variant: {...} }
    onChange({
      [newTag]: variant.schema ? plugins.core.utils?.getDefaultValue(variant.schema) : {},
    });
  };

  // Handle field change - the child passes the complete variant data
  const handleFieldChange = (tag: string, fieldValue: any) => {
    // fieldValue is the complete data for this variant. Just wrap it with the tag key
    onChange({ [tag]: fieldValue });
  };

  return (
    <div className="space-y-3 border rounded-md p-2 min-w-0">
      <div className="flex flex-col gap-2">
        <Select onValueChange={v => v && handleVariantChange(v)} value={currentTag || ''}>
          <SelectTrigger id={formId}>
            <SelectValue>{v => v || `Select ${label || 'variant'}...`}</SelectValue>
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
        <FieldSet className="p-2 min-w-0">
          {/* Render the variant schema directly */}
          <BaseForm.FieldEdit<Schema>
            formId={generateFieldFormId(currentVariant.schema.nodeType, currentTag, formId)}
            isWizard={isWizard}
            label={`${utils?.generateFieldLabel(currentTag)} Configuration`}
            node={currentVariant.schema}
            onChange={newValue => handleFieldChange(currentTag, newValue)}
            value={value[currentTag]}
          />
        </FieldSet>
      )}
    </div>
  );
}
