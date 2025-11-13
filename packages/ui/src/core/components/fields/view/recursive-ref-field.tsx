import type { CoreRecursiveRefNode, CoreSchemas } from "@/core";
import { useStatelyUi } from "@/context";
import { FieldView } from "@/base/form/field-view";
import type { ViewFieldProps } from "@/base/form/field-view";

export type RecursiveRefViewProps<Schema extends CoreSchemas = CoreSchemas> =
  ViewFieldProps<Schema, CoreRecursiveRefNode<Schema>>;

export function RecursiveRefView<Schema extends CoreSchemas = CoreSchemas>({
  value,
  node,
}: RecursiveRefViewProps<Schema>) {
  const { schema } = useStatelyUi();
  // Look up the referenced schema and recurse
  const referencedSchema =
    schema.schema.nodes[node.refName as keyof typeof schema.schema.nodes];
  if (!referencedSchema) {
    return (
      <div className="p-4 bg-muted rounded-md text-sm text-destructive">
        Unknown schema reference: {String(node.refName)}
      </div>
    );
  }
  // Recursively render with the looked-up schema
  return <FieldView node={referencedSchema} value={value} />;
}
