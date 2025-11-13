# UI Plugin Alignment with Schema

This document explains how stately/ui plugins align with stately/schema plugins.

## The Constant: Single Source of Truth

```typescript
// In @stately/ui/src/core/index.ts
export const CORE_PLUGIN_NAME = "core" as const;
```

This constant is the **single source of truth** for the plugin name. It's used in:
1. Type definitions (SchemaAugment, UiAugment)
2. Runtime population (plugin factories)
3. Type distribution (plugin map keys)

## Schema Side: @stately/schema/core

```typescript
import { CORE_PLUGIN_NAME } from "@stately/ui/core";

// Type definition
export type CoreSchemaAugment<Config> = SchemaAugment<
  typeof CORE_PLUGIN_NAME,  // ← "core"
  CoreNodeMap<Config>,
  CoreSchemaTypes<Config>,
  CoreData<Config>,
  CoreUtils<Config>
>;

// Runtime factory
export function createCorePlugin<S>(): PluginFactory<S> {
  return (runtime) => ({
    ...runtime,
    plugins: {
      ...runtime.plugins,
      [CORE_PLUGIN_NAME]: coreUtils,  // ← runtime.plugins.core
    },
  });
}
```

**Result:** `schema.utils.core` has type `CoreUtils<Config>`

## UI Side: @stately/ui/core

```typescript
// Type definition
export type CoreUiAugment<S> = UiAugment<
  typeof CORE_PLUGIN_NAME,  // ← "core" (same constant!)
  S,
  CoreOperationMap,
  CorePluginUtils<S>
>;

// Runtime factory
export function createCoreUiPlugin<S>(): StatelyUiPluginFactory<...> {
  return (runtime) => {
    const nextPlugins = {
      ...runtime.plugins,
      [CORE_PLUGIN_NAME]: descriptor,  // ← runtime.plugins.core
    };
    return { ...runtime, plugins: nextPlugins };
  };
}
```

**Result:** `runtime.plugins.core` has type `PluginRuntime<S, CoreOperationMap, CorePluginUtils<S>>`

## Type Distribution Mechanism

### SchemaAugment
```typescript
export type SchemaAugment<
  Name extends string,
  Nodes = NodeMap,
  Types = EmptyRecord,
  Data extends AnyRecord = EmptyRecord,
  Utils extends AnyRecord = EmptyRecord,
> = {
  name: Name;  // ← Property for structural consistency
  nodes: Nodes extends NodeMap ? Nodes : Nodes & NodeMap;
  types?: Types;
  data?: Data;
  utils?: Utils;
};

// Distribution uses type parameter, not property
type AugmentPluginUtils<Augments> = (
  Augments extends readonly SchemaAugment<
    infer Name,  // ← Extract from type parameter
    any, any, any,
    infer Utils
  >[]
    ? { [K in Name]: Utils }  // ← Use as key
    : {}
) & Record<string, AnyRecord>;
```

### UiAugment
```typescript
export type UiAugment<
  Name extends string,
  Schema extends AnyBaseSchemas = BaseSchemas,
  Ops extends DefineOperationMap = DefineOperationMap,
  Utils extends PluginFunctionMap = PluginFunctionMap,
> = {
  name: Name;  // ← Property for structural consistency (matches SchemaAugment)
  api?: HttpBundle<Schema, Ops>;
  utils?: PluginUtils<Utils>;
};

// Distribution uses type parameter, not property
export type MergeUiAugments<Schema, Augments> =
  Augments extends readonly [infer First extends UiAugment<string, Schema, any, any>, ...infer Rest]
    ? (First extends UiAugment<infer Name, Schema, infer Ops, infer Utils>
        ? { [K in Name]: PluginRuntime<Schema, Ops, Utils> }  // ← Use as key
        : {}) &
      (Rest extends readonly UiAugment<string, Schema, any, any>[]
        ? MergeUiAugments<Schema, Rest>
        : {})
    : {};
```

## The Alignment Contract

For a plugin named "foo", plugin authors must:

1. **Define the constant** (shared between schema and UI):
   ```typescript
   export const FOO_PLUGIN_NAME = "foo" as const;
   ```

2. **Use in SchemaAugment**:
   ```typescript
   type FooSchemaAugment = SchemaAugment<typeof FOO_PLUGIN_NAME, ...>;
   ```

3. **Use in UiAugment**:
   ```typescript
   type FooUiAugment = UiAugment<typeof FOO_PLUGIN_NAME, ...>;
   ```

4. **Use in schema plugin factory**:
   ```typescript
   runtime.plugins[FOO_PLUGIN_NAME] = utils;
   ```

5. **Use in UI plugin factory**:
   ```typescript
   runtime.plugins[FOO_PLUGIN_NAME] = descriptor;
   ```

**Result:**
- `schema.utils.foo` and `runtime.plugins.foo` use the SAME key
- Both are fully typed with perfect intellisense
- The constant ensures they can never drift apart

## Why the `name` Property Exists

Both `SchemaAugment` and `UiAugment` have a `name: Name` property, even though:
- Type distribution uses `infer Name` from the type parameter
- Runtime population uses string literals via the constant

**Reasons for the property:**
1. **Structural consistency**: Makes the augment shape explicit
2. **Future-proofing**: Could be used for reflection, debugging, or runtime validation
3. **Documentation**: Self-documenting type structure
4. **Alignment**: Both schema and UI follow the same pattern

The property is not currently accessed at runtime, but provides type-level and structural benefits.
