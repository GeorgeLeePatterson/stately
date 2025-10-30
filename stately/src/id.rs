//! ID generation utilities

use crate::entity::EntityIdentifier;

/// Generates a new time-sortable entity identifier using UUID v7
pub fn generate() -> EntityIdentifier { uuid::Uuid::now_v7() }

/// Default singleton ID for singleton entities
pub fn default_singleton_id() -> String { "singleton".to_string() }
