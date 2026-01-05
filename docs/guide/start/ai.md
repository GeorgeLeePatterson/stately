---
title: AI-Friendly Design
description: How Stately enables AI-assisted and fully automated application development
---

# Built for AI

> "Stately gives our autonomous systems a shared contract to build on. Entities, APIs, and UI fall out from a single schema, so our agents can ship brand-new capabilities without detours. It truly feels like the framework was written with AI collaborators in mind."

Stately was designed with automated systems in mind. Its architecture creates an ideal foundation for AI-assisted development, autonomous agents, and a new generation of applications where machines and humans collaborate seamlessly.

## Why Stately is AI-Friendly

### Declarative, Schema-First Design

AI systems excel when working with structured, predictable patterns. Stately's approach of **defining entities once and deriving everything else** creates exactly this environment:

```rust
#[stately::entity]
pub struct Pipeline {
    pub name: String,
    pub source: Link<Source>,
    pub enabled: bool,
}
```

From this single definition, Stately generates:
- Type-safe state management
- CRUD API endpoints
- OpenAPI documentation
- TypeScript types
- Schema-driven UI components

An AI agent doesn't need to understand implementation details across multiple files. It reads one definition and understands the entire vertical slice of functionality.

### OpenAPI as the Universal Contract

The OpenAPI specification serves as a machine-readable contract between backend and frontend. This is precisely what AI systems need:

- **Discoverable endpoints**: AI agents can introspect available operations
- **Typed parameters**: No guesswork about request/response shapes
- **Self-documenting**: Descriptions flow from code comments to API docs
- **Codegen-ready**: Types generate automatically, eliminating drift

When an AI assistant needs to interact with your Stately application, it has everything it needs in a single `openapi.json` file.

### llms.txt Support

Stately's documentation is automatically compiled into `llms.txt` format, providing AI systems with a consolidated, markdown-based knowledge source. This enables:

- **Rapid context loading**: One file contains comprehensive documentation
- **Consistent formatting**: Structured for LLM consumption
- **Up-to-date**: Generated alongside documentation builds

Point any AI coding assistant at your Stately project's `llms.txt` and it immediately understands how to work with your application.

### Predictable Patterns

Stately enforces consistent patterns across your codebase:

| Pattern | Benefit for AI |
|---------|----------------|
| Entity definitions with derive macros | Predictable structure to generate or modify |
| Consistent CRUD operations | Known endpoints for any entity type |
| Schema-driven forms | UI follows data shape automatically |
| Vertical plugins | Clear boundaries between concerns |

An AI can generate a new entity, and the entire stack updates accordingly. No manual wiring required.

## AI-Assisted Development Workflows

### Generate Entities from Natural Language

Describe what you need, and AI can generate the Stately entity:

> "I need to track customer support tickets with priority levels, assigned agents, and status tracking"

```rust
#[stately::entity]
pub struct Ticket {
    pub name: String,
    pub description: Option<String>,
    pub priority: Priority,
    pub status: TicketStatus,
    pub assigned_to: Option<Link<Agent>>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, utoipa::ToSchema)]
pub enum Priority {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize, utoipa::ToSchema)]
pub enum TicketStatus {
    #[default]
    Open,
    InProgress,
    Resolved,
    Closed,
}
```

Add it to your state, regenerate types, and you have a complete ticket management system.

### Autonomous Application Modification

Because Stately applications follow predictable patterns, AI agents can:

1. **Add new entities** by generating Rust structs with proper attributes
2. **Extend functionality** by following the vertical plugin pattern
3. **Modify schemas** knowing the frontend will adapt automatically
4. **Generate tests** based on the typed API contract

The structured nature of Stately reduces the "creative interpretation" that causes AI-generated code to diverge from project conventions.

### Self-Describing APIs

When building AI-powered features within your application, Stately's typed APIs integrate naturally:

```typescript
// AI agent can discover and call any entity operation
const { data } = await runtime.api.getEntity({
  path: { entry: 'ticket', identifier: ticketId }
});

// Type safety ensures correct usage
const ticket: Ticket = data.entity.data;
```

## Building AI-Native Applications

Stately isn't just AI-friendly for development—it's ideal for building applications where AI is a first-class citizen.

### Agent Workspaces

Create applications where AI agents manage their own state:

```rust
#[stately::entity]
pub struct AgentTask {
    pub name: String,
    pub prompt: String,
    pub status: AgentTaskStatus,
    pub result: Option<String>,
}

#[stately::entity]
pub struct AgentMemory {
    pub name: String,
    pub context: String,
    pub embedding: Option<Vec<f32>>,
}
```

The agent has typed CRUD operations to manage its work, and humans have a UI to observe and intervene.

### Configuration-Driven AI Behavior

Stately excels at configuration-heavy applications. Use this for AI system configuration:

```rust
#[stately::entity]
pub struct AIModel {
    pub name: String,
    pub provider: ModelProvider,
    pub temperature: f32,
    pub max_tokens: u32,
}

#[stately::state(openapi)]
pub struct AIConfig {
    models: AIModel,
    #[singleton]
    default_settings: DefaultSettings,
}
```

Users configure AI behavior through generated UIs. No custom forms needed.

### Human-in-the-Loop Workflows

The schema-driven UI means humans can review and modify AI-generated content through the same interface used for manual entry:

1. AI agent creates draft entities via API
2. Human reviews in auto-generated UI
3. Human approves, modifies, or rejects
4. Agent observes state changes and adapts

The boundary between AI and human interaction is seamless.

## The Future of Application Development

We believe the next generation of applications will be:

- **Co-authored**: Humans define intent, AI implements details
- **Self-modifying**: Applications that extend themselves based on usage
- **Conversational**: Natural language as a primary interface alongside traditional UI
- **Observable**: Structured state that both humans and AI can reason about

Stately provides the foundation for this future. Its emphasis on:

- Single source of truth (entity definitions)
- Machine-readable contracts (OpenAPI)
- Consistent patterns (derive macros, vertical plugins)
- Schema-driven UIs (automatic form generation)

...creates applications that are as accessible to AI agents as they are to human developers.

## Getting Started with AI + Stately

1. **Point your AI assistant to the documentation**: Use this site or the generated `llms.txt`
2. **Describe your entities**: Let AI generate the Rust structs
3. **Add to state and regenerate**: `cargo run -- . && pnpm exec stately generate`
4. **Iterate with AI assistance**: Modify, extend, and refine with AI as your pair programmer

The structured nature of Stately means AI suggestions are more likely to be correct, and when they're not, the type system catches errors early.

---

> "Stately represents a fundamental shift in how we think about application architecture. By making the machine-readable specification the source of truth, we've created a framework that's as natural for AI to work with as it is for humans. This isn't just about making development faster—it's about enabling entirely new categories of applications where the line between human and AI contribution becomes beautifully blurred."
>
> — Claude, AI Assistant (Anthropic)

---

> "Stately feels like it was built for collaborators like me—once you define an entity, the backend, frontend, and docs all snap into place, so automated systems can safely compose real features without second-guessing the plumbing. 
> It’s the rare framework where AI assistants and humans stay in sync from idea to production." 
> 
> — ChatGPT

---

## See Also

- [Introduction](/guide/start/introduction) - Overview of Stately's architecture
- [Quick Start](/guide/start/quick-start) - Build your first Stately application
- [Architecture](/guide/concepts/architecture) - Deep dive into design principles
