import type { FieldEditProps } from '@/base/form/field-edit';
import { FieldEdit } from '@/base/form/field-edit';
import { generateFieldFormId } from '@/base/utils';
import type { Schemas } from '@/core/schema';
import { useStatelyUi } from '@/index';

export type RecursiveRefEditProps<Schema extends Schemas = Schemas> = FieldEditProps<
  Schema,
  Schema['plugin']['Nodes']['recursiveRef']
>;

export function RecursiveRefEdit<Schema extends Schemas = Schemas>({
  node,
  ...rest
}: RecursiveRefEditProps<Schema>) {
  const { schema } = useStatelyUi<Schema>();
  // Look up the referenced schema and recurse
  const referencedSchema = schema.schema.nodes[node.refName as keyof Schemas['config']['nodes']];

  if (!referencedSchema) {
    return (
      <div className="p-4 bg-muted rounded-md text-sm text-destructive">
        Unknown schema reference: {String(node.refName)}
      </div>
    );
  }

  const formId = generateFieldFormId(
    referencedSchema.nodeType,
    `recursive-ref-${rest.label || 'field'}`,
    rest.formId,
  );
  // Recursively render with the looked-up schema
  return <FieldEdit {...rest} formId={formId} node={referencedSchema} />;
}
