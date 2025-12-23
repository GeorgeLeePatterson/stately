use serde::{Deserialize, Serialize};

/// A dispatched task
#[stately::entity]
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, utoipa::ToSchema)]
pub struct Task {
    /// The name of the task
    pub name:        String,
    /// The description of the task
    pub description: Option<String>,
    /// The status of the task
    pub status:      TaskStatus,
}

/// The status of a task
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
    /// The number of tasks created
    pub tasks_created: u64,
    /// The number of tasks removed
    pub tasks_removed: u64,
}

/// Application state containing all entity collections
#[stately::state(openapi)]
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct State {
    tasks: Task,
}
