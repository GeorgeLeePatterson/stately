/**
 * Build-time schema generator (ported from xeo4)
 *
 * Parses all OpenAPI schemas and serializes them to a TypeScript file.
 * Handles circular references by converting them to RecursiveRef nodes.
 *
 * WARNING: This logic is VERY BRITTLE. Any changes risk breaking schema parsing.
 */

import * as fs from 'node:fs';
import { NodeType } from '@stately/schema';
import {
  getCodegenPlugins,
  loadPluginsFromConfig,
  setCodegenPlugins,
  type CodegenPluginContext,
} from './plugin-manager.js';

// Accept paths as arguments (will be called by CLI)
const openapiPath = process.argv[2];
const outputPath = process.argv[3];
const pluginConfigPath = process.argv[4];

if (!openapiPath || !outputPath) {
  console.error('Usage: node generate.js <openapi.json> <output.ts> [pluginConfig.js]');
  process.exit(1);
}

type SerializedNode = any;

async function main() {
  const resolvedOpenapiPath = openapiPath!;
  const resolvedOutputPath = outputPath!;
  const plugins = await loadPluginsFromConfig(pluginConfigPath);
  if (plugins.length) {
    console.log(`🔌 Loaded ${plugins.length} stately-codegen plugin(s)`);
  }
  setCodegenPlugins(plugins);

  const openapi = JSON.parse(fs.readFileSync(resolvedOpenapiPath, 'utf-8'));

  console.log('🔧 Generating schemas from openapi.json...');

  const schemaCache = new Map<
    string,
    { node: SerializedNode | null; state: 'uninitialized' | 'parsing' | 'complete' }
  >();
  const componentSchemas = openapi.components?.schemas || {};

  for (const schemaName in componentSchemas) {
    schemaCache.set(`#/components/schemas/${schemaName}`, { node: null, state: 'uninitialized' });
  }

  console.log(`📋 Found ${Object.keys(componentSchemas).length} component schemas`);

  const parsedSchemas: Record<string, SerializedNode> = {};

  function resolveRef(ref: string): any {
    const schemaName = ref.split('/').pop();
    return schemaName ? componentSchemas[schemaName] : null;
  }

  const basePluginContext: Omit<CodegenPluginContext, 'schemaName'> = {
    resolveRef,
    parseSchema: (schema: any, schemaName?: string) => parseSchema(schema, schemaName),
  };

  function parseSchema(schema: any, schemaName?: string): SerializedNode | null {
  if (!schema) return null;

  const pluginContext: CodegenPluginContext = { schemaName, ...basePluginContext };
  for (const plugin of getCodegenPlugins()) {
    try {
      const matches = plugin.match ? plugin.match(schema, pluginContext) : true;
      if (!matches) continue;
      const result = plugin.transform(schema, pluginContext);
      if (result) {
        return result;
      }
    } catch (error) {
      console.warn(`[stately-codegen] Plugin "${plugin.name}" failed:`, error);
    }
  }

  // Handle $ref resolution with cycle detection
  if (schema.$ref) {
    const cached = schemaCache.get(schema.$ref);

    if (cached?.state === 'parsing') {
      // Circular reference detected!
      console.log(`  🔄 Circular reference detected: ${schema.$ref}`);
      return {
        nodeType: NodeType.RecursiveRef,
        refName: schema.$ref.split('/').pop() || '',
        description: schema.description,
      };
    }

    if (cached?.state === 'complete') {
      return cached.node;
    }

    const resolved = resolveRef(schema.$ref);
    if (!resolved) return null;

    // Mark as parsing and create placeholder
    if (cached) {
      cached.state = 'parsing';
      const placeholder: any = { nodeType: null };
      cached.node = placeholder;

      const parsed = parseSchema(resolved, schemaName);

      if (parsed) {
        Object.assign(placeholder, parsed);
      }

      cached.state = 'complete';
      return cached.node;
    }

    return parseSchema(resolved, schemaName);
  }

  // Handle nullable via type array (e.g., type: ["string", "null"])
  if (Array.isArray(schema.type) && schema.type.includes('null')) {
    const nonNullTypes = schema.type.filter((t: string) => t !== 'null');
    if (nonNullTypes.length === 1) {
      const innerSchema = { ...schema, type: nonNullTypes[0] };
      delete innerSchema.type; // Will be re-added by inner parse
      const parsed = parseSchema({ ...schema, type: nonNullTypes[0] }, schemaName);
      if (parsed) {
        return {
          nodeType: NodeType.Nullable,
          innerSchema: parsed,
          description: schema.description,
        };
      }
    }
  }

  // Handle allOf (schema composition/merging)
  if (schema.allOf && schema.allOf.length > 0) {
    let mergedProperties: Record<string, any> = {};
    let mergedRequired: string[] = [];

    for (const subSchema of schema.allOf) {
      const parsed = parseSchema(subSchema, schemaName);
      if (parsed && parsed.nodeType === NodeType.Object) {
        mergedProperties = { ...mergedProperties, ...parsed.properties };
        mergedRequired = [...mergedRequired, ...(parsed.required || [])];
      }
    }

    if (Object.keys(mergedProperties).length > 0) {
      return {
        nodeType: NodeType.Object,
        properties: mergedProperties,
        required: [...new Set(mergedRequired)], // Deduplicate
        description: schema.description,
      };
    }
  }

  // Handle oneOf (unions)
  if (schema.oneOf && schema.oneOf.length > 0) {
    // Check for UserDefinedPath pattern (untagged: RelativePath | String)
    // UserDefinedPath has: two variants, one is RelativePath (tagged union with 'dir'), one is string
    // Check for Link<T> pattern (before generic nullable check)
    // Link has: two variants with entity_type enum, one with 'ref', one with 'inline'
    if (schema.oneOf.length === 2) {
      const variants = schema.oneOf;
      const bothHaveEntityType = variants.every(
        (v: any) => v.properties?.entity_type?.enum && Array.isArray(v.properties.entity_type.enum),
      );
      const hasRef = variants.some((v: any) => v.properties?.ref);
      const hasInline = variants.some((v: any) => v.properties?.inline);

      if (bothHaveEntityType && hasRef && hasInline) {
        // This is Link<T>
        const inlineVariant = variants.find((v: any) => v.properties?.inline);
        const entityType = inlineVariant?.properties?.entity_type?.enum?.[0];
        const inlineSchema = inlineVariant?.properties?.inline;

        if (entityType && inlineSchema) {
          const parsedInline = parseSchema(inlineSchema, schemaName);
          if (parsedInline && parsedInline.nodeType === NodeType.Object) {
            return {
              nodeType: NodeType.Link,
              targetType: entityType,
              inlineSchema: parsedInline,
              description: schema.description,
            };
          }
        }
      }
    }

    // Check for nullable pattern

    if (schema.oneOf.some((v: any) => v.type === 'null')) {
      const innerSchema = schema.oneOf.find((v: any) => v.type !== 'null');
      if (innerSchema) {
        const parsed = parseSchema(innerSchema, schemaName);
        if (parsed) {
          return {
            nodeType: NodeType.Nullable,
            innerSchema: parsed,
            description: schema.description,
          };
        }
      }
    }

    // Otherwise, it's a union - detect if tagged or untagged and parse accordingly
    // First, detect union type by checking if all object variants have a common discriminator field
    const objectVariants = schema.oneOf.filter((v: any) => {
      const resolved = v.$ref ? resolveRef(v.$ref) : v;
      return resolved?.type === 'object';
    });

    let discriminatorField: string | null = null;
    let isUntaggedEnum = false;

    if (objectVariants.length > 0) {
      // Check if all variants have exactly one property (untagged enum pattern)
      isUntaggedEnum = objectVariants.every((v: any) => {
        const resolved = v.$ref ? resolveRef(v.$ref) : v;
        const properties = resolved?.properties || {};
        return Object.keys(properties).length === 1;
      });

      if (!isUntaggedEnum) {
        // Check for tagged union: find a common field with enum values across all variants
        const firstVariant = objectVariants[0];
        const firstResolved = firstVariant.$ref ? resolveRef(firstVariant.$ref) : firstVariant;
        const firstProperties = firstResolved?.properties || {};

        for (const fieldName of Object.keys(firstProperties)) {
          const hasEnumInAll = objectVariants.every((v: any) => {
            const resolved = v.$ref ? resolveRef(v.$ref) : v;
            const props = resolved?.properties || {};
            const field = props[fieldName];
            return field?.enum && Array.isArray(field.enum) && field.enum.length > 0;
          });

          if (hasEnumInAll) {
            discriminatorField = fieldName;
            break;
          }
        }
      }
    }

    // Parse variants based on detected union type
    const untaggedVariants: Array<{ tag: string; schema: any }> = [];
    const taggedVariants: Array<{ tag: string; schema: any }> = [];

    for (const variant of schema.oneOf) {
      // Resolve $ref if present
      const resolved = variant.$ref ? resolveRef(variant.$ref) : variant;
      if (!resolved) continue;

      // Skip null variants (handled by nullable wrapper)
      if (resolved.type === 'null') continue;

      let tag: string;
      let variantSchema: any;

      // Case 1: Unit variant (string enum)
      if (resolved.type === 'string' && resolved.enum && resolved.enum.length > 0) {
        tag = resolved.enum[0];
        variantSchema = { nodeType: NodeType.Object, properties: {}, required: [] };
        (isUntaggedEnum ? untaggedVariants : taggedVariants).push({ tag, schema: variantSchema });
        continue;
      }

      // Case 2: Object variant
      if (resolved.type === 'object') {
        const properties = resolved.properties || {};
        const propertyKeys = Object.keys(properties);

        if (propertyKeys.length === 0) continue;

        if (isUntaggedEnum) {
          // Untagged: single-key object where key is the tag
          tag = propertyKeys[0]!;
          const innerPropertySchema = properties[tag];
          const parsed = parseSchema(innerPropertySchema, schemaName);
          variantSchema = parsed || { nodeType: NodeType.Object, properties: {}, required: [] };
          untaggedVariants.push({ tag, schema: variantSchema });
        } else if (discriminatorField) {
          // Tagged: extract tag from discriminator field
          const discriminatorSchema = properties[discriminatorField];
          if (!discriminatorSchema?.enum || discriminatorSchema.enum.length === 0) continue;

          tag = discriminatorSchema.enum[0];

          // Parse all properties EXCEPT the discriminator
          const variantProperties: Record<string, any> = {};
          for (const [propName, propSchema] of Object.entries(properties)) {
            if (propName === discriminatorField) continue;
            const parsed = parseSchema(propSchema as any, schemaName);
            if (parsed) {
              variantProperties[propName] = parsed;
            }
          }

          variantSchema = {
            nodeType: NodeType.Object,
            properties: variantProperties,
            required: (resolved.required || []).filter((r: string) => r !== discriminatorField),
          };
          taggedVariants.push({ tag, schema: variantSchema });
        }
      }
    }

    // Return appropriate node type
    if (isUntaggedEnum && untaggedVariants.length > 0) {
      return {
        nodeType: NodeType.UntaggedEnum,
        variants: untaggedVariants,
        description: schema.description,
      };
    }

    if (discriminatorField && taggedVariants.length > 0) {
      return {
        nodeType: NodeType.TaggedUnion,
        discriminator: discriminatorField,
        variants: taggedVariants,
        description: schema.description,
      };
    }
  }

  // Handle arrays
  if (schema.type === 'array') {
    // Handle tuples (arrays with prefixItems)
    if (schema.prefixItems) {
      const items = schema.prefixItems
        .map((item: any) => parseSchema(item, schemaName))
        .filter((node: any) => node !== null);

      if (items.length === schema.prefixItems.length) {
        return { nodeType: NodeType.Tuple, items, description: schema.description };
      }
    }

    // Regular arrays
    const itemSchema = schema.items ? parseSchema(schema.items, schemaName) : null;
    return { nodeType: NodeType.Array, items: itemSchema, description: schema.description };
  }

  // Handle map/dictionary (object with additionalProperties but no properties)
  if (schema.type === 'object' && schema.additionalProperties && !schema.properties) {
    const valueSchema = parseSchema(schema.additionalProperties, schemaName);
    if (!valueSchema) return null;

    return { nodeType: NodeType.Map, valueSchema, description: schema.description };
  }

  // Handle objects
  if (schema.type === 'object') {
    const properties: Record<string, SerializedNode> = {};
    for (const [propName, propSchema] of Object.entries(schema.properties || {})) {
      const parsed = parseSchema(propSchema as any, schemaName);
      if (parsed) {
        properties[propName] = parsed;
      }
    }

    return {
      nodeType: NodeType.Object,
      properties,
      required: schema.required || [],
      description: schema.description,
    };
  }

  // Handle primitives
  if (
    schema.type === 'string' ||
    schema.type === 'number' ||
    schema.type === 'integer' ||
    schema.type === 'boolean'
  ) {
    if (schema.enum && schema.enum.length > 0) {
      return { nodeType: NodeType.Enum, values: schema.enum, description: schema.description };
    }

    return {
      nodeType: NodeType.Primitive,
      primitiveType: schema.type,
      format: schema.format,
      description: schema.description,
    };
  }

  return null;
}

// Parse all component schemas
  for (const [schemaName, schema] of Object.entries(componentSchemas)) {
    try {
      console.log(`  📝 Parsing ${schemaName}...`);
      const refName = `#/components/schemas/${schemaName}`;

      const cached = schemaCache.get(refName);
      if (cached?.state === 'complete' && cached.node) {
        parsedSchemas[schemaName] = cached.node;
        continue;
      }

      const parsed = parseSchema(schema, schemaName);
      if (parsed) {
        parsedSchemas[schemaName] = parsed;

        const cacheEntry = schemaCache.get(refName);
        if (cacheEntry) {
          cacheEntry.node = parsed;
          cacheEntry.state = 'complete';
        }
      } else {
        console.warn(`  ⚠️  Failed to parse ${schemaName}`);
      }
    } catch (err) {
      console.error(`  ❌ Error parsing ${schemaName}:`, err);
    }
  }

  console.log(`✅ Parsed ${Object.keys(parsedSchemas).length} schemas`);

  const output = `// Auto-generated at build time from openapi.json
// DO NOT EDIT MANUALLY - run 'npm run generate-schemas' to regenerate

export const PARSED_SCHEMAS = ${JSON.stringify(parsedSchemas, null, 2)} as const;

export type ParsedSchemaName = keyof typeof PARSED_SCHEMAS;
`;

  fs.writeFileSync(resolvedOutputPath, output);

  console.log(`💾 Written to ${resolvedOutputPath}`);
  console.log('✨ Schema generation complete!');
}

main().catch(error => {
  console.error('[stately-codegen] generation failed:', error);
  process.exit(1);
});
