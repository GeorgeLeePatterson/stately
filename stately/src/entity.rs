//! Entity types and identifiers

use serde::{Deserialize, Serialize};

/// Entity identifier type - uses UUID v7 for time-sortable IDs
pub type EntityIdentifier = uuid::Uuid;

/// Summary of an entity for listings
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct Summary {
    /// The unique identifier of the entity
    #[cfg_attr(feature = "openapi", schema(value_type = String, format = "uuid"))]
    pub id:          EntityIdentifier,
    /// Human-readable name
    pub name:        String,
    /// Optional description
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
}

/// Generates a new time-sortable entity identifier
pub fn generate_id() -> EntityIdentifier { uuid::Uuid::now_v7() }

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_id() {
        let id1 = generate_id();
        let id2 = generate_id();
        
        // IDs should be unique
        assert_ne!(id1, id2);
        
        // Should be valid UUIDs
        assert_eq!(id1.get_version(), Some(uuid::Version::SortRand));
        assert_eq!(id2.get_version(), Some(uuid::Version::SortRand));
    }

    #[test]
    fn test_summary_creation() {
        let id = generate_id();
        let summary = Summary {
            id,
            name: "test-entity".to_string(),
            description: Some("A test entity".to_string()),
        };

        assert_eq!(summary.id, id);
        assert_eq!(summary.name, "test-entity");
        assert_eq!(summary.description, Some("A test entity".to_string()));
    }

    #[test]
    fn test_summary_without_description() {
        let id = generate_id();
        let summary = Summary {
            id,
            name: "simple-entity".to_string(),
            description: None,
        };

        assert_eq!(summary.name, "simple-entity");
        assert!(summary.description.is_none());
    }

    #[test]
    fn test_summary_serialization() {
        let id = generate_id();
        let summary = Summary {
            id,
            name: "test".to_string(),
            description: Some("desc".to_string()),
        };

        let json = serde_json::to_string(&summary).unwrap();
        let deserialized: Summary = serde_json::from_str(&json).unwrap();

        assert_eq!(summary, deserialized);
    }
}
