/**
 * OpenAPI spec reading and TypeScript type generation.
 *
 * Handles reading OpenAPI specs and generating TypeScript types via openapi-typescript.
 */

import openapiTS, { astToString } from 'openapi-typescript';

import type { CodegenIO } from './fs.js';
import type { OpenAPISpec } from './config.js';

// =============================================================================
// Reading
// =============================================================================

/**
 * Read and parse an OpenAPI spec from a JSON file.
 */
export function readOpenAPISpec(io: CodegenIO, inputPath: string): OpenAPISpec {
  const resolved = io.resolvePath(inputPath);
  const content = io.readFile(resolved);
  return JSON.parse(content);
}

// =============================================================================
// Writing
// =============================================================================

const TYPES_HEADER = `// Auto-generated at build time from openapi.json
// DO NOT EDIT MANUALLY - run 'stately generate' to regenerate

`;

/**
 * Generate TypeScript types from an OpenAPI spec and write to file.
 */
export async function writeTypes(
  io: CodegenIO,
  outputPath: string,
  specPath: string,
): Promise<void> {
  const resolvedSpecPath = io.resolvePath(specPath);

  io.log('🔧 Generating TypeScript types from OpenAPI spec...');

  try {
    const ast = await openapiTS(new URL(`file://${resolvedSpecPath}`));
    const typesString = astToString(ast);
    const content = TYPES_HEADER + typesString;

    io.writeFile(outputPath, content);
    io.log(`💾 Written types to ${outputPath}`);
  } catch (error) {
    io.log(`❌ Failed to generate TypeScript types: ${error}`);
    throw error;
  }
}
