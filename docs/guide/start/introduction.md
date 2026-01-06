---
title: Introduction 
description: Stately state management framework
---

# Stately 

Stately is a composable state management framework for building full-stack applications with Rust and TypeScript/React. 

## What is Stately?

Stately shines with applications that are heavily configuration-driven, but the use cases are not intentionally limited to any particular use case. 
By establishing a foundation around elementary concepts, in Stately's case 'entities' and 'collections', much of the "how" of application development is simplified, allowing the developer to focus on the "what" and the "why".  

Stately provides a unified approach to state management across your backend and frontend:

- **Backend (Rust)**: Define entities with derive macros, get automatic CRUD APIs, OpenAPI generation, and type-safe state management
- **Frontend (TypeScript/React)**: Consume your API with full type safety, render schema-driven forms, and extend with plugins

## Why Stately?

The goal of Stately is to drastically reduce the boilerplate needed to take the denotational semantics of your application into a fully functioning, production-ready state in a fraction of the time. With this foundation in mind, the Stately platform is designed to grow around type-safe, sound architectures. This has an outsized benefit, in my opinion, for the next phase of application development as I see it: dynamic, AI-native applications. To learn more about the direction this is headed, check out the docs on how Stately aims to be [AI-friendly](/guide/start/ai.md).

## Core Packages

### Backend (Rust)

| Crate | Description |
|-------|-------------|
| [`stately`](https://crates.io/crates/stately) | Core types, traits, and collections for state management |
| [`stately-derive`](https://crates.io/crates/stately-derive) | Procedural macros for entity, state, and API generation |

### Frontend (TypeScript)

| Package | Description |
|---------|-------------|
| [`@statelyjs/stately`](https://www.npmjs.com/package/@statelyjs/stately) | Full runtime with entity hooks, views, and codegen CLI |
| [`@statelyjs/ui`](https://www.npmjs.com/package/@statelyjs/ui) | Base UI components, layout, and plugin infrastructure |
| [`@statelyjs/schema`](https://www.npmjs.com/package/@statelyjs/schema) | Schema type system and runtime creation |

## Plugins

Stately is designed to be extended with plugins that provide both backend and frontend capabilities. Currently, Stately provides two out-of-the-box plugins:

| Plugin | Backend | Frontend | Description |
|--------|---------|----------|-------------|
| Files | [`stately-files`](https://crates.io/crates/stately-files) | [`@statelyjs/files`](https://www.npmjs.com/package/@statelyjs/files) | File upload, versioning, and management |
| Arrow | [`stately-arrow`](https://crates.io/crates/stately-arrow) | [`@statelyjs/arrow`](https://www.npmjs.com/package/@statelyjs/arrow) | Data connectivity and SQL query execution |

## Next Steps

Installation is easy, follow the [Installation](/guide/start/installation.md) guide to get setup. If you are setup and ready to go, follow the [Quick start](/guide/start/quick-start.md) to learn how to build your first Stately application. 

For more details on the motivation behind Stately, check out [Why Stately](/guide/start/why-stately.md).
