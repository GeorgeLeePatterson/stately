import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { EditFieldProps } from '../types';
import { PrimitiveStringEdit } from './primitive-string';

export type PrimitiveEditProps<Config extends StatelyConfig = StatelyConfig> = EditFieldProps<
  Config,
  StatelySchemas<Config>['PrimitiveNode'],
  string | number | null | undefined
>;

/**
 * Primitive field component - handles basic types: string, number, integer, boolean
 */
export function PrimitiveEdit<Config extends StatelyConfig = StatelyConfig>({
  formId,
  node,
  value,
  onChange,
  placeholder,
}: PrimitiveEditProps<Config>) {
  // Primitives call onChange immediately - no validation needed here
  // Validation happens at the compound level (ObjectField, ArrayField, etc.)
  switch (node.primitiveType) {
    case 'string':
      return (
        <PrimitiveStringEdit<Config>
          formId={formId}
          node={node}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      );

    case 'number':
    case 'integer':
      return (
        <Input
          id={formId}
          type="number"
          value={value ?? ''}
          onChange={e => {
            const val = e.target.value;
            onChange(val === '' ? null : Number.parseFloat(val));
          }}
          min={node.minimum}
          max={node.maximum}
          placeholder={placeholder ? `Enter ${placeholder.toLowerCase()}...` : 'Enter value'}
        />
      );

    case 'boolean':
      return (
        <div className="flex items-center space-x-2">
          <Switch
            id={formId}
            checked={Boolean(value)}
            onCheckedChange={checked => onChange(checked as any)}
          />
        </div>
      );

    default:
      return null;
  }
}
