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
