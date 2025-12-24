/**
 * Pure schema parser for the codegen system.
 *
 * Transforms OpenAPI schemas into SerializedNodes using plugins.
 * Handles circular references and code splitting.
 *
 * This module is pure - no IO, no side effects beyond the optional logger.
 */

import type {
  CodegenPlugin,
  CodegenPluginContext,
  OpenAPISpec,
  SchemaCache,
  SerializedNode,
} from './config.js';

// =============================================================================
// Types
// =============================================================================

export interface ParseResult {
  mainSchemas: Record<string, SerializedNode>;
  runtimeSchemas: Record<string, SerializedNode>;
}

export interface ParseOptions {
  /** Optional logger for progress messages */
  log?: (message: string) => void;
}

// =============================================================================
// Parse Context
// =============================================================================

interface ParseContext {
  readonly plugins: CodegenPlugin[];
  readonly componentSchemas: Record<string, any>;
  readonly log: (message: string) => void;
  schemaCache: Map<string, SchemaCache>;
  reachedViaRecursion: Set<string>;
}

function createParseContext(
  plugins: CodegenPlugin[],
  componentSchemas: Record<string, any>,
  log: (message: string) => void,
): ParseContext {
  const schemaCache = new Map<string, SchemaCache>();
  for (const schemaName in componentSchemas) {
    schemaCache.set(`#/components/schemas/${schemaName}`, {
      node: null,
      state: 'uninitialized',
    });
  }

  return {
    plugins,
    componentSchemas,
    log,
    schemaCache,
    reachedViaRecursion: new Set(),
  };
}

// =============================================================================
// Ref Resolution
// =============================================================================

function resolveRef(ctx: ParseContext, ref: string): any {
  const schemaName = ref.split('/').pop();
  return schemaName ? ctx.componentSchemas[schemaName] : null;
}

// =============================================================================
// Schema Parsing
// =============================================================================

function parseSchema(
  ctx: ParseContext,
  schema: any,
  schemaName?: string,
): SerializedNode | null {
  if (!schema) return null;

  // Handle $ref resolution with cycle detection
  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop() || '';
    const cached = ctx.schemaCache.get(schema.$ref);

    if (cached?.state === 'parsing') {
      // Circular reference detected
      ctx.log(`  🔄 Circular reference detected: ${schema.$ref}`);
      ctx.reachedViaRecursion.add(refName);
      return { description: schema.description, nodeType: 'recursiveRef', refName };
    }

    if (cached?.state === 'complete') {
      return cached.node;
    }

    const resolved = resolveRef(ctx, schema.$ref);
    if (!resolved) {
      ctx.log(`  ⚠️ Could not resolve reference, type generation will fail: ${schema.$ref}`);
      return null;
    }

    if (cached) {
      // Mark as parsing and create placeholder
      cached.state = 'parsing';
      const placeholder: any = { nodeType: 'unknown' };
      cached.node = placeholder;

      const parsed = parseSchema(ctx, resolved, schemaName);

      if (parsed) {
        Object.assign(placeholder, parsed);
      }

      cached.state = 'complete';
      return cached.node;
    }

    return parseSchema(ctx, resolved, schemaName);
  }

  // Create plugin context (bridge to hide internal ParseContext)
  const pluginContext: CodegenPluginContext = {
    schemaName,
    resolveRef: (ref) => resolveRef(ctx, ref),
    parseSchema: (s, name) => parseSchema(ctx, s, name),
  };

  // Delegate to plugins for transformation
  for (const plugin of ctx.plugins) {
    try {
      const matches = plugin.match ? plugin.match(schema, pluginContext) : true;
      if (!matches) continue;
      const result = plugin.transform(schema, pluginContext);
      if (result) {
        return result;
      }
    } catch (error) {
      ctx.log(`[@statelyjs/codegen] Plugin "${plugin.name}" failed: ${error}`);
    }
  }

  // No plugin could parse this schema
  return { description: schema.description, nodeType: 'unknown' };
}

// =============================================================================
// Entry Point Parsing
// =============================================================================

function collectEntryPoints(
  ctx: ParseContext,
  spec: OpenAPISpec,
): Set<string> {
  const entryPoints = new Set<string>();

  for (const plugin of ctx.plugins) {
    if (plugin.entryPoints) {
      const pluginEntries = plugin.entryPoints(spec);
      if (pluginEntries?.length) {
        ctx.log(`📍 Plugin "${plugin.name}" declared ${pluginEntries.length} entry points`);
        for (const entrypoint of pluginEntries) {
          entryPoints.add(entrypoint);
        }
      }
    }
  }

  return entryPoints;
}

function parseFromEntryPoints(
  ctx: ParseContext,
  entryPoints: Set<string>,
): Record<string, SerializedNode> {
  const parsedSchemas: Record<string, SerializedNode> = {};

  ctx.log('🎯 Parsing from entry points...');
  for (const entryPoint of entryPoints) {
    const schema = ctx.componentSchemas[entryPoint];
    if (!schema) {
      ctx.log(`  ⚠️ Entry point "${entryPoint}" not found in component schemas`);
      continue;
    }

    ctx.log(`  📝 Parsing entry point: ${entryPoint}...`);
    const refName = `#/components/schemas/${entryPoint}`;

    const cached = ctx.schemaCache.get(refName);
    if (cached?.state === 'complete' && cached.node) {
      parsedSchemas[entryPoint] = cached.node;
      continue;
    }

    const parsed = parseSchema(ctx, schema, entryPoint);
    if (parsed) {
      parsedSchemas[entryPoint] = parsed;

      const cacheEntry = ctx.schemaCache.get(refName);
      if (cacheEntry) {
        cacheEntry.node = parsed;
        cacheEntry.state = 'complete';
      }
    } else {
      ctx.log(`  ⚠️ Failed to parse entry point: ${entryPoint}`);
    }
  }

  return parsedSchemas;
}

function parseAllSchemas(ctx: ParseContext): Record<string, SerializedNode> {
  const parsedSchemas: Record<string, SerializedNode> = {};

  for (const [schemaName, schema] of Object.entries(ctx.componentSchemas)) {
    try {
      ctx.log(`  📝 Parsing ${schemaName}...`);
      const refName = `#/components/schemas/${schemaName}`;

      const cached = ctx.schemaCache.get(refName);
      if (cached?.state === 'complete' && cached.node) {
        parsedSchemas[schemaName] = cached.node;
        continue;
      }

      const parsed = parseSchema(ctx, schema, schemaName);
      if (parsed) {
        parsedSchemas[schemaName] = parsed;

        const cacheEntry = ctx.schemaCache.get(refName);
        if (cacheEntry) {
          cacheEntry.node = parsed;
          cacheEntry.state = 'complete';
        }
      } else {
        ctx.log(`  ⚠️ Failed to parse ${schemaName}`);
      }
    } catch (err) {
      ctx.log(`  ❌ Error parsing ${schemaName}: ${err}`);
    }
  }

  return parsedSchemas;
}

// =============================================================================
// Bundle Splitting
// =============================================================================

function splitBundles(
  ctx: ParseContext,
  parsedSchemas: Record<string, SerializedNode>,
  hasEntryPoints: boolean,
): ParseResult {
  const mainSchemas: Record<string, SerializedNode> = {};
  const runtimeSchemas: Record<string, SerializedNode> = {};

  if (hasEntryPoints && ctx.reachedViaRecursion.size > 0) {
    ctx.log(`\n🔀 Code splitting: ${ctx.reachedViaRecursion.size} schema(s) reached via recursion`);

    // Parse recursive schemas for the runtime bundle
    for (const schemaName of ctx.reachedViaRecursion) {
      const schema = ctx.componentSchemas[schemaName];
      if (!schema) continue;

      ctx.log(`  📦 Runtime bundle: ${schemaName}`);
      const refName = `#/components/schemas/${schemaName}`;

      // Reset state to parse fresh for runtime bundle
      const cached = ctx.schemaCache.get(refName);
      if (cached) {
        cached.state = 'uninitialized';
        cached.node = null;
      }

      const parsed = parseSchema(ctx, schema, schemaName);
      if (parsed) {
        runtimeSchemas[schemaName] = parsed;
      }
    }

    // Main bundle gets everything except recursive schemas
    for (const [schemaName, node] of Object.entries(parsedSchemas)) {
      if (!ctx.reachedViaRecursion.has(schemaName)) {
        mainSchemas[schemaName] = node;
      }
    }
  } else {
    Object.assign(mainSchemas, parsedSchemas);
  }

  return { mainSchemas, runtimeSchemas };
}

// =============================================================================
// Main Entry Point
// =============================================================================

/**
 * Parse OpenAPI schemas into SerializedNodes.
 *
 * This is a pure function - no IO operations, only data transformation.
 */
export function parse(
  spec: OpenAPISpec,
  plugins: CodegenPlugin[],
  options: ParseOptions = {},
): ParseResult {
  const log = options.log ?? (() => {});
  const componentSchemas = spec.components?.schemas ?? {};

  log('🔧 Parsing schemas from OpenAPI spec...');
  log(`📋 Found ${Object.keys(componentSchemas).length} component schemas`);

  const ctx = createParseContext(plugins, componentSchemas, log);

  // Collect entry points from plugins
  const entryPoints = collectEntryPoints(ctx, spec);
  const hasEntryPoints = entryPoints.size > 0;

  if (hasEntryPoints) {
    log(`📍 Total entry points: ${entryPoints.size}`);
  } else {
    log('📦 No entry points declared - bundling all schemas together');
  }

  // Parse schemas
  const parsedSchemas = hasEntryPoints
    ? parseFromEntryPoints(ctx, entryPoints)
    : parseAllSchemas(ctx);

  // Split into main and runtime bundles
  const result = splitBundles(ctx, parsedSchemas, hasEntryPoints);

  log(`\n✅ Main bundle: ${Object.keys(result.mainSchemas).length} schemas`);
  if (Object.keys(result.runtimeSchemas).length > 0) {
    log(`✅ Runtime bundle: ${Object.keys(result.runtimeSchemas).length} schemas`);
  }

  return result;
}
