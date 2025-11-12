import type { CoreEnumNode, CoreSchemas } from "@/core";
import { useStatelyUi } from "@/context";
import { Field } from "@/core/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import type { EditFieldProps } from "../types";

export type EnumEditProps<Schema extends CoreSchemas = CoreSchemas> =
  EditFieldProps<Schema, CoreEnumNode<Schema>, string>;

/**
 * Enum field component - handles string enums with fixed set of values
 * Calls onChange immediately (primitive-like behavior)
 */
export function EnumEdit<Schema extends CoreSchemas = CoreSchemas>({
  formId,
  node,
  value,
  onChange,
  placeholder,
}: EnumEditProps<Schema>) {
  const { schema } = useStatelyUi();

  return (
    <Field>
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger id={formId} className="bg-background">
          <SelectValue
            placeholder={
              placeholder
                ? `Select ${placeholder.toLowerCase()}...`
                : "Select value"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {node.values.map((option: string) => (
            <SelectItem key={option} value={option}>
              {schema.utils.generateFieldLabel(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
