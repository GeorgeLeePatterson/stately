import { useMemo } from 'react';
import type { Schemas } from '@/core/schema';
import { useStatelyUi } from '@/index';

/**
 * Access merged keys from object node's merged properties
 *
 * @param merged
 * @returns {Set<string>}
 */
export const getMergedKeys = <S extends Schemas = Schemas>(
  merged: readonly S['plugin']['AnyNode'][] | null,
): Set<string> => {
  if (!merged || merged.length === 0) return new Set<string>();
  const keys = new Set<string>();
  for (const schema of merged) {
    if ('keys' in schema && Array.isArray(schema.keys)) {
      for (const key of schema.keys) {
        keys.add(key);
      }
    }
  }
  return keys;
};

/**
 * Access object schema properties
 *
 * @param node
 * @param disableSort
 * @returns Destructured object schema properties
 */
export function useObjectSchema<S extends Schemas = Schemas>(
  node: S['plugin']['Nodes']['object'],
  disableSort?: boolean,
) {
  const { schema } = useStatelyUi<S, []>();

  const sortProperties = schema.plugins.core.sortEntityProperties;

  const additional = node.additionalProperties ?? null;

  // Merged schemas from allOf composition - handled separately from regular properties
  const merged = node.merged ?? null;

  // Collect keys from merged schemas (object-like schemas have a 'keys' property)
  const mergedKeys = useMemo(() => getMergedKeys(merged), [merged]);

  // Property keys from the object schema itself
  const propertyKeys = useMemo(
    () => new Set(node.keys ?? Object.keys(node.properties) ?? []),
    [node.keys, node.properties],
  );

  const required = new Set<string>(node?.required || []);

  const fields = useMemo(() => {
    if (disableSort) return Object.entries(node.properties);
    const valueFields = Object.entries(node.properties).filter(([fieldName]) => fieldName !== 'id');
    return sortProperties<S['plugin']['AnyNode']>(valueFields, required);
  }, [sortProperties, node.properties, required, disableSort]);

  return { additional, fields, merged, mergedKeys, propertyKeys, required };
}
