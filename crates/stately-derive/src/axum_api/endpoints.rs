//! Endpoint handler generation for the axum_api macro.
//!
//! This module generates all the async handler functions for the API:
//! - create_entity, update_entity, patch_entity_by_id, remove_entity
//! - list_all_entities, list_entities
//! - get_entities, get_entity_by_id

use proc_macro2::TokenStream;
use quote::{ToTokens, quote};

/// Generates all endpoint handler functions for the API.
pub struct Endpoints {
    pub enable_openapi: bool,
    pub struct_name:    syn::Ident,
    pub vis:            syn::Visibility,
}

impl Endpoints {
    /// OpenAPI path attribute for create_entity.
    fn create_entity_path(&self) -> TokenStream {
        if self.enable_openapi {
            quote! {
                #[::utoipa::path(
                    put,
                    path = "/",
                    tag = "entity",
                    request_body = Entity,
                    responses(
                        (status = 200, description = "Entity created successfully", body = OperationResponse),
                        (status = 500, description = "Internal server error", body = ::stately::ApiError)
                    )
                )]
            }
        } else {
            quote! {}
        }
    }

    /// OpenAPI path attribute for list_all_entities.
    fn list_all_entities_path(&self) -> TokenStream {
        if self.enable_openapi {
            quote! {
                #[::utoipa::path(
                    get,
                    path = "/list",
                    tag = "entity",
                    responses((status = 200, description = "List all entities", body = ListResponse))
                )]
            }
        } else {
            quote! {}
        }
    }

    /// OpenAPI path attribute for list_entities.
    fn list_entities_path(&self) -> TokenStream {
        if self.enable_openapi {
            quote! {
                #[::utoipa::path(
                    get,
                    path = "/list/{type}",
                    tag = "entity",
                    params(("type" = StateEntry, Path, description = "Entity type to list")),
                    responses((status = 200, description = "List entities by type", body = ListResponse)),
                )]
            }
        } else {
            quote! {}
        }
    }

    /// OpenAPI path attribute for get_entity_by_id.
    fn get_entity_by_id_path(&self) -> TokenStream {
        if self.enable_openapi {
            quote! {
                #[::utoipa::path(
                    get,
                    path = "/{id}",
                    tag = "entity",
                    params(
                        ("id" = String, Path, description = "Entity ID"),
                        GetEntityQuery
                    ),
                    responses(
                        (status = 200, description = "Successfully retrieved entity", body = GetEntityResponse),
                        (status = 404, description = "Entity not found", body = ::stately::ApiError)
                    )
                )]
            }
        } else {
            quote! {}
        }
    }

    /// OpenAPI path attribute for update_entity.
    fn update_entity_path(&self) -> TokenStream {
        if self.enable_openapi {
            quote! {
                #[::utoipa::path(
                    post,
                    path = "/{id}",
                    tag = "entity",
                    params(("id" = String, Path, description = "Entity ID")),
                    request_body = Entity,
                    responses(
                        (status = 200, description = "Entity updated successfully", body = OperationResponse),
                        (status = 500, description = "Internal server error", body = ::stately::ApiError)
                    )
                )]
            }
        } else {
            quote! {}
        }
    }

    /// OpenAPI path attribute for patch_entity_by_id.
    fn patch_entity_by_id_path(&self) -> TokenStream {
        if self.enable_openapi {
            quote! {
                #[::utoipa::path(
                    patch,
                    path = "/{id}",
                    tag = "entity",
                    params(("id" = String, Path, description = "Entity ID")),
                    request_body = Entity,
                    responses(
                        (status = 200, description = "Entity patched successfully", body = OperationResponse),
                        (status = 500, description = "Internal server error", body = ::stately::ApiError)
                    )
                )]
            }
        } else {
            quote! {}
        }
    }

    /// OpenAPI path attribute for remove_entity.
    fn remove_entity_path(&self) -> TokenStream {
        if self.enable_openapi {
            quote! {
                #[::utoipa::path(
                    delete,
                    path = "/{entry}/{id}",
                    tag = "entity",
                    params(
                        ("entry" = StateEntry, Path, description = "Entity type"),
                        ("id" = String, Path, description = "Entity ID")
                    ),
                    responses(
                        (status = 200, description = "Entity removed successfully", body = OperationResponse),
                        (status = 404, description = "Entity not found", body = ::stately::ApiError),
                        (status = 500, description = "Internal server error", body = ::stately::ApiError)
                    )
                )]
            }
        } else {
            quote! {}
        }
    }

    /// OpenAPI path attribute for get_entities.
    fn get_entities_path(&self) -> TokenStream {
        if self.enable_openapi {
            quote! {
                #[::utoipa::path(
                    get,
                    path = "/",
                    tag = "entity",
                    params(
                        ("name" = Option<String>, Query, description = "Identifier of entity, ie id or name"),
                        ("type" = Option<StateEntry>, Query, description = "Type of entity")
                    ),
                    responses((status = 200, description = "Get entities with filters", body = EntitiesResponse)),
                )]
            }
        } else {
            quote! {}
        }
    }
}

impl ToTokens for Endpoints {
    fn to_tokens(&self, tokens: &mut TokenStream) {
        let struct_name = &self.struct_name;
        let vis = &self.vis;

        let create_entity_path = self.create_entity_path();
        let update_entity_path = self.update_entity_path();
        let patch_entity_by_id_path = self.patch_entity_by_id_path();
        let remove_entity_path = self.remove_entity_path();
        let list_all_entities_path = self.list_all_entities_path();
        let list_entities_path = self.list_entities_path();
        let get_entities_path = self.get_entities_path();
        let get_entity_by_id_path = self.get_entity_by_id_path();

        tokens.extend(quote! {
            /// Create a new entity
            #create_entity_path
            #vis async fn create_entity(
                ::axum::extract::State(stately): ::axum::extract::State<#struct_name>,
                ::axum::Json(entity): ::axum::Json<Entity>,
            ) -> ::axum::response::Response {
                use ::axum::response::IntoResponse;

                let mut state = stately.state.write().await;
                let id = state.create_entity(entity.clone());

                let mut response = ::axum::Json(OperationResponse {
                    id: id.clone(),
                    message: format!("Entity created")
                }).into_response();
                response.extensions_mut().insert(ResponseEvent::Created { id, entity });
                response
            }

            /// Update an existing entity (full replacement)
            #update_entity_path
            pub async fn update_entity(
                ::axum::extract::State(stately): ::axum::extract::State<#struct_name>,
                ::axum::extract::Path(id): ::axum::extract::Path<String>,
                ::axum::Json(entity): ::axum::Json<Entity>,
            ) -> ::axum::response::Response {
                use ::axum::response::IntoResponse;

                let mut state = stately.state.write().await;
                match state.update_entity(&id, entity.clone()) {
                    Ok(_) => {
                        let entity_id: ::stately::EntityId = id.into();
                        let mut response = ::axum::Json(OperationResponse {
                            id: entity_id.clone(),
                            message: format!("Entity updated")
                        }).into_response();
                        response.extensions_mut().insert(ResponseEvent::Updated { id: entity_id, entity });
                        response
                    }
                    Err(e) => e.into_response()
                }
            }

            /// Patch an existing entity (same as update)
            #patch_entity_by_id_path
            pub async fn patch_entity_by_id(
                ::axum::extract::State(stately): ::axum::extract::State<#struct_name>,
                ::axum::extract::Path(id): ::axum::extract::Path<String>,
                ::axum::Json(entity): ::axum::Json<Entity>,
            ) -> ::axum::response::Response {
                use ::axum::response::IntoResponse;

                let mut state = stately.state.write().await;
                match state.update_entity(&id, entity.clone()) {
                    Ok(_) => {
                        let entity_id: ::stately::EntityId = id.into();
                        let mut response = ::axum::Json(OperationResponse {
                            id: entity_id.clone(),
                            message: format!("Entity patched")
                        }).into_response();
                        response.extensions_mut().insert(ResponseEvent::Updated { id: entity_id, entity });
                        response
                    }
                    Err(e) => e.into_response()
                }
            }

            /// Remove an entity
            #remove_entity_path
            pub async fn remove_entity(
                ::axum::extract::State(stately): ::axum::extract::State<#struct_name>,
                ::axum::extract::Path((entry, id)): ::axum::extract::Path<(StateEntry, String)>,
            ) -> ::axum::response::Response {
                use ::axum::response::IntoResponse;

                let mut state = stately.state.write().await;
                if let Err(e) = state.remove_entity(&id, entry) {
                    return e.into_response();
                };

                let entity_id: ::stately::EntityId = id.into();
                let mut response = ::axum::Json(OperationResponse {
                    id: entity_id.clone(),
                    message: format!("Entity removed")
                }).into_response();
                response.extensions_mut().insert(ResponseEvent::Deleted { id: entity_id, entry });
                response
            }

            /// List all entity summaries
            #list_all_entities_path
            pub async fn list_all_entities(
                ::axum::extract::State(stately): ::axum::extract::State<#struct_name>,
            ) -> ::stately::Result<::axum::Json<ListResponse>> {
                let state = stately.state.read().await;
                let entities = state.list_entities(None);
                Ok(::axum::Json(ListResponse { entities }))
            }

            /// List entity summaries
            #list_entities_path
            pub async fn list_entities(
                ::axum::extract::State(stately): ::axum::extract::State<#struct_name>,
                ::axum::extract::Path(entity_type): ::axum::extract::Path<StateEntry>,
            ) -> ::stately::Result<::axum::Json<ListResponse>> {
                let state = stately.state.read().await;
                let entities = state.list_entities(Some(entity_type));
                Ok(::axum::Json(ListResponse { entities }))
            }

            /// Get all entities for all types
            #get_entities_path
            pub async fn get_entities(
                ::axum::extract::State(stately): ::axum::extract::State<#struct_name>,
            ) -> ::stately::Result<::axum::Json<EntitiesResponse>> {
                let state = stately.state.read().await;
                let entities = state.search_entities("");
                Ok(::axum::Json(EntitiesResponse { entities: EntitiesMap { entities } }))
            }

            /// Get entity by ID and type
            #get_entity_by_id_path
            pub async fn get_entity_by_id(
                ::axum::extract::State(stately): ::axum::extract::State<#struct_name>,
                ::axum::extract::Path(id): ::axum::extract::Path<String>,
                ::axum::extract::Query(query): ::axum::extract::Query<GetEntityQuery>,
            ) -> ::stately::Result<::axum::Json<GetEntityResponse>> {
                let state = stately.state.read().await;
                let Some((id, entity)) = state.get_entity(&id, query.entity_type) else {
                    return Err(::stately::Error::NotFound(format!("Entity with ID {id} not found")))
                };
                Ok(::axum::Json(GetEntityResponse { id, entity }))
            }
        });
    }
}
