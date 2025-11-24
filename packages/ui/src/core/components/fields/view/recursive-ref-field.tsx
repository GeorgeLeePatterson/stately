import type { Schemas } from '@stately/schema';
import type { ViewFieldProps } from '@/base/form/field-view';
import { FieldView } from '@/base/form/field-view';
import { useStatelyUi } from '@/index';

export type RecursiveRefViewProps<Schema extends Schemas = Schemas> = ViewFieldProps<
  Schema,
  Schema['plugin']['Nodes']['recursiveRef']
>;

export function RecursiveRefView<Schema extends Schemas = Schemas>({
  value,
  node,
}: RecursiveRefViewProps<Schema>) {
  const { schema } = useStatelyUi<Schema>();
  // Look up the referenced schema and recurse
  const referencedSchema = schema.schema.nodes[node.refName] as any;

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
