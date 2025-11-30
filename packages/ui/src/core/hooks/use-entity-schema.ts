import { isNodeOfType } from '@stately/schema/schema';
import type { CoreStateEntry } from '@/core';
import type { Schemas } from '@/core/schema';
import { CoreNodeType } from '@/core/schema/nodes';
import { useStatelyUi } from '@/index';

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
