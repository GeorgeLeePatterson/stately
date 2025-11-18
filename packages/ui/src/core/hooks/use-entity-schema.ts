import type { Schemas } from '@stately/schema';
import type { CoreStateEntry } from '@/core';
import { useStatelyUi } from '@/core';

export function useEntitySchema<Schema extends Schemas>(
  entityType: CoreStateEntry<Schema>,
  entitySchema?: Schema['plugin']['Nodes']['object'],
): { node: Schema['plugin']['Nodes']['object']; error?: never } | { error: string; node?: never } {
  const { schema } = useStatelyUi();
  const cache = schema.data.entitySchemaCache || schema.schema.nodes[entityType];
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
