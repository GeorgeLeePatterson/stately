//! Entity types and identifiers

use std::borrow::Borrow;
use std::str::FromStr;

use serde::{Deserialize, Serialize};

/// Singleton entity identifier string - uses nil UUID string for singleton collections
pub const SINGLETON_ID: &str = "00000000-0000-0000-0000-000000000000";

// Singleton entity ID as a module-level static
pub static SINGLETON_ENTITY_ID: std::sync::LazyLock<EntityId> =
    std::sync::LazyLock::new(EntityId::singleton);

/// Entity identifier type - wraps String for flexibility with UUID v7 generation
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
#[serde(transparent)]
pub struct EntityId(String);

impl EntityId {
    /// Generates a new time-sortable entity identifier using UUID v7
    pub fn new() -> Self { Self(uuid::Uuid::now_v7().to_string()) }

    /// Creates an entity identifier from a name (for seed configs)
    pub fn from_name(name: &str) -> Self { Self(name.to_string()) }

    /// Creates an entity identifier from a UUID
    pub fn from_uuid(uuid: uuid::Uuid) -> Self { Self(uuid.to_string()) }

    /// Creates a Singleton entity identifier
    pub fn singleton() -> Self { Self(SINGLETON_ID.to_string()) }

    /// Returns the string representation
    pub fn as_str(&self) -> &str { &self.0 }

    /// Checks if this is the singleton ID
    pub fn is_singleton(&self) -> bool { self.0 == SINGLETON_ID }

    /// Checks if this ID is a valid UUID format
    pub fn is_uuid(&self) -> bool { uuid::Uuid::parse_str(&self.0).is_ok() }

    /// Attempts to parse as a UUID
    pub fn as_uuid(&self) -> Option<uuid::Uuid> { uuid::Uuid::parse_str(&self.0).ok() }
}

impl Default for EntityId {
    fn default() -> Self { Self::new() }
}

impl AsRef<str> for EntityId {
    fn as_ref(&self) -> &str { &self.0 }
}

impl std::ops::Deref for EntityId {
    type Target = str;

    fn deref(&self) -> &Self::Target { &self.0 }
}

impl FromStr for EntityId {
    type Err = std::convert::Infallible;

    fn from_str(s: &str) -> Result<Self, Self::Err> { Ok(Self(s.to_string())) }
}

impl std::fmt::Display for EntityId {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result { self.0.fmt(f) }
}

impl From<uuid::Uuid> for EntityId {
    fn from(uuid: uuid::Uuid) -> Self { Self(uuid.to_string()) }
}

impl From<EntityId> for String {
    fn from(id: EntityId) -> Self { id.0 }
}

impl From<String> for EntityId {
    fn from(s: String) -> Self { Self(s) }
}

impl From<&str> for EntityId {
    fn from(s: &str) -> Self { Self(s.to_string()) }
}

impl<'a> From<&'a EntityId> for &'a str {
    fn from(id: &'a EntityId) -> Self { &id.0 }
}

impl Borrow<str> for EntityId {
    fn borrow(&self) -> &str { &self.0 }
}

/// Summary of an entity for listings
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct Summary {
    /// The unique identifier of the entity
    #[cfg_attr(feature = "openapi", schema(value_type = String, format = "uuid"))]
    pub id:          EntityId,
    /// Human-readable name
    pub name:        String,
    /// Optional description
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
}

/// Generates a new time-sortable entity identifier
pub fn generate_id() -> EntityId { EntityId::new() }

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_id() {
        let id1 = generate_id();
        let id2 = generate_id();

        // IDs should be unique
        assert_ne!(id1, id2);

        // Should be valid UUID strings
        assert!(id1.is_uuid());
        assert!(id2.is_uuid());

        // Should parse as UUID v7
        assert_eq!(id1.as_uuid().unwrap().get_version(), Some(uuid::Version::SortRand));
        assert_eq!(id2.as_uuid().unwrap().get_version(), Some(uuid::Version::SortRand));
    }

    #[test]
    fn test_entity_id_from_name() {
        let id = EntityId::from_name("my-pipeline");
        assert_eq!(id.as_str(), "my-pipeline");
        assert!(!id.is_uuid());
    }

    #[test]
    fn test_entity_id_singleton() {
        let id = EntityId::singleton();
        assert!(id.is_singleton());
        assert_eq!(id.as_str(), SINGLETON_ID);
        assert!(id.is_uuid()); // Nil UUID is still valid UUID format
    }

    #[test]
    fn test_entity_id_conversions() {
        let uuid = uuid::Uuid::now_v7();
        let id = EntityId::from_uuid(uuid);
        assert_eq!(id.as_uuid(), Some(uuid));

        let id_str: String = id.clone().into();
        let id_back = EntityId::from(id_str);
        assert_eq!(id, id_back);
    }

    #[test]
    fn test_summary_creation() {
        let id = generate_id();
        let summary = Summary {
            id:          id.clone(),
            name:        "test-entity".to_string(),
            description: Some("A test entity".to_string()),
        };

        assert_eq!(summary.id, id);
        assert_eq!(summary.name, "test-entity");
        assert_eq!(summary.description, Some("A test entity".to_string()));
    }

    #[test]
    fn test_summary_without_description() {
        let id = generate_id();
        let summary = Summary { id, name: "simple-entity".to_string(), description: None };

        assert_eq!(summary.name, "simple-entity");
        assert!(summary.description.is_none());
    }

    #[test]
    fn test_summary_serialization() {
        let id = generate_id();
        let summary =
            Summary { id, name: "test".to_string(), description: Some("desc".to_string()) };

        let json = serde_json::to_string(&summary).unwrap();
        let deserialized: Summary = serde_json::from_str(&json).unwrap();

        assert_eq!(summary, deserialized);
    }
}
