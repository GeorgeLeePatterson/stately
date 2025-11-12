import type { CoreSchemas, CoreUntaggedEnumNode } from "@/core";
import { FieldItem } from "@/core/components/base/array";
import { SimpleLabel } from "@/core/components/base/simple-label";
import { FieldView } from "../field-view";
import type { ViewFieldProps } from "../types";

export type UntaggedEnumViewProps<Schema extends CoreSchemas = CoreSchemas> =
  ViewFieldProps<Schema, CoreUntaggedEnumNode<Schema>>;

export function UntaggedEnumView<Schema extends CoreSchemas = CoreSchemas>({
  value,
  node,
}: UntaggedEnumViewProps<Schema>) {
  const unionValue = value as Record<string, unknown>;

  // Find the active variant by looking for which tag key exists in the value
  const activeVariant = node.variants.find(
    (variant: (typeof node.variants)[number]) => variant.tag in unionValue,
  );

  if (!activeVariant) {
    return (
      <FieldItem>
        <pre className="text-sm bg-muted p-3 rounded-lg overflow-auto max-h-64">
          {JSON.stringify(value, null, 2)}
        </pre>
      </FieldItem>
    );
  }

  // Extract the inner value for this variant
  const innerValue = unionValue[activeVariant.tag];

  return (
    <EnumFieldView
      tag={activeVariant.tag}
      node={activeVariant.schema}
      value={innerValue}
    />
  );
}

export function EnumFieldView<Schema extends CoreSchemas = CoreSchemas>({
  tag,
  node,
  value,
}: {
  tag: string;
  node: Schema["AnyNode"];
  value: unknown;
}) {
  return (
    <div className="min-w-0 flex flex-col px-3 gap-3">
      <div className="text-base font-semibold flex gap-2 items-baseline">
        <SimpleLabel>Selected:</SimpleLabel>
        <span className="uppercase">{tag}</span>
      </div>
      <div className="flex flex-col gap-2">
        <SimpleLabel>Configuration:</SimpleLabel>
        <FieldView node={node} value={value} />
      </div>
    </div>
  );
}
