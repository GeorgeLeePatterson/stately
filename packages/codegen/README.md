# @statelyjs/codegen

[![npm](https://img.shields.io/npm/v/@statelyjs/codegen)](https://www.npmjs.com/package/@statelyjs/codegen)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../LICENSE)

> Build-time code generation for Stately UI

Generate TypeScript types and schema definitions from OpenAPI specifications for use with `@statelyjs/ui` components.

## Installation

```bash
pnpm add -D @statelyjs/codegen
```

## Usage

```bash
# Basic usage
pnpx @statelyjs/codegen ./openapi.json ./src/generated

# With custom plugins
pnpx @statelyjs/codegen ./openapi.json ./src/generated ./stately.codegen.config.ts
```

### Generated Files

The CLI generates two files in your output directory:

| File | Description |
|------|-------------|
| `schemas.ts` | Parsed schema nodes for form generation and validation |
| `types.ts` | Full TypeScript types from OpenAPI (components, paths, operations) |

### Example Output

```typescript
// src/generated/schemas.ts
export const PARSED_SCHEMAS = {
  Pipeline: {
    nodeType: 'object',
    properties: {
      name: { nodeType: 'string', nullable: false },
      source: { nodeType: 'link', inner: { nodeType: 'ref', $ref: '#/components/schemas/SourceConfig' } },
    },
    required: ['name', 'source'],
  },
  // ... more schemas
} as const;

// src/generated/types.ts
export interface components {
  schemas: {
    Pipeline: { name: string; source: Link<SourceConfig> };
    SourceConfig: { name: string; url: string };
    // ...
  };
}
// ... paths, operations
```

## Custom Plugins

Plugins allow you to handle custom schema formats or transformations:

```typescript
// stately.codegen.config.ts
import type { CodegenPlugin } from '@statelyjs/codegen';

const relativePathPlugin: CodegenPlugin = {
  name: 'relative-path',
  
  // Match schemas with format: 'relativePath'
  match(schema) {
    return schema?.format === 'relativePath';
  },
  
  // Transform to custom node type
  transform(schema, ctx) {
    const inner = ctx.parseSchema({ type: 'string' }, ctx.schemaName);
    return inner
      ? {
          nodeType: 'relativePath',
          inner,
        }
      : null;
  },
};

export default [relativePathPlugin];
```

### Plugin Context

Plugins receive a context object with helpers:

```typescript
interface CodegenPluginContext {
  // Parse a nested schema recursively
  parseSchema(schema: SchemaObject, name: string): SchemaNode | null;
  
  // Resolve a $ref to its schema
  resolveRef(ref: string): SchemaObject | undefined;
  
  // Current schema name being processed
  schemaName: string;
}
```

### Built-in Core Plugin

`@statelyjs/codegen` always includes the core plugin, which handles:

- Primitive types (string, number, boolean, integer)
- Objects and arrays
- Enums and unions
- References (`$ref`)
- Stately's `Link<T>` type

Custom plugins only need to handle additional node types specific to your application.

## Workflow

1. **Backend changes**: Update your Rust entities
2. **Generate OpenAPI**: Export your backend's OpenAPI spec
3. **Run codegen**: `pnpx @statelyjs/codegen ./openapi.json ./src/generated`
4. **Types updated**: Your frontend now has updated types

For backend plugins like `stately-files` or `stately-arrow`, run codegen after any API changes:

```bash
# In your frontend package
pnpm codegen
```

## Integration with @statelyjs/ui

The generated files are consumed by the Stately UI runtime:

```typescript
import { stately } from '@statelyjs/ui/schema';
import { PARSED_SCHEMAS } from './generated/schemas';
import type { components, operations, paths } from './generated/types';
import openapiDoc from './openapi.json';

const schema = stately<MySchemas>(openapiDoc, PARSED_SCHEMAS);
```

## CLI Reference

```
Usage: pnpx @statelyjs/codegen <openapi.json> <output_dir> [pluginConfig.js]

Arguments:
  openapi.json      Path to OpenAPI 3.x specification
  output_dir        Directory for generated files
  pluginConfig.js   Optional path to plugin configuration

Example:
  pnpx @statelyjs/codegen ./openapi.json ./src/generated
  pnpx @statelyjs/codegen ./openapi.json ./src/generated ./stately.codegen.config.ts
```

## License

Apache-2.0
