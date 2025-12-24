/**
 * Plugin loading and output writing for the codegen system.
 *
 * Handles loading plugins from config files and writing parsed schema output.
 */

import { pathToFileURL } from 'node:url';

import type { CodegenIO } from './fs.js';
import type { CodegenPlugin } from './config.js';
import type { ParseResult } from './parser.js';

// =============================================================================
// Plugin Loading
// =============================================================================

function normalizePluginCandidate(value: unknown): CodegenPlugin[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap(normalizePluginCandidate);
  }
  return [value as CodegenPlugin];
}

function isCodegenPlugin(candidate: unknown): candidate is CodegenPlugin {
  return (
    typeof candidate === 'object' &&
    candidate !== null &&
    typeof (candidate as CodegenPlugin).name === 'string' &&
    typeof (candidate as CodegenPlugin).transform === 'function'
  );
}

/**
 * Load codegen plugins from a config file.
 */
export async function loadPlugins(
  io: CodegenIO,
  configPath?: string,
): Promise<CodegenPlugin[]> {
  if (!configPath) return [];

  const resolved = io.resolvePath(configPath);
  if (!io.exists(resolved)) {
    io.log(`⚠️ Plugin config not found at ${resolved}`);
    return [];
  }

  try {
    const moduleUrl = pathToFileURL(resolved).href;
    const imported = await import(moduleUrl);
    const candidates = normalizePluginCandidate(imported?.default).concat(
      normalizePluginCandidate(imported?.plugins),
      normalizePluginCandidate(imported?.codegenPlugins),
    );
    const plugins = candidates.filter(isCodegenPlugin);
    if (!plugins.length) {
      io.log('⚠️ No plugins exported from config');
    }
    return plugins;
  } catch (error) {
    io.log(`❌ Failed to load plugin config: ${error}`);
    throw error;
  }
}

// =============================================================================
// Output Writing
// =============================================================================

const SCHEMAS_HEADER = `// Auto-generated at build time from openapi.json
// DO NOT EDIT MANUALLY - run 'stately generate' to regenerate

`;

const RUNTIME_SCHEMAS_HEADER = `// Auto-generated at build time from openapi.json
// DO NOT EDIT MANUALLY - run 'stately generate' to regenerate
//
// This file contains schemas that are loaded lazily at runtime.
// Import via dynamic import: () => import('./schemas.runtime')

`;

/**
 * Write parsed schema output to files.
 */
export function writePluginOutput(
  io: CodegenIO,
  outputDir: string,
  result: ParseResult,
): void {
  const schemasPath = io.joinPath(outputDir, 'schemas.ts');
  const runtimeSchemasPath = io.joinPath(outputDir, 'schemas.runtime.ts');

  // Write main schemas
  const mainContent = `${SCHEMAS_HEADER}export const PARSED_SCHEMAS = ${JSON.stringify(result.mainSchemas, null, 2)} as const;

export type ParsedSchema = typeof PARSED_SCHEMAS;
`;

  io.writeFile(schemasPath, mainContent);
  io.log(`💾 Written to ${schemasPath}`);

  // Write runtime schemas if any
  if (Object.keys(result.runtimeSchemas).length > 0) {
    const runtimeContent = `${RUNTIME_SCHEMAS_HEADER}export const RUNTIME_SCHEMAS = ${JSON.stringify(result.runtimeSchemas, null, 2)} as const;

export type RuntimeSchema = typeof RUNTIME_SCHEMAS;
`;

    io.writeFile(runtimeSchemasPath, runtimeContent);
    io.log(`💾 Written runtime schemas to ${runtimeSchemasPath}`);
  }
}
