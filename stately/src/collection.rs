//! Collection and Singleton types for managing entities

use hashbrown::HashMap;
use hashbrown::hash_map::Entry;
use serde::{Deserialize, Serialize};

use crate::entity::{EntityIdentifier, Summary};
use crate::id;
use crate::traits::{StateCollection, StateEntity};

/// A collection of entities of type `T`
///
/// Provides CRUD operations and lookup by both ID and name.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Collection<T: StateEntity> {
    #[serde(bound(deserialize = "T: StateEntity"))]
    inner: HashMap<EntityIdentifier, T>,
}

impl<T: StateEntity> Default for Collection<T> {
    fn default() -> Self { Self { inner: HashMap::default() } }
}

impl<T: StateEntity> Collection<T> {
    /// Creates a new empty collection
    pub fn new() -> Self { Self::default() }

    /// Gets an entity by ID
    pub fn get_by_id(&self, id: &EntityIdentifier) -> Option<&T> { self.inner.get(id) }

    /// Gets an entity by name
    pub fn get_by_name(&self, name: &str) -> Option<(&EntityIdentifier, &T)> {
        self.inner.iter().find(|(_, entity)| entity.name() == name)
    }

    /// Inserts an entity with a specific ID
    pub fn insert_with_id(&mut self, id: EntityIdentifier, entity: T) -> Option<T> {
        self.inner.insert(id, entity)
    }

    /// Returns the number of entities in the collection
    pub fn len(&self) -> usize { self.inner.len() }

    /// Returns whether the collection is empty
    pub fn is_empty(&self) -> bool { self.inner.is_empty() }

    /// Returns an iterator over the collection
    pub fn iter(&self) -> impl Iterator<Item = (&EntityIdentifier, &T)> { self.inner.iter() }
}

impl<T: StateEntity> StateCollection for Collection<T> {
    type Entity = T;

    const STATE_ENTRY: &'static str = T::STATE_ENTRY;

    fn get_entity(&self, id: &str) -> Option<(&EntityIdentifier, &Self::Entity)> {
        // Try parsing as UUID first
        if let Ok(uuid) = id.parse::<EntityIdentifier>() {
            // Need to find the actual key in the hashmap to return a valid reference
            if let Some((key, entity)) = self.inner.iter().find(|(k, _)| **k == uuid) {
                return Some((key, entity));
            }
        }

        // Fall back to name lookup
        self.get_by_name(id)
    }

    fn get_entities(&self) -> Vec<(&EntityIdentifier, &Self::Entity)> {
        self.inner.iter().collect()
    }

    fn search_entities(&self, needle: &str) -> Vec<(&EntityIdentifier, &Self::Entity)> {
        let needle_lower = needle.to_lowercase();
        self.inner
            .iter()
            .filter(|(_, entity)| {
                entity.name().to_lowercase().contains(&needle_lower)
                    || entity
                        .description()
                        .is_some_and(|d| d.to_lowercase().contains(&needle_lower))
            })
            .collect()
    }

    fn create(&mut self, entity: Self::Entity) -> EntityIdentifier {
        let id = id::generate();
        drop(self.inner.insert(id, entity));
        id
    }

    fn update(&mut self, id: &str, entity: Self::Entity) -> Result<EntityIdentifier, String> {
        // Try UUID first
        if let Ok(uuid) = id.parse::<EntityIdentifier>()
            && let Entry::Occupied(mut e) = self.inner.entry(uuid)
        {
            drop(e.insert(entity));
            return Ok(uuid);
        }

        // Fall back to name lookup
        if let Some((entity_id, _)) = self.get_by_name(id) {
            let entity_id = *entity_id;
            drop(self.inner.insert(entity_id, entity));
            return Ok(entity_id);
        }

        Err(format!("Entity not found: {id}"))
    }

    fn remove(&mut self, id: &str) -> Result<Self::Entity, String> {
        // Try UUID first
        if let Ok(uuid) = id.parse::<EntityIdentifier>()
            && let Some(entity) = self.inner.remove(&uuid)
        {
            return Ok(entity);
        }

        // Fall back to name lookup
        if let Some((entity_id, _)) = self.get_by_name(id) {
            let entity_id = *entity_id;
            return self.inner.remove(&entity_id).ok_or_else(|| format!("Entity not found: {id}"));
        }

        Err(format!("Entity not found: {id}"))
    }

    fn list(&self) -> Vec<Summary> {
        self.inner.iter().map(|(id, entity)| entity.summary(id)).collect()
    }

    fn is_empty(&self) -> bool { self.inner.is_empty() }
}

/// A singleton entity - only one instance exists
///
/// Unlike collections, singletons don't have IDs and can't be created/deleted,
/// only read and updated.
#[derive(Debug, Clone, PartialEq)]
pub struct Singleton<T: StateEntity> {
    inner: T,
}

// Manual Serialize implementation to avoid complex trait bound resolution
impl<T: StateEntity> Serialize for Singleton<T> {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        self.inner.serialize(serializer)
    }
}

// Manual Deserialize implementation to avoid complex trait bound resolution
impl<'de, T: StateEntity> Deserialize<'de> for Singleton<T> {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let inner = T::deserialize(deserializer)?;
        Ok(Self { inner })
    }
}

impl<T: StateEntity> Singleton<T> {
    /// Creates a new singleton with the given entity
    pub fn new(entity: T) -> Self { Self { inner: entity } }

    /// Gets a reference to the singleton entity
    pub fn get(&self) -> &T { &self.inner }

    /// Gets a mutable reference to the singleton entity
    pub fn get_mut(&mut self) -> &mut T { &mut self.inner }

    /// Updates the singleton entity
    pub fn set(&mut self, entity: T) { self.inner = entity; }
}

impl<T: StateEntity> StateCollection for Singleton<T> {
    type Entity = T;

    const STATE_ENTRY: &'static str = T::STATE_ENTRY;

    fn get_entity(&self, _id: &str) -> Option<(&EntityIdentifier, &Self::Entity)> {
        // Singletons don't have real IDs, but we need to return something
        // We'll use a static UUID for the singleton
        static SINGLETON_ID: std::sync::LazyLock<EntityIdentifier> =
            std::sync::LazyLock::new(uuid::Uuid::nil);
        Some((&SINGLETON_ID, &self.inner))
    }

    fn get_entities(&self) -> Vec<(&EntityIdentifier, &Self::Entity)> {
        static SINGLETON_ID: std::sync::LazyLock<EntityIdentifier> =
            std::sync::LazyLock::new(uuid::Uuid::nil);
        vec![(&SINGLETON_ID, &self.inner)]
    }

    fn search_entities(&self, needle: &str) -> Vec<(&EntityIdentifier, &Self::Entity)> {
        let needle_lower = needle.to_lowercase();
        if self.inner.name().to_lowercase().contains(&needle_lower)
            || self.inner.description().is_some_and(|d| d.to_lowercase().contains(&needle_lower))
        {
            self.get_entities()
        } else {
            vec![]
        }
    }

    fn create(&mut self, entity: Self::Entity) -> EntityIdentifier {
        // For singletons, "create" is really just an update
        self.inner = entity;
        uuid::Uuid::nil()
    }

    fn update(&mut self, _id: &str, entity: Self::Entity) -> Result<EntityIdentifier, String> {
        self.inner = entity;
        Ok(uuid::Uuid::nil())
    }

    fn remove(&mut self, _id: &str) -> Result<Self::Entity, String> {
        // Can't remove a singleton
        Err("Cannot remove singleton entity".to_string())
    }

    fn list(&self) -> Vec<Summary> { vec![self.inner.summary(&uuid::Uuid::nil())] }

    fn is_empty(&self) -> bool { false }
}
