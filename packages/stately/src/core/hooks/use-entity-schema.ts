import { isNodeOfType } from '@statelyjs/schema/schema';
import type { CoreStateEntry } from '@/core';
import type { Schemas } from '@/core/schema';
import { CoreNodeType } from '@/core/schema/nodes';
import { useStatelyUi } from '@/index';

/**
 * Get the schema node for an entity type.
 *
 * Retrieves the parsed object schema for a given entity type, which can be used
 * for form generation, validation, or custom rendering. Returns either the schema
 * node or an error message if the schema is not found or invalid.
 *
 * @typeParam Schema - Your application's schema type
 *
 * @param entityType - The entity type name (e.g., 'Pipeline', 'SourceConfig')
 * @param entitySchema - Optional pre-fetched schema to use instead of looking up
 *
 * @returns Either `{ node }` with the schema, or `{ error }` with an error message
 *
 * @example
 * ```tsx
 * function EntityForm({ entityType }: { entityType: string }) {
 *   const result = useEntitySchema<MySchemas>(entityType);
 *
 *   if (result.error) {
 *     return <Error message={result.error} />;
 *   }
 *
 *   const { node } = result;
 *   return (
 *     <form>
 *       {Object.entries(node.properties).map(([name, fieldSchema]) => (
 *         <FieldEdit key={name} name={name} node={fieldSchema} />
 *       ))}
 *     </form>
 *   );
 * }
 * ```
 */
export function useEntitySchema<Schema extends Schemas>(
  entityType: CoreStateEntry<Schema>,
  entitySchema?: Schema['plugin']['Nodes']['object'],
): { node: Schema['plugin']['Nodes']['object']; error?: never } | { error: string; node?: never } {
  const { schema } = useStatelyUi();
  const cache = schema.data.entitySchemaCache || schema.schema.nodes;
  const node = entitySchema || cache[entityType];

  if (!node) {
    console.error('[Entity] Schema not found for:', entityType);
    console.error('[Entity] Available schemas:', Object.keys(cache));
    console.error('[Entity] Schema value for this key:', cache[entityType]);
    console.error(
      '[Entity] All cache entries:',
      Object.entries(cache).map(([k, v]) => [k, v ? 'exists' : 'NULL']),
    );
    return { error: `Schema not found for entity type: ${entityType}` };
  }

  if (!isNodeOfType<Schema['plugin']['Nodes']['object']>(node, CoreNodeType.Object)) {
    return {
      error: `Expected object schema for entity type: ${entityType}, got: ${node.nodeType}`,
    };
  }

  return { node };
}
