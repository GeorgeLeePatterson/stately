import type { CoreSchemas, CoreUntaggedEnumNode } from "@/core";
import { useStatelyUi } from "@/context";
import { DescriptionLabel } from "@/core/components/base/description";
import { FieldSet } from "@/core/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { FieldEdit } from "@/base/form/field-edit";
import type { EditFieldProps } from "@/base/form/field-edit";
import { useCoreStatelyUi } from "@/core";

export type UntaggedEnumEditProps<Schema extends CoreSchemas = CoreSchemas> =
  EditFieldProps<Schema, CoreUntaggedEnumNode<Schema>, any>;

/**
 * Untagged Enum field component - handles Rust untagged enums
 * Example: { database: {...} } | { shell: {...} }
 * The tag is inferred from the single property key in the object
 * Uses explicit save pattern with dirty tracking
 */
export function UntaggedEnumEdit<Schema extends CoreSchemas = CoreSchemas>({
  formId,
  label,
  node,
  value,
  onChange,
  isWizard,
}: UntaggedEnumEditProps<Schema>) {
  const { schema, plugins } = useCoreStatelyUi();

  // Extract current tag from the single property key
  let currentTag: string | null = null;

  if (typeof value === "object" && value !== null && value !== undefined) {
    const keys = Object.keys(value);
    currentTag = keys.length > 0 ? keys[0] : null;
  }

  // Find the current variant schema
  const currentVariant = currentTag
    ? node.variants.find(
        (variant: (typeof node.variants)[number]) => variant.tag === currentTag,
      )
    : null;

  // Handle variant selection change
  const handleVariantChange = (newTag: string) => {
    const variant = node.variants.find(
      (candidate: (typeof node.variants)[number]) => candidate.tag === newTag,
    );
    if (!variant) return;
    // Get default value for the variant's schema and wrap with tag as key: { variant: {...} }
    onChange({ [newTag]: plugins.core.utils?.getDefaultValue(variant.schema) });
  };

  // Handle field change - the child passes the complete variant data
  const handleFieldChange = (tag: string, fieldValue: any) => {
    // fieldValue is the complete data for this variant. Just wrap it with the tag key
    onChange({ [tag]: fieldValue });
  };

  return (
    <div className="space-y-3 border rounded-md p-2 min-w-0">
      <div className="flex flex-col gap-2">
        <Select value={currentTag || ""} onValueChange={handleVariantChange}>
          <SelectTrigger id={formId}>
            <SelectValue placeholder={`Select ${label || "variant"}...`} />
          </SelectTrigger>
          <SelectContent>
            {node.variants.map((variant: (typeof node.variants)[number]) => (
              <SelectItem key={variant.tag} value={variant.tag}>
                {plugins.core.utils?.generateFieldLabel(variant.tag)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {currentVariant?.schema.description && (
          <DescriptionLabel>
            {currentVariant.schema.description}
          </DescriptionLabel>
        )}
      </div>

      {currentVariant && currentTag && (
        <FieldSet className="p-2 min-w-0">
          {/* Render the variant schema directly */}
          <FieldEdit
            formId={`untagged-enum-${currentTag}-${formId}`}
            node={currentVariant.schema}
            value={value[currentTag]}
            onChange={(newValue) => handleFieldChange(currentTag, newValue)}
            label={`${plugins.core.utils?.generateFieldLabel(currentTag)} Configuration`}
            isWizard={isWizard}
          />
        </FieldSet>
      )}
    </div>
  );
}
