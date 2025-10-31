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

#[cfg(test)]
mod tests {
    use serde::{Deserialize, Serialize};

    use super::*;

    #[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
    struct TestEntity {
        name:  String,
        value: i32,
    }

    impl StateEntity for TestEntity {
        const STATE_ENTRY: &'static str = "test_entity";

        fn name(&self) -> &str { &self.name }
    }

    #[test]
    fn test_link_create_ref() {
        let link: Link<TestEntity> = Link::create_ref("entity-123");
        assert_eq!(link.get_ref(), Some("entity-123"));
        assert_eq!(link.name(), "entity-123");
    }

    #[test]
    fn test_link_inline() {
        let entity = TestEntity { name: "test".to_string(), value: 42 };
        let link = Link::inline(entity.clone());

        assert_eq!(link.get_ref(), None);
        assert_eq!(link.name(), "test");

        match link {
            Link::Inline(e) => assert_eq!(e, entity),
            Link::Ref(_) => panic!("Expected Inline variant"),
        }
    }

    #[test]
    fn test_link_resolve_ref_success() {
        let link: Link<TestEntity> = Link::create_ref("entity-123");
        let entity = TestEntity { name: "test".to_string(), value: 42 };

        let resolver = |id: &str| {
            if id == "entity-123" { Some(entity.clone()) } else { None }
        };

        let resolved_ref = link.resolve(resolver).unwrap();
        assert_eq!(resolved_ref, entity);
    }

    #[test]
    fn test_link_resolve_ref_failure() {
        let link: Link<TestEntity> = Link::create_ref("entity-123");

        let resolver = |_id: &str| None;

        let result = link.resolve(resolver);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "entity-123");
    }

    #[test]
    fn test_link_resolve_inline() {
        let entity = TestEntity { name: "test".to_string(), value: 42 };
        let link = Link::inline(entity.clone());

        let resolver = |_id: &str| panic!("Resolver should not be called for inline");

        let resolved_ref = link.resolve(resolver).unwrap();
        assert_eq!(resolved_ref, entity);
    }

    #[test]
    fn test_link_serialize_ref() {
        let link: Link<TestEntity> = Link::create_ref("entity-123");
        let json = serde_json::to_string(&link).unwrap();

        let value: serde_json::Value = serde_json::from_str(&json).unwrap();
        assert_eq!(value["entity_type"], "test_entity");
        assert_eq!(value["ref"], "entity-123");
    }

    #[test]
    fn test_link_serialize_inline() {
        let entity = TestEntity { name: "test".to_string(), value: 42 };
        let link = Link::inline(entity);
        let json = serde_json::to_string(&link).unwrap();

        let value: serde_json::Value = serde_json::from_str(&json).unwrap();
        assert_eq!(value["entity_type"], "test_entity");
        assert_eq!(value["inline"]["name"], "test");
        assert_eq!(value["inline"]["value"], 42);
    }

    #[test]
    fn test_link_deserialize_ref_new_format() {
        let json = r#"{"entity_type":"test_entity","ref":"entity-123"}"#;
        let link: Link<TestEntity> = serde_json::from_str(json).unwrap();

        assert_eq!(link.get_ref(), Some("entity-123"));
    }

    #[test]
    fn test_link_deserialize_inline_new_format() {
        let json = r#"{"entity_type":"test_entity","inline":{"name":"test","value":42}}"#;
        let link: Link<TestEntity> = serde_json::from_str(json).unwrap();

        match link {
            Link::Inline(entity) => {
                assert_eq!(entity.name, "test");
                assert_eq!(entity.value, 42);
            }
            Link::Ref(_) => panic!("Expected Inline variant"),
        }
    }

    #[test]
    fn test_link_deserialize_ref_old_format_string() {
        let json = r#""entity-123""#;
        let link: Link<TestEntity> = serde_json::from_str(json).unwrap();

        assert_eq!(link.get_ref(), Some("entity-123"));
    }

    #[test]
    fn test_link_deserialize_inline_old_format() {
        let json = r#"{"name":"test","value":42}"#;
        let link: Link<TestEntity> = serde_json::from_str(json).unwrap();

        match link {
            Link::Inline(entity) => {
                assert_eq!(entity.name, "test");
                assert_eq!(entity.value, 42);
            }
            Link::Ref(_) => panic!("Expected Inline variant"),
        }
    }

    #[test]
    fn test_link_round_trip_ref() {
        let original: Link<TestEntity> = Link::create_ref("entity-123");
        let json = serde_json::to_string(&original).unwrap();
        let deserialized: Link<TestEntity> = serde_json::from_str(&json).unwrap();

        assert_eq!(original, deserialized);
    }

    #[test]
    fn test_link_round_trip_inline() {
        let entity = TestEntity { name: "test".to_string(), value: 42 };
        let original = Link::inline(entity);
        let json = serde_json::to_string(&original).unwrap();
        let deserialized: Link<TestEntity> = serde_json::from_str(&json).unwrap();

        assert_eq!(original, deserialized);
    }

    #[test]
    fn test_link_equality() {
        let ref1: Link<TestEntity> = Link::create_ref("entity-123");
        let ref2: Link<TestEntity> = Link::create_ref("entity-123");
        assert_eq!(ref1, ref2);

        let entity1 = TestEntity { name: "test".to_string(), value: 42 };
        let entity2 = TestEntity { name: "test".to_string(), value: 42 };
        let inline1 = Link::inline(entity1);
        let inline2 = Link::inline(entity2);
        assert_eq!(inline1, inline2);

        let ref_link: Link<TestEntity> = Link::create_ref("entity-123");
        let inline_link = Link::inline(TestEntity { name: "entity-123".to_string(), value: 0 });
        assert_ne!(ref_link, inline_link);
    }

    #[test]
    fn test_link_hash() {
        use std::collections::HashSet;

        let mut set = HashSet::new();
        let link1: Link<TestEntity> = Link::create_ref("entity-1");
        let link2: Link<TestEntity> = Link::create_ref("entity-2");
        let link3: Link<TestEntity> = Link::create_ref("entity-1");

        let _ = set.insert(link1);
        let _ = set.insert(link2);
        let _ = set.insert(link3);

        assert_eq!(set.len(), 2);
    }
}
