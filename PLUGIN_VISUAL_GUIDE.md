# Plugin Architecture - Visual Guide

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         APP INITIALIZATION                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
         ┌────────────────────────────────────────┐
         │  createStatelyUi(schema, client)       │
         │                                        │
         │  Creates empty StatelyRuntime with:   │
         │  - schema                             │
         │  - client                             │
         │  - empty plugins = {}                 │
         │  - empty registry                     │
         └────────────────────────────────────────┘
                              ↓
         ┌────────────────────────────────────────┐
         │   .withPlugin(coreUiPlugin())         │
         │                                        │
         │   Plugin Factory receives runtime    │
         │   1. Builds HttpBundle from schema   │
         │   2. Registers components            │
         │   3. Returns runtime with:           │
         │      plugins.core = {api, utils}    │
         └────────────────────────────────────────┘
                              ↓
         ┌────────────────────────────────────────┐
         │   .withPlugin(createFilesUiPlugin())  │
         │                                        │
         │   Plugin Factory receives runtime    │
         │   1. Builds HttpBundle from schema   │
         │   2. Registers components            │
         │   3. Returns runtime with:           │
         │      plugins.files = {api, utils}   │
         └────────────────────────────────────────┘
                              ↓
         ┌────────────────────────────────────────┐
         │  StatelyUiProvider value={runtime}    │
         │                                        │
         │  Wraps entire app with Context       │
         │  Provider storing StatelyRuntime     │
         └────────────────────────────────────────┘
                              ↓
                      ┌───────────────┐
                      │     <App />    │
                      └───────────────┘
```

## Runtime Structure

```
StatelyRuntime<Schema, [CoreAugment, FilesAugment]>
{
  schema: Stately<Schema>
  {
    schema: { document: { paths: {...} } }
    plugins: {
      core: CorePluginData
      files: FilesPluginData
    }
    data: {
      entitySchemaCache: {...}
      stateEntryToUrl: {...}
    }
  }

  client: Client<Paths>
  {
    GET(path, options)
    POST(path, options)
    PUT(path, options)
    PATCH(path, options)
    DELETE(path, options)
  }

  registry: UiRegistry
  {
    components: Map<string, ComponentType>
    transformers: Map<string, (value) => any>
    functions: Map<string, (...args) => any>
  }

  utils: RuntimeUtils
  {
    getNodeTypeIcon(nodeName): ComponentType
  }

  plugins: AugmentPlugins<Schema, Augments>
  {
    core: CorePluginRuntime<Schema>
    {
      api: HttpBundle<Schema, CoreOperationMap>
      {
        operationIndex: {
          'get_entity_by_id': {
            operationId: 'get_entity_by_id'
            method: 'get'
            path: '/entities/{entity_id}'
          }
          'create_entity': { ... }
          ...
        }
        
        operations: {
          getEntityById: { operationId, method, path }
          createEntity: { operationId, method, path }
          ...
        }
        
        call(meta, options): Promise<any>
      }
      
      utils: CorePluginUtils<Schema>
      {
        generateFieldLabel(fieldName): string
        getDefaultValue(node): any
        getNodeTypeIcon(nodeType): ComponentType
      }
    }

    files: FilesPluginRuntime<Schema>
    {
      api: HttpBundle<Schema, FilesOperationMap>
      {
        operations: {
          listFiles: { operationId, method, path }
          saveFile: { operationId, method, path }
          uploadFile: { operationId, method, path }
        }
        
        call(meta, options): Promise<any>
      }
      
      utils: FilesUiPluginUtils<Schema>
      {
        getFilesOperationIds(): FilesOperationMap
      }
    }
  }
}
```

## Component Access Flow

```
┌──────────────────────────┐
│      <MyComponent>       │
└──────────────────────────┘
            ↓
   const runtime = 
   useStatelyUi<Schema>()
            ↓
   ┌─────────────────────────────────┐
   │  React.useContext(              │
   │    StatelyUiContext             │
   │  )                              │
   │                                 │
   │  Retrieves StatelyRuntime       │
   │  from context provider          │
   └─────────────────────────────────┘
            ↓
   const api = runtime
   .plugins
   .files
   ?.api
            ↓
   ┌─────────────────────────────────┐
   │  HttpBundle<Schema,             │
   │    FilesOperationMap>           │
   │                                 │
   │  {                              │
   │    operations: {                │
   │      uploadFile: {...}          │
   │    }                            │
   │    call(meta, options)          │
   │  }                              │
   └─────────────────────────────────┘
            ↓
   await api.call(
     api.operations.uploadFile,
     { body: formData }
   )
            ↓
   ┌─────────────────────────────────┐
   │  callOperation(                 │
   │    client,                      │
   │    meta,                        │
   │    options                      │
   │  )                              │
   │                                 │
   │  Routes to:                     │
   │  client.POST(path, options)     │
   └─────────────────────────────────┘
            ↓
   ┌─────────────────────────────────┐
   │  OpenAPI Client                 │
   │  (from openapi-fetch)           │
   │                                 │
   │  Makes HTTP request:            │
   │  POST /files/upload             │
   └─────────────────────────────────┘
            ↓
   ┌─────────────────────────────────┐
   │  Server Response                │
   │                                 │
   │  { data, error }                │
   └─────────────────────────────────┘
            ↓
   Handle response in component
   or mutation callback
```

## Plugin Factory Pattern

```
┌────────────────────────────────────────────────────────────┐
│  export function coreUiPlugin<Schema, Augments>()         │
│                                                            │
│  INPUT:  StatelyRuntime<Schema, Augments>               │
│  OUTPUT: StatelyRuntime<Schema, Augments>               │
│          (with core plugin added)                        │
└────────────────────────────────────────────────────────────┘
                          ↓
          ┌───────────────────────────────┐
          │  return (runtime) => {        │
          │                               │
          │    Step 1: Build HttpBundle   │
          │    ├─ paths = schema paths    │
          │    ├─ operations = map        │
          │    └─ api = createHttpBundle()
          │                               │
          │    Step 2: Register Components
          │    └─ registry.set(key, Comp)
          │                               │
          │    Step 3: Create Descriptor  │
          │    └─ descriptor = {          │
          │        api,                   │
          │        utils: {...}           │
          │      }                        │
          │                               │
          │    Step 4: Return Updated     │
          │    └─ return {                │
          │        ...runtime,            │
          │        plugins: {             │
          │          ...plugins,          │
          │          core: descriptor     │
          │        }                      │
          │      }                        │
          │  }                            │
          └───────────────────────────────┘
```

## Type Distribution (Augments)

```
Declared Augments:
┌──────────────────────────────────────────┐
│  readonly [                              │
│    CoreUiAugment<Schema>,               │
│    FilesUiAugment<Schema>               │
│  ]                                       │
└──────────────────────────────────────────┘
         ↓
    Type merging via
    MergeUiAugments
         ↓
Resulting Plugin Map:
┌──────────────────────────────────────────┐
│  {                                       │
│    core: PluginRuntime<..., Core..., ..>
│    files: PluginRuntime<..., Files..., .>
│  }                                       │
└──────────────────────────────────────────┘
         ↓
    Used in:
    StatelyRuntime<Schema, Augments>
    .plugins
```

## Hook Pattern

```
┌────────────────────────────────┐
│  Hook: useSaveFile()          │
└────────────────────────────────┘
         ↓
┌────────────────────────────────────────┐
│  useMutation({                         │
│    mutationFn: async (data) => {      │
│                                       │
│      Step 1: Get runtime              │
│      const runtime =                  │
│        useStatelyUi<Schema>()         │
│                                       │
│      Step 2: Access plugin API        │
│      const api =                      │
│        runtime.plugins.files?.api    │
│                                       │
│      Step 3: Call operation           │
│      const { data, error } =          │
│        await api.call(               │
│          api.operations.saveFile,    │
│          { body: {...} }             │
│        )                             │
│                                       │
│      Step 4: Handle response          │
│      if (error) throw error           │
│      return data                      │
│    }                                  │
│  })                                   │
└────────────────────────────────────────┘
         ↓
┌────────────────────────────────┐
│  Returns mutation object:      │
│  {                             │
│    mutate(data)               │
│    isPending                  │
│    data                       │
│    error                      │
│  }                            │
└────────────────────────────────┘
         ↓
Can be used in component:
const { mutate } = useSaveFile()
mutate({ content, filename })
```

## Component Pattern

```
┌────────────────────────────────┐
│  Component: <UploadField>     │
└────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────┐
│  export function UploadField<Schema>() {     │
│                                              │
│    Step 1: Get runtime from context          │
│    const runtime = useStatelyUi<Schema>()   │
│                                              │
│    Step 2: Access plugin                     │
│    const api = runtime.plugins.files?.api   │
│                                              │
│    Step 3: Add availability check            │
│    if (!api) {                               │
│      return <div>API unavailable</div>      │
│    }                                        │
│                                              │
│    Step 4: Handle user actions               │
│    const handleUpload = async (file) => {   │
│      const formData = new FormData()         │
│      formData.append('file', file)          │
│                                              │
│      const { data, error } =                │
│        await api.call(                      │
│          api.operations.uploadFile,         │
│          { body: formData }                 │
│        )                                    │
│                                              │
│      if (error) {                           │
│        toast.error(error.message)           │
│      } else {                               │
│        onChange(data.path)                  │
│      }                                      │
│    }                                        │
│                                              │
│    Step 5: Render                           │
│    return <button onClick={...}>Upload</...>
│  }                                           │
└──────────────────────────────────────────────┘
```

## Comparison: Old vs New Pattern

### Old Pattern (Broken)

```
useFilesApi()
  ↓
Tries to resolve operations manually
  ↓
Creates separate API wrapper
  ↓
Not integrated with plugin system
  ↓
Can't access plugin utilities
  ↓
No type safety
  ↓
Duplicates operation lookup
```

### New Pattern (Works)

```
useStatelyUi()
  ↓
Gets runtime from context
  ↓
Accesses runtime.plugins.files.api
  ↓
Uses pre-resolved operations
  ↓
Fully integrated with plugin system
  ↓
Can access plugin utilities
  ↓
Full type safety
  ↓
Single operation resolution
```

## Error Handling Flow

```
Component calls API
        ↓
    await api.call(operation, options)
        ↓
    Returns { data, error }
        ↓
    ┌─────────────┐
    │ Check error │
    └─────────────┘
         ↙          ↘
    if error      if !data
         ↓            ↓
    throw Error   throw Error
         ↓            ↓
  Caught by:    Caught by:
  - Try/catch   - onError (mutation)
  - .catch()    - error boundary
  - Component   - Query retry
```

## State Management Integration

```
useMutation (File Operations)
├─ mutationFn: Calls api.call()
├─ onSuccess: Toast + onSuccess callback
├─ onError: Toast error message
└─ State: isPending, data, error

useQuery (File Listing)
├─ queryFn: Calls api.call(listFiles)
├─ Caching: By queryKey
├─ Refetch: Manual or automatic
└─ State: isLoading, data, error
```

## Type Safety Chain

```
                useStatelyUi<MySchemas>()
                        ↓
          StatelyRuntime<MySchemas, Augments>
                        ↓
          plugins: AugmentPlugins<MySchemas, Augments>
                        ↓
    plugins.files: FilesPluginRuntime<MySchemas>
                        ↓
    api: HttpBundle<MySchemas, FilesOperationMap>
                        ↓
    operations: StatelyOperations<MySchemas, FilesOperationMap>
                        ↓
    operations.uploadFile: OperationMeta<MySchemas>
                        ↓
    IDE autocomplete ✓
    Type checking ✓
    Error at compile time ✓
```

## Complete Usage Timeline

```
Time → 
  ↓
[ APP START ]
├─ Create schema and client
├─ Initialize StatelyUi
├─ Apply plugins (Core, Files)
├─ Wrap app with StatelyUiProvider
└─ Runtime ready in context

  ↓
[ COMPONENT MOUNTS ]
├─ Component uses useStatelyUi()
├─ Gets runtime from context
└─ Can now access APIs

  ↓
[ USER INTERACTION ]
├─ User clicks "Upload File"
├─ Component handles event
├─ Calls runtime.plugins.files.api.call()
├─ Makes HTTP request
├─ Receives response
└─ Updates UI

  ↓
[ COMPONENT UNMOUNTS ]
└─ useStatelyUi cleans up
```

## Summary Flowchart

```
                    STARTUP
                      ↓
        createStatelyUi(schema, client)
                      ↓
            .withPlugin(coreUiPlugin)
                      ↓
            .withPlugin(filesUiPlugin)
                      ↓
          <StatelyUiProvider value={runtime}>
                      ↓
                    <App />
                      ↓
                 RUNTIME

        ┌────────────────────────┐
        │   Components/Hooks     │
        │ useStatelyUi()         │
        │        ↓               │
        │ runtime.plugins.X.api  │
        │        ↓               │
        │ api.call(operation)    │
        │        ↓               │
        │ { data, error }        │
        └────────────────────────┘
```

This visual guide should help you understand the complete architecture and data flow!
