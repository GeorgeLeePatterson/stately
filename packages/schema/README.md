# @stately/schema-types

Generic type definitions for Stately schema nodes that preserve semantic meaning across the type system.

## Overview

This package provides TypeScript types for representing OpenAPI schemas as an Abstract Syntax Tree (AST), with full type safety for Stately-specific contracts.

**Key Feature**: Enforces `Entity.type === StateEntry` at compile time, matching Rust's proc macro guarantees.

## Installation

```bash
pnpm add @stately/schema-types
```

## Quick Start

```typescript
// TODO
```

## Core Design Principle

**StatelySchemas is the SINGLE SOURCE OF TRUTH**

- All type derivations CASCADE from `StatelySchemas`
- `Entity.type === StateEntry` is ENFORCED (matching Rust guarantees)
- As we discover new required types, we ADD them to `StatelySchemas`
- Everything else derives from there

## Node Types - Core and Beyond

// TODO:

## Type Helpers

// TODO: Remove - When stable, add type helpers, for plugin authors v user

```typescript
// Extract types from your schemas
type StateEntry = ...;
```

## Validation

The package validates that `Entity.type === StateEntry` at compile time:

```typescript
// TODO: Remove - When stable, correct this
throw new Error("Not implemented");

// ✓ Valid: Entity.type matches StateEntry
interface GoodComponents {
  StateEntry: 'a' | 'b';
  Entity: { type: 'a'; data: any } | { type: 'b'; data: any };
  EntityId: string;
}

// ❌ Invalid: Entity has extra type not in StateEntry
interface BadComponents {
  StateEntry: 'a' | 'b';
  Entity:
    | { type: 'a'; data: any }
    | { type: 'b'; data: any }
    | { type: 'c'; data: any }; // ← Not in StateEntry!
  EntityId: string;
}

type Bad = StatelySchemas<BadComponents>;
type Invalid = ExtractStateEntry<Bad>; // Result: never (validation failed)
```

## Integration with @stately/codegen

Use `@stately/codegen` to generate schema nodes from your OpenAPI spec:

```bash
$ npx stately-codegen openapi.json --output src/generated-schemas.ts
```

This generates:

```typescript
// TODO: Remove
```

## Benefits

1. ✅ **Type-safe everywhere**: Routes, hooks, parsing, rendering
2. ✅ **Semantic preservation**: StateEntry isn't "string", it's YOUR entity types
3. ✅ **Zero runtime overhead**: Pure TypeScript, compiles to same JavaScript
4. ✅ **Compile-time validation**: Typos caught by tsc, not at runtime
5. ✅ **Excellent IDE support**: Autocomplete, go-to-definition, refactoring
6. ✅ **Reusable**: Works with ANY Stately backend, not hardcoded

## Documentation

// TODO:

## License

Apache-2.0

## Contributing

This package is part of the [Stately](https://github.com/georgeleepatterson/stately) monorepo.
