# 🏰 Stately

[![Crates.io](https://img.shields.io/crates/v/stately.svg)](https://crates.io/crates/stately)
[![Documentation](https://docs.rs/stately/badge.svg)](https://docs.rs/stately)
[![npm](https://img.shields.io/npm/v/@stately/ui)](https://www.npmjs.com/package/@stately/ui)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

> Full-stack type-safe state management with auto-generated UI

Stately is a full-stack framework for managing application configuration and state. The Rust backend provides type-safe entity relationships, CRUD operations, and automatic API generation. The TypeScript UI packages automatically generate React interfaces from your OpenAPI schemas.

## ✨ Features

### Backend (Rust)
- **🎯 Type-Safe**: Compile-time guarantees for entity relationships and state operations
- **🔗 Entity Relationships**: Reference entities inline or by ID with `Link<T>`
- **📝 CRUD Operations**: Built-in create, read, update, delete for all entity types
- **🔄 Serialization**: Full serde support for JSON, YAML, etc.
- **📚 OpenAPI Schema**: Automatic schema generation with `utoipa`
- **🚀 Web Framework Integration**: Optional Axum API generation (more frameworks coming soon)
- **🆔 Time-Sortable IDs**: UUID v7 for naturally ordered entity identifiers

### Frontend (TypeScript/React)
- **🎨 Auto-Generated UI**: React components generated from OpenAPI schemas
- **🧩 Composable**: Use individual field components or complete CRUD views
- **📱 Responsive**: Built on shadcn/ui with mobile-first design
- **⚡ Fast**: Powered by Tanstack Query and Router
- **🔧 Customizable**: Override any component or behavior

## 🚀 Quick Start

### Backend: Rust API

Add stately to your `Cargo.toml`:

```toml
[dependencies]
stately = { version = "0.3.2", features = ["axum"] }
```

See [`crates/stately`](crates/stately) for full documentation.

### Frontend: React UI

Install the UI packages:

```bash
# Code generation tool (dev dependency)
pnpm add -D @stately/codegen

# React UI components
pnpm add @stately/ui @tanstack/react-query @tanstack/react-router
```

Generate schemas from your OpenAPI spec:

```bash
npx stately-codegen ./openapi.json --output ./src/generated
```

See [`packages/ui`](packages/ui) for full documentation.

## 📦 Packages

This is a monorepo containing both Rust and TypeScript packages:

### Rust Crates
- **[`stately`](crates/stately)** - Core library for state management
- **[`stately-derive`](crates/stately-derive)** - Procedural macros

### TypeScript Packages
- **[`@stately/schema`](packages/schema)** - Shared type definitions
- **[`@stately/codegen`](packages/codegen)** - CLI tool for schema generation
- **[`@stately/ui`](packages/ui)** - React UI components

## 📖 Examples

- [Rust examples](crates/stately/examples)
- TypeScript examples (coming soon)

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.

## 🔗 Links

- [Documentation](https://docs.rs/stately)
- [Crates.io](https://crates.io/crates/stately)
- [Repository](https://github.com/georgeleepatterson/stately)
- [Issue Tracker](https://github.com/georgeleepatterson/stately/issues)

# TODO: Remove - NOTES

Plugin Authors Notes:
1. Ensure that the "operation id" of an endpoint is unique. For example, if an api handler is named 'list', explicitly set its operation id to 'list_{plugin_name}' or similar, to avoid collision with another operation id.
