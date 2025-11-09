#!/usr/bin/env node
/**
 * CLI for @stately/codegen
 *
 * Usage: stately-codegen <openapi.json> <output.ts>
 */

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);

if (args.length < 2 || args.length > 3) {
  console.error('Usage: stately-codegen <openapi.json> <output.ts> [pluginConfig.js]');
  console.error('');
  console.error('Example:');
  console.error('  stately-codegen ./openapi.json ./src/generated-schemas.ts ./stately.codegen.config.ts');
  process.exit(1);
}

const [openapiPath, outputPath, pluginConfigPath] = args;

// Validate paths exist
if (!openapiPath || !outputPath) {
  console.error('Both paths are required');
  process.exit(1);
}

// Run the generator
const generatePath = path.join(__dirname, 'generate.js');
const childArgs = [generatePath, openapiPath, outputPath];
if (pluginConfigPath) childArgs.push(pluginConfigPath);

const child = spawn('node', childArgs, {
  stdio: 'inherit' as const,
});

child.on('exit', (code: number | null) => {
  process.exit(code || 0);
});
