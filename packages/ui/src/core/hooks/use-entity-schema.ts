import { useStatelyUi } from '@/context';
import type { CoreObjectNode, CoreSchemas, CoreStateEntry } from '@/core';

export function useEntitySchema<Schema extends CoreSchemas = CoreSchemas>(
  entityType: CoreStateEntry<Schema>,
  entitySchema?: CoreObjectNode<Schema>,
): { node: CoreObjectNode<Schema>; error?: never } | { error: string; node?: never } {
  const { schema } = useStatelyUi();
  const cache =
    schema.data.entitySchemaCache as Record<string, CoreObjectNode<Schema> | undefined>;
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

  if (node.nodeType !== 'object') {
    return {
      error: `Expected object schema for entity type: ${entityType}, got: ${node.nodeType}`,
    };
  }

  return { node };
}
