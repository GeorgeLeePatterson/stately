import { FieldItem, SimpleLabel } from '@statelyjs/ui/components';
import type { FieldViewProps } from '@statelyjs/ui/form';
import { BaseForm } from '@statelyjs/ui/form';
import type { Schemas } from '@/core/schema';

export type UnionViewProps<Schema extends Schemas = Schemas> = FieldViewProps<
  Schema,
  Schema['plugin']['Nodes']['union']
>;

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

    if (schema.nodeType === 'primitive') {
      if (schema.primitiveType === 'string' && typeof value === 'string') return i;
      if (schema.primitiveType === 'number' && typeof value === 'number') return i;
      if (schema.primitiveType === 'integer' && typeof value === 'number') return i;
      if (schema.primitiveType === 'boolean' && typeof value === 'boolean') return i;
    }

    if (schema.nodeType === 'object' && typeof value === 'object' && !Array.isArray(value)) {
      const required = schema.required || [];
      const hasRequired = required.every((key: string) => key in value);
      if (hasRequired) return i;
    }

    if (schema.nodeType === 'array' && Array.isArray(value)) {
      return i;
    }
  }

  return null;
}

/**
 * Generate a label for a union variant based on its schema structure
 */
function generateVariantLabel(variant: { schema: any; label?: string }, index: number): string {
  if (variant.label) return variant.label;

  const schema = variant.schema;
  if (!schema) return `Option ${index + 1}`;

  if (schema.nodeType === 'object' && schema.properties) {
    const keys = Object.keys(schema.properties);
    if (keys.length > 0) {
      return keys.slice(0, 3).join(', ') + (keys.length > 3 ? '...' : '');
    }
  }

  if (schema.nodeType === 'primitive') {
    return schema.primitiveType;
  }

  if (schema.nodeType === 'array') {
    return 'Array';
  }

  if (schema.nodeType === 'enum') {
    return 'Enum';
  }

  return `Option ${index + 1}`;
}

/**
 * Union view component - displays a generic oneOf/anyOf value
 */
export function UnionView<Schema extends Schemas = Schemas>({
  value,
  node,
}: UnionViewProps<Schema>) {
  const variantIndex = detectCurrentVariant(value, node.variants);

  if (variantIndex === null) {
    return (
      <FieldItem>
        <pre className="text-sm bg-muted p-3 rounded-lg overflow-auto max-h-64">
          {JSON.stringify(value, null, 2)}
        </pre>
      </FieldItem>
    );
  }

  const variant = node.variants[variantIndex];
  const variantLabel = generateVariantLabel(variant, variantIndex);

  return (
    <div className="min-w-0 flex flex-col px-3 gap-3">
      <div className="text-base font-semibold flex gap-2 items-baseline">
        <SimpleLabel>Variant:</SimpleLabel>
        <span>{variantLabel}</span>
      </div>
      {variant.schema && (
        <div className="flex flex-col gap-2">
          <BaseForm.FieldView<Schema> node={variant.schema} value={value} />
        </div>
      )}
    </div>
  );
}
