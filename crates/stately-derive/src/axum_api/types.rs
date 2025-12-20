//! Response and request type generation for the axum_api macro.
//!
//! This module generates all the struct types used by the API handlers:
//! - Query parameters (GetEntityQuery)
//! - Response types (OperationResponse, GetEntityResponse, EntitiesResponse, ListResponse)
//! - Helper types (EntitiesMap, ResponseEvent)

use proc_macro2::TokenStream;
use quote::{ToTokens, quote};

/// Generates all response and request types for the API.
///
/// This includes:
/// - `GetEntityQuery` - Query parameters for getting an entity by ID
/// - `OperationResponse` - Standard response for create/update/delete operations
/// - `GetEntityResponse` - Response containing a single entity
/// - `EntitiesResponse` - Response containing multiple entities
/// - `EntitiesMap` - Map of entities grouped by type (with custom Serialize impl)
/// - `ListResponse` - Response containing entity summaries
/// - `ResponseEvent` - Events emitted after CRUD operations
pub struct Types {
    pub enable_openapi: bool,
    pub vis:            syn::Visibility,
}

impl Types {
    /// Base derive attributes that all response types share.
    fn base_response_derive(&self) -> TokenStream {
        quote! { Debug, ::serde::Serialize, ::serde::Deserialize }
    }

    /// OpenAPI-specific derive attributes for response types.
    fn openapi_response_derive(&self) -> TokenStream {
        if self.enable_openapi {
            quote! { , ::utoipa::ToSchema, ::utoipa::ToResponse }
        } else {
            quote! {}
        }
    }

    /// Combined derive for response types.
    fn response_derive(&self) -> TokenStream {
        let base = self.base_response_derive();
        let openapi = self.openapi_response_derive();
        quote! { #[derive(#base #openapi)] }
    }

    /// Derive for GetEntityQuery (uses IntoParams instead of ToSchema).
    fn query_derive(&self) -> TokenStream {
        if self.enable_openapi {
            quote! { #[derive(::serde::Deserialize, ::utoipa::IntoParams)] }
        } else {
            quote! { #[derive(::serde::Deserialize)] }
        }
    }

    /// Derive for EntitiesMap (no Serialize - has custom impl).
    fn entities_map_derive(&self) -> TokenStream {
        let openapi = if self.enable_openapi {
            quote! { , ::utoipa::ToSchema }
        } else {
            quote! {}
        };
        quote! { #[derive(Debug, Clone, PartialEq, ::serde::Deserialize #openapi)] }
    }

    /// Schema attribute for OperationResponse.id field.
    fn id_schema_attr(&self) -> TokenStream {
        if self.enable_openapi {
            quote! { #[schema(value_type = String, format = "uuid")] }
        } else {
            quote! {}
        }
    }

    /// Schema attribute for ListResponse.entities field.
    fn list_response_field_attr(&self) -> TokenStream {
        if self.enable_openapi {
            quote! {
                #[schema(
                    value_type = HashMap<StateEntry, Vec<::stately::Summary>>,
                    example = json!({
                        "pipeline": [
                            {"id": "my-pipeline", "name": "My Pipeline", "description": "Example pipeline"}
                        ],
                        "source": [
                            {"id": "my-source", "name": "My Source", "description": "Example source"}
                        ]
                    })
                )]
            }
        } else {
            quote! {}
        }
    }
}

impl ToTokens for Types {
    fn to_tokens(&self, tokens: &mut TokenStream) {
        let vis = &self.vis;

        let query_derive = self.query_derive();
        let response_derive = self.response_derive();
        let entities_map_derive = self.entities_map_derive();
        let id_schema_attr = self.id_schema_attr();
        let list_response_field_attr = self.list_response_field_attr();

        tokens.extend(quote! {
            /// Query parameters for getting a single entity by ID and type
            #query_derive
            #vis struct GetEntityQuery {
                #[serde(rename = "type")]
                entity_type: StateEntry,
            }

            /// Standard operation response with ID and optional message
            #response_derive
            #vis struct OperationResponse {
                #id_schema_attr
                pub id: ::stately::EntityId,
                pub message: String,
            }

            /// Response containing a single entity
            #response_derive
            #vis struct GetEntityResponse {
                id: ::stately::EntityId,
                entity: Entity,
            }

            /// Response for full entity queries
            #response_derive
            #vis struct EntitiesResponse {
                #vis entities: EntitiesMap,
            }

            /// Map of all entity collections grouped by type
            #entities_map_derive
            #vis struct EntitiesMap {
                #vis entities: ::stately::hashbrown::HashMap<
                    StateEntry,
                    ::stately::hashbrown::HashMap<::stately::EntityId, Entity>
                >,
            }

            /// Response for entity summary list queries
            #response_derive
            #vis struct ListResponse {
                #list_response_field_attr
                #vis entities: ::stately::hashbrown::HashMap<StateEntry, Vec<::stately::Summary>>,
            }

            /// Event emitted after CRUD operations
            #[derive(Debug, Clone)]
            #vis enum ResponseEvent {
                Created { id: ::stately::EntityId, entity: Entity },
                Updated { id: ::stately::EntityId, entity: Entity },
                Deleted { id: ::stately::EntityId, entry: StateEntry },
            }

            // Custom serialization for EntitiesMap to flatten entity structure
            impl ::serde::Serialize for EntitiesMap {
                fn serialize<S>(&self, serializer: S) -> ::std::result::Result<S::Ok, S::Error>
                where
                    S: ::serde::Serializer,
                {
                    use ::serde::ser::SerializeMap;

                    let mut map = serializer.serialize_map(Some(self.entities.len()))?;
                    for (state_entry, entities) in &self.entities {
                        let mut entity_map: ::stately::hashbrown::HashMap<
                            ::stately::EntityId,
                            ::serde_json::Value
                        > = ::stately::hashbrown::HashMap::default();

                        for (id, entity) in entities {
                            let inner_value = ::serde_json::to_value(entity)
                                .map_err(::serde::ser::Error::custom)?;
                            drop(entity_map.insert(id.clone(), inner_value));
                        }
                        map.serialize_entry(&state_entry.as_ref(), &entity_map)?;
                    }
                    map.end()
                }
            }
        });
    }
}
