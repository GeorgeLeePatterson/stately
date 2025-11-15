import type { CoreNullableNode } from "@/core";
import { NotSet } from "@/core/components/base/not-set";
import { FieldView } from "@/base/form/field-view";
import type { ViewFieldProps } from "@/base/form/field-view";
import { Schemas } from "@stately/schema";

export type NullableViewProps<Schema extends Schemas = Schemas> =
  ViewFieldProps<Schema, CoreNullableNode<Schema>>;

export function NullableView<Schema extends Schemas = Schemas>({
  value,
  node,
}: NullableViewProps<Schema>) {
  if (!value) return <NotSet />;
  return <FieldView node={node.innerSchema} value={value} />;
}
