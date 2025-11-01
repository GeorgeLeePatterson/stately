#![expect(unused_crate_dependencies)]
//! Integration tests for stately proc macros and generated code

use serde::{Deserialize, Serialize};
use stately::prelude::*;

// Test entities
#[stately::entity]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
struct Pipeline {
    name:        String,
    description: Option<String>,
}

#[stately::entity]
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
struct Source {
    name: String,
    url:  String,
}

#[stately::entity]
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
struct Sink {
    name:        String,
    destination: String,
}

#[stately::entity(singleton, description = "Global configuration")]
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Default)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
struct Config {
    max_connections: usize,
    timeout_seconds: u64,
}

// Additional entities for demonstrating collection syntax variations
#[stately::entity]
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
struct Task {
    name:   String,
    status: String,
}

#[stately::entity]
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "openapi", derive(utoipa::ToSchema))]
struct Job {
    name:     String,
    priority: u32,
}

// Type alias for custom StateCollection demonstration
type TaskCache = Collection<Task>;

// Test state demonstrating all collection syntax permutations
#[stately::state]
struct TestState {
    // Singleton
    #[singleton]
    config:     Config,
    // Case 1: Implicit collection (no attribute)
    pipelines:  Pipeline,
    // Case 2: Explicit collection (same as case 1, with variant to avoid collision)
    #[collection(variant = "ExplicitSource")]
    sources:    Source,
    // Case 3: Custom StateCollection type (using type alias)
    #[collection(TaskCache, variant = "CachedTask")]
    tasks:      Task,
    // Case 4: Variant override only (reusing Pipeline entity)
    #[collection(variant = "ArchivedPipeline")]
    archived:   Pipeline,
    // Case 5: Custom type + variant override (reusing Task entity and TaskCache type)
    #[collection(TaskCache, variant = "BackgroundTask")]
    background: Task,
    // Keep existing fields for backward compatibility with existing tests
    sinks:      Sink,
    jobs:       Job,
}

#[test]
fn test_state_new() {
    let state = TestState::new();
    assert!(state.pipelines.is_empty());
    assert!(state.sources.is_empty());
    assert!(state.sinks.is_empty());
    // Singleton is initialized with Default value
    assert_eq!(state.config.get(), &Config::default());
}

#[test]
fn test_create_entities() {
    let mut state = TestState::new();

    let source_id = state
        .sources
        .create(Source { name: "test-source".to_string(), url: "http://example.com".to_string() });

    let sink_id = state.sinks.create(Sink {
        name:        "test-sink".to_string(),
        destination: "s3://bucket".to_string(),
    });

    let pipeline_id = state.pipelines.create(Pipeline {
        name:        "test-pipeline".to_string(),
        description: Some("A test pipeline".to_string()),
    });

    assert_eq!(state.sources.len(), 1);
    assert_eq!(state.sinks.len(), 1);
    assert_eq!(state.pipelines.len(), 1);

    // Verify we can retrieve them
    assert!(state.sources.get_by_id(&source_id).is_some());
    assert!(state.sinks.get_by_id(&sink_id).is_some());
    assert!(state.pipelines.get_by_id(&pipeline_id).is_some());
}

#[test]
fn test_get_entity_by_id() {
    let mut state = TestState::new();

    let source = Source { name: "my-source".to_string(), url: "http://example.com".to_string() };
    let source_id = state.sources.create(source.clone());

    let result = state.get_entity(&source_id, StateEntry::ExplicitSource);
    assert!(result.is_some());

    let (id, entity) = result.unwrap();
    assert_eq!(id, source_id);

    match entity {
        Entity::ExplicitSource(s) => assert_eq!(s, source),
        _ => panic!("Wrong entity type"),
    }
}

#[test]
fn test_get_entity_by_name() {
    let mut state = TestState::new();

    let source = Source { name: "my-source".to_string(), url: "http://example.com".to_string() };
    drop(state.sources.create(source.clone()));

    let result = state.get_entity("my-source", StateEntry::ExplicitSource);
    assert!(result.is_some());

    let (_id, entity) = result.unwrap();
    match entity {
        Entity::ExplicitSource(s) => assert_eq!(s, source),
        _ => panic!("Wrong entity type"),
    }
}

#[test]
fn test_list_all_entities() {
    let mut state = TestState::new();

    let source1_id = state
        .sources
        .create(Source { name: "source1".to_string(), url: "http://example.com".to_string() });
    drop(
        state
            .sources
            .create(Source { name: "source2".to_string(), url: "http://example.org".to_string() }),
    );
    drop(
        state.sinks.create(Sink {
            name:        "sink1".to_string(),
            destination: "s3://bucket".to_string(),
        }),
    );

    let all_entities = state.list_entities(None);

    assert_eq!(all_entities.len(), 8); // 8 entity types (config singleton + pipelines + sources + tasks + archived + background + sinks + jobs)
    assert_eq!(all_entities.get(&StateEntry::ExplicitSource).map(Vec::len), Some(2));
    assert_eq!(all_entities.get(&StateEntry::Sink).map(Vec::len), Some(1));

    let collected = state.sources.get_entities();
    assert_eq!(collected.len(), 2);

    let err_res = state.sources.update("non_existent", Source {
        name: "source3".to_string(),
        url:  "http://example.net".to_string(),
    });
    assert!(err_res.is_err());
    let removed = state.sources.remove(&source1_id).expect("source1 exists");
    assert!(removed.name() == "source1");
    assert!(!state.sources.is_empty());
}

#[test]
fn test_list_entities_by_type() {
    let mut state = TestState::new();

    drop(
        state
            .sources
            .create(Source { name: "source1".to_string(), url: "http://example.com".to_string() }),
    );
    drop(
        state
            .sources
            .create(Source { name: "source2".to_string(), url: "http://example.org".to_string() }),
    );
    drop(
        state.sinks.create(Sink {
            name:        "sink1".to_string(),
            destination: "s3://bucket".to_string(),
        }),
    );

    let sources = state.list_entities(Some(StateEntry::ExplicitSource));
    assert_eq!(sources.len(), 1);
    assert_eq!(sources.get(&StateEntry::ExplicitSource).map(Vec::len), Some(2));

    let sinks = state.list_entities(Some(StateEntry::Sink));
    assert_eq!(sinks.len(), 1);
    assert_eq!(sinks.get(&StateEntry::Sink).map(Vec::len), Some(1));

    let all_sinks = state.sinks.iter().map(|(k, v)| (k.clone(), v.clone())).collect::<Vec<_>>();
    assert!(all_sinks.len() == 1);
}

#[test]
fn test_search_entities() {
    let mut state = TestState::new();

    drop(state.sources.create(Source {
        name: "api-source".to_string(),
        url:  "http://api.example.com".to_string(),
    }));
    drop(state.sources.create(Source {
        name: "database-source".to_string(),
        url:  "postgresql://localhost".to_string(),
    }));
    drop(state.pipelines.create(Pipeline {
        name:        "api-pipeline".to_string(),
        description: Some("Processes API data".to_string()),
    }));

    // Search for "api" - should match source name and pipeline name/description
    let results = state.search_entities("api");
    assert!(results.contains_key(&StateEntry::ExplicitSource));
    assert!(results.contains_key(&StateEntry::Pipeline));

    let source_results = results.get(&StateEntry::ExplicitSource).unwrap();
    assert_eq!(source_results.len(), 1);

    let pipeline_results = results.get(&StateEntry::Pipeline).unwrap();
    assert_eq!(pipeline_results.len(), 1);

    // Search for "database" - should only match one source
    let results = state.search_entities("database");
    assert_eq!(results.len(), 1);
    assert!(results.contains_key(&StateEntry::ExplicitSource));
}

#[test]
fn test_update_entity() {
    let mut state = TestState::new();

    let source = Source { name: "my-source".to_string(), url: "http://example.com".to_string() };
    let source_id = state.sources.create(source);

    // Update by ID
    let updated_source =
        Source { name: "my-source".to_string(), url: "http://updated.com".to_string() };
    let result = state.sources.update(&source_id, updated_source.clone());
    assert!(result.is_ok());

    let retrieved = state.sources.get_by_id(&source_id).unwrap();
    assert_eq!(retrieved.url, "http://updated.com");
}

#[test]
fn test_update_entity_by_id() {
    let mut state = TestState::new();

    let source = Source { name: "my-source".to_string(), url: "http://example.com".to_string() };
    let source_id = state.sources.create(source);

    // Update by ID
    let updated_source =
        Source { name: "my-source".to_string(), url: "http://updated.com".to_string() };
    let result = state.sources.update(&source_id, updated_source);
    assert!(result.is_ok());

    let retrieved = state.sources.get_by_id(&source_id).unwrap();
    assert_eq!(retrieved.url, "http://updated.com");
}

#[test]
fn test_remove_entity() {
    let mut state = TestState::new();

    let source = Source { name: "my-source".to_string(), url: "http://example.com".to_string() };
    let source_id = state.sources.create(source.clone());

    assert_eq!(state.sources.len(), 1);

    let removed = state.sources.remove(&source_id);
    assert!(removed.is_ok());
    assert_eq!(removed.unwrap(), source);

    assert_eq!(state.sources.len(), 0);
    assert!(state.sources.get_by_id(&source_id).is_none());
}

#[test]
fn test_singleton_operations() {
    let mut state = TestState::new();

    // Set singleton
    let config = Config { max_connections: 100, timeout_seconds: 30 };
    state.config.set(config.clone());
    assert_eq!(state.config.get(), &config);
    assert!(!state.config.is_empty());

    // Update singleton
    let updated_config = Config { max_connections: 200, timeout_seconds: 60 };
    state.config.set(updated_config.clone());
    assert_eq!(state.config.get(), &updated_config);

    let returned = state.config.get_entity("");
    assert!(returned.is_some());

    let collected = state.config.get_entities();
    assert!(collected.len() == 1);

    let err_res = state.config.remove("");
    assert!(err_res.is_err());

    let result = state.config.update("", Config { max_connections: 300, timeout_seconds: 90 });
    assert!(result.is_ok());

    let create_id = state.config.create(Config { max_connections: 400, timeout_seconds: 120 });
    assert_eq!(create_id, EntityId::singleton());
}

/// Test all 5 permutations of collection syntax using the main `TestState`
#[test]
fn test_custom_collection_syntax() {
    let mut state = TestState::new();

    // Test Case 1: Implicit collection (pipelines field)
    let pipeline1 = Pipeline {
        name:        "implicit-pipeline".to_string(),
        description: Some("Created in implicit collection".to_string()),
    };
    let id1 = state.pipelines.create(pipeline1.clone());
    assert_eq!(state.pipelines.len(), 1);

    // Test Case 2: Explicit collection with variant override (sources field -> ExplicitSource)
    let source =
        Source { name: "explicit-source".to_string(), url: "http://example.com".to_string() };
    let id2 = state.sources.create(source.clone());
    assert_eq!(state.sources.len(), 1);

    // Test Case 3: Custom StateCollection type (tasks field -> CachedTask)
    let task = Task { name: "cached-task".to_string(), status: "pending".to_string() };
    let id3 = state.tasks.create(task.clone());
    assert_eq!(state.tasks.len(), 1);

    // Test Case 4: Variant override only (archived field -> ArchivedPipeline)
    let pipeline2 = Pipeline {
        name:        "archived-pipeline".to_string(),
        description: Some("Created in archived collection".to_string()),
    };
    let id4 = state.archived.create(pipeline2.clone());
    assert_eq!(state.archived.len(), 1);

    // Test Case 5: Custom type + variant override (background field -> BackgroundTask)
    let task2 = Task { name: "background-task".to_string(), status: "running".to_string() };
    let id5 = state.background.create(task2.clone());
    assert_eq!(state.background.len(), 1);

    // Test that each variant is distinct in StateEntry enum
    let list_all = state.list_entities(None);
    assert_eq!(list_all.len(), 8); // All 8 entity types

    // Test retrieval by variant
    let result1 = state.get_entity(&id1, StateEntry::Pipeline);
    assert!(result1.is_some());
    if let Entity::Pipeline(p) = result1.unwrap().1 {
        assert_eq!(p, pipeline1);
    } else {
        panic!("Wrong entity type");
    }

    let result2 = state.get_entity(&id2, StateEntry::ExplicitSource);
    assert!(result2.is_some());
    if let Entity::ExplicitSource(s) = result2.unwrap().1 {
        assert_eq!(s, source);
    } else {
        panic!("Wrong entity type");
    }

    let result3 = state.get_entity(&id3, StateEntry::CachedTask);
    assert!(result3.is_some());
    if let Entity::CachedTask(t) = result3.unwrap().1 {
        assert_eq!(t, task);
    } else {
        panic!("Wrong entity type");
    }

    let result4 = state.get_entity(&id4, StateEntry::ArchivedPipeline);
    assert!(result4.is_some());
    if let Entity::ArchivedPipeline(p) = result4.unwrap().1 {
        assert_eq!(p, pipeline2);
    } else {
        panic!("Wrong entity type");
    }

    let result5 = state.get_entity(&id5, StateEntry::BackgroundTask);
    assert!(result5.is_some());
    if let Entity::BackgroundTask(t) = result5.unwrap().1 {
        assert_eq!(t, task2);
    } else {
        panic!("Wrong entity type");
    }

    // Test update operations
    let updated_task =
        Task { name: "background-task".to_string(), status: "completed".to_string() };
    assert!(state.background.update(&id5, updated_task.clone()).is_ok());
    let retrieved = state.background.get_by_id(&id5).unwrap();
    assert_eq!(retrieved.status, "completed");

    // Test remove operations
    assert!(state.archived.remove(&id4).is_ok());
    assert_eq!(state.archived.len(), 0);
}
