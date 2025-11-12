import { CoreNodeType } from "@stately/schema/core/nodes";
import type { CodegenPlugin, CodegenPluginContext } from "../plugin-manager.js";

export function createCoreCodegenPlugin(): CodegenPlugin {
  return {
    name: "stately:codegen-core",
    transform(schema, ctx) {
      return transformSchema(schema, ctx);
    },
  };
}

function transformSchema(schema: any, ctx: CodegenPluginContext) {
  if (!schema) return null;

  // Nullable via type: ["string", "null"]
  if (Array.isArray(schema.type) && schema.type.includes("null")) {
    const nonNullTypes = schema.type.filter((t: string) => t !== "null");
    if (nonNullTypes.length === 1) {
      const parsed = ctx.parseSchema(
        { ...schema, type: nonNullTypes[0] },
        ctx.schemaName,
      );
      if (parsed) {
        return {
          nodeType: CoreNodeType.Nullable,
          innerSchema: parsed,
          description: schema.description,
        };
      }
    }
  }

  // Nullable via oneOf pattern (string | null)
  if (schema.oneOf && schema.oneOf.some((v: any) => v.type === "null")) {
    const innerSchema = schema.oneOf.find((v: any) => v.type !== "null");
    if (innerSchema) {
      const parsed = ctx.parseSchema(innerSchema, ctx.schemaName);
      if (parsed) {
        return {
          nodeType: CoreNodeType.Nullable,
          innerSchema: parsed,
          description: schema.description,
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
        nodeType: CoreNodeType.Object,
        properties: mergedProperties,
        required: [...new Set(mergedRequired)],
        description: schema.description,
      };
    }
  }

  // oneOf unions (link detection, tagged/untagged enums)
  if (schema.oneOf && schema.oneOf.length > 0) {
    const linkNode = detectLinkNode(schema, ctx);
    if (linkNode) return linkNode;

    const unionNode = buildUnionNode(schema, ctx);
    if (unionNode) return unionNode;
  }

  // Arrays and tuples
  if (schema.type === "array") {
    if (schema.prefixItems) {
      const items = schema.prefixItems
        .map((item: any) => ctx.parseSchema(item, ctx.schemaName))
        .filter((node: any) => node !== null);

      if (items.length === schema.prefixItems.length) {
        return {
          nodeType: CoreNodeType.Tuple,
          items,
          description: schema.description,
        };
      }
    }

    const itemSchema = schema.items
      ? ctx.parseSchema(schema.items, ctx.schemaName)
      : null;
    return {
      nodeType: CoreNodeType.Array,
      items: itemSchema,
      description: schema.description,
    };
  }

  // Map/dictionary
  if (
    schema.type === "object" &&
    schema.additionalProperties &&
    !schema.properties
  ) {
    const valueSchema = ctx.parseSchema(
      schema.additionalProperties,
      ctx.schemaName,
    );
    if (!valueSchema) return null;

    return {
      nodeType: CoreNodeType.Map,
      valueSchema,
      description: schema.description,
    };
  }

  // Objects
  if (schema.type === "object") {
    const properties: Record<string, any> = {};
    for (const [propName, propSchema] of Object.entries(
      schema.properties || {},
    )) {
      const parsed = ctx.parseSchema(propSchema as any, ctx.schemaName);
      if (parsed) {
        properties[propName] = parsed;
      }
    }

    return {
      nodeType: CoreNodeType.Object,
      properties,
      required: schema.required || [],
      description: schema.description,
    };
  }

  // Primitives + enums
  if (
    schema.type === "string" ||
    schema.type === "number" ||
    schema.type === "integer" ||
    schema.type === "boolean"
  ) {
    if (schema.enum && schema.enum.length > 0) {
      return {
        nodeType: CoreNodeType.Enum,
        values: schema.enum,
        description: schema.description,
      };
    }

    return {
      nodeType: CoreNodeType.Primitive,
      primitiveType: schema.type,
      format: schema.format,
      description: schema.description,
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
      resolved?.properties?.entity_type?.enum &&
      Array.isArray(resolved.properties.entity_type.enum)
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
        nodeType: CoreNodeType.Link,
        targetType: entityType,
        inlineSchema: parsedInline,
        description: schema.description,
      };
    }
  }

  return null;
}

function buildUnionNode(schema: any, ctx: CodegenPluginContext) {
  const objectVariants = schema.oneOf
    .map((variant: any) => resolveVariant(variant, ctx))
    .filter((resolved: any) => resolved?.type === "object");

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
          return (
            field?.enum && Array.isArray(field.enum) && field.enum.length > 0
          );
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

  for (const variant of schema.oneOf) {
    const resolved = resolveVariant(variant, ctx);
    if (!resolved || resolved.type === "null") continue;

    // Unit variant (string enum)
    if (
      resolved.type === "string" &&
      resolved.enum &&
      resolved.enum.length > 0
    ) {
      const tag = resolved.enum[0];
      const variantSchema = {
        nodeType: CoreNodeType.Object,
        properties: {},
        required: [],
      };
      (isUntaggedEnum ? untaggedVariants : taggedVariants).push({
        tag,
        schema: variantSchema,
      });
      continue;
    }

    if (resolved.type === "object") {
      const properties = resolved.properties || {};
      const propertyKeys = Object.keys(properties);
      if (propertyKeys.length === 0) continue;

      if (isUntaggedEnum) {
        const tag = propertyKeys[0]!;
        const innerPropertySchema = properties[tag];
        const parsed = ctx.parseSchema(innerPropertySchema, ctx.schemaName);
        const variantSchema = parsed || {
          nodeType: CoreNodeType.Object,
          properties: {},
          required: [],
        };
        untaggedVariants.push({ tag, schema: variantSchema });
      } else if (discriminatorField) {
        const discriminatorSchema = properties[discriminatorField];
        if (!discriminatorSchema?.enum || discriminatorSchema.enum.length === 0)
          continue;

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
          required: (resolved.required || []).filter(
            (r: string) => r !== discriminatorField,
          ),
        };
        taggedVariants.push({ tag, schema: variantSchema });
      }
    }
  }

  if (isUntaggedEnum && untaggedVariants.length > 0) {
    return {
      nodeType: CoreNodeType.UntaggedEnum,
      variants: untaggedVariants,
      description: schema.description,
    };
  }

  if (discriminatorField && taggedVariants.length > 0) {
    return {
      nodeType: CoreNodeType.TaggedUnion,
      discriminator: discriminatorField,
      variants: taggedVariants,
      description: schema.description,
    };
  }

  return null;
}

function resolveVariant(variant: any, ctx: CodegenPluginContext) {
  if (!variant) return null;
  if (variant.$ref) {
    return ctx.resolveRef(variant.$ref) ?? null;
  }
  return variant;
}
