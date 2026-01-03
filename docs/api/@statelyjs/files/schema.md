# schema

Files plugin schema extensions.

This module defines the `RelativePath` node type for handling file paths
in Stately schemas. The node type is automatically registered when you
add the files plugin to your schema.

## Interfaces

### RelativePathNode

Defined in: [files/src/schema.ts:70](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/files/src/schema.ts#L70)

Schema node for relative file paths.

Used in schemas to represent paths relative to a storage directory.
The path can be either a simple string or an object with dir/path properties.

#### Examples

```yaml
ConfigPath:
  type: string
  x-stately-node: relativePath
```

```typescript
// Simple string path
const path1: RelativePath = "configs/pipeline.yaml";

// Object with directory
const path2: RelativePath = { dir: "upload", path: "configs/pipeline.yaml" };
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

> **nodeType**: `"relativePath"`

Defined in: [files/src/schema.ts:71](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/files/src/schema.ts#L71)

Discriminator identifying the node type (e.g., 'object', 'string', 'array').

###### Overrides

[`BaseNode`](../schema/nodes.md#basenode).[`nodeType`](../schema/nodes.md#nodetype)

## Type Aliases

### FilesData

> **FilesData** = [`DefineData`](../schema/plugin.md#definedata)

Defined in: [files/src/schema.ts:35](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/files/src/schema.ts#L35)

Runtime data for the files plugin.

Currently empty - no runtime caches or registries are needed.

***

### FilesNodeMap

> **FilesNodeMap** = `object`

Defined in: [files/src/schema.ts:79](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/files/src/schema.ts#L79)

Node map for files plugin augmentation.

Maps node type identifiers to their node definitions for the plugin system.

#### Properties

##### relativePath

> **relativePath**: [`RelativePathNode`](#relativepathnode)

Defined in: [files/src/schema.ts:79](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/files/src/schema.ts#L79)

***

### FilesTypes

> **FilesTypes** = [`DefineTypes`](../schema/plugin.md#definetypes)\<\{ `FileEntryType`: `FileEntryType`; `FileInfo`: `FileInfo`; `FileSaveRequest`: `FileSaveRequest`; `FileVersion`: `FileVersion`; \}\>

Defined in: [files/src/schema.ts:19](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/files/src/schema.ts#L19)

Type definitions provided by the files plugin.

These types are available in your schema when the files plugin is installed.

***

### TFilesNodeType

> **TFilesNodeType** = *typeof* [`FilesNodeType`](#filesnodetype)\[keyof *typeof* [`FilesNodeType`](#filesnodetype)\]

Defined in: [files/src/schema.ts:46](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/files/src/schema.ts#L46)

Union type of all files plugin node types

## Variables

### FilesNodeType

> `const` **FilesNodeType**: `object`

Defined in: [files/src/schema.ts:40](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/files/src/schema.ts#L40)

Node type identifiers for the files plugin.

#### Type Declaration

##### RelativePath

> `readonly` **RelativePath**: `"relativePath"` = `'relativePath'`

Represents a path relative to a storage directory
