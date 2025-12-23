---
title: Links
description: Entity relationships with Link<T> in Stately
---

# Links

Links represent relationships between entities in Stately. They provide a flexible way to reference other entities, either by ID or by embedding them inline.

## The Link Type

`Link<T>` is an enum with two variants:

```rust
pub enum Link<T: StateEntity> {
    Ref(String),    // Reference by ID
    Inline(T),      // Embedded entity
}
```

Use links when one entity needs to reference another:

```rust
#[stately::entity]
pub struct Pipeline {
    pub name: String,
    pub source: Link<Source>,      // Required reference
    pub sink: Option<Link<Sink>>,  // Optional reference
}
```

## Reference vs Inline

### References

References store just the entity ID:

```json
{
  "name": "my-pipeline",
  "source": {
    "entity_type": "Source",
    "ref": "01234567-89ab-cdef-0123-456789abcdef"
  }
}
```

Use references when:
- The referenced entity exists independently
- Multiple entities reference the same target
- You want to avoid data duplication
- The reference might change without changing the target

### Inline

Inline links embed the full entity:

```json
{
  "name": "my-pipeline",
  "source": {
    "entity_type": "Source",
    "inline": {
      "name": "embedded-source",
      "endpoint": "https://api.example.com"
    }
  }
}
```

Use inline when:
- The embedded entity is tightly coupled to its parent
- You want atomic updates (parent and child together)
- The entity doesn't need independent existence
- Configuration is self-contained

## Working with Links

### Creating Links

```rust
use stately::Link;

// Reference by ID
let source_ref = Link::<Source>::Ref("source-id".into());

// Reference from EntityId
let source_ref = Link::from(entity_id);

// Inline entity
let source_inline = Link::Inline(Source {
    name: "my-source".into(),
    endpoint: "https://api.example.com".into(),
});
```

### Checking Link Type

```rust
let link: Link<Source> = get_link();

if link.is_ref() {
    println!("This is a reference");
}

if link.is_inline() {
    println!("This is inline");
}
```

### Accessing Values

```rust
// Get reference ID (if Ref variant)
if let Some(id) = link.as_ref() {
    println!("Reference ID: {}", id);
}

// Get inline entity (if Inline variant)
if let Some(entity) = link.as_inline() {
    println!("Inline entity: {}", entity.name);
}
```

### Resolving References

To get the actual entity from a reference, you need access to the state:

```rust
impl Pipeline {
    pub fn resolve_source<'a>(&'a self, state: &'a AppState) -> Option<&'a Source> {
        match &self.source {
            Link::Ref(id) => {
                state.sources.get_entity(id).map(|(_, source)| source)
            }
            Link::Inline(source) => Some(source),
        }
    }
}
```

The `Link` type provides a `find` method that works with any collection:

```rust
let source: Option<&Source> = pipeline.source.find(&state.sources);
```

## Serialization

Links serialize with an `entity_type` field for type safety.

This enables:
- Type checking during deserialization
- Clear JSON structure for debugging
- Frontend type discrimination

### JSON Examples

**Reference:**
```json
{
  "entity_type": "Source",
  "ref": "01234567-89ab-cdef-0123-456789abcdef"
}
```

**Inline:**
```json
{
  "entity_type": "Source",
  "inline": {
    "name": "my-source",
    "endpoint": "https://api.example.com"
  }
}
```

## Link Aliases

The `#[stately::state]` macro generates type aliases for convenience:

```rust
#[stately::state(openapi)]
pub struct AppState {
    sources: Source,
    pipelines: Pipeline,
}

// Generated in link_aliases module.
// Automatically brought into scope:
pub mod link_aliases {
    pub type SourceLink = stately::Link<Source>;
    pub type PipelineLink = stately::Link<Pipeline>;
}
```

Use these for cleaner type signatures:

```rust
use crate::state::link_aliases::SourceLink;

pub struct Pipeline {
    pub source: SourceLink,
}
```

## OpenAPI Integration

Links generate OpenAPI schemas that support both variants:

```yaml
components:
  schemas:
    LinkSource:
      oneOf:
        - type: object
          properties:
            entity_type:
              type: string
              description: The entity type this Link references
              enum: [source]
            ref:
              type: string
              format: uuid
              description: Reference to an entity by ID
        - type: object
          properties:
            entity_type:
              type: string
              enum: [source]
            inline:
              $ref: '#/components/schemas/Source'
```

## Frontend Handling

On the frontend, links are rendered with specialized components:

```typescript
// The schema parses links as 'link' node type
{
  nodeType: 'link',
  targetEntity: 'Source',
  // ...
}
```

The core plugin provides:
- `LinkDetailView` - Display a link (resolves references)
- `LinkEditView` - Edit a link (choose ref vs inline)
- `LinkRefView` / `LinkRefEdit` - Reference-only views
- `LinkInlineView` / `LinkInlineEdit` - Inline-only views

### Accessing Linked Entities

Review `@statelyjs/stately/src/core/views/link/link-edit-view.tsx`, `LinkEditView`, to see how a `Link<T>` is resolved. Underlying every link, `T` is just another entity.

For `Link::Ref` variants, you can fetch the referenced entity. The core plugin provides `useEntityData` (or `useEntityInlineData`) for this:

```typescript
import { useEntityData } from '@statelyjs/stately/core/hooks';

function PipelineView({ pipeline }) {
  // If the link is a reference, extract the ID
  const sourceId = pipeline.source.ref;
  
  // Fetch the referenced entity
  const { data: sourceData } = useEntityData({
    entity: 'source',
    identifier: sourceId,
    disabled: !sourceId, // Don't fetch if inline
  });
  
  // For inline links, the entity is embedded directly
  const source = pipeline.source.inline ?? sourceData?.entity.data;
  
  return (
    <div>
      <h2>{pipeline.name}</h2>
      <p>Source: {source?.name}</p>
    </div>
  );
}
```

The built-in link view components (`LinkDetailView`, `LinkEditView`) handle this resolution automatically.

## Common Patterns

### Optional Links

```rust
pub struct Pipeline {
    pub source: Link<Source>,           // Required
    pub fallback: Option<Link<Source>>, // Optional
}
```

### Multiple Links

```rust
pub struct Pipeline {
    pub sources: Vec<Link<Source>>,  // Multiple sources
}
```

### Nested Links

```rust
pub struct Pipeline {
    pub stage: Link<Stage>,
}

pub struct Stage {
    pub processor: Link<Processor>,  // Link within linked entity
}
```

### Self-References

```rust
pub struct Category {
    pub name: String,
    pub parent: Option<Link<Category>>,  // Reference to same type
}
```

## Best Practices

1. **Use references for shared entities**: If multiple entities reference the same target, use `Link::Ref` to avoid duplication.

2. **Use inline for configuration**: When an entity is configuration that belongs to its parent, inline keeps them together.

3. **Consider update patterns**: References allow updating the target independently. Inline requires updating the parent.

4. **Validate references**: References can become dangling if the target is deleted. Consider cascade delete or validation.

5. **Document link semantics**: Make it clear in your documentation whether a link is expected to be a reference or inline.

## Next Steps

- [Entities and State](./entities-and-state.md) - Managing entity collections
- [Plugins](./plugins.md) - Extending Stately with plugins
- [Quick Start](../getting-started/quick-start.md) - Build a complete example
