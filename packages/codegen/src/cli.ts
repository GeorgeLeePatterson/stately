#!/usr/bin/env node
/**
 * CLI for @statelyjs/codegen
 *
 * Usage: pnpx @statelyjs/codegen <openapi.json> <output_dir> [pluginConfig.js]
 *
 * Generates:
 *   <output_dir>/schemas.ts  - Parsed schema nodes for form generation
 *   <output_dir>/types.ts    - Full OpenAPI types (paths, operations, components)
 */

import { spawn } from 'node:child_process';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);

if (args.length < 2 || args.length > 3) {
  console.error('Usage: pnpx @statelyjs/codegen <openapi.json> <output_dir> [pluginConfig.js]');
  console.error('');
  console.error('Generates:');
  console.error('  <output_dir>/schemas.ts  - Parsed schema nodes for form generation');
  console.error('  <output_dir>/types.ts    - Full OpenAPI types (paths, operations, components)');
  console.error('');
  console.error('Example:');
  console.error(
    '  pnpx @statelyjs/codegen ./openapi.json ./src/generated ./stately.codegen.config.ts',
  );
  process.exit(1);
}

const [openapiPath, outputDir, pluginConfigPath] = args;

// Validate paths exist
if (!openapiPath || !outputDir) {
  console.error('Both openapi.json path and output directory are required');
  process.exit(1);
}

// Run the generator
const generatePath = path.join(__dirname, 'generate.js');
const childArgs = [generatePath, openapiPath, outputDir];
if (pluginConfigPath) childArgs.push(pluginConfigPath);

const child = spawn('node', childArgs, { stdio: 'inherit' as const });

child.on('exit', (code: number | null) => {
  process.exit(code || 0);
});
