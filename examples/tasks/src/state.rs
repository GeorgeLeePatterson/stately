use serde::{Deserialize, Serialize};

/// A task in our application
#[stately::entity]
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, utoipa::ToSchema)]
pub struct Task {
    pub name:        String,
    pub description: Option<String>,
    pub status:      TaskStatus,
}

#[derive(Clone, Copy, Debug, Default, PartialEq, Serialize, Deserialize, utoipa::ToSchema)]
pub enum TaskStatus {
    #[default]
    Pending,
    InProgress,
    Complete,
}

// Simple tracker for the ui
#[derive(Clone, Copy, Debug, Default, PartialEq, Serialize, Deserialize, utoipa::ToSchema)]
pub struct TaskMetrics {
    pub tasks_created: u64,
    pub tasks_removed: u64,
}

/// Application state containing all entity collections
#[stately::state(openapi)]
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct State {
    tasks: Task,
}
