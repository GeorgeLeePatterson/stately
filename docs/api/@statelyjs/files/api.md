# api

Files plugin API operations.

Defines the typed API operations for the files plugin. These operations
are available via `runtime.plugins.files.api` when the plugin is installed.

## Available Operations

- `list_files` - List files in a directory
- `upload` - Upload a new file
- `save_file` - Save file content
- `download_data` - Download from data directory
- `download_cache` - Download from cache directory
- `download_upload` - Download from upload directory

## Example

```typescript
const { plugins } = useStatelyUi();

// List files
const { data } = await plugins.files.api.list_files({
  params: { query: { dir: '/configs' } }
});

// Upload a file
await plugins.files.api.upload({ body: formData });
```

## Type Aliases

### FilesApi

> **FilesApi** = [`TypedOperations`](../ui/api.md#typedoperations)\<[`FilesPaths`](#filespaths), *typeof* [`FILES_OPERATIONS`](#files_operations)\>

Defined in: [files/src/api.ts:72](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/files/src/api.ts#L72)

Typed API client for files operations.

Access via `runtime.plugins.files.api`.

***

### FilesOperations

> **FilesOperations** = [`DefineOperations`](../schema/api.md#defineoperations)\<`operations`\>

Defined in: [files/src/api.ts:44](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/files/src/api.ts#L44)

OpenAPI operations type for the files plugin

***

### FilesPaths

> **FilesPaths** = [`DefinePaths`](../stately/schema.md#definepaths)\<`paths`\>

Defined in: [files/src/api.ts:41](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/files/src/api.ts#L41)

OpenAPI paths type for the files plugin

## Variables

### FILES\_OPERATIONS

> `const` **FILES\_OPERATIONS**: `object`

Defined in: [files/src/api.ts:52](https://github.com/GeorgeLeePatterson/stately/blob/b8910accb3b200676731aeb7f39e1bb8d666404d/packages/files/src/api.ts#L52)

Files plugin operation bindings.

Maps friendly operation names to their HTTP method and path.
Paths do NOT include any prefix - that's provided via plugin options.

#### Type Declaration

##### download\_cache

> `readonly` **download\_cache**: `object`

Download a file from the cache directory

###### download\_cache.method

> `readonly` **method**: `"get"` = `'get'`

###### download\_cache.path

> `readonly` **path**: `"/file/cache/{path}"` = `'/file/cache/{path}'`

##### download\_data

> `readonly` **download\_data**: `object`

Download a file from the data directory

###### download\_data.method

> `readonly` **method**: `"get"` = `'get'`

###### download\_data.path

> `readonly` **path**: `"/file/data/{path}"` = `'/file/data/{path}'`

##### download\_upload

> `readonly` **download\_upload**: `object`

Download a file from the upload directory

###### download\_upload.method

> `readonly` **method**: `"get"` = `'get'`

###### download\_upload.path

> `readonly` **path**: `"/file/upload/{path}"` = `'/file/upload/{path}'`

##### list\_files

> `readonly` **list\_files**: `object`

List files in a directory

###### list\_files.method

> `readonly` **method**: `"get"` = `'get'`

###### list\_files.path

> `readonly` **path**: `"/list"` = `'/list'`

##### save\_file

> `readonly` **save\_file**: `object`

Save content to a file

###### save\_file.method

> `readonly` **method**: `"post"` = `'post'`

###### save\_file.path

> `readonly` **path**: `"/save"` = `'/save'`

##### upload

> `readonly` **upload**: `object`

Upload a file via multipart form

###### upload.method

> `readonly` **method**: `"post"` = `'post'`

###### upload.path

> `readonly` **path**: `"/upload"` = `'/upload'`
