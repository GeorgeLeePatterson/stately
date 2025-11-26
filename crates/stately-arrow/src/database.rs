// TODO: Docs
#[cfg(feature = "clickhouse")]
pub mod clickhouse;

use serde::{Deserialize, Serialize};

/// Configuration for database-backed connectors.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Deserialize, Serialize, utoipa::ToSchema)]
#[schema(as = DatabaseConfiguration)]
pub struct Config {
    pub options: DatabaseOptions,
    pub driver:  Database,
    #[serde(default)]
    pub pool:    PoolOptions,
}

/// Common connection options shared by database connectors.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Deserialize, Serialize, utoipa::ToSchema)]
pub struct DatabaseOptions {
    /// Endpoint, url, or path to the database
    pub endpoint: String,
    /// Username used to connect to the database
    pub username: String,
    /// Optional password for the database
    #[serde(skip_serializing_if = "Option::is_none")]
    #[schema(value_type = String)]
    pub password: Option<Secret>,
    /// TLS configuration if the database requires it
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tls:      Option<TlsOptions>,
    /// Whether the connector should validate connections before use
    #[serde(default)]
    #[schema(default = false)]
    pub check:    bool,
}

/// Common configuration options shared across connector types.
#[derive(
    Default, Debug, Clone, Copy, PartialEq, Eq, Hash, Deserialize, Serialize, utoipa::ToSchema,
)]
pub struct PoolOptions {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub connect_timeout:     Option<u16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub transaction_timeout: Option<u16>,
    /// Configure the maximum number of connections to the database. Note, not all connectors
    /// support pools.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pool_size:           Option<u32>,
}

/// TLS options for databases that require secure connections.
#[derive(Default, Debug, Clone, PartialEq, Eq, Hash, Deserialize, Serialize, utoipa::ToSchema)]
pub struct TlsOptions {
    #[serde(default)]
    #[schema(default = false)]
    pub enable: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub domain: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cafile: Option<String>,
}

/// Supported databases for the default backend lineup.
#[cfg_attr(not(feature = "clickhouse"), expect(missing_copy_implementations))]
#[derive(Debug, Clone, PartialEq, Eq, Hash, Deserialize, Serialize, utoipa::ToSchema)]
#[cfg_attr(feature = "strum", derive(strum_macros::AsRefStr))]
#[serde(rename_all = "snake_case")]
pub enum Database {
    #[cfg(feature = "clickhouse")]
    #[serde(alias = "clickhouse")]
    ClickHouse(
        #[serde(default, skip_serializing_if = "Option::is_none")]
        Option<clickhouse::ClickHouseConfig>,
    ),
}

// TODO: Encrypt
/// Newtype to protect secrets from being logged
/// A wrapper type for sensitive string data like passwords.
///
/// This type provides protection against accidental exposure of sensitive data
/// in logs, debug output, or error messages. The inner value is not displayed
/// in `Debug` implementations.
///
/// # Example
/// ```
/// use stately_arrow::database::Secret;
///
/// let password = Secret::new("my_password");
/// println!("{password:?}"); // Prints: Secret(*******)
/// ```
#[derive(Clone, Default, PartialEq, Eq, Hash, Deserialize, utoipa::ToSchema)]
#[schema(value_type = String)]
pub struct Secret(String);

impl Secret {
    pub fn new<P: AsRef<str>>(s: P) -> Self { Self(s.as_ref().to_string()) }

    #[must_use]
    pub fn get(&self) -> &str { &self.0 }
}

impl std::fmt::Debug for Secret {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Secret(*****)")
    }
}

impl<T: AsRef<str>> From<T> for Secret {
    fn from(s: T) -> Self { Self(s.as_ref().to_string()) }
}

impl Serialize for Secret {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(self.get())
    }
}
