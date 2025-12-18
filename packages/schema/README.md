# 🏰 @statelyjs/schema

[![npm](https://img.shields.io/npm/v/@statelyjs/schema)](https://www.npmjs.com/package/@statelyjs/schema)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](../../LICENSE)

> Type definitions and schema parsing for Stately applications

This package provides the foundational type system for Stately's frontend. It parses OpenAPI schemas into a typed AST (Abstract Syntax Tree) that powers the UI's form generation, validation, and type safety.

## Installation

```bash
pnpm add @statelyjs/schema
```

> **Note**: Most users should use `@statelyjs/ui` which re-exports this package with additional UI integration. Use `@statelyjs/schema` directly only if building custom tooling or plugins without the UI layer.

## Core Concepts

### Schema Nodes

OpenAPI schemas are parsed into **nodes** - typed representations of each schema element:

```typescript
// A string field
{ nodeType: 'string', nullable: false }

// An object with properties
{ 
  nodeType: 'object',
  properties: {
    name: { nodeType: 'string', nullable: false },
    age: { nodeType: 'integer', nullable: true },
  },
  required: ['name'],
}

// A reference to another entity
{ nodeType: 'link', inner: { nodeType: 'ref', $ref: '#/components/schemas/SourceConfig' } }
```

### The `Schemas` Type

The `Schemas` type is the **single source of truth** for your application's type system. It combines:

1. **Config**: Your OpenAPI-generated types (components, paths, operations)
2. **Plugins**: Type augmentations from installed plugins
3. **Derived Types**: EntityData, StateEntry, and other computed types

```typescript
import type { Schemas, DefineConfig } from '@statelyjs/schema';
import type { components, paths, operations } from './generated/types';

type MySchemas = Schemas<
  DefineConfig<components, DefinePaths<paths>, DefineOperations<operations>, typeof PARSED_SCHEMAS>
>;
```

### Plugin System

Plugins extend the schema with additional node types:

```typescript
import type { DefinePlugin, NodeMap } from '@statelyjs/schema';

// Define custom nodes
interface MyNodes extends NodeMap {
  myCustomType: { nodeType: 'myCustomType'; value: string };
}

// Create plugin type
export type MyPlugin = DefinePlugin<'my-plugin', MyNodes>;

// Use with Schemas
type AppSchemas = Schemas<MyConfig, readonly [MyPlugin]>;
```

## Usage

### Creating a Stately Runtime

```typescript
import { createStately } from '@statelyjs/schema';
import { PARSED_SCHEMAS } from './generated/schemas';
import openapiDoc from './openapi.json';

const stately = createStately<MySchemas>(openapiDoc, PARSED_SCHEMAS);

// Access schema utilities
const entityNode = stately.utils.getNode('Pipeline');
const isValid = stately.utils.validate(data, 'Pipeline');
```

### With Code Splitting

When using `@statelyjs/codegen` with entry points, some schemas are split into a separate runtime bundle for lazy loading. Configure the loader to enable this:

```typescript
import { createStately } from '@statelyjs/schema';
import { PARSED_SCHEMAS } from './generated/schemas';
import openapiDoc from './openapi.json';

const stately = createStately<MySchemas>(openapiDoc, PARSED_SCHEMAS, {
  // Enable lazy loading for code-split schemas
  runtimeSchemas: () => import('./generated/schemas.runtime').then(m => m.RUNTIME_SCHEMAS),
});
```

This is optional - if no `schemas.runtime.ts` was generated, you don't need this option.

### With Plugins

```typescript
import { createStately } from '@statelyjs/schema';
import { filesPlugin } from '@statelyjs/files';

const stately = createStately<MySchemas>(openapiDoc, PARSED_SCHEMAS)
  .withPlugin(filesPlugin());

// Plugin utilities are now available
stately.plugins.files.utils.formatPath('/some/path');
```

## Type Helpers

### DefineConfig

Combines your generated types into a schema configuration:

```typescript
type MyConfig = DefineConfig<
  components,           // OpenAPI components
  DefinePaths<paths>,   // API paths
  DefineOperations<operations>,  // Operations
  typeof PARSED_SCHEMAS // Generated schema nodes
>;
```

### DefinePlugin

Declares a plugin's type augmentations:

```typescript
type MyPlugin = DefinePlugin<
  'my-plugin',     // Unique name (string literal)
  MyNodes,         // Node map
  MyTypes,         // Additional types
  MyData,          // Data utilities
  MyUtils          // Utility functions
>;
```

### Extracting Types

```typescript
import type { Schemas } from '@statelyjs/schema';

// Get the StateEntry union (entity type names)
type StateEntry = MySchemas['config']['components']['schemas']['StateEntry'];

// Get entity data types
type EntityData = MySchemas['types']['EntityData'];

// Get all nodes from plugins
type AllNodes = MySchemas['plugin']['AnyNode'];
```

## Integration with @statelyjs/codegen

The `@statelyjs/codegen` CLI generates the files this package consumes:

```bash
pnpx @statelyjs/codegen ./openapi.json ./src/generated
```

This produces:
- `types.ts` - TypeScript interfaces matching your OpenAPI spec
- `schemas.ts` - Parsed `PARSED_SCHEMAS` object for runtime use

## Node Types

### Primitives

| Node Type | Description |
|-----------|-------------|
| `string` | String values, with optional format (date, uri, etc.) |
| `integer` | Integer numbers |
| `number` | Floating point numbers |
| `boolean` | Boolean values |
| `null` | Null values |

### Composites

| Node Type | Description |
|-----------|-------------|
| `object` | Objects with typed properties |
| `array` | Arrays with typed items |
| `record` | Dictionaries with string keys |
| `tuple` | Fixed-length arrays with typed positions |

### References

| Node Type | Description |
|-----------|-------------|
| `ref` | Reference to another schema (`$ref`) |
| `link` | Stately `Link<T>` - inline or by-reference entity |

### Unions

| Node Type | Description |
|-----------|-------------|
| `union` | Union of multiple types (`oneOf`) |
| `enum` | Enumeration of string values |
| `discriminatedUnion` | Tagged union with discriminator property |

### Special

| Node Type | Description |
|-----------|-------------|
| `unknown` | Unknown/any type |
| `const` | Constant value |

## Validation

```typescript
import type { ValidationResult } from '@statelyjs/schema';

const result: ValidationResult = stately.utils.validate(data, 'Pipeline');

if (!result.valid) {
  console.log(result.errors);
  // [{ path: ['name'], message: 'Required field missing' }]
}
```

## API Reference

### `createStately(openapiDoc, parsedSchemas)`

Creates a Stately schema runtime.

### `isNodeOfType(node, nodeType)`

Type guard for checking node types:

```typescript
if (isNodeOfType(node, 'string')) {
  // node is typed as StringNode
}
```

### `createOperationBindingsFactory()`

Creates typed API operation bindings from paths.

## License

Apache-2.0
