---
title: Entities and State
description: Defining entities and managing application state with Stately
---

# Entities and State

Entities are the core data structures in Stately. They represent the things your application manages - configurations, resources, settings...anything really. State is the container that holds collections of entities and provides operations for working with them.

## Defining Entities

An entity is a Rust struct with the `#[stately::entity]` attribute:

```rust
use serde::{Deserialize, Serialize};

#[stately::entity]
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Pipeline {
    pub name: String,
    pub description: Option<String>,
    pub enabled: bool,
}
```

### Required Traits

Entities must derive:

- `Clone` - For state management operations
- `Serialize` and `Deserialize` - For API serialization

The `#[stately::entity]` macro implements the `HasName` trait, which provides name-based lookups. This macro is not strictly necessary, but that trait's implementation is.

### The `name` Field

By default, entities must have a `name: String` field. This field is used for:

- Display in lists and summaries
- Lookup by name (in addition to ID)
- Human-readable identification

You can customize which field provides the name:

```rust
#[stately::entity(name_field = "title")]
pub struct Document {
    pub title: String,
    pub content: String,
}
```

Or use a method:

```rust
#[stately::entity(name_method = "display_name")]
pub struct Config {
    pub key: String,
    pub value: String,
}

impl Config {
    fn display_name(&self) -> &str {
        &self.key
    }
}
```

### Adding Descriptions

Entities can have descriptions for richer summaries:

```rust
#[stately::entity(description_field = "summary")]
pub struct Task {
    pub name: String,
    pub summary: Option<String>,
}
```

Or with a static description:

```rust
#[stately::entity(description = "A data processing pipeline")]
pub struct Pipeline {
    pub name: String,
}
```

## Defining State

State is a container struct that holds entity collections. Use the `#[stately::state]` macro:

```rust
#[stately::state(openapi)]
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct AppState {
    pipelines: Pipeline,
    sources: Source,
    sinks: Sink,
}
```

### What Gets Generated

The `#[stately::state]` macro generates:

**1. StateEntry Enum**

A discriminator for entity types:

```rust
pub enum StateEntry {
    Pipeline,
    Source,
    Sink,
}

impl AsRef<str> for StateEntry { ... }
impl FromStr for StateEntry { ... }
```

**2. Entity Enum**

A type-erased wrapper for any entity:

```rust
pub enum Entity {
    Pipeline(Pipeline),
    Source(Source),
    Sink(Sink),
}
```

**3. Collection Fields**

Each field becomes a typed collection:

```rust
pub struct AppState {
    pub pipelines: Collection<Pipeline>,
    pub sources: Collection<Source>,
    pub sinks: Collection<Sink>,
}
```

**4. State Methods**

Operations for working with entities:

```rust
impl AppState {
    pub fn new() -> Self;
    pub fn get_entity(&self, id: &str, entry: StateEntry) -> Option<(EntityId, Entity)>;
    pub fn list_entities(&self, entry: Option<StateEntry>) -> HashMap<StateEntry, Vec<Summary>>;
    pub fn search_entities(&self, needle: &str) -> HashMap<StateEntry, Vec<Summary>>;
    pub fn remove_entity(&mut self, id: &str, entry: StateEntry) -> Result<()>;
}
```

**5. StateEntity Implementations**

Each entity type gets connected to its state entry:

```rust
impl StateEntity for Pipeline {
    type Entry = StateEntry;
    const STATE_ENTRY: StateEntry = StateEntry::Pipeline;
}
```

### The `openapi` Flag

Adding `openapi` to the state macro enables OpenAPI schema generation:

```rust
#[stately::state(openapi)]
pub struct AppState { ... }
```

This generates `utoipa` schema implementations for all types, enabling automatic API documentation.

## Collections

Collections store multiple entities of the same type. They're backed by a `HashMap<EntityId, T>`.

### Basic Operations

```rust
let mut state = AppState::new();

// Create
let id = state.pipelines.create(Pipeline {
    name: "my-pipeline".into(),
    description: None,
    enabled: true,
});

// Read by ID
if let Some((id, pipeline)) = state.pipelines.get_entity(&id.to_string()) {
    println!("Found: {}", pipeline.name);
}

// Read by name
if let Some((id, pipeline)) = state.pipelines.get_entity("my-pipeline") {
    println!("Found by name: {}", pipeline.name);
}

// Update
state.pipelines.update(&id, Pipeline {
    name: "my-pipeline".into(),
    description: Some("Updated".into()),
    enabled: false,
})?;

// Delete
let removed = state.pipelines.remove(&id)?;

// List all
for (id, pipeline) in state.pipelines.get_entities() {
    println!("{}: {}", id, pipeline.name);
}

// Search
let results = state.pipelines.search_entities("pipe");
```

### EntityId

Entity IDs are UUID v7 values, which are:

- Globally unique
- Time-sortable (newer IDs sort after older ones)
- URL-safe when serialized as strings

```rust
use stately::EntityId;

// Generate a new ID
let id = EntityId::new();

// Parse from string
let id: EntityId = "01234567-89ab-cdef-0123-456789abcdef".parse()?;

// Special singleton ID (nil UUID)
let singleton_id = EntityId::singleton();
```

## Singletons

Singletons are single-instance containers for settings-like entities:

```rust
#[stately::state(openapi)]
pub struct AppState {
    pipelines: Pipeline,
    
    #[singleton]
    settings: Settings,
}
```

### Singleton Operations

```rust
// Get the singleton
let settings = state.settings.get();

// Modify the singleton
state.settings.set(Settings {
    max_connections: 100,
    timeout_seconds: 30,
});

// Get mutable reference
let settings = state.settings.get_mut();
settings.max_connections = 200;
```

Singletons differ from collections:

- Always exactly one instance
- No create/delete operations
- Uses a special nil UUID as its ID
- Ideal for application-wide settings

## Custom Collection Types

You can use custom collection types instead of the default:

```rust
#[stately::state(openapi)]
pub struct AppState {
    #[collection(MyCustomCollection)]
    items: Item,
}
```

Your custom type must implement the `StateCollection` trait:

```rust
pub trait StateCollection {
    type Entity: StateEntity;
    
    fn create(&mut self, entity: Self::Entity) -> EntityId;
    fn update(&mut self, id: &EntityId, entity: Self::Entity) -> Result<()>;
    fn remove(&mut self, id: &EntityId) -> Result<Self::Entity>;
    fn get_entity(&self, id: &str) -> Option<(&EntityId, &Self::Entity)>;
    fn get_entities(&self) -> Vec<(&EntityId, &Self::Entity)>;
    fn search_entities(&self, needle: &str) -> Vec<(&EntityId, &Self::Entity)>;
    fn list(&self) -> Vec<Summary>;
    fn is_empty(&self) -> bool;
}
```

## Foreign Entity Types

Sometimes you need to store types you don't control (from other crates). Use the `foreign` attribute:

```rust
#[stately::state(openapi)]
pub struct AppState {
    #[collection(foreign, variant = "JsonConfig")]
    configs: serde_json::Value,
}
```

This generates a `ForeignEntity` trait that you implement:

```rust
impl ForeignEntity for serde_json::Value {
    fn name(&self) -> &str {
        self.get("name")
            .and_then(|v| v.as_str())
            .unwrap_or("unnamed")
    }
    
    fn description(&self) -> Option<&str> {
        self.get("description").and_then(|v| v.as_str())
    }
}
```

## Summary Type

The `Summary` type provides a lightweight representation for lists:

```rust
pub struct Summary {
    pub id: EntityId,
    pub name: String,
    pub description: Option<String>,
}
```

Use summaries when you need to display entities without loading full data:

```rust
// Get summaries for all entities
let summaries = state.pipelines.list();

for summary in summaries {
    println!("{}: {} - {:?}", summary.id, summary.name, summary.description);
}
```

## Next Steps

- [Links](./links.md) - Learn about entity relationships
- [Plugins](./plugins.md) - Extending Stately with plugins
- [Quick Start](../getting-started/quick-start.md) - Build a complete example
