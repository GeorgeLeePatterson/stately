import { Skeleton } from '@statelyjs/ui/components/base/skeleton';
import type { FieldViewProps } from '@statelyjs/ui/form';
import { BaseForm } from '@statelyjs/ui/form';
import { useEffect, useState } from 'react';
import type { Schemas } from '@/core/schema';
import { useStatelyUi } from '@/index';

export type RecursiveRefViewProps<Schema extends Schemas = Schemas> = FieldViewProps<
  Schema,
  Schema['plugin']['Nodes']['recursiveRef']
>;

export function RecursiveRefView<Schema extends Schemas = Schemas>({
  value,
  node,
}: RecursiveRefViewProps<Schema>) {
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
    if (mainBundleSchema) return;
    if (runtimeSchema) return;
    if (!schema.loadRuntimeSchemas) {
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
      .catch(err => {
        setError(`Failed to load runtime schema: ${err.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [mainBundleSchema, runtimeSchema, schema, node.refName]);

  const referencedSchema = mainBundleSchema ?? runtimeSchema;

  if (isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  if (error) {
    return <div className="p-4 bg-muted rounded-md text-sm text-destructive">{error}</div>;
  }

  if (!referencedSchema) {
    return (
      <div className="p-4 bg-muted rounded-md text-sm text-destructive">
        Unknown schema reference: {String(node.refName)}
      </div>
    );
  }

  return (
    <BaseForm.FieldView<Schema, typeof referencedSchema, typeof value>
      node={referencedSchema}
      value={value}
    />
  );
}
