import { Input } from '@statelyjs/ui/components/base/input';
import { Switch } from '@statelyjs/ui/components/base/switch';
import type { FieldEditProps } from '@statelyjs/ui/registry';
import type { Schemas } from '@/core/schema';
import { PrimitiveStringEdit } from './primitive-string';

export type PrimitiveEditProps<Schema extends Schemas = Schemas> = FieldEditProps<
  Schema,
  Schema['plugin']['Nodes']['primitive'],
  string | number | null | undefined
>;

/**
 * Primitive field component - handles basic types: string, number, integer, boolean
 */
export function PrimitiveEdit<Schema extends Schemas = Schemas>({
  formId,
  node,
  value,
  onChange,
  placeholder,
}: PrimitiveEditProps<Schema>) {
  // Primitives call onChange immediately - no validation needed here
  // Validation happens at the compound level (ObjectField, ArrayField, etc.)
  switch (node.primitiveType) {
    case 'string':
      return (
        <PrimitiveStringEdit<Schema>
          formId={formId}
          node={node}
          onChange={onChange}
          placeholder={placeholder}
          value={value}
        />
      );

    case 'number':
    case 'integer':
      return (
        <Input
          id={formId}
          max={node.maximum}
          min={node.minimum}
          onChange={e => {
            const val = e.target.value;
            onChange(val === '' ? null : Number.parseFloat(val));
          }}
          placeholder={placeholder ? `Enter ${placeholder.toLowerCase()}...` : 'Enter value'}
          type="number"
          value={value ?? ''}
        />
      );

    case 'boolean':
      return (
        <div className="flex items-center space-x-2">
          <Switch
            checked={Boolean(value)}
            id={formId}
            onCheckedChange={checked => onChange(checked as any)}
          />
        </div>
      );

    default:
      return null;
  }
}
