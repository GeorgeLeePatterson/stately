# @stately/codegen

> Build-time code generation for Stately UI

Generate TypeScript types and schema definitions from OpenAPI specifications for use with Stately UI components.

## Installation

```bash
pnpm add -D @stately/codegen
```

## Usage

```bash
# Generate schemas from OpenAPI spec
npx stately-codegen ./openapi.json ./src/generated-schemas.ts

# With plugins
npx stately-codegen ./openapi.json ./src/generated-schemas.ts ./stately.codegen.config.ts
```

Example `stately.codegen.config.ts`:

```ts
import type { CodegenPlugin } from '@stately/codegen';

const relativePathPlugin: CodegenPlugin = {
  name: 'relative-path',
  match(schema) {
    return schema?.format === 'relativePath';
  },
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

`@stately/codegen` always includes the core plugin, so custom plugins only need to handle additional node types. Plugins receive helpers to resolve `$ref`s and to recursively parse nested schemas.

## License

Apache-2.0
