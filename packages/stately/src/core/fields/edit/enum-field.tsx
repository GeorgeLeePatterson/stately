import { Field } from '@statelyjs/ui/components/base/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@statelyjs/ui/components/base/select';
import type { FieldEditProps } from '@statelyjs/ui/form';
import type { Schemas } from '@/core/schema';
import { useStatelyUi } from '@/index';

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
  const { utils } = useStatelyUi<Schema>();

  return (
    <Field>
      <Select onValueChange={onChange} value={value || ''}>
        <SelectTrigger className="bg-background" id={formId}>
          <SelectValue
            placeholder={placeholder ? `Select ${placeholder.toLowerCase()}...` : 'Select value'}
          />
        </SelectTrigger>
        <SelectContent>
          {node.values.map((option: string) => (
            <SelectItem key={option} value={option}>
              {utils?.generateFieldLabel(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
