//! `OpenAPI` documentation for the stately-arrow API.
//!
//! This module provides the `OpenAPI` specification with conditional schema inclusion
//! based on enabled features (`database`, `object-store`, etc.).

use utoipa::openapi::tag::TagBuilder;
use utoipa::openapi::{ComponentsBuilder, InfoBuilder, OpenApiBuilder, PathsBuilder};

use crate::{
    Capability, ConnectionMetadata, ListSummary, QueryRequest, SessionCapability, StatQuery,
    TableSummary,
};

/// `OpenAPI` documentation struct for the stately-arrow API.
#[derive(Clone, Copy)]
pub struct OpenApiDoc;

impl utoipa::OpenApi for OpenApiDoc {
    #[cfg_attr(not(all(feature = "database", feature = "object-store")), expect(unused_mut))]
    fn openapi() -> utoipa::openapi::OpenApi {
        // Build components with base schemas
        let mut components = ComponentsBuilder::new()
            // Base schemas (always included)
            .schema_from::<QueryRequest>()
            .schema_from::<StatQuery>()
            .schema_from::<SessionCapability>()
            .schema_from::<Capability>()
            .schema_from::<ConnectionMetadata>()
            .schema_from::<ListSummary>()
            .schema_from::<TableSummary>()
            .schema_from::<crate::connectors::ConnectionKind>();

        // Database feature schemas
        #[cfg(feature = "database")]
        {
            use crate::database::{
                Config as DatabaseConfig, Database, DatabaseOptions, PoolOptions, Secret,
                TlsOptions,
            };
            components = components
                .schema_from::<DatabaseConfig>()
                .schema_from::<DatabaseOptions>()
                .schema_from::<Database>()
                .schema_from::<PoolOptions>()
                .schema_from::<Secret>()
                .schema_from::<TlsOptions>();

            // ClickHouse-specific schemas (nested under database feature)
            #[cfg(feature = "clickhouse")]
            {
                use crate::database::clickhouse::{ClickHouseCompression, ClickHouseConfig};
                components = components
                    .schema_from::<ClickHouseConfig>()
                    .schema_from::<ClickHouseCompression>();
            }
        }

        // Object store feature schemas
        #[cfg(feature = "object-store")]
        {
            use crate::object_store::{
                Config as ObjectStoreConfig, ObjectStore, ObjectStoreFormat, ObjectStoreOptions,
            };
            components = components
                .schema_from::<ObjectStoreConfig>()
                .schema_from::<ObjectStore>()
                .schema_from::<ObjectStoreOptions>()
                .schema_from::<ObjectStoreFormat>();
        }

        // Build paths from handler functions
        let paths = PathsBuilder::new()
            .path_from::<super::handlers::__path_list_connectors>()
            .path_from::<super::handlers::__path_list_catalogs>()
            .path_from::<super::handlers::__path_stat>()
            .path_from::<super::handlers::__path_execute_query>()
            .path_from::<super::handlers::__path_register>()
            .build();

        // Build the OpenAPI spec
        OpenApiBuilder::new()
            .info(
                InfoBuilder::new()
                    .title(env!("CARGO_PKG_NAME"))
                    .version(env!("CARGO_PKG_VERSION"))
                    .description(Some(env!("CARGO_PKG_DESCRIPTION")))
                    .build(),
            )
            .paths(paths)
            .components(Some(components.build()))
            .tags(Some(vec![
                TagBuilder::new().name("arrow-view").description(Some("Viewer endpoints")).build(),
            ]))
            .build()
    }
}
