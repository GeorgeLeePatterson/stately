import type { BaseNode } from '@statelyjs/schema/nodes';
import { isNodeOfType } from '@statelyjs/schema/schema';
import type { Stately } from '@statelyjs/schema/stately';
import type { AnyUiPlugin, StatelyUiRuntime } from '@statelyjs/ui';
import { Braces, Brackets, Cog, Dot, SendToBack, Shapes, TextCursorInput } from 'lucide-react';
import type { ComponentType } from 'react';
import type { Schemas } from '@/core/schema';
import type { CoreStateEntry } from '.';
import { CoreRouteBasePath, type CoreUiOptions, type CoreUiPlugin } from './plugin';
import {
  type ArrayNode,
  CoreNodeType,
  type EnumNode,
  type LinkNode,
  type MapNode,
  type NullableNode,
  type ObjectNode,
  type PrimitiveNode,
  type TaggedUnionNode,
  type TupleNode,
  type UnionNode,
  type UntaggedEnumNode,
} from './schema/nodes';

export type EntityUrlParts =
  | { type?: string; id?: never; mode?: never }
  | { type: string; id?: string; mode?: never }
  | { type: string; mode?: string; id?: never } // `new`
  | { type: string; id: string; mode?: string };

export interface CoreUiUtils {
  // Base overrides
  getNodeTypeIcon(nodeType: string): ComponentType<any> | null;
  getDefaultValue(node: BaseNode): any;
  // Core specific
  generateEntityTypeDisplay<S extends Schemas = Schemas>(): {
    description: string;
    label: string;
    urlPath: string;
    entity: CoreStateEntry<S>;
  }[];
  getEntityIcon<S extends Schemas = Schemas>(entity: CoreStateEntry<S>): ComponentType<any>;
  resolveEntityType<S extends Schemas = Schemas>(entity: string): CoreStateEntry<S>;
  resolveEntityUrl(
    entityParts?: EntityUrlParts,
    params?: Record<string, string>,
    omitBasePath?: boolean,
  ): string;
}

export function createCoreUtils<S extends Schemas = Schemas, A extends readonly AnyUiPlugin[] = []>(
  runtime: StatelyUiRuntime<S, readonly [CoreUiPlugin, ...A]>,
  options?: CoreUiOptions,
): CoreUiUtils {
  const entityIcons = options?.entities?.icons ?? {};
  return {
    generateEntityTypeDisplay() {
      return generateEntityTypeDisplay(runtime.schema.data);
    },
    getDefaultValue,
    getEntityIcon<Schema extends S>(entity: CoreStateEntry<Schema>) {
      return entityIcons?.[entity] ?? Dot;
    },
    getNodeTypeIcon,
    resolveEntityType<Schema extends S>(entity: string): CoreStateEntry<Schema> {
      return resolveEntityType<Schema>(entity, runtime.schema.data as Stately<Schema>['data']);
    },
    resolveEntityUrl(entityParts, params): string {
      return resolveEntityUrl(runtime, entityParts, params);
    },
  };
}

/**
 * Get icon component for a node type
 */
export function getNodeTypeIcon(nodeType: string): ComponentType<any> | null {
  switch (nodeType) {
    case CoreNodeType.Object:
      return Braces;
    case CoreNodeType.Tuple:
    case CoreNodeType.Array:
      return Brackets;
    case CoreNodeType.Primitive:
      return TextCursorInput;
    case CoreNodeType.Enum:
    case CoreNodeType.Union:
    case CoreNodeType.TaggedUnion:
    case CoreNodeType.UntaggedEnum:
      return Shapes;
    case CoreNodeType.Map:
      return SendToBack;
    case CoreNodeType.Link:
      return Cog;
    default:
      return null;
  }
}

/**
 * Default value generation
 *
 * Generates sensible default values for core node types.
 * Returns null for unknown/plugin node types (graceful degradation).
 */
export function getDefaultValue(node: BaseNode): any {
  switch (true) {
    case isNodeOfType<PrimitiveNode>(node, CoreNodeType.Primitive):
      switch (node.primitiveType) {
        case 'string':
          return '';
        case 'number':
        case 'integer':
          return 0;
        case 'boolean':
          return false;
        default:
          return null;
      }

    case isNodeOfType<EnumNode>(node, CoreNodeType.Enum):
      return node.values[0] || '';

    case isNodeOfType<ArrayNode<any>>(node, CoreNodeType.Array):
      return [];

    case isNodeOfType<MapNode<any>>(node, CoreNodeType.Map):
      return {};

    case isNodeOfType<TupleNode>(node, CoreNodeType.Tuple):
      return node.items.map(getDefaultValue);

    case isNodeOfType<ObjectNode<any>>(node, CoreNodeType.Object): {
      const obj: any = {};
      const requiredFields = new Set(node.required || []);
      for (const [name, propNode] of Object.entries(node.properties)) {
        if (requiredFields.has(name)) {
          obj[name] = getDefaultValue(propNode);
        }
      }
      return obj;
    }

    case isNodeOfType<LinkNode<any>>(node, CoreNodeType.Link):
      return '';

    case isNodeOfType<UnionNode<any>>(node, CoreNodeType.Union):
    case isNodeOfType<TaggedUnionNode<any>>(node, CoreNodeType.TaggedUnion):
    case isNodeOfType<UntaggedEnumNode<any>>(node, CoreNodeType.UntaggedEnum):
      return null;

    case isNodeOfType<NullableNode<any>>(node, CoreNodeType.Nullable):
      return null;

    default:
      return null;
  }
}

/**
 * Generate entity types from metadata
 *
 * @param data Stately['data']
 * @returns {description: string; label: string; urlPath: string; entity: CoreStateEntry<S>}[]
 */
export function generateEntityTypeDisplay<S extends Schemas = Schemas>(
  data: Stately<S>['data'],
): { description: string; label: string; urlPath: string; entity: CoreStateEntry<S> }[] {
  return (Object.keys(data.entityDisplayNames) as CoreStateEntry<S>[]).map(entry => ({
    description: `${data.entityDisplayNames[entry]} configurations`,
    entity: entry,
    label: data.entityDisplayNames[entry],
    urlPath: data.stateEntryToUrl[entry],
  }));
}

/**
 * Attempts to resolve a string signifying an entity type into a proper `StateEntry`.
 *
 * @param entity - A URL path segment or display name to resolve
 * @param data - The schema data containing entity mappings
 * @returns The resolved StateEntry, or the original string cast as StateEntry if not found
 */
export function resolveEntityType<S extends Schemas = Schemas>(
  entity: string,
  data: Stately<S>['data'],
): CoreStateEntry<S> {
  if (entity in data.urlToStateEntry) {
    return data.urlToStateEntry[entity] as CoreStateEntry<S>;
  }
  const found = Object.entries(data.entityDisplayNames).find(
    ([_, displayName]) => displayName === entity,
  );
  // Return the found key or fall back to the original entity (cast as StateEntry)
  return (found?.[0] ?? entity) as CoreStateEntry<S>;
}

/**
 * Resolve an entity URL, respecting base path
 */
export function resolveEntityUrl<
  S extends Schemas = Schemas,
  A extends readonly AnyUiPlugin[] = [],
>(
  runtime: StatelyUiRuntime<S, readonly [CoreUiPlugin, ...A]>,
  entityParts?: EntityUrlParts,
  params?: Record<string, string>,
  omitBasePath?: boolean,
): string {
  const data = runtime.schema.data;
  const utils = runtime.utils;
  const basePath = omitBasePath ? '' : (runtime.options?.navigation?.basePath ?? '');
  const entitiesBasePath = `${utils.stripTrailing(basePath || '')}${CoreRouteBasePath}`;

  const pathParts = [entitiesBasePath];

  // Entity state entry
  if (entityParts?.type) {
    const { type: entityType, mode, id: entityId } = entityParts;
    // Ensure entityType is resolveable as url path
    let entityUrlPath = utils.stripLeading(utils.stripTrailing(entityType));
    if (!(entityType in data.urlToStateEntry)) {
      entityUrlPath = resolveEntityType(entityUrlPath, data);
    }
    pathParts.push(`/${entityUrlPath}`);

    // Entity ID
    const strippedEntityId = utils.stripLeading(utils.stripTrailing(entityId || ''));
    if (strippedEntityId) pathParts.push(`/${strippedEntityId}`);

    // Mode, ie `edit` or 'new'
    const strippedMode = utils.stripLeading(utils.stripTrailing(mode || ''));
    if (strippedMode) pathParts.push(`/${strippedMode}`);
  }

  // Params
  let qs = '';
  if (params && Object.keys(params).length > 0) {
    qs = `?${new URLSearchParams(params).toString()}`;
  }

  return `${pathParts.join('')}${qs}`;
}
