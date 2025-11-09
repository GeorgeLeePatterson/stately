import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import { Field } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStatelyUi } from '@/context';
import type { EditFieldProps } from '../types';

export type EnumEditProps<Config extends StatelyConfig = StatelyConfig> = EditFieldProps<
  Config,
  StatelySchemas<Config>['EnumNode'],
  string
>;

/**
 * Enum field component - handles string enums with fixed set of values
 * Calls onChange immediately (primitive-like behavior)
 */
export function EnumEdit<Config extends StatelyConfig = StatelyConfig>({
  formId,
  node,
  value,
  onChange,
  placeholder,
}: EnumEditProps<Config>) {
  const { integration } = useStatelyUi();

  return (
    <Field>
      <Select value={value || ''} onValueChange={onChange}>
        <SelectTrigger id={formId} className="bg-background">
          <SelectValue
            placeholder={placeholder ? `Select ${placeholder.toLowerCase()}...` : 'Select value'}
          />
        </SelectTrigger>
        <SelectContent>
          {node.values.map((option: string) => (
            <SelectItem key={option} value={option}>
              {integration.helpers.generateFieldLabel(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
