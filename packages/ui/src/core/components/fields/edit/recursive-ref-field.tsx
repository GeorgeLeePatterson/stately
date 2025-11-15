import type { CoreRecursiveRefNode } from "@/core";
import { useStatelyUi } from "@/context";
import { FieldEdit } from "@/base/form/field-edit";
import type { EditFieldProps } from "@/base/form/field-edit";
import { Schemas } from "@stately/schema";

export type RecursiveRefEditProps<Schema extends Schemas = Schemas> =
  EditFieldProps<Schema, CoreRecursiveRefNode<Schema>>;

export function RecursiveRefEdit<Schema extends Schemas = Schemas>(
  props: RecursiveRefEditProps<Schema>,
) {
  const { schema } = useStatelyUi();
  // Look up the referenced schema and recurse
  const referencedSchema =
    schema.schema.nodes[props.node.refName as keyof typeof schema.schema.nodes];
  if (!referencedSchema) {
    return (
      <div className="p-4 bg-muted rounded-md text-sm text-destructive">
        Unknown schema reference: {String(props.node.refName)}
      </div>
    );
  }
  // Recursively render with the looked-up schema
  return <FieldEdit {...props} node={referencedSchema} />;
}
