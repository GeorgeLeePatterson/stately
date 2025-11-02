#![expect(unused_crate_dependencies)]
//! Basic example of using stately

use serde::{Deserialize, Serialize};
use stately::prelude::*;

// Define entities
#[stately::entity]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Pipeline {
    pub name:        String,
    pub description: Option<String>,
}

#[stately::entity]
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct Source {
    pub name: String,
    pub url:  String,
}

#[stately::entity]
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct Sink {
    pub name:        String,
    pub destination: String,
}

#[stately::entity(singleton, description = "Global configuration")]
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize, Default)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct Config {
    pub max_connections: usize,
    pub timeout_seconds: u64,
}

// Additional entities for demonstrating collection syntax variations
#[stately::entity]
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct Task {
    pub name:   String,
    pub status: String,
}

#[stately::entity]
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
pub struct Job {
    pub name:     String,
    pub priority: u32,
}

// Type alias for custom StateCollection demonstration
type TaskCache = Collection<Task>;

// Define the application state demonstrating all collection syntax permutations
#[stately::state]
pub struct AppState {
    // Singleton
    #[singleton]
    pub config:     Config,
    // Case 1: Implicit collection (no attribute)
    pub pipelines:  Pipeline,
    // Case 2: Explicit collection (same as case 1, with variant to avoid collision)
    #[collection(variant = "ExplicitSource")]
    pub sources:    Source,
    // Case 3: Custom StateCollection type (using type alias)
    #[collection(TaskCache, variant = "CachedTask")]
    pub tasks:      Task,
    // Case 4: Variant override only (reusing Pipeline entity)
    #[collection(variant = "ArchivedPipeline")]
    pub archived:   Pipeline,
    // Case 5: Custom type + variant override (reusing Task entity and TaskCache type)
    #[collection(TaskCache, variant = "BackgroundTask")]
    pub background: Task,
    // Additional collections
    pub sinks:      Sink,
    pub jobs:       Job,
}

fn main() {
    println!("=== Stately Basic Example ===\n");
    println!("Demonstrating all 5 collection syntax permutations:\n");

    // Create a new state
    let mut state = AppState::new();

    // Configure singleton
    state.config.set(Config { max_connections: 100, timeout_seconds: 30 });
    println!("✓ Configured singleton (Config)");

    // Case 1: Implicit collection
    let pipeline_id = state.pipelines.create(Pipeline {
        name:        "data-pipeline".to_string(),
        description: Some("Main data processing pipeline".to_string()),
    });
    println!("✓ Case 1 - Implicit collection: Created pipeline {pipeline_id}");

    // Case 2: Explicit collection with variant override
    let source_id = state.sources.create(Source {
        name: "api-source".to_string(),
        url:  "http://example.com/data".to_string(),
    });
    println!("✓ Case 2 - Explicit with variant: Created source {source_id}");

    // Case 3: Custom StateCollection type
    let task_id = state
        .tasks
        .create(Task { name: "process-data".to_string(), status: "pending".to_string() });
    println!("✓ Case 3 - Custom type: Created task {task_id}");

    // Case 4: Variant override only
    let archived_id = state.archived.create(Pipeline {
        name:        "old-pipeline".to_string(),
        description: Some("Archived for reference".to_string()),
    });
    println!("✓ Case 4 - Variant override: Created archived pipeline {archived_id}");

    // Case 5: Custom type + variant override
    let background_id = state
        .background
        .create(Task { name: "cleanup".to_string(), status: "running".to_string() });
    println!("✓ Case 5 - Custom + variant: Created background task {background_id}");

    // Create additional entities
    let sink_id = state.sinks.create(Sink {
        name:        "s3-sink".to_string(),
        destination: "s3://my-bucket/output".to_string(),
    });
    println!("✓ Created sink {sink_id}");

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

    // Retrieve specific entities by variant
    println!("\n=== Get Specific Entities ===");
    if let Some((id, _entity)) = state.get_entity(&pipeline_id, StateEntry::Pipeline) {
        println!("Found Pipeline: {id}");
    }
    if let Some((id, _entity)) = state.get_entity(&source_id, StateEntry::ExplicitSource) {
        println!("Found ExplicitSource: {id}");
    }
    if let Some((id, _entity)) = state.get_entity(&task_id, StateEntry::CachedTask) {
        println!("Found CachedTask: {id}");
    }
    if let Some((id, _entity)) = state.get_entity(&archived_id, StateEntry::ArchivedPipeline) {
        println!("Found ArchivedPipeline: {id}");
    }
    if let Some((id, _entity)) = state.get_entity(&background_id, StateEntry::BackgroundTask) {
        println!("Found BackgroundTask: {id}");
    }

    // Update an entity
    println!("\n=== Update Entity ===");
    let updated_source =
        Source { name: "api-source".to_string(), url: "http://example.com/new-data".to_string() };
    match state.sources.update(&source_id, updated_source) {
        Ok(()) => println!("Updated source"),
        Err(e) => println!("Error updating source: {e}"),
    }

    // Serialize state to JSON
    println!("\n=== Serialization ===");
    let json = serde_json::to_string_pretty(&state.sources).unwrap();
    println!("Sources as JSON:\n{json}");

    println!("\n=== Example Complete ===");
}
