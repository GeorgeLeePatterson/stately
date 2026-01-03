# codegen

Codegen plugin types for building custom schema transformers.

This module provides the types needed to create custom codegen plugins
that transform OpenAPI schemas into Stately's internal node representation.

## Example

```typescript
import type { CodegenPlugin } from '@statelyjs/stately/codegen';

const myPlugin: CodegenPlugin = {
  name: 'my-plugin',
  match: (schema) => schema['x-my-custom'] !== undefined,
  transform: (schema, ctx) => ({
    type: 'custom',
    // ... transform logic
  }),
};
```

## Interfaces

### CodegenPlugin

Defined in: [packages/stately/src/codegen/config.ts:65](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/codegen/config.ts#L65)

A codegen plugin that transforms OpenAPI schemas to SerializedNodes.

#### Properties

##### description?

> `optional` **description**: `string`

Defined in: [packages/stately/src/codegen/config.ts:69](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/codegen/config.ts#L69)

Human-readable description

##### entryPoints()?

> `optional` **entryPoints**: (`spec`) => `string`[] \| `undefined`

Defined in: [packages/stately/src/codegen/config.ts:80](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/codegen/config.ts#L80)

Optional function to declare entry point schemas for code splitting.
Entry points are parsed into the main bundle; schemas reached only
through recursion are split into a runtime bundle for lazy loading.

If not provided or returns undefined/empty, all schemas are bundled together.

###### Parameters

###### spec

[`OpenAPISpec`](#openapispec)

The full OpenAPI specification

###### Returns

`string`[] \| `undefined`

Array of schema names to use as entry points

##### match()?

> `optional` **match**: (`schema`, `ctx`) => `boolean`

Defined in: [packages/stately/src/codegen/config.ts:85](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/codegen/config.ts#L85)

Optional predicate to determine if this plugin should handle a schema.
If not provided, the plugin is considered a match for all schemas.

###### Parameters

###### schema

`any`

###### ctx

[`CodegenPluginContext`](#codegenplugincontext)

###### Returns

`boolean`

##### name

> **name**: `string`

Defined in: [packages/stately/src/codegen/config.ts:67](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/codegen/config.ts#L67)

Unique identifier for the plugin

##### transform()

> **transform**: (`schema`, `ctx`) => `SerializedNode` \| `null` \| `undefined`

Defined in: [packages/stately/src/codegen/config.ts:90](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/codegen/config.ts#L90)

Transform a schema into a SerializedNode.
Return null/undefined to pass to the next plugin.

###### Parameters

###### schema

`any`

###### ctx

[`CodegenPluginContext`](#codegenplugincontext)

###### Returns

`SerializedNode` \| `null` \| `undefined`

***

### CodegenPluginContext

Defined in: [packages/stately/src/codegen/config.ts:53](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/codegen/config.ts#L53)

Context provided to plugins during schema transformation.

#### Properties

##### parseSchema()

> **parseSchema**: (`schema`, `schemaName?`) => `SerializedNode` \| `null`

Defined in: [packages/stately/src/codegen/config.ts:59](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/codegen/config.ts#L59)

Recursively parse a schema (for nested structures)

###### Parameters

###### schema

`any`

###### schemaName?

`string`

###### Returns

`SerializedNode` \| `null`

##### resolveRef()

> **resolveRef**: (`ref`) => `any`

Defined in: [packages/stately/src/codegen/config.ts:57](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/codegen/config.ts#L57)

Resolve a $ref string to its schema definition

###### Parameters

###### ref

`string`

###### Returns

`any`

##### schemaName?

> `optional` **schemaName**: `string`

Defined in: [packages/stately/src/codegen/config.ts:55](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/codegen/config.ts#L55)

The name of the schema being parsed (if known)

***

### OpenAPISpec

Defined in: [packages/stately/src/codegen/config.ts:41](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/codegen/config.ts#L41)

OpenAPI specification structure (minimal typing for plugin use).

#### Indexable

\[`key`: `string`\]: `any`

#### Properties

##### components?

> `optional` **components**: `object`

Defined in: [packages/stately/src/codegen/config.ts:42](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/stately/src/codegen/config.ts#L42)

###### schemas?

> `optional` **schemas**: `Record`\<`string`, `any`\>
