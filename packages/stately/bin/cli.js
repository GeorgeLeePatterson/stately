#!/usr/bin/env node
/**
 * CLI for @statelyjs/stately codegen
 *
 * Usage: pnpx @statelyjs/stately <openapi.json> <output_dir> [pluginConfig.js]
 *
 * Generates:
 *   <output_dir>/schemas.ts  - Parsed schema nodes for form generation
 *   <output_dir>/types.ts    - Full OpenAPI types (paths, operations, components)
 */

import('../dist/codegen/generate.mjs');
