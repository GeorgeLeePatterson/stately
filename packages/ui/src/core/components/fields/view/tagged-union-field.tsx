import type { CoreSchemas, CoreTaggedUnionNode } from "@/core";
import { FieldItem } from "@/core/components/base/field";
import type { ViewFieldProps } from "@/base/form/field-view";
import { EnumFieldView } from "./untagged-enum-field";
import { AnyRecord } from "@stately/schema/helpers";

export type TaggedUnionViewProps<Schema extends CoreSchemas = CoreSchemas> =
  ViewFieldProps<Schema, CoreTaggedUnionNode<Schema>>;

export function TaggedUnionView<Schema extends CoreSchemas = CoreSchemas>({
  value,
  node,
}: TaggedUnionViewProps<Schema>) {
  const unionValue = value as AnyRecord;
  const discriminatorValue = unionValue[node.discriminator];

  // Find the variant by discriminator value
  const activeVariant = node.variants.find(
    (variant: (typeof node.variants)[number]) =>
      variant.tag === discriminatorValue,
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

  return (
    <EnumFieldView
      tag={activeVariant.tag}
      node={activeVariant.schema}
      value={unionValue}
    />
  );
}
