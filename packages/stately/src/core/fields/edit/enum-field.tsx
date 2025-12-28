import { Field } from '@statelyjs/ui/components/base/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@statelyjs/ui/components/base/select';
import type { FieldEditProps } from '@statelyjs/ui/registry';
import type { Schemas } from '@/core/schema';

export type EnumEditProps<Schema extends Schemas = Schemas> = FieldEditProps<
  Schema,
  Schema['plugin']['Nodes']['enum'],
  string
>;

/**
 * Enum field component - handles string enums with fixed set of values
 * Calls onChange immediately (primitive-like behavior)
 */
export function EnumEdit<Schema extends Schemas = Schemas>({
  formId,
  node,
  value,
  onChange,
  placeholder,
}: EnumEditProps<Schema>) {
  return (
    <Field>
      <Select onValueChange={v => v && onChange(v)} value={value || ''}>
        <SelectTrigger className="bg-background" id={formId}>
          <SelectValue>
            {v => (v ? v : placeholder ? `Select ${placeholder}...` : 'Select value')}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {node.values.map((option: string) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
