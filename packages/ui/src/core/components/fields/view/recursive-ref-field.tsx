import type { Schemas } from '@stately/schema';
import type { ViewFieldProps } from '@/base/form/field-view';
import { FieldView } from '@/base/form/field-view';
import type { CoreRecursiveRefNode } from '@/core';
import { useStatelyUi } from '@/core';

export type RecursiveRefViewProps<Schema extends Schemas = Schemas> = ViewFieldProps<
  Schema,
  CoreRecursiveRefNode<Schema>
>;

export function RecursiveRefView<Schema extends Schemas = Schemas>({
  value,
  node,
}: RecursiveRefViewProps<Schema>) {
  const { schema } = useStatelyUi();
  // Look up the referenced schema and recurse
  const referencedSchema = schema.schema.nodes[node.refName as keyof typeof schema.schema.nodes];
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
