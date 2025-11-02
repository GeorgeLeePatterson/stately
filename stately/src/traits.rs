//! Core traits for state management

use serde::{Deserialize, Serialize};

use crate::Result;
use crate::entity::{EntityId, Summary};

/// Trait that all state entities must implement.
///
/// This trait defines the core behavior of an entity, including:
/// - Type identification via `STATE_ENTRY`
/// - Human-readable name and description
/// - Summary generation for listings
///
/// Typically implemented via the `#[stately::entity]` proc macro.
pub trait StateEntity: Clone + Serialize + for<'de> Deserialize<'de> {
    /// The type identifier for this entity (e.g., "pipeline", "source")
    const STATE_ENTRY: &'static str;

    /// Returns the human-readable name of this entity instance
    fn name(&self) -> &str;

    /// Returns an optional description of this entity instance
    fn description(&self) -> Option<&str> { None }

    /// Returns a summary of this entity for listings
    fn summary(&self, id: EntityId) -> Summary {
        Summary {
            id,
            name: self.name().to_string(),
            description: self.description().map(ToString::to_string),
        }
    }
}

/// Trait for collections of entities.
///
/// This trait defines CRUD operations for managing a collection of entities
/// of a specific type. Collections are typically stored in a `State` struct
/// and provide operations like:
/// - Creating new entities
/// - Reading entities by ID or name
/// - Updating existing entities
/// - Deleting entities
/// - Listing and searching entities
pub trait StateCollection {
    /// The entity type stored in this collection
    type Entity: StateEntity;

    /// The type identifier for this collection's entities
    const STATE_ENTRY: &'static str;

    /// Loads a collection from a list of entities and IDs
    fn load<I>(entities: I) -> Self
    where
        I: IntoIterator<Item = (EntityId, Self::Entity)>;

    /// Gets an entity by ID or name
    fn get_entity(&self, id: &str) -> Option<(&EntityId, &Self::Entity)>;

    /// Gets all entities in the collection
    fn get_entities(&self) -> Vec<(&EntityId, &Self::Entity)>;

    /// Searches entities by a needle string (matches against name/description)
    fn search_entities(&self, needle: &str) -> Vec<(&EntityId, &Self::Entity)>;

    /// Creates a new entity in the collection, returning its ID
    fn create(&mut self, entity: Self::Entity) -> EntityId;

    /// Updates an existing entity by ID
    ///
    /// # Errors
    ///
    /// Returns an error if the entity with the given ID does not exist in the collection.
    fn update(&mut self, id: &str, entity: Self::Entity) -> Result<()>;

    /// Removes an entity by ID
    ///
    /// # Errors
    ///
    /// Returns an error if the entity with the given ID does not exist in the collection.
    /// For singletons, always returns an error as they cannot be removed.
    fn remove(&mut self, id: &str) -> Result<Self::Entity>;

    /// Lists all entities as summaries
    fn list(&self) -> Vec<Summary>;

    /// Checks if the collection is empty
    fn is_empty(&self) -> bool;
}

//----
// Blanket impls
//----
impl<T: StateCollection> StateCollection for Box<T> {
    type Entity = T::Entity;

    const STATE_ENTRY: &'static str = T::STATE_ENTRY;

    fn load<I>(entities: I) -> Self
    where
        I: IntoIterator<Item = (EntityId, Self::Entity)>,
    {
        Box::new(T::load(entities))
    }

    fn get_entity(&self, id: &str) -> Option<(&EntityId, &Self::Entity)> {
        self.as_ref().get_entity(id)
    }

    fn get_entities(&self) -> Vec<(&EntityId, &Self::Entity)> { self.as_ref().get_entities() }

    fn search_entities(&self, needle: &str) -> Vec<(&EntityId, &Self::Entity)> {
        self.as_ref().search_entities(needle)
    }

    fn create(&mut self, entity: Self::Entity) -> EntityId { self.as_mut().create(entity) }

    fn update(&mut self, id: &str, entity: Self::Entity) -> Result<()> {
        self.as_mut().update(id, entity)
    }

    fn remove(&mut self, id: &str) -> Result<Self::Entity> { self.as_mut().remove(id) }

    fn list(&self) -> Vec<Summary> { self.as_ref().list() }

    fn is_empty(&self) -> bool { self.as_ref().is_empty() }
}
