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

import { nodeFS } from '../codegen/fs.js';
import { readOpenAPISpec, writeTypes } from '../codegen/openapi.js';
import { parse } from '../codegen/parser.js';
import { loadPlugins, writePluginOutput } from '../codegen/plugins.js';
import { createCoreCodegenPlugin } from '../core/codegen.js';

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
    const io = nodeFS;

    try {
      // Resolve paths
      const inputPath = io.resolvePath(openapi);
      const outputDir = io.resolvePath(options.output);
      const typesPath = io.joinPath(outputDir, 'types.ts');

      // Validate input exists
      if (!io.exists(inputPath)) {
        io.log(`❌ OpenAPI spec not found: ${inputPath}`);
        process.exit(1);
      }

      // Load inputs
      const spec = readOpenAPISpec(io, inputPath);
      const userPlugins = await loadPlugins(io, options.config);
      if (userPlugins.length) {
        io.log(`🔌 Loaded ${userPlugins.length} @statelyjs/codegen plugin(s)`);
      }
      const plugins = [...userPlugins, createCoreCodegenPlugin()];

      // Parse (pure transformation)
      const result = parse(spec, plugins, { log: io.log });

      // Write outputs
      io.ensureDir(outputDir);
      writePluginOutput(io, outputDir, result);
      await writeTypes(io, typesPath, inputPath);

      io.log('✨ Schema generation complete!');
    } catch (error) {
      io.log(`❌ Generation failed: ${error}`);
      process.exit(1);
    }
  });

program.parse();
