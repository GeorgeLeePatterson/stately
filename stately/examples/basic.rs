#![expect(unused_crate_dependencies)]
//! Basic example of using stately

use serde::{Deserialize, Serialize};
use stately::prelude::*;

// Define entities
#[stately::entity]
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct Pipeline {
    pub name:   String,
    pub source: Link<SourceConfig>,
    pub sink:   Link<SinkConfig>,
}

#[stately::entity]
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct SourceConfig {
    pub name: String,
    pub url:  String,
}

#[stately::entity]
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct SinkConfig {
    pub name:        String,
    pub destination: String,
}

#[stately::entity(singleton, description = "Application buffer settings")]
#[derive(Debug, Default, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct BufferSettings {
    pub buffer_size:    usize,
    pub max_batch_size: usize,
}

// Define the application state - clean syntax with proc macro!
#[stately::state]
pub struct AppState {
    #[singleton]
    buffer_settings: BufferSettings,
    pipelines:       Pipeline,
    sources:         SourceConfig,
    sinks:           SinkConfig,
}

fn main() {
    println!("=== Stately Basic Example ===\n");

    // Create a new state
    let mut state = AppState::new();

    // Create some source configs
    let source_id = state.sources.create(SourceConfig {
        name: "my-source".to_string(),
        url:  "http://example.com/data".to_string(),
    });
    println!("Created source with ID: {source_id}");

    // Create a sink config
    let sink_id = state.sinks.create(SinkConfig {
        name:        "my-sink".to_string(),
        destination: "s3://my-bucket/output".to_string(),
    });
    println!("Created sink with ID: {sink_id}");

    // Create a pipeline that references the source and sink
    let pipeline = Pipeline {
        name:   "my-pipeline".to_string(),
        source: Link::create_ref(source_id.to_string()),
        sink:   Link::create_ref(sink_id.to_string()),
    };
    let pipeline_id = state.pipelines.create(pipeline);
    println!("Created pipeline with ID: {pipeline_id}");

    // List all entities
    println!("\n=== Entity Summaries ===");
    let summaries = state.list_entities(None);
    for (entry, summaries) in summaries {
        println!("\n{}:", entry.as_ref());
        for summary in summaries {
            println!("  - {} ({})", summary.name, summary.id);
            if let Some(desc) = summary.description {
                println!("    Description: {desc}");
            }
        }
    }

    // Search for entities
    println!("\n=== Search Results for 'pipeline' ===");
    let search_results = state.search_entities("pipeline");
    for (entry, entities) in search_results {
        println!("\n{}:", entry.as_ref());
        for (id, _entity) in entities {
            println!("  - {id}");
        }
    }

    // Retrieve a specific entity
    println!("\n=== Get Specific Entity ===");
    if let Some((id, entity)) = state.get_entity(&pipeline_id.to_string(), StateEntry::Pipeline) {
        println!("Found pipeline {id}: {entity:?}");
    }

    // Update an entity
    println!("\n=== Update Entity ===");
    let updated_source = SourceConfig {
        name: "my-source".to_string(),
        url:  "http://example.com/new-data".to_string(),
    };
    match state.sources.update(&source_id.to_string(), updated_source) {
        Ok(old) => println!("Updated source (old value: {})", old.name),
        Err(e) => println!("Error updating source: {e}"),
    }

    // Serialize state to JSON
    println!("\n=== Serialization ===");
    let json = serde_json::to_string_pretty(&state.sources).unwrap();
    println!("Sources as JSON:\n{json}");

    println!("\n=== Example Complete ===");
}
