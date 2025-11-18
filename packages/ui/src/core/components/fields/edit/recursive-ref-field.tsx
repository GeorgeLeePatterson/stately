import type { Schemas } from '@stately/schema';
import type { PluginNodeUnion } from '@stately/schema/plugin';
import type { EditFieldProps } from '@/base/form/field-edit';
import { FieldEdit } from '@/base/form/field-edit';
import { type CoreNodeUnion, useStatelyUi } from '@/core';

export type RecursiveRefEditProps<Schema extends Schemas = Schemas> = EditFieldProps<
  Schema,
  Schema['plugin']['Nodes']['recursiveRef']
>;

export function RecursiveRefEdit<Schema extends Schemas = Schemas>({
  node,
  ...rest
}: RecursiveRefEditProps<Schema>) {
  const { schema } = useStatelyUi();
  // Look up the referenced schema and recurse
  const referencedSchema = schema.schema.nodes[node.refName] as CoreNodeUnion<Schema>;
  if (!referencedSchema) {
    return (
      <div className="p-4 bg-muted rounded-md text-sm text-destructive">
        Unknown schema reference: {String(node.refName)}
      </div>
    );
  }
  // Recursively render with the looked-up schema
  return <FieldEdit<Schema, PluginNodeUnion<Schema>> {...rest} node={referencedSchema} />;
}
