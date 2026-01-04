import { generateFieldFormId } from '@statelyjs/ui';
import { Skeleton } from '@statelyjs/ui/components/base/skeleton';
import type { FieldEditProps } from '@statelyjs/ui/registry';
import { useEffect, useState } from 'react';
import type { Schemas } from '@/core/schema';
import { BaseForm } from '@/form';
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
  const [runtimeSchema, setRuntimeSchema] = useState<Schema['config']['nodes'][string] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // First, check the main bundle
  const mainBundleSchema = schema.schema.nodes[node.refName];

  // If not in main bundle, try loading from runtime schemas
  useEffect(() => {
    if (mainBundleSchema) return; // Already have it
    if (runtimeSchema) return; // Already loaded
    if (!schema.loadRuntimeSchemas) {
      // No runtime loader configured - this is an error
      setError(`Schema "${node.refName}" not found and no runtime loader configured`);
      return;
    }

    setIsLoading(true);
    setError(null);

    schema
      .loadRuntimeSchemas()
      .then(runtimeSchemas => {
        const loaded = runtimeSchemas[node.refName];
        if (loaded) {
          setRuntimeSchema(loaded);
        } else {
          setError(`Schema "${node.refName}" not found in main or runtime bundle`);
        }
      })
      .catch((err: Error) => {
        setError(`Failed to load runtime schema: ${err.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [mainBundleSchema, runtimeSchema, schema, node.refName]);

  // Determine which schema to use
  const referencedSchema = mainBundleSchema ?? runtimeSchema;

  // Loading state
  if (isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  // Error state
  if (error) {
    return <div className="p-4 bg-muted rounded-md text-sm text-destructive">{error}</div>;
  }

  // Schema not yet available (shouldn't happen if loading/error states are correct)
  if (!referencedSchema) {
    return (
      <div className="p-4 bg-muted rounded-md text-sm text-destructive">
        Unknown schema reference: {String(node.refName)}
      </div>
    );
  }

  const formId = generateFieldFormId({
    fieldType: referencedSchema.nodeType,
    formId: rest.formId,
    propertyName: `recursive-ref-${rest.label || 'field'}`,
  });

  // Recursively render with the looked-up schema
  return <BaseForm.FieldEdit {...rest} formId={formId} node={referencedSchema} />;
}
