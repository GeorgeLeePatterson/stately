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
npx stately-codegen ./openapi.json --output ./src/generated

# Or via package.json script
{
  "scripts": {
    "codegen": "stately-codegen ./openapi.json"
  }
}
```

## What it Generates

- **api.ts** - OpenAPI TypeScript types (via `openapi-typescript`)
- **schemas.ts** - Parsed schema definitions for UI components

## License

Apache-2.0
