# schema

Arrow plugin schema extensions.

This module defines the `ArrowConnection` node type for representing
data connections in Stately schemas. The node type is automatically
registered when you add the arrow plugin to your schema.

## Interfaces

### ArrowConnectionNode

Defined in: [arrow/src/schema.ts:56](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/arrow/src/schema.ts#L56)

Schema node for Arrow data connections.

Used in schemas to represent references to registered data connections.
The connection can be identified by its connector ID.

#### Examples

```yaml
DataSource:
  type: string
  x-stately-node: arrowConnection
```

```ts
Usage in forms
The ArrowConnection field component provides a dropdown of available
connections that the user can select from.
```

#### Extends

- [`BaseNode`](../schema/nodes.md#basenode)

#### Properties

##### description?

> `optional` **description**: `string`

Defined in: schema/dist/nodes.d.ts:30

Optional description from the OpenAPI schema.

###### Inherited from

[`BaseNode`](../schema/nodes.md#basenode).[`description`](../schema/nodes.md#description)

##### nodeType

> **nodeType**: `"arrowConnection"`

Defined in: [arrow/src/schema.ts:57](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/arrow/src/schema.ts#L57)

Discriminator identifying the node type (e.g., 'object', 'string', 'array').

###### Overrides

[`BaseNode`](../schema/nodes.md#basenode).[`nodeType`](../schema/nodes.md#nodetype)

## Type Aliases

### ArrowData

> **ArrowData** = [`DefineData`](../schema/plugin.md#definedata)

Defined in: [arrow/src/schema.ts:26](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/arrow/src/schema.ts#L26)

Runtime data for the arrow plugin.

Currently empty - no runtime caches or registries are needed.

***

### ArrowNodeMap

> **ArrowNodeMap** = `object`

Defined in: [arrow/src/schema.ts:65](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/arrow/src/schema.ts#L65)

Node map for arrow plugin augmentation.

Maps node type identifiers to their node definitions for the plugin system.

#### Properties

##### arrowConnection

> **arrowConnection**: [`ArrowConnectionNode`](#arrowconnectionnode)

Defined in: [arrow/src/schema.ts:65](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/arrow/src/schema.ts#L65)

***

### ArrowTypes

> **ArrowTypes** = [`DefineTypes`](../schema/plugin.md#definetypes)\<`components`\[`"schemas"`\]\>

Defined in: [arrow/src/schema.ts:19](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/arrow/src/schema.ts#L19)

Type definitions provided by the arrow plugin.

Includes all component schemas from the Arrow API specification.

***

### TArrowNodeType

> **TArrowNodeType** = *typeof* [`ArrowNodeType`](#arrownodetype)\[keyof *typeof* [`ArrowNodeType`](#arrownodetype)\]

Defined in: [arrow/src/schema.ts:37](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/arrow/src/schema.ts#L37)

Union type of all arrow plugin node types

## Variables

### ArrowNodeType

> `const` **ArrowNodeType**: `object`

Defined in: [arrow/src/schema.ts:31](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/arrow/src/schema.ts#L31)

Node type identifiers for the arrow plugin.

#### Type Declaration

##### ArrowConnection

> `readonly` **ArrowConnection**: `"arrowConnection"` = `'arrowConnection'`

Represents an Arrow data connection reference
