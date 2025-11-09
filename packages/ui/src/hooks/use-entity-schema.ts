import type { StatelySchemas } from '@stately/schema';
import { useStatelyUi } from '@/context';

export function useEntitySchema<Schemas extends StatelySchemas = StatelySchemas>(
  entityType: Schemas['StateEntry'],
  entitySchema?: Schemas['ObjectNode'],
): { schema: Schemas['ObjectNode']; error?: never } | { error: string; schema?: never } {
  const { integration } = useStatelyUi();
  const schema = entitySchema || integration.entitySchemaCache[entityType];

  if (!schema) {
    console.error('[Entity] Schema not found for:', entityType);
    console.error('[Entity] Available schemas:', Object.keys(integration.entitySchemaCache));
    console.error('[Entity] Schema value for this key:', integration.entitySchemaCache[entityType]);
    console.error(
      '[Entity] All cache entries:',
      Object.entries(integration.entitySchemaCache).map(([k, v]) => [k, v ? 'exists' : 'NULL']),
    );
    return { error: `Schema not found for entity type: ${entityType}` };
  }

  if (schema.nodeType !== 'object') {
    return {
      error: `Expected object schema for entity type: ${entityType}, got: ${schema.nodeType}`,
    };
  }

  return { schema };
}
