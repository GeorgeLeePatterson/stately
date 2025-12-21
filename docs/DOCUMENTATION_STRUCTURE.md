# Stately Documentation Structure

This document outlines the proposed structure for Stately documentation, covering both **end-user documentation** and **plugin author documentation**.

---

## Overview

Stately is a **composable, configuration-driven state management framework** that spans both backend (Rust) and frontend (TypeScript/React). The ecosystem consists of:

- **Core**: `stately` + `stately-derive` (Rust), `@statelyjs/schema` + `@statelyjs/ui` + `@statelyjs/stately` (TypeScript)
- **Plugins**: Vertically integrated packages that provide both backend and frontend capabilities
  - **Files**: `stately-files` (Rust) + `@statelyjs/files` (TypeScript)
  - **Arrow**: `stately-arrow` (Rust) + `@statelyjs/arrow` (TypeScript)

---

## Documentation Audiences

### 1. End Users
Developers building applications with Stately. They need to understand:
- How to define entities and state
- How to configure and use the UI components
- How to integrate plugins
- How to customize and theme their application

### 2. Plugin Authors
Developers extending Stately with new capabilities. They need to understand:
- The plugin architecture (both Rust and TypeScript sides)
- How to create custom node types
- How to register components and transformers
- How to integrate with the codegen pipeline

---

## Proposed Documentation Structure

```
docs/
├── README.md                    # Documentation home / getting started
│
├── getting-started/
│   ├── introduction.md          # What is Stately?
│   ├── installation.md          # Installation for both Rust and TypeScript
│   ├── quick-start.md           # Minimal working example
│   └── project-setup.md         # Full project setup guide
│
├── concepts/
│   ├── overview.md              # High-level architecture
│   ├── entities-and-state.md    # Core state management concepts
│   ├── links.md                 # Entity relationships with Link<T>
│   ├── collections.md           # Collection<T> and Singleton<T>
│   ├── schema-nodes.md          # Schema node types and parsing
│   ├── plugins.md               # Plugin architecture overview
│   └── openapi-integration.md   # OpenAPI-driven type generation
│
├── backend/
│   ├── README.md                # Backend development overview
│   ├── stately-crate.md         # Core stately crate usage
│   ├── stately-derive.md        # Macro reference (#[entity], #[state], #[axum_api])
│   ├── api-generation.md        # Automatic API route generation
│   ├── error-handling.md        # Error types and HTTP responses
│   └── extending-state.md       # Adding custom fields and methods
│
├── frontend/
│   ├── README.md                # Frontend development overview
│   ├── schema-package.md        # @statelyjs/schema usage
│   ├── ui-package.md            # @statelyjs/ui components and layout
│   ├── stately-package.md       # @statelyjs/stately runtime and hooks
│   ├── codegen.md               # CLI code generation
│   ├── hooks.md                 # React hooks reference
│   ├── components.md            # Component library reference
│   ├── fields.md                # Field edit/view components
│   ├── pages.md                 # Pre-built page components
│   └── theming.md               # Theme customization
│
├── plugins/
│   ├── README.md                # Using plugins
│   │
│   ├── files/
│   │   ├── overview.md          # Files plugin introduction
│   │   ├── backend.md           # stately-files Rust crate
│   │   ├── frontend.md          # @statelyjs/files package
│   │   ├── path-types.md        # RelativePath, VersionedPath, UserDefinedPath
│   │   ├── versioning.md        # UUID v7 file versioning
│   │   └── components.md        # FileManager, FileBrowser, etc.
│   │
│   └── arrow/
│       ├── overview.md          # Arrow plugin introduction
│       ├── backend.md           # stately-arrow Rust crate
│       ├── frontend.md          # @statelyjs/arrow package
│       ├── connectors.md        # Backend trait and connector types
│       ├── query-execution.md   # Streaming SQL queries
│       └── components.md        # ArrowViewer, QueryEditor, ArrowTable
│
├── plugin-development/          # For plugin authors
│   ├── README.md                # Plugin development overview
│   ├── architecture.md          # Full-stack plugin architecture
│   │
│   ├── backend/
│   │   ├── getting-started.md   # Creating a Rust plugin crate
│   │   ├── router-pattern.md    # Axum router integration
│   │   ├── state-extraction.md  # FromRef pattern for state access
│   │   ├── openapi-generation.md# Generating OpenAPI specs
│   │   └── entity-types.md      # Adding custom entity types to state
│   │
│   └── frontend/
│       ├── getting-started.md   # Creating a TypeScript plugin package
│       ├── schema-plugin.md     # Creating schema plugins
│       ├── ui-plugin.md         # Creating UI plugins
│       ├── custom-nodes.md      # Defining custom node types
│       ├── component-registry.md# Registering field components
│       ├── transformer-registry.md # Registering prop transformers
│       ├── codegen-plugin.md    # Extending code generation
│       └── navigation.md        # Adding navigation routes
│
├── guides/
│   ├── full-stack-example.md    # Complete app walkthrough
│   ├── custom-entity-type.md    # Adding a new entity type
│   ├── custom-field-component.md# Creating custom form fields
│   ├── connecting-to-database.md# Database persistence pattern
│   ├── file-uploads.md          # Working with file uploads
│   ├── data-exploration.md      # Using Arrow for data queries
│   └── deployment.md            # Production deployment considerations
│
└── migration/
    └── changelog.md             # Version history and breaking changes

# NOTE: API Reference
# Rust API docs link to docs.rs (auto-generated from rustdoc)
# TypeScript API docs link to package READMEs or generated typedoc
# No need to duplicate auto-generated documentation
```

---

## Document Content Guidelines

### Getting Started Documents
- Focus on practical, runnable examples
- Include copy-pasteable code blocks
- Show both Rust and TypeScript sides where applicable
- Link to deeper concept documents for further reading

### Concept Documents
- Explain the "why" behind design decisions
- Use diagrams where helpful (mermaid supported)
- Cross-reference related concepts
- Include small code examples

### Reference Documents
- Comprehensive API coverage
- All function signatures and type definitions
- Example usage for each major feature
- Note required vs optional parameters

### Plugin Development Documents
- Step-by-step tutorials
- Complete working examples
- Explanation of extension points
- Common patterns and best practices

---

## Key Topics Per Section

### Getting Started
1. **Introduction**: What problems does Stately solve? Who is it for?
2. **Install**: `cargo add stately stately-derive`, `pnpm add @statelyjs/stately`
3. **Quick Start**: Define an entity, spin up API, render a form
4. **Project Setup**: Workspace structure, codegen scripts, development workflow

### Concepts
1. **Entities and State**: `#[stately::entity]`, `#[stately::state]`, `StateEntity` trait
2. **Links**: `Link<T>` for references vs inline, resolution patterns
3. **Collections**: `Collection<T>` vs `Singleton<T>`, CRUD operations
4. **Schema Nodes**: Node types, parsing, validation, default values
5. **Plugins**: Two-tier architecture (schema + UI plugins)
6. **OpenAPI**: Generated types, codegen CLI, type safety

### Backend
1. **stately crate**: `EntityId`, `Summary`, `Link<T>`, `Collection<T>`, `Singleton<T>`
2. **stately-derive**: `#[entity]`, `#[state]`, `#[axum_api]` macros
3. **API Generation**: Routes, handlers, OpenAPI docs
4. **Error Handling**: `Error` enum, `ApiError`, HTTP responses

### Frontend
1. **@statelyjs/schema**: `createStately()`, node types, validation
2. **@statelyjs/ui**: Components, layout, plugin system, registry
3. **@statelyjs/stately**: Runtime, hooks, views, pages, codegen
4. **Hooks**: `useListEntities`, `useEntityData`, `useCreateEntity`, etc.
5. **Components**: Base components, form fields, layout primitives

### Plugins
1. **Files**: Versioning, path types, file browser, upload/download
2. **Arrow**: Connectors, backends, streaming queries, data tables

### Plugin Development
1. **Architecture**: Backend + frontend coordination, OpenAPI bridge
2. **Backend**: Router factory, FromRef pattern, entity integration
3. **Frontend**: Schema plugin, UI plugin, registry, navigation

### Guides
- Practical walkthroughs for common tasks
- End-to-end examples with working code
- Troubleshooting and gotchas

---

## Documentation Priorities

### Phase 1: Core Documentation (Essential) - COMPLETE
- [x] Introduction and quick start
- [x] Entity and state concepts
- [x] Backend macro reference
- [x] Frontend runtime and hooks
- [x] Plugin usage (files, arrow)

### Phase 2: Complete Reference (Important)
- [x] API reference - Link to docs.rs (Rust) and package READMEs (TypeScript)
- [ ] All concept documents (collections, schema-nodes, openapi-integration)
- [ ] Component library reference
- [ ] Codegen guide

### Phase 3: Plugin Development (Advanced)
- [x] Plugin development overview (consolidated in single README)
- [ ] Additional plugin examples if needed

### Phase 4: Guides and Examples (Polish)
- [ ] Full-stack example walkthrough
- [ ] Common task guides
- [ ] Deployment guide
- [ ] Migration/changelog

---

## Notes for Documentation Authors

1. **Code Examples**: Always test code examples before publishing. Use the xeo4 application as a reference for real-world patterns.

2. **Cross-Referencing**: Link between related documents. The architecture is interconnected.

3. **Version Awareness**: Note which version introduced features. Track breaking changes.

4. **Two Audiences**: Clearly separate user docs from plugin author docs. Users shouldn't need to understand internals.

5. **Diagrams**: Use mermaid for architecture diagrams. Keep them simple and focused.

6. **README Syncing**: Package READMEs should stay in sync with the main docs.

---

## Open Questions

1. **Hosting**: Where will docs be hosted? (GitHub Pages, Docusaurus, mdBook, etc.)
2. **Versioning**: How to handle documentation for different versions?
3. ~~**API Docs**: Generate from code (rustdoc, typedoc) or write manually?~~ **RESOLVED**: Link to docs.rs for Rust, package READMEs for TypeScript
4. **Examples Repo**: Separate examples repository or inline in docs?
5. **Interactive**: Consider interactive examples (Storybook, playground)?

---

## Next Steps

1. Review and refine this structure based on feedback
2. Prioritize initial documents to write
3. Set up documentation tooling (mdBook, Docusaurus, etc.)
4. Begin writing Phase 1 documents
5. Create templates for consistency
