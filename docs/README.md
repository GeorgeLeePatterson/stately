---
title: Stately Documentation
description: Documentation for the Stately state management framework
---

# Stately Documentation

Stately is a composable state management framework for building full-stack applications with Rust and TypeScript/React. 

## What is Stately?

Stately shines with applications heavily configuration-driven, but the use cases are not intentionally limited to any particular use case. By establishing a foundation around elementary concepts, in Stately's case 'entities' and 'collections', much of the "how" of application development is simplified, allowing the developer to focus on the "what" and the "why".  

Stately provides a unified approach to state management across your backend and frontend:

- **Backend (Rust)**: Define entities with derive macros, get automatic CRUD APIs, OpenAPI generation, and type-safe state management
- **Frontend (TypeScript/React)**: Consume your API with full type safety, render schema-driven forms, and extend with plugins

## Core Packages

### Backend (Rust)

| Crate | Description |
|-------|-------------|
| `stately` | Core types, traits, and collections for state management |
| `stately-derive` | Procedural macros for entity, state, and API generation |

### Frontend (TypeScript)

| Package | Description |
|---------|-------------|
| `@statelyjs/schema` | Schema type system and runtime creation |
| `@statelyjs/ui` | Base UI components, layout, and plugin infrastructure |
| `@statelyjs/stately` | Full runtime with entity hooks, views, and codegen CLI |

## Plugins

Stately is designed to be extended with plugins that provide both backend and frontend capabilities. Currently, Stately provides two out-of-the-box plugins:

| Plugin | Backend | Frontend | Description |
|--------|---------|----------|-------------|
| Files | `stately-files` | `@statelyjs/files` | File upload, versioning, and management |
| Arrow | `stately-arrow` | `@statelyjs/arrow` | Data connectivity and SQL query execution |

## Getting Started

- [Introduction](./getting-started/introduction.md) - Learn what Stately is and why you might use it
- [Installation](./getting-started/installation.md) - Install Stately packages
- [Quick Start](./getting-started/quick-start.md) - Build your first Stately application

## Documentation Sections

- [Concepts](./concepts/overview.md) - Understand Stately's architecture
- [Backend](./backend/README.md) - Rust crate documentation
- [Frontend](./frontend/README.md) - TypeScript package documentation
- [Plugins](./plugins/README.md) - Using the files and arrow plugins
- [Plugin Development](./plugin-development/README.md) - Create your own plugins
- [Guides](./guides/README.md) - Practical tutorials - Coming soon
