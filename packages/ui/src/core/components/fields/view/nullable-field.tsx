import type { CoreNullableNode, CoreSchemas } from "@/core";
import { NotSet } from "@/core/components/base/not-set";
import { FieldView } from "@/base/form/field-view";
import type { ViewFieldProps } from "@/base/form/field-view";

export type NullableViewProps<Schema extends CoreSchemas = CoreSchemas> =
  ViewFieldProps<Schema, CoreNullableNode<Schema>>;

export function NullableView<Schema extends CoreSchemas = CoreSchemas>({
  value,
  node,
}: NullableViewProps<Schema>) {
  if (!value) return <NotSet />;
  return <FieldView node={node.innerSchema} value={value} />;
}
