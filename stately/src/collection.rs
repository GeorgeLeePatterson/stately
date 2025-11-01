//! Collection and Singleton types for managing entities

use hashbrown::HashMap;
use hashbrown::hash_map::Entry;
use serde::{Deserialize, Serialize};

use crate::entity::{EntityId, Summary};
use crate::traits::{StateCollection, StateEntity};

/// A collection of entities of type `T`
///
/// Provides CRUD operations and lookup by both ID and name.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Collection<T: StateEntity> {
    #[serde(bound(deserialize = "T: StateEntity"))]
    inner: HashMap<EntityId, T>,
}

impl<T: StateEntity> Default for Collection<T> {
    fn default() -> Self { Self { inner: HashMap::default() } }
}

impl<T: StateEntity> Collection<T> {
    /// Creates a new empty collection
    pub fn new() -> Self { Self::default() }

    /// Access the inner `HashMap`
    pub fn inner(&self) -> &HashMap<EntityId, T> { &self.inner }

    /// Gets an entity by ID
    pub fn get_by_id(&self, id: &EntityId) -> Option<&T> { self.inner.get(id) }

    /// Gets an entity by name
    pub fn get_by_name(&self, name: &str) -> Option<(&EntityId, &T)> {
        self.inner.iter().find(|(_, entity)| entity.name() == name)
    }

    /// Inserts an entity with a specific ID
    pub fn insert_with_id(&mut self, id: EntityId, entity: T) -> Option<T> {
        self.inner.insert(id, entity)
    }

    /// Returns the number of entities in the collection
    pub fn len(&self) -> usize { self.inner.len() }

    /// Returns whether the collection is empty
    pub fn is_empty(&self) -> bool { self.inner.is_empty() }

    /// Returns an iterator over the collection
    pub fn iter(&self) -> impl Iterator<Item = (&EntityId, &T)> { self.inner.iter() }
}

impl<T: StateEntity> StateCollection for Collection<T> {
    type Entity = T;

    const STATE_ENTRY: &'static str = T::STATE_ENTRY;

    fn load<I>(entities: I) -> Self
    where
        I: IntoIterator<Item = (EntityId, Self::Entity)>,
    {
        Self { inner: entities.into_iter().collect() }
    }

    fn get_entity(&self, id: &str) -> Option<(&EntityId, &Self::Entity)> {
        // Try direct ID lookup first
        let entity_id = EntityId::from(id);
        if let Some((key, entity)) = self.inner.iter().find(|(k, _)| **k == entity_id) {
            return Some((key, entity));
        }

        // Fall back to name lookup
        self.get_by_name(id)
    }

    fn get_entities(&self) -> Vec<(&EntityId, &Self::Entity)> { self.inner.iter().collect() }

    fn search_entities(&self, needle: &str) -> Vec<(&EntityId, &Self::Entity)> {
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

    fn create(&mut self, entity: Self::Entity) -> EntityId {
        let id = EntityId::new();
        drop(self.inner.insert(id.clone(), entity));
        id
    }

    fn update(&mut self, id: &str, entity: Self::Entity) -> Result<Self::Entity, String> {
        // Try direct ID lookup first
        let entity_id = EntityId::from(id);
        if let Entry::Occupied(mut e) = self.inner.entry(entity_id) {
            return Ok(e.insert(entity));
        }

        // Fall back to name lookup
        if let Some((found_id, _)) = self.get_by_name(id) {
            let found_id = found_id.clone();
            return self
                .inner
                .insert(found_id, entity)
                .ok_or_else(|| format!("Entity not found: {id}"));
        }

        Err(format!("Entity not found: {id}"))
    }

    fn remove(&mut self, id: &str) -> Result<Self::Entity, String> {
        // Try direct ID lookup first
        let entity_id = EntityId::from(id);
        if let Some(entity) = self.inner.remove(&entity_id) {
            return Ok(entity);
        }

        // Fall back to name lookup
        if let Some((found_id, _)) = self.get_by_name(id) {
            let found_id = found_id.clone();
            return self.inner.remove(&found_id).ok_or_else(|| format!("Entity not found: {id}"));
        }

        Err(format!("Entity not found: {id}"))
    }

    fn list(&self) -> Vec<Summary> {
        self.inner.iter().map(|(id, entity)| entity.summary(id.clone())).collect()
    }

    fn is_empty(&self) -> bool { self.inner.is_empty() }
}

/// A singleton entity - only one instance exists
///
/// Unlike collections, singletons don't have IDs and can't be created/deleted,
/// only read and updated.
#[derive(Debug, Clone, PartialEq)]
pub struct Singleton<T: StateEntity> {
    id:    EntityId,
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
        Ok(Self { id: EntityId::singleton(), inner })
    }
}

impl<T: StateEntity> Singleton<T> {
    /// Creates a new singleton with the given entity
    pub fn new(entity: T) -> Self { Self { id: EntityId::singleton(), inner: entity } }

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

    fn load<I>(entities: I) -> Self
    where
        I: IntoIterator<Item = (EntityId, Self::Entity)>,
    {
        // For singleton, just take the first entity if present
        // Panics if no entity provided (Singleton must have exactly one entity to load)
        let mut iter = entities.into_iter();
        if let Some((_, entity)) = iter.next() {
            Self::new(entity)
        } else {
            panic!("Singleton::load requires at least one entity")
        }
    }

    fn get_entity(&self, _id: &str) -> Option<(&EntityId, &Self::Entity)> {
        Some((&self.id, &self.inner))
    }

    fn get_entities(&self) -> Vec<(&EntityId, &Self::Entity)> { vec![(&self.id, &self.inner)] }

    fn search_entities(&self, needle: &str) -> Vec<(&EntityId, &Self::Entity)> {
        let needle_lower = needle.to_lowercase();
        if self.inner.name().to_lowercase().contains(&needle_lower)
            || self.inner.description().is_some_and(|d| d.to_lowercase().contains(&needle_lower))
        {
            vec![(&self.id, &self.inner)]
        } else {
            vec![]
        }
    }

    fn create(&mut self, entity: Self::Entity) -> EntityId {
        // For singletons, "create" is really just an update
        self.inner = entity;
        EntityId::singleton()
    }

    fn update(&mut self, _id: &str, entity: Self::Entity) -> Result<Self::Entity, String> {
        let old = self.inner.clone();
        self.inner = entity;
        Ok(old)
    }

    fn remove(&mut self, _id: &str) -> Result<Self::Entity, String> {
        // Can't remove a singleton
        Err("Cannot remove singleton entity".to_string())
    }

    fn list(&self) -> Vec<Summary> { vec![self.inner.summary(EntityId::singleton())] }

    fn is_empty(&self) -> bool { false }
}

#[cfg(test)]
mod tests {
    use serde::{Deserialize, Serialize};

    use super::*;

    #[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
    struct TestEntity {
        name:  String,
        value: i32,
    }

    impl StateEntity for TestEntity {
        const STATE_ENTRY: &'static str = "test_entity";

        fn name(&self) -> &str { &self.name }
    }

    #[test]
    fn test_singleton_serde_roundtrip() {
        let entity = TestEntity { name: "test".to_string(), value: 42 };
        let singleton = Singleton::new(entity.clone());

        // Serialize
        let json = serde_json::to_string(&singleton).unwrap();

        // Deserialize
        let deserialized: Singleton<TestEntity> = serde_json::from_str(&json).unwrap();

        // Verify
        assert_eq!(singleton, deserialized);
        assert_eq!(deserialized.get().name, "test");
        assert_eq!(deserialized.get().value, 42);
    }

    #[test]
    fn test_singleton_deserialize_from_entity_json() {
        // Test that we can deserialize directly from entity JSON
        let json = r#"{"name":"direct","value":100}"#;
        let singleton: Singleton<TestEntity> = serde_json::from_str(json).unwrap();

        assert_eq!(singleton.get().name, "direct");
        assert_eq!(singleton.get().value, 100);
    }

    #[test]
    fn test_collection_serde_roundtrip() {
        let mut collection = Collection::<TestEntity>::new();
        let id1 = collection.create(TestEntity { name: "entity1".to_string(), value: 10 });
        let id2 = collection.create(TestEntity { name: "entity2".to_string(), value: 20 });

        // Serialize
        let json = serde_json::to_string(&collection).unwrap();

        // Deserialize
        let deserialized: Collection<TestEntity> = serde_json::from_str(&json).unwrap();

        // Verify
        assert_eq!(collection, deserialized);
        assert_eq!(deserialized.len(), 2);
        assert_eq!(deserialized.get_by_id(&id1).unwrap().value, 10);
        assert_eq!(deserialized.get_by_id(&id2).unwrap().value, 20);
    }
}
