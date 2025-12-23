#!/usr/bin/env node
/**
 * Stately CLI
 *
 * A schema-driven UI framework with codegen and plugin system.
 *
 * Commands:
 *   generate  Generate TypeScript schemas and types from an OpenAPI spec
 *
 * Examples:
 *   stately generate ./openapi.json -o ./src/generated
 *   stately generate ./openapi.json --output ./src/lib/generated --config ./stately.config.ts
 */

import { Command } from 'commander';
import { generate } from '../codegen/generate.js';

const program = new Command();

program
  .name('stately')
  .description('Stately - Schema-driven UI runtime with codegen and plugin system')
  .version('0.0.1');

program
  .command('generate')
  .description('Generate TypeScript schemas and types from an OpenAPI spec')
  .argument('<openapi>', 'Path to the OpenAPI JSON file')
  .option('-o, --output <dir>', 'Output directory for generated files', './src/generated')
  .option('-c, --config <file>', 'Path to a plugin config file (e.g., stately.config.ts)')
  .action(async (openapi: string, options: { output: string; config?: string }) => {
    try {
      await generate({ config: options.config, input: openapi, output: options.output });
    } catch (error) {
      console.error('[@statelyjs/stately] Generation failed:', error);
      process.exit(1);
    }
  });

program.parse();
