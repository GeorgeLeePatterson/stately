---
title: Installation
description: How to install Stately packages for your project
---

# Installation

Stately consists of Rust crates for the backend and TypeScript packages for the frontend. Install the packages you need based on your project requirements.

## Backend (Rust)

### Core Packages

Add the core Stately crates to your `Cargo.toml`:

```toml
[dependencies]
stately = "0.3"
```

The `stately` crate re-exports `stately-derive`, so you don't need to add it separately.

### Feature Flags

Stately supports several feature flags:

| Feature | Default | Description |
|---------|---------|-------------|
| `openapi` | Yes | OpenAPI schema generation via `utoipa` |
| `axum` | No | Axum web framework integration (includes `openapi`) |

To enable Axum API generation:

```toml
[dependencies]
stately = { version = "0.3", features = ["axum"] }
```

### Plugin Crates

For file management capabilities:

```toml
[dependencies]
stately-files = "0.3"
```

For data connectivity and Arrow-based queries:

```toml
[dependencies]
stately-arrow = "0.3"
```

## Frontend (TypeScript)

### Package Manager

Stately packages are published to npm. Install using your preferred package manager:

```bash
# npm
npm install @statelyjs/stately @statelyjs/ui @statelyjs/schema

# pnpm
pnpm add @statelyjs/stately @statelyjs/ui @statelyjs/schema

# yarn
yarn add @statelyjs/stately @statelyjs/ui @statelyjs/schema
```

### Peer Dependencies

The packages require several peer dependencies:

```bash
# npm
npm install react react-dom @tanstack/react-query lucide-react sonner

# pnpm
pnpm add react react-dom @tanstack/react-query lucide-react sonner

# yarn
yarn add react react-dom @tanstack/react-query lucide-react sonner
```

### Plugin Packages

For file management:

```bash
pnpm add @statelyjs/files
```

For data connectivity:

```bash
pnpm add @statelyjs/arrow
```

## Development Setup

### Rust Requirements

- Rust 2024 edition (1.85+)
- Cargo

### TypeScript Requirements

- Node.js 20+
- A package manager (npm, pnpm, or yarn)
- TypeScript 5.0+

### Recommended Project Structure

A typical Stately project has this structure:

```
my-app/
├── Cargo.toml              # Rust workspace
├── crates/
│   └── my-app/
│       ├── Cargo.toml
│       └── src/
│           ├── main.rs     # Entry point
│           ├── state.rs    # Entity definitions
│           └── api.rs      # API configuration
├── ui/
│   ├── package.json
│   ├── src/
│   │   ├── lib/
│   │   │   └── generated/  # Generated from OpenAPI
│   │   │       ├── types.ts
│   │   │       └── schemas.ts
│   │   └── App.tsx
│   └── tsconfig.json
└── openapi.json            # Generated OpenAPI spec
```

## Generating TypeScript Types

Stately includes a CLI for generating TypeScript types from your OpenAPI spec:

```bash
# Generate types and schemas
pnpm exec stately generate ./openapi.json -o ./src/lib/generated
```

This creates:
- `types.ts` - TypeScript types from OpenAPI components
- `schemas.ts` - Parsed schema definitions for runtime form generation

## Verifying Installation

### Backend

Create a simple entity to verify your Rust setup:

```rust
use stately::prelude::*;

#[stately::entity]
pub struct Example {
    pub name: String,
}

fn main() {
    println!("Stately is installed correctly!");
}
```

Build to verify:

```bash
cargo build
```

### Frontend

Create a simple component to verify your TypeScript setup:

```typescript
import { createStately } from '@statelyjs/schema';

// This should compile without errors
const runtime = createStately({} as any, {});
console.log('Stately is installed correctly!');
```

## Next Steps

- [Quick Start](./quick-start.md) - Build your first Stately application
- [Entities and State](../concepts/entities-and-state.md) - Learn about defining entities
