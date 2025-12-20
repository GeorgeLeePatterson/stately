//! Axum API integration - generates FromRef and api module with handlers

mod args;
mod endpoints;
mod openapi;
mod types;

use args::AxumApiArgs;
use endpoints::Endpoints;
use proc_macro::TokenStream;
use quote::quote;
use syn::{DeriveInput, parse_macro_input};
use types::Types;

/// Generates FromRef implementation and api module with CRUD handlers
///
/// Usage:
/// ```ignore
/// #[stately::axum_api(State)]  // Pass the state type name
/// pub struct AppState {
///     state: StatelyState,
/// }
/// ```
///
/// This generates:
/// 1. The `state` field with type `StatelyState` (generated from State)
/// 2. `FromRef<AppState> for StatelyState` - allows Axum to extract state
/// 3. `AppState::api` module with all CRUD handlers, router, and OpenAPI docs
pub fn generate(attr: TokenStream, item: TokenStream) -> TokenStream {
    let args = parse_macro_input!(attr as AxumApiArgs);
    let input = parse_macro_input!(item as DeriveInput);

    let state_type_name = &args.state_type;
    let enable_openapi = args.enable_openapi();
    let additional_components = args.components();

    let struct_name = &input.ident;
    let vis = &input.vis;

    // Generate response and request types
    let types = Types { enable_openapi, vis: vis.clone() };

    // Generate endpoint handler functions
    let endpoints =
        Endpoints { enable_openapi, struct_name: struct_name.clone(), vis: vis.clone() };

    let api_doc = if enable_openapi {
        quote! {
            /// OpenAPI documentation
            #[derive(::utoipa::OpenApi)]
            #[openapi(
                paths(
                    create_entity,
                    list_entities,
                    get_entity_by_id,
                    update_entity,
                    patch_entity_by_id,
                    remove_entity
                ),
                components(
                    responses(
                        OperationResponse,
                        EntitiesResponse,
                        ListResponse,
                        GetEntityResponse,
                        ::stately::ApiError,
                    ),
                    schemas(
                        Entity,
                        StateEntry,
                        OperationResponse,
                        EntitiesResponse,
                        EntitiesMap,
                        ListResponse,
                        GetEntityResponse,
                        ::stately::Summary,
                        ::stately::EntityId,
                        #(#additional_components),*
                    )
                ),
                tags(
                    (name = "entity", description = "Entity management endpoints"),
                )
            )]
        }
    } else {
        quote! {}
    };

    // Generate StatelyState wrapper and api module
    let expanded = quote! {
        // Generate the AppState struct with the state field
        #[derive(Clone)]
        #api_doc
        #vis struct #struct_name {
            #vis state: ::std::sync::Arc<::tokio::sync::RwLock<#state_type_name>>,
        }

        impl #struct_name {
            /// Creates a new API state wrapper
            #vis fn new(state: #state_type_name) -> Self {
                Self {
                    state: ::std::sync::Arc::new(::tokio::sync::RwLock::new(state)),
                }
            }

            /// Creates a new wrapped state for use with Axum
            #vis fn new_from_state(state: ::std::sync::Arc<::tokio::sync::RwLock<#state_type_name>>) -> Self {
                Self { state }
            }
        }

        // Generated API implementation on the user's struct
        impl #struct_name {
            /// Creates the Axum router with all entity CRUD endpoints
            pub fn router<S>(state: S) -> ::axum::Router<S>
            where
                S: Send + Sync + Clone + 'static,
                #struct_name: ::axum::extract::FromRef<S>,
            {
                ::axum::Router::new()
                    .route(
                        "/",
                        ::axum::routing::get(get_entities)
                            .put(create_entity)
                            .layer(::tower_http::compression::CompressionLayer::new())
                    )
                    .route(
                        "/list",
                        ::axum::routing::get(list_all_entities)
                            .layer(::tower_http::compression::CompressionLayer::new())
                    )
                    .route(
                        "/list/{type}",
                        ::axum::routing::get(list_entities)
                            .layer(::tower_http::compression::CompressionLayer::new())
                    )
                    .route(
                        "/{id}",
                        ::axum::routing::get(get_entity_by_id)
                            .post(update_entity)
                            .patch(patch_entity_by_id)
                    )
                    .route("/{entry}/{id}", ::axum::routing::delete(remove_entity))
                    .with_state(state)
            }

            /// Creates middleware that extracts ResponseEvent from response extensions and sends to channel
            ///
            /// The channel can send any type `T` that implements `From<ResponseEvent>`, allowing you to
            /// convert the event into your own enum variant (e.g., `events::Api::StateEvent(event)`).
            pub fn event_middleware<T>(
                event_tx: ::tokio::sync::mpsc::Sender<T>
            ) -> impl Fn(::axum::http::Request<::axum::body::Body>, ::axum::middleware::Next) -> std::pin::Pin<Box<dyn std::future::Future<Output = ::axum::response::Response> + Send>> + Clone
            where
                T: From<ResponseEvent> + Send + 'static,
            {
                move |req: ::axum::http::Request<::axum::body::Body>, next: ::axum::middleware::Next| {
                    let tx = event_tx.clone();
                    Box::pin(async move {
                        let response = next.run(req).await;

                        if let Some(event) = response.extensions().get::<ResponseEvent>() {
                            let converted: T = event.clone().into();
                            let _ = tx.send(converted).await;
                        }

                        response
                    })
                }
            }
        }

        // Response and request types
        #types

        // Endpoint handler functions
        #endpoints
    };

    TokenStream::from(expanded)
}
