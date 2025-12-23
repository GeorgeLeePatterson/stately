#!/usr/bin/env node
/**
 * Stately CLI entry point
 *
 * Usage:
 *   stately generate <openapi.json> -o <output_dir> [-c <config>]
 *
 * Examples:
 *   stately generate ./openapi.json -o ./src/generated
 *   stately generate ./openapi.json --output ./src/lib/generated --config ./stately.config.ts
 */

import('../dist/cli/index.mjs');
