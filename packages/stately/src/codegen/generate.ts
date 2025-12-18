/**
 * Build-time schema generator (ported from xeo4)
 *
 * Parses OpenAPI schemas and serializes them to TypeScript files.
 * Supports code splitting via plugin entry points:
 * - Main bundle: Entry point schemas and their non-recursive dependencies
 * - Runtime bundle: Schemas reached only through recursion (lazy loaded)
 *
 * Handles circular references by converting them to RecursiveRef nodes.
 *
 * CODE SPLITTING BEHAVIOR:
 * When entry points are declared, only reachable schemas are parsed:
 * - Directly reachable schemas → main bundle (schemas.ts)
 * - Recursively reachable schemas → runtime bundle (schemas.runtime.ts)
 * - Unreachable schemas → not parsed at all
 *
 * FUTURE: If dynamic access to unreachable schemas is needed, add a third bundle
 * (e.g., schemas.deferred.ts) containing all unparsed component schemas. This would
 * require tracking `componentSchemas` keys minus `parsedSchemas` keys, parsing them
 * separately, and exposing them via a similar lazy-loading mechanism.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import openapiTS, { astToString } from 'openapi-typescript';
import { createCoreCodegenPlugin } from '@/core/codegen.js';
import {
  type CodegenPluginContext,
  getCodegenPlugins,
  loadPluginsFromConfig,
  setCodegenPlugins,
} from './plugin-manager.js';

// Accept paths as arguments (will be called by CLI)
const openapiPath = process.argv[2];
const outputDir = process.argv[3];
const pluginConfigPath = process.argv[4];

if (!openapiPath || !outputDir) {
  console.error('Usage: node generate.js <openapi.json> <output_dir> [pluginConfig.js]');
  process.exit(1);
}

type SerializedNode = any;

interface SchemaCache {
  node: SerializedNode | null;
  state: 'uninitialized' | 'parsing' | 'complete';
}

async function main() {
  if (!openapiPath || !outputDir) {
    console.error('Usage: node generate.js <openapi.json> <output_dir> [pluginConfig.js]');
    process.exit(1);
  }

  const resolvedOpenapiPath = openapiPath;
  const resolvedOutputDir = path.resolve(outputDir);

  // Ensure output directory exists
  if (!fs.existsSync(resolvedOutputDir)) {
    fs.mkdirSync(resolvedOutputDir, { recursive: true });
  }

  const schemasOutputPath = path.join(resolvedOutputDir, 'schemas.ts');
  const runtimeSchemasOutputPath = path.join(resolvedOutputDir, 'schemas.runtime.ts');
  const typesOutputPath = path.join(resolvedOutputDir, 'types.ts');

  const userPlugins = await loadPluginsFromConfig(pluginConfigPath);
  if (userPlugins.length) {
    console.log(`🔌 Loaded ${userPlugins.length} @statelyjs/codegen plugin(s)`);
  }
  const plugins = [...userPlugins, createCoreCodegenPlugin()];
  setCodegenPlugins(plugins);

  const openapi = JSON.parse(fs.readFileSync(resolvedOpenapiPath, 'utf-8'));
  const componentSchemas = openapi.components?.schemas || {};

  console.log('🔧 Generating schemas from openapi.json...');
  console.log(`📋 Found ${Object.keys(componentSchemas).length} component schemas`);

  // Collect entry points from all plugins
  const entryPoints = new Set<string>();
  for (const plugin of plugins) {
    if (plugin.entryPoints) {
      const pluginEntries = plugin.entryPoints(openapi);
      if (pluginEntries?.length) {
        console.log(`📍 Plugin "${plugin.name}" declared ${pluginEntries.length} entry points`);
        for (const entrypoint of pluginEntries) {
          entryPoints.add(entrypoint);
        }
      }
    }
  }

  const hasEntryPoints = entryPoints.size > 0;
  if (hasEntryPoints) {
    console.log(`📍 Total entry points: ${entryPoints.size}`);
  } else {
    console.log('📦 No entry points declared - bundling all schemas together');
  }

  // Initialize schema cache
  const schemaCache = new Map<string, SchemaCache>();
  for (const schemaName in componentSchemas) {
    schemaCache.set(`#/components/schemas/${schemaName}`, { node: null, state: 'uninitialized' });
  }

  // Track which schemas are reached via recursion (for code splitting)
  const reachedViaRecursion = new Set<string>();
  // Track which schemas are reached directly from entry points
  const reachedDirectly = new Set<string>();
  // Track the current parsing path for better recursion context
  let isInRecursivePath = false;

  function resolveRef(ref: string): any {
    const schemaName = ref.split('/').pop();
    return schemaName ? componentSchemas[schemaName] : null;
  }

  const basePluginContext: Omit<CodegenPluginContext, 'schemaName'> = {
    parseSchema: (schema: any, schemaName?: string) => parseSchema(schema, schemaName),
    resolveRef,
  };

  function parseSchema(schema: any, schemaName?: string): SerializedNode | null {
    if (!schema) return null;

    // Handle $ref resolution with cycle detection
    if (schema.$ref) {
      const refName = schema.$ref.split('/').pop() || '';
      const cached = schemaCache.get(schema.$ref);

      if (cached?.state === 'parsing') {
        // Circular reference detected!
        console.log(`  🔄 Circular reference detected: ${schema.$ref}`);
        // Mark this schema as reached via recursion for code splitting
        reachedViaRecursion.add(refName);
        isInRecursivePath = true;
        return { description: schema.description, nodeType: 'recursiveRef', refName };
      }

      if (cached?.state === 'complete') {
        // Track that we're referencing this schema
        if (!isInRecursivePath) {
          reachedDirectly.add(refName);
        }
        return cached.node;
      }

      const resolved = resolveRef(schema.$ref);
      if (!resolved) {
        console.log(`  ⚠️ Could not resolve reference, type generation will fail: ${schema.$ref}`);
        return null;
      }

      if (cached) {
        // Mark as parsing and create placeholder
        cached.state = 'parsing';
        const placeholder: any = { nodeType: 'unknown' };
        cached.node = placeholder;

        // Track direct reachability before parsing
        if (!isInRecursivePath) {
          reachedDirectly.add(refName);
        }

        const parsed = parseSchema(resolved, schemaName);

        if (parsed) {
          Object.assign(placeholder, parsed);
        }

        cached.state = 'complete';
        return cached.node;
      }

      return parseSchema(resolved, schemaName);
    }

    // Delegate to plugins for transformation
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
        console.warn(`[@statelyjs/codegen] Plugin "${plugin.name}" failed:`, error);
      }
    }

    // No plugin could parse this schema - return unknown node
    return { description: schema.description, nodeType: 'unknown' };
  }

  const parsedSchemas: Record<string, SerializedNode> = {};

  if (hasEntryPoints) {
    // Parse only from entry points
    // Only entry points become top-level keys in the output - dependencies are inlined
    console.log('🎯 Parsing from entry points...');
    for (const entryPoint of entryPoints) {
      const schema = componentSchemas[entryPoint];
      if (!schema) {
        console.warn(`  ⚠️ Entry point "${entryPoint}" not found in component schemas`);
        continue;
      }

      console.log(`  📝 Parsing entry point: ${entryPoint}...`);
      const refName = `#/components/schemas/${entryPoint}`;

      // Reset recursive path tracking for each entry point
      isInRecursivePath = false;
      reachedDirectly.add(entryPoint);

      const cached = schemaCache.get(refName);
      if (cached?.state === 'complete' && cached.node) {
        parsedSchemas[entryPoint] = cached.node;
        continue;
      }

      const parsed = parseSchema(schema, entryPoint);
      if (parsed) {
        parsedSchemas[entryPoint] = parsed;

        const cacheEntry = schemaCache.get(refName);
        if (cacheEntry) {
          cacheEntry.node = parsed;
          cacheEntry.state = 'complete';
        }
      } else {
        console.warn(`  ⚠️ Failed to parse entry point: ${entryPoint}`);
      }
    }

    // NOTE: We intentionally do NOT add reachedDirectly schemas to parsedSchemas.
    // Dependencies are inlined within the entry point schemas.
    // Only entry points and RecursiveRef targets need to be top-level keys.
  } else {
    // Parse all component schemas (original behavior)
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
  }

  // Separate schemas into main and runtime bundles
  const mainBundleSchemas: Record<string, SerializedNode> = {};
  const runtimeBundleSchemas: Record<string, SerializedNode> = {};

  if (hasEntryPoints && reachedViaRecursion.size > 0) {
    console.log(`\n🔀 Code splitting: ${reachedViaRecursion.size} schema(s) reached via recursion`);

    // Parse recursive schemas for the runtime bundle
    for (const schemaName of reachedViaRecursion) {
      const schema = componentSchemas[schemaName];
      if (!schema) continue;

      console.log(`  📦 Runtime bundle: ${schemaName}`);
      const refName = `#/components/schemas/${schemaName}`;

      // Reset state to parse fresh for runtime bundle
      const cached = schemaCache.get(refName);
      if (cached) {
        cached.state = 'uninitialized';
        cached.node = null;
      }

      isInRecursivePath = false;
      const parsed = parseSchema(schema, schemaName);
      if (parsed) {
        runtimeBundleSchemas[schemaName] = parsed;
      }
    }

    // Main bundle gets everything except recursive schemas
    for (const [schemaName, node] of Object.entries(parsedSchemas)) {
      if (!reachedViaRecursion.has(schemaName)) {
        mainBundleSchemas[schemaName] = node;
      }
    }
  } else {
    // No splitting - everything goes to main bundle
    Object.assign(mainBundleSchemas, parsedSchemas);
  }

  console.log(`\n✅ Main bundle: ${Object.keys(mainBundleSchemas).length} schemas`);
  if (Object.keys(runtimeBundleSchemas).length > 0) {
    console.log(`✅ Runtime bundle: ${Object.keys(runtimeBundleSchemas).length} schemas`);
  }

  // Write main schemas file
  const mainOutput = `// Auto-generated at build time from openapi.json
// DO NOT EDIT MANUALLY - run 'pnpx @statelyjs/codegen' to regenerate

export const PARSED_SCHEMAS = ${JSON.stringify(mainBundleSchemas, null, 2)} as const;

export type ParsedSchemaName = keyof typeof PARSED_SCHEMAS;
`;

  fs.writeFileSync(schemasOutputPath, mainOutput);
  console.log(`💾 Written to ${schemasOutputPath}`);

  // Write runtime schemas file if we have any
  if (Object.keys(runtimeBundleSchemas).length > 0) {
    const runtimeOutput = `// Auto-generated at build time from openapi.json
// DO NOT EDIT MANUALLY - run 'pnpx @statelyjs/codegen' to regenerate
//
// This file contains schemas that are loaded lazily at runtime.
// Import via dynamic import: () => import('./schemas.runtime')

export const RUNTIME_SCHEMAS = ${JSON.stringify(runtimeBundleSchemas, null, 2)} as const;

export type RuntimeSchemaName = keyof typeof RUNTIME_SCHEMAS;
`;

    fs.writeFileSync(runtimeSchemasOutputPath, runtimeOutput);
    console.log(`💾 Written runtime schemas to ${runtimeSchemasOutputPath}`);
  }

  // Generate TypeScript types using openapi-typescript
  console.log('🔧 Generating TypeScript types from OpenAPI spec...');

  try {
    // openapiTS returns a TypeScript AST, convert it to a string
    const ast = await openapiTS(new URL(`file://${path.resolve(resolvedOpenapiPath)}`));
    const typesString = astToString(ast);

    const typesFileContent = `// Auto-generated at build time from openapi.json
// DO NOT EDIT MANUALLY - run 'pnpx @statelyjs/codegen' to regenerate

${typesString}
`;

    fs.writeFileSync(typesOutputPath, typesFileContent);
    console.log(`💾 Written types to ${typesOutputPath}`);
  } catch (error) {
    console.error('❌ Failed to generate TypeScript types:', error);
    console.error('Error details:', error);
    throw error;
  }

  console.log('✨ Schema generation complete!');
}

main().catch(error => {
  console.error('[@statelyjs/codegen] generation failed:', error);
  process.exit(1);
});
