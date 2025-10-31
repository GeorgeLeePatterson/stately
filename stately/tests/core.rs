#![expect(unused_crate_dependencies)]
//! Integration tests for stately proc macros and generated code

use serde::{Deserialize, Serialize};
use stately::prelude::*;
use uuid::Uuid;

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

// Test state
#[stately::state]
struct TestState {
    #[singleton]
    config:    Config,
    pipelines: Pipeline,
    sources:   Source,
    sinks:     Sink,
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

    let result = state.get_entity(&source_id.to_string(), StateEntry::Source);
    assert!(result.is_some());

    let (id, entity) = result.unwrap();
    assert_eq!(id, source_id);

    match entity {
        Entity::Source(s) => assert_eq!(s, source),
        _ => panic!("Wrong entity type"),
    }
}

#[test]
fn test_get_entity_by_name() {
    let mut state = TestState::new();

    let source = Source { name: "my-source".to_string(), url: "http://example.com".to_string() };
    let _ = state.sources.create(source.clone());

    let result = state.get_entity("my-source", StateEntry::Source);
    assert!(result.is_some());

    let (_id, entity) = result.unwrap();
    match entity {
        Entity::Source(s) => assert_eq!(s, source),
        _ => panic!("Wrong entity type"),
    }
}

#[test]
fn test_list_all_entities() {
    let mut state = TestState::new();

    let _ = state
        .sources
        .create(Source { name: "source1".to_string(), url: "http://example.com".to_string() });
    let _ = state
        .sources
        .create(Source { name: "source2".to_string(), url: "http://example.org".to_string() });
    let _ = state
        .sinks
        .create(Sink { name: "sink1".to_string(), destination: "s3://bucket".to_string() });

    let all_entities = state.list_entities(None);

    assert_eq!(all_entities.len(), 4); // 4 entity types (config singleton + sources + sinks + pipelines)
    assert_eq!(all_entities.get(&StateEntry::Source).map(Vec::len), Some(2));
    assert_eq!(all_entities.get(&StateEntry::Sink).map(Vec::len), Some(1));

    let collected = state.sources.get_entities();
    assert_eq!(collected.len(), 2);

    let err_res = state.sources.update("non_existent", Source {
        name: "source3".to_string(),
        url:  "http://example.net".to_string(),
    });
    assert!(err_res.is_err());
    let removed = state.sources.remove("source1").expect("source1 exists");
    assert!(removed.name() == "source1");
    assert!(!state.sources.is_empty());
}

#[test]
fn test_list_entities_by_type() {
    let mut state = TestState::new();

    let _ = state
        .sources
        .create(Source { name: "source1".to_string(), url: "http://example.com".to_string() });
    let _ = state
        .sources
        .create(Source { name: "source2".to_string(), url: "http://example.org".to_string() });
    let _ = state
        .sinks
        .create(Sink { name: "sink1".to_string(), destination: "s3://bucket".to_string() });

    let sources = state.list_entities(Some(StateEntry::Source));
    assert_eq!(sources.len(), 1);
    assert_eq!(sources.get(&StateEntry::Source).map(Vec::len), Some(2));

    let sinks = state.list_entities(Some(StateEntry::Sink));
    assert_eq!(sinks.len(), 1);
    assert_eq!(sinks.get(&StateEntry::Sink).map(Vec::len), Some(1));

    let all_sinks = state.sinks.iter().map(|(k, v)| (*k, v.clone())).collect::<Vec<_>>();
    assert!(all_sinks.len() == 1);
}

#[test]
fn test_search_entities() {
    let mut state = TestState::new();

    let _ = state.sources.create(Source {
        name: "api-source".to_string(),
        url:  "http://api.example.com".to_string(),
    });
    let _ = state.sources.create(Source {
        name: "database-source".to_string(),
        url:  "postgresql://localhost".to_string(),
    });
    let _ = state.pipelines.create(Pipeline {
        name:        "api-pipeline".to_string(),
        description: Some("Processes API data".to_string()),
    });

    // Search for "api" - should match source name and pipeline name/description
    let results = state.search_entities("api");
    assert!(results.contains_key(&StateEntry::Source));
    assert!(results.contains_key(&StateEntry::Pipeline));

    let source_results = results.get(&StateEntry::Source).unwrap();
    assert_eq!(source_results.len(), 1);

    let pipeline_results = results.get(&StateEntry::Pipeline).unwrap();
    assert_eq!(pipeline_results.len(), 1);

    // Search for "database" - should only match one source
    let results = state.search_entities("database");
    assert_eq!(results.len(), 1);
    assert!(results.contains_key(&StateEntry::Source));
}

#[test]
fn test_update_entity() {
    let mut state = TestState::new();

    let source = Source { name: "my-source".to_string(), url: "http://example.com".to_string() };
    let source_id = state.sources.create(source);

    // Update by ID
    let updated_source =
        Source { name: "my-source".to_string(), url: "http://updated.com".to_string() };
    let result = state.sources.update(&source_id.to_string(), updated_source.clone());
    assert!(result.is_ok());

    let retrieved = state.sources.get_by_id(&source_id).unwrap();
    assert_eq!(retrieved.url, "http://updated.com");
}

#[test]
fn test_update_entity_by_name() {
    let mut state = TestState::new();

    let source = Source { name: "my-source".to_string(), url: "http://example.com".to_string() };
    let _ = state.sources.create(source);

    // Update by name
    let updated_source =
        Source { name: "my-source".to_string(), url: "http://updated.com".to_string() };
    let result = state.sources.update("my-source", updated_source);
    assert!(result.is_ok());

    let (_, retrieved) = state.sources.get_by_name("my-source").unwrap();
    assert_eq!(retrieved.url, "http://updated.com");
}

#[test]
fn test_remove_entity() {
    let mut state = TestState::new();

    let source = Source { name: "my-source".to_string(), url: "http://example.com".to_string() };
    let source_id = state.sources.create(source.clone());

    assert_eq!(state.sources.len(), 1);

    let removed = state.sources.remove(&source_id.to_string());
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
    assert_eq!(create_id, Uuid::nil());
}
