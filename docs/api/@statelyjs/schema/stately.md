# stately

@statelyjs/schema - Stately Schema Runtime

This module provides the schema runtime that powers Stately's form generation
and validation. It parses OpenAPI schemas into typed AST nodes and provides
utilities for working with entity data.

## Overview

The schema runtime is created from two inputs:
1. **OpenAPI document** - The raw JSON/object for runtime introspection
2. **Generated nodes** - Pre-parsed schema nodes from codegen (`PARSED_SCHEMAS`)

Type safety comes from your generated TypeScript types, while the OpenAPI
document enables runtime features like dynamic field rendering.

## Basic Usage

```typescript
import { createStately } from '@statelyjs/schema';
import { PARSED_SCHEMAS } from './generated/schemas';
import openapiDoc from './openapi.json';

const schema = createStately<MySchemas>(openapiDoc, PARSED_SCHEMAS);

// Access schema nodes
const pipelineSchema = schema.schema.nodes['Pipeline'];

// Validate data
const result = schema.validate({
  data: { name: 'My Pipeline' },
  schema: pipelineSchema,
  path: 'Pipeline',
});
```

## With Plugins

Schema plugins extend the runtime with additional data, utilities, and validation:

```typescript
import { corePlugin } from '@statelyjs/stately/core';

const schema = createStately<MySchemas>(openapiDoc, PARSED_SCHEMAS)
  .withPlugin(corePlugin());

// Access plugin utilities
schema.plugins.core.sortEntityProperties(...);
```

## Interfaces

### CreateStatelyOptions

Defined in: [stately.ts:145](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/stately.ts#L145)

Options for creating a Stately schema runtime.

#### Type Parameters

##### S

`S` *extends* [`StatelySchemas`](schema.md#statelyschemas)\<`any`, `any`\>

#### Properties

##### runtimeSchemas?

> `optional` **runtimeSchemas**: [`RuntimeSchemaLoader`](#runtimeschemaloader)\<`S`\>

Defined in: [stately.ts:159](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/stately.ts#L159)

Optional loader for code-split runtime schemas.

Provide this when using codegen with entry points to enable lazy loading
of schemas that were split out (e.g., recursive schemas).

###### Example

```typescript
const schema = createStately<MySchemas>(openapiDoc, PARSED_SCHEMAS, {
  runtimeSchemas: () => import('./generated/schemas.runtime').then(m => m.RUNTIME_SCHEMAS),
});
```

***

### Stately

Defined in: [stately.ts:103](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/stately.ts#L103)

The Stately schema runtime.

Contains the parsed schema nodes, plugin data, and validation utilities.
Created via `createStately()`.

#### Extended by

- [`StatelyBuilder`](#statelybuilder)

#### Type Parameters

##### S

`S` *extends* [`StatelySchemas`](schema.md#statelyschemas)\<`any`, `any`\>

The application's schema type

#### Properties

##### data

> **data**: `S`\[`"data"`\]

Defined in: [stately.ts:112](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/stately.ts#L112)

Plugin-contributed data (entity caches, computed values, etc.)

##### loadRuntimeSchemas?

> `optional` **loadRuntimeSchemas**: [`RuntimeSchemaLoader`](#runtimeschemaloader)\<`S`\>

Defined in: [stately.ts:121](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/stately.ts#L121)

Optional loader for code-split runtime schemas.
When provided, RecursiveRef nodes can resolve schemas that were split out during codegen.

##### plugins

> **plugins**: `S`\[`"utils"`\]

Defined in: [stately.ts:114](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/stately.ts#L114)

Plugin-contributed utilities and validation hooks

##### schema

> **schema**: `object`

Defined in: [stately.ts:105](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/stately.ts#L105)

The schema document and parsed nodes

###### document

> **document**: `any`

Raw OpenAPI document for runtime introspection

###### nodes

> **nodes**: [`StatelySchemaConfig`](schema.md#statelyschemaconfig)\<`S`\>\[`"nodes"`\]

Pre-parsed schema nodes from codegen

##### validate()

> **validate**: (`args`) => [`ValidationResult`](validation.md#validationresult)

Defined in: [stately.ts:116](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/stately.ts#L116)

Validate data against a schema node

###### Parameters

###### args

[`ValidateArgs`](validation.md#validateargs)\<`S`\>

###### Returns

[`ValidationResult`](validation.md#validationresult)

***

### StatelyBuilder

Defined in: [stately.ts:129](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/stately.ts#L129)

Builder interface for chaining plugin additions.

Extends `Stately` with `withPlugin()` for fluent plugin composition.

#### Extends

- [`Stately`](#stately)\<`S`\>

#### Type Parameters

##### S

`S` *extends* [`StatelySchemas`](schema.md#statelyschemas)\<`any`, `any`\>

#### Properties

##### data

> **data**: `S`\[`"data"`\]

Defined in: [stately.ts:112](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/stately.ts#L112)

Plugin-contributed data (entity caches, computed values, etc.)

###### Inherited from

[`Stately`](#stately).[`data`](#data)

##### loadRuntimeSchemas?

> `optional` **loadRuntimeSchemas**: [`RuntimeSchemaLoader`](#runtimeschemaloader)\<`S`\>

Defined in: [stately.ts:121](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/stately.ts#L121)

Optional loader for code-split runtime schemas.
When provided, RecursiveRef nodes can resolve schemas that were split out during codegen.

###### Inherited from

[`Stately`](#stately).[`loadRuntimeSchemas`](#loadruntimeschemas)

##### plugins

> **plugins**: `S`\[`"utils"`\]

Defined in: [stately.ts:114](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/stately.ts#L114)

Plugin-contributed utilities and validation hooks

###### Inherited from

[`Stately`](#stately).[`plugins`](#plugins)

##### schema

> **schema**: `object`

Defined in: [stately.ts:105](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/stately.ts#L105)

The schema document and parsed nodes

###### document

> **document**: `any`

Raw OpenAPI document for runtime introspection

###### nodes

> **nodes**: [`StatelySchemaConfig`](schema.md#statelyschemaconfig)\<`S`\>\[`"nodes"`\]

Pre-parsed schema nodes from codegen

###### Inherited from

[`Stately`](#stately).[`schema`](#schema)

##### validate()

> **validate**: (`args`) => [`ValidationResult`](validation.md#validationresult)

Defined in: [stately.ts:116](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/stately.ts#L116)

Validate data against a schema node

###### Parameters

###### args

[`ValidateArgs`](validation.md#validateargs)\<`S`\>

###### Returns

[`ValidationResult`](validation.md#validationresult)

###### Inherited from

[`Stately`](#stately).[`validate`](#validate)

#### Methods

##### withPlugin()

> **withPlugin**(`plugin`): [`StatelyBuilder`](#statelybuilder)\<`S`\>

Defined in: [stately.ts:139](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/stately.ts#L139)

Add a plugin to the schema runtime.

Plugins can contribute data, utilities, and validation hooks.
Returns a new builder for chaining.

###### Parameters

###### plugin

[`PluginFactory`](#pluginfactory)\<`S`\>

The plugin factory function

###### Returns

[`StatelyBuilder`](#statelybuilder)\<`S`\>

A new builder with the plugin applied

## Type Aliases

### PluginFactory()

> **PluginFactory**\<`S`\> = (`runtime`) => [`Stately`](#stately)\<`S`\>

Defined in: [stately.ts:81](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/stately.ts#L81)

Factory function for creating schema plugins.

A plugin factory receives the current runtime and returns an augmented runtime.
Plugins can add data to `runtime.data`, utilities to `runtime.plugins`, and
validation hooks.

#### Type Parameters

##### S

`S` *extends* [`StatelySchemas`](schema.md#statelyschemas)\<`any`, `any`\>

The application's schema type

#### Parameters

##### runtime

[`Stately`](#stately)\<`S`\>

#### Returns

[`Stately`](#stately)\<`S`\>

#### Example

```typescript
const myPlugin: PluginFactory<MySchemas> = (runtime) => ({
  ...runtime,
  data: { ...runtime.data, myData: computeMyData(runtime) },
  plugins: { ...runtime.plugins, myPlugin: { utils: myUtils } },
});
```

***

### RuntimeSchemaLoader()

> **RuntimeSchemaLoader**\<`S`\> = () => `Promise`\<`Partial`\<`S`\[`"config"`\]\[`"nodes"`\]\>\>

Defined in: [stately.ts:91](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/stately.ts#L91)

Loader function for code-split runtime schemas.

When using codegen with entry points, some schemas may be split into a separate
bundle for lazy loading. This function loads those schemas on demand.

#### Type Parameters

##### S

`S` *extends* [`StatelySchemas`](schema.md#statelyschemas)\<`any`, `any`\>

#### Returns

`Promise`\<`Partial`\<`S`\[`"config"`\]\[`"nodes"`\]\>\>

A promise resolving to the additional schema nodes

## Functions

### createStately()

> **createStately**\<`S`\>(`openapi`, `generatedNodes`, `options?`): [`StatelyBuilder`](#statelybuilder)\<`S`\>

Defined in: [stately.ts:203](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/stately.ts#L203)

Create a Stately schema runtime.

This is the main entry point for creating a schema runtime. The returned
builder can be extended with plugins via `withPlugin()`.

#### Type Parameters

##### S

`S` *extends* [`StatelySchemas`](schema.md#statelyschemas)\<`any`, `any`\>

Your application's schema type (from `Schemas<DefineConfig<...>>`)

#### Parameters

##### openapi

`any`

The raw OpenAPI document (JSON object)

##### generatedNodes

`S`\[`"config"`\]\[`"nodes"`\]

Pre-parsed schema nodes from codegen (`PARSED_SCHEMAS`)

##### options?

[`CreateStatelyOptions`](#createstatelyoptions)\<`S`\>

Optional configuration (runtime schema loader, etc.)

#### Returns

[`StatelyBuilder`](#statelybuilder)\<`S`\>

A schema builder that can be extended with plugins

#### Examples

```typescript
import { createStately } from '@statelyjs/schema';
import { PARSED_SCHEMAS } from './generated/schemas';
import openapiDoc from './openapi.json';

const schema = createStately<MySchemas>(openapiDoc, PARSED_SCHEMAS);
```

```typescript
const schema = createStately<MySchemas>(openapiDoc, PARSED_SCHEMAS)
  .withPlugin(corePlugin())
  .withPlugin(filesPlugin());
```

```typescript
const schema = createStately<MySchemas>(openapiDoc, PARSED_SCHEMAS, {
  runtimeSchemas: () => import('./generated/schemas.runtime').then(m => m.RUNTIME_SCHEMAS),
});
```
