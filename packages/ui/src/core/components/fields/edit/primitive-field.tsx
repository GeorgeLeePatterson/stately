import type { CorePrimitiveNode } from "@/core";
import { Input } from "@/core/components/ui/input";
import { Switch } from "@/core/components/ui/switch";
import type { EditFieldProps } from "@/base/form/field-edit";
import { PrimitiveStringEdit } from "./primitive-string";
import { Schemas } from "@stately/schema";

export type PrimitiveEditProps<Schema extends Schemas = Schemas> =
  EditFieldProps<
    Schema,
    CorePrimitiveNode,
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
    case "string":
      return (
        <PrimitiveStringEdit<Schema>
          formId={formId}
          node={node}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      );

    case "number":
    case "integer":
      return (
        <Input
          id={formId}
          type="number"
          value={value ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            onChange(val === "" ? null : Number.parseFloat(val));
          }}
          min={node.minimum}
          max={node.maximum}
          placeholder={
            placeholder
              ? `Enter ${placeholder.toLowerCase()}...`
              : "Enter value"
          }
        />
      );

    case "boolean":
      return (
        <div className="flex items-center space-x-2">
          <Switch
            id={formId}
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange(checked as any)}
          />
        </div>
      );

    default:
      return null;
  }
}
