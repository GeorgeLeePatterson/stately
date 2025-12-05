import { CoreNodeType } from '@stately/ui/core/schema';
import type { CodegenPlugin, CodegenPluginContext } from '../plugin-manager.js';

export function createCoreCodegenPlugin(): CodegenPlugin {
  return {
    name: 'stately:codegen-core',
    transform(schema, ctx) {
      return transformSchema(schema, ctx);
    },
  };
}

function transformSchema(schema: any, ctx: CodegenPluginContext) {
  if (!schema) return null;

  // Nullable via type: ["string", "null"]
  if (Array.isArray(schema.type) && schema.type.includes('null')) {
    const nonNullTypes = schema.type.filter((t: string) => t !== 'null');
    if (nonNullTypes.length === 1) {
      const parsed = ctx.parseSchema({ ...schema, type: nonNullTypes[0] }, ctx.schemaName);
      if (parsed) {
        return {
          description: schema.description,
          innerSchema: parsed,
          nodeType: CoreNodeType.Nullable,
        };
      }
    }
  }

  // Nullable via oneOf pattern (string | null)
  if (schema.oneOf?.some((v: any) => v.type === 'null')) {
    const innerSchema = schema.oneOf.find((v: any) => v.type !== 'null');
    if (innerSchema) {
      const parsed = ctx.parseSchema(innerSchema, ctx.schemaName);
      if (parsed) {
        return {
          description: schema.description,
          innerSchema: parsed,
          nodeType: CoreNodeType.Nullable,
        };
      }
    }
  }

  // allOf composition
  if (schema.allOf && schema.allOf.length > 0) {
    let mergedProperties: Record<string, any> = {};
    let mergedRequired: string[] = [];

    for (const subSchema of schema.allOf) {
      const parsed = ctx.parseSchema(subSchema, ctx.schemaName);
      if (parsed && parsed.nodeType === CoreNodeType.Object) {
        mergedProperties = { ...mergedProperties, ...parsed.properties };
        mergedRequired = [...mergedRequired, ...(parsed.required || [])];
      }
    }

    if (Object.keys(mergedProperties).length > 0) {
      return {
        description: schema.description,
        nodeType: CoreNodeType.Object,
        properties: mergedProperties,
        required: [...new Set(mergedRequired)],
      };
    }
  }

  // oneOf/anyOf unions (link detection, tagged/untagged enums, generic union)
  const unionVariants = schema.oneOf || schema.anyOf;
  if (unionVariants && unionVariants.length > 0) {
    const linkNode = detectLinkNode(schema, ctx);
    if (linkNode) return linkNode;

    const unionNode = buildUnionNode(schema, ctx);
    if (unionNode) return unionNode;
  }

  // Arrays and tuples
  if (schema.type === 'array') {
    if (schema.prefixItems) {
      const items = schema.prefixItems
        .map((item: any) => ctx.parseSchema(item, ctx.schemaName))
        .filter((node: any) => node !== null);

      if (items.length === schema.prefixItems.length) {
        return { description: schema.description, items, nodeType: CoreNodeType.Tuple };
      }
    }

    const itemSchema = schema.items ? ctx.parseSchema(schema.items, ctx.schemaName) : null;
    return { description: schema.description, items: itemSchema, nodeType: CoreNodeType.Array };
  }

  // Map/dictionary
  if (schema.type === 'object' && schema.additionalProperties && !schema.properties) {
    const valueSchema = ctx.parseSchema(schema.additionalProperties, ctx.schemaName);
    if (!valueSchema) return null;

    return { description: schema.description, nodeType: CoreNodeType.Map, valueSchema };
  }

  // Objects
  if (schema.type === 'object') {
    const properties: Record<string, any> = {};
    for (const [propName, propSchema] of Object.entries(schema.properties || {})) {
      const parsed = ctx.parseSchema(propSchema as any, ctx.schemaName);
      if (parsed) {
        properties[propName] = parsed;
      }
    }

    // Parse additionalProperties if present (for objects with dynamic keys)
    let additionalProperties: any;
    if (schema.additionalProperties && schema.additionalProperties !== true) {
      additionalProperties = ctx.parseSchema(schema.additionalProperties, ctx.schemaName);
    }

    const node: any = {
      description: schema.description,
      nodeType: CoreNodeType.Object,
      properties,
      required: schema.required || [],
    };

    if (additionalProperties) {
      node.additionalProperties = additionalProperties;
    }

    return node;
  }

  // Primitives + enums
  if (
    schema.type === 'string' ||
    schema.type === 'number' ||
    schema.type === 'integer' ||
    schema.type === 'boolean'
  ) {
    if (schema.enum && schema.enum.length > 0) {
      return { description: schema.description, nodeType: CoreNodeType.Enum, values: schema.enum };
    }

    return {
      description: schema.description,
      format: schema.format,
      nodeType: CoreNodeType.Primitive,
      primitiveType: schema.type,
    };
  }

  return null;
}

function detectLinkNode(schema: any, ctx: CodegenPluginContext) {
  if (!Array.isArray(schema.oneOf) || schema.oneOf.length !== 2) return null;
  const variants = schema.oneOf;
  const bothHaveEntityType = variants.every((v: any) => {
    const resolved = resolveVariant(v, ctx);
    return (
      resolved?.properties?.entity_type?.enum && Array.isArray(resolved.properties.entity_type.enum)
    );
  });
  const hasRef = variants.some((v: any) => {
    const resolved = resolveVariant(v, ctx);
    return resolved?.properties?.ref;
  });
  const hasInline = variants.some((v: any) => {
    const resolved = resolveVariant(v, ctx);
    return resolved?.properties?.inline;
  });

  if (!bothHaveEntityType || !hasRef || !hasInline) return null;

  const inlineVariant = variants
    .map((variant: any) => resolveVariant(variant, ctx))
    .find((resolved: any) => resolved?.properties?.inline);
  const entityType = inlineVariant?.properties?.entity_type?.enum?.[0];
  const inlineSchema = inlineVariant?.properties?.inline;

  if (entityType && inlineSchema) {
    const parsedInline = ctx.parseSchema(inlineSchema, ctx.schemaName);
    if (parsedInline && parsedInline.nodeType === CoreNodeType.Object) {
      return {
        description: schema.description,
        inlineSchema: parsedInline,
        nodeType: CoreNodeType.Link,
        targetType: entityType,
      };
    }
  }

  return null;
}

function buildUnionNode(schema: any, ctx: CodegenPluginContext) {
  const variants = schema.oneOf || schema.anyOf || [];
  const objectVariants = variants
    .map((variant: any) => resolveVariant(variant, ctx))
    .filter((resolved: any) => resolved?.type === 'object');

  let discriminatorField: string | null = null;
  let isUntaggedEnum = false;

  if (objectVariants.length > 0) {
    isUntaggedEnum = objectVariants.every((resolved: any) => {
      const properties = resolved?.properties || {};
      return Object.keys(properties).length === 1;
    });

    if (!isUntaggedEnum) {
      const firstProperties = objectVariants[0]?.properties || {};
      for (const fieldName of Object.keys(firstProperties)) {
        const hasEnumInAll = objectVariants.every((resolved: any) => {
          const field = resolved?.properties?.[fieldName];
          return field?.enum && Array.isArray(field.enum) && field.enum.length > 0;
        });

        if (hasEnumInAll) {
          discriminatorField = fieldName;
          break;
        }
      }
    }
  }

  const untaggedVariants: Array<{ tag: string; schema: any }> = [];
  const taggedVariants: Array<{ tag: string; schema: any }> = [];

  for (const variant of variants) {
    const resolved = resolveVariant(variant, ctx);
    if (!resolved || resolved.type === 'null') continue;

    // Unit variant (string enum) - no associated data, schema is null
    if (resolved.type === 'string' && resolved.enum && resolved.enum.length > 0) {
      const tag = resolved.enum[0];
      (isUntaggedEnum ? untaggedVariants : taggedVariants).push({ schema: null, tag });
      continue;
    }

    if (resolved.type === 'object') {
      const properties = resolved.properties || {};
      const propertyKeys = Object.keys(properties);
      if (propertyKeys.length === 0) continue;

      if (isUntaggedEnum) {
        const tag = propertyKeys[0] || '';
        const innerPropertySchema = properties[tag];
        const parsed = ctx.parseSchema(innerPropertySchema, ctx.schemaName);
        const variantSchema = parsed || {
          nodeType: CoreNodeType.Object,
          properties: {},
          required: [],
        };
        untaggedVariants.push({ schema: variantSchema, tag });
      } else if (discriminatorField) {
        const discriminatorSchema = properties[discriminatorField];
        if (!discriminatorSchema?.enum || discriminatorSchema.enum.length === 0) continue;

        const tag = discriminatorSchema.enum[0];
        const variantProperties: Record<string, any> = {};
        for (const [propName, propSchema] of Object.entries(properties)) {
          if (propName === discriminatorField) continue;
          const parsed = ctx.parseSchema(propSchema as any, ctx.schemaName);
          if (parsed) {
            variantProperties[propName] = parsed;
          }
        }

        const variantSchema = {
          nodeType: CoreNodeType.Object,
          properties: variantProperties,
          required: (resolved.required || []).filter((r: string) => r !== discriminatorField),
        };
        taggedVariants.push({ schema: variantSchema, tag });
      }
    }
  }

  if (isUntaggedEnum && untaggedVariants.length > 0) {
    return {
      description: schema.description,
      nodeType: CoreNodeType.UntaggedEnum,
      variants: untaggedVariants,
    };
  }

  if (discriminatorField && taggedVariants.length > 0) {
    return {
      description: schema.description,
      discriminator: discriminatorField,
      nodeType: CoreNodeType.TaggedUnion,
      variants: taggedVariants,
    };
  }

  // Fallback: generic Union for any oneOf/anyOf we couldn't classify
  const genericVariants = variants
    .map((variant: any) => {
      const resolved = resolveVariant(variant, ctx);
      if (!resolved || resolved.type === 'null') return null;
      const parsed = ctx.parseSchema(resolved, ctx.schemaName);
      return { schema: parsed, label: resolved.description };
    })
    .filter(Boolean);

  return {
    description: schema.description,
    nodeType: CoreNodeType.Union,
    variants: genericVariants,
  };
}

function resolveVariant(variant: any, ctx: CodegenPluginContext) {
  if (!variant) return null;
  if (variant.$ref) {
    return ctx.resolveRef(variant.$ref) ?? null;
  }
  return variant;
}
