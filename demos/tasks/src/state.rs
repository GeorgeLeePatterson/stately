use serde::{Deserialize, Serialize};
use stately::Link;

/// A task in our application
#[stately::entity]
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, utoipa::ToSchema)]
pub struct Task {
    // The task's friendly name
    pub name:        String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    // The task's current status
    pub status:      TaskStatus,
    // The task's assigned user
    #[serde(skip_serializing_if = "Option::is_none")]
    pub assigned_to: Option<Link<User>>,
}

/// A user in our application
#[stately::entity]
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, utoipa::ToSchema)]
pub struct User {
    // The user's full name
    pub name:   String,
    // The user's title
    pub title:  Option<String>,
    // The user's current status
    #[serde(default)]
    pub status: UserStatus,
}

/// A task's status
#[derive(Clone, Copy, Debug, Default, PartialEq, Serialize, Deserialize, utoipa::ToSchema)]
pub enum TaskStatus {
    #[default]
    Pending,
    InProgress,
    Complete,
}

/// A user's status
#[derive(Clone, Copy, Debug, Default, PartialEq, Serialize, Deserialize, utoipa::ToSchema)]
pub enum UserStatus {
    /// The user is working
    #[default]
    Working,
    /// The user is currently on approved PTO
    #[serde(rename = "PTO")]
    Pto,
    /// The user is currently out of office
    #[serde(rename = "OOO")]
    Ooo,
    /// The user is currently absent without notice
    Absent,
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
    users: User,
}
