import type { CoreRecursiveRefNode, CoreSchemas } from "@/core";
import { useStatelyUi } from "@/context";
import { FieldEdit } from "../field-edit";
import type { EditFieldProps } from "../types";

export type RecursiveRefEditProps<Schema extends CoreSchemas = CoreSchemas> =
  EditFieldProps<Schema, CoreRecursiveRefNode<Schema>>;

export function RecursiveRefEdit<Schema extends CoreSchemas = CoreSchemas>(
  props: RecursiveRefEditProps<Schema>,
) {
  const { schema } = useStatelyUi();
  // Look up the referenced schema and recurse
  const referencedSchema = schema.data.nodes[props.node.refName];
  if (!referencedSchema) {
    return (
      <div className="p-4 bg-muted rounded-md text-sm text-destructive">
        Unknown schema reference: {props.node.refName}
      </div>
    );
  }
  // Recursively render with the looked-up schema
  return <FieldEdit {...props} node={referencedSchema} />;
}
