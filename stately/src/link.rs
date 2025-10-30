//! Entity linking - reference entities inline or by ID

use std::fmt;

use serde::de::{self, MapAccess, Visitor};
use serde::{Deserialize, Deserializer, Serialize, Serializer};

use crate::traits::StateEntity;

/// Reference configuration either by ID or inline.
///
/// This type allows entities to reference other entities either:
/// - By ID (`Link::Ref`) - stores only the entity ID
/// - Inline (`Link::Inline`) - embeds the full entity
///
/// When serialized, includes an `entity_type` field for type safety.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum Link<T>
where
    T: StateEntity,
{
    /// Reference to an entity by its ID
    Ref(String),
    /// Inline entity definition
    Inline(T),
}

impl<T: StateEntity> Link<T> {
    /// Returns the name of the referenced entity
    pub fn name(&self) -> String {
        match self {
            Self::Ref(s) => s.clone(),
            Self::Inline(t) => t.name().to_string(),
        }
    }

    /// Returns the reference ID if this is a reference
    pub fn get_ref(&self) -> Option<&str> {
        match self {
            Self::Ref(s) => Some(s),
            Self::Inline(_) => None,
        }
    }

    /// Creates a new reference link
    pub fn create_ref(ref_id: impl Into<String>) -> Self { Self::Ref(ref_id.into()) }

    /// Creates a new inline link
    pub fn inline(entity: T) -> Self { Self::Inline(entity) }

    /// Resolves the link to an entity.
    ///
    /// For `Ref` variants, looks up the entity in the provided resolver.
    /// For `Inline` variants, returns the embedded entity.
    ///
    /// # Errors
    /// - If the reference ID is not found in the resolver.
    pub fn resolve<F>(self, resolver: F) -> Result<T, String>
    where
        F: FnOnce(&str) -> Option<T>,
    {
        match self {
            Self::Ref(id) => resolver(&id).ok_or(id),
            Self::Inline(entity) => Ok(entity),
        }
    }
}

// Custom Serialize implementation that includes entity_type
impl<T> Serialize for Link<T>
where
    T: StateEntity + Serialize,
{
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        use serde::ser::SerializeMap;

        let entity_type = T::STATE_ENTRY;
        let mut map = serializer.serialize_map(Some(2))?;

        map.serialize_entry("entity_type", entity_type)?;

        match self {
            Link::Ref(r) => {
                map.serialize_entry("ref", r)?;
            }
            Link::Inline(inline) => {
                map.serialize_entry("inline", inline)?;
            }
        }

        map.end()
    }
}

// Custom Deserialize implementation supporting both old and new formats
impl<'de, T> Deserialize<'de> for Link<T>
where
    T: StateEntity + de::DeserializeOwned,
{
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        struct LinkVisitor<T>(std::marker::PhantomData<T>);

        impl<'de, T> Visitor<'de> for LinkVisitor<T>
        where
            T: StateEntity + de::DeserializeOwned,
        {
            type Value = Link<T>;

            fn expecting(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
                formatter.write_str(
                    "a string reference, an object with 'entity_type' and 'ref'/'inline', or a \
                     direct entity object",
                )
            }

            // Handle old format: plain string "my-source"
            fn visit_str<E>(self, value: &str) -> Result<Self::Value, E>
            where
                E: de::Error,
            {
                Ok(Link::Ref(value.to_string()))
            }

            fn visit_map<M>(self, map: M) -> Result<Self::Value, M::Error>
            where
                M: MapAccess<'de>,
            {
                // Deserialize into Value first to inspect keys
                let mut obj: serde_json::Map<String, serde_json::Value> =
                    Deserialize::deserialize(de::value::MapAccessDeserializer::new(map))?;

                // Check for new format: must have entity_type AND (ref OR inline)
                if obj.contains_key("entity_type")
                    && (obj.contains_key("ref") || obj.contains_key("inline"))
                {
                    // New format: { entity_type, ref } or { entity_type, inline }
                    if let Some(r) = obj.remove("ref") {
                        let ref_str = serde_json::from_value(r).map_err(de::Error::custom)?;
                        return Ok(Link::Ref(ref_str));
                    } else if let Some(i) = obj.remove("inline") {
                        let entity: T = serde_json::from_value(i).map_err(de::Error::custom)?;
                        return Ok(Link::Inline(entity));
                    }

                    return Err(de::Error::custom("missing 'ref' or 'inline' field"));
                }

                // Old inline format: deserialize the entire object as T
                let entity: T = serde_json::from_value(obj.into()).map_err(de::Error::custom)?;
                Ok(Link::Inline(entity))
            }
        }

        deserializer.deserialize_any(LinkVisitor(std::marker::PhantomData))
    }
}

// OpenAPI support - only available when the "openapi" feature is enabled
#[cfg(feature = "openapi")]
mod api {
    use utoipa::ToSchema;
    use utoipa::openapi::schema::Type;
    use utoipa::openapi::{ObjectBuilder, OneOfBuilder, RefOr, Schema};

    use super::*;

    impl<T: StateEntity + ToSchema> ToSchema for Link<T> {
        fn name() -> std::borrow::Cow<'static, str> {
            format!("Link{}", <T as ToSchema>::name()).into()
        }
    }

    // ComposeSchema implementation for utoipa's derive macro
    // This is needed because utoipa detects Link<T> as a generic type and expects ComposeSchema
    // Note: PartialSchema is automatically implemented for types that implement ComposeSchema
    impl<T: StateEntity + ToSchema> utoipa::__dev::ComposeSchema for Link<T> {
        fn compose(_generics: Vec<RefOr<Schema>>) -> RefOr<Schema> {
            let entity_type = T::STATE_ENTRY;

            // Build the oneOf schema with entity_type embedded
            RefOr::T(Schema::OneOf(
                OneOfBuilder::new()
                    .item(
                        ObjectBuilder::new()
                            .property(
                                "entity_type",
                                ObjectBuilder::new()
                                    .schema_type(Type::String)
                                    .enum_values(Some(vec![entity_type]))
                                    .description(Some("The entity type this Link references")),
                            )
                            .property(
                                "ref",
                                ObjectBuilder::new()
                                    .schema_type(Type::String)
                                    .description(Some("Reference to an entity by ID")),
                            )
                            .required("entity_type")
                            .required("ref")
                            .build(),
                    )
                    .item(
                        ObjectBuilder::new()
                            .property(
                                "entity_type",
                                ObjectBuilder::new()
                                    .schema_type(Type::String)
                                    .enum_values(Some(vec![entity_type]))
                                    .description(Some("The entity type this Link references")),
                            )
                            .property(
                                "inline",
                                RefOr::Ref(utoipa::openapi::Ref::from_schema_name(
                                    <T as ToSchema>::name(),
                                )),
                            )
                            .required("entity_type")
                            .required("inline")
                            .build(),
                    )
                    .description(Some(
                        "Reference configuration either by ID or inline, with entity type metadata",
                    ))
                    .build(),
            ))
        }
    }
}
