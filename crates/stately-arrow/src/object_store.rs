// TODO: Docs
use std::collections::BTreeMap;
use std::fs;
use std::path::PathBuf;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};

use async_trait::async_trait;
use datafusion::execution::context::SessionContext;
use datafusion::execution::object_store::ObjectStoreUrl;
use futures_util::TryStreamExt;
use object_store::ObjectStore as ObjectStoreClient;
use object_store::aws::AmazonS3Builder;
use object_store::azure::MicrosoftAzureBuilder;
use object_store::gcp::GoogleCloudStorageBuilder;
use object_store::local::LocalFileSystem;
use object_store::path::Path as ObjectStorePath;
use serde::{Deserialize, Serialize};
use tracing::{debug, error};

use crate::connectors::{Backend, Capability, ConnectionKind, ConnectionMetadata};
use crate::error::Error;
use crate::{ListSummary, Result, TableSummary};

const IGNORE_FILES: &[&str] = &[".DS_Store", ".git", ".env"];

/// Configuration for an object store-backed connector.
#[derive(Default, Debug, Clone, PartialEq, Eq, Hash, Deserialize, Serialize, utoipa::ToSchema)]
#[schema(as = ObjectStoreConfiguration)]
pub struct Config {
    /// The format to read/write within the store.
    #[serde(default)]
    pub format: ObjectStoreFormat,
    /// Provider specific configuration for the store itself.
    #[serde(default)]
    pub store:  ObjectStore,
}

/// Supported file formats for object-store connectors.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Deserialize, Serialize, utoipa::ToSchema)]
#[cfg_attr(feature = "strum", derive(strum_macros::AsRefStr))]
#[schema(as = ObjectStoreFormat)]
#[serde(rename_all = "snake_case")]
pub enum ObjectStoreFormat {
    /// Apache Parquet format with optional key/value overrides.
    #[schema(value_type = Option<BTreeMap<String, String>>)]
    Parquet(#[serde(default)] Option<BTreeMap<String, String>>),
}

impl Default for ObjectStoreFormat {
    fn default() -> Self { ObjectStoreFormat::Parquet(None) }
}

/// Provider-agnostic object store settings.
#[derive(Default, Debug, Clone, PartialEq, Eq, Hash, Deserialize, Serialize, utoipa::ToSchema)]
pub struct ObjectStoreOptions {
    /// *Required* bucket name (or base directory for local stores).
    #[serde(default)]
    #[schema(required)]
    pub bucket:   String,
    /// Whether credentials should be resolved from environment variables.
    #[serde(default)]
    pub from_env: bool,
    /// Additional provider-specific configuration parameters.
    #[serde(default)]
    #[schema(value_type = BTreeMap<String, String>)]
    pub options:  BTreeMap<String, String>,
}

impl ObjectStoreOptions {
    /// Look up a configuration option by key.
    pub fn get(&self, key: &str) -> Option<&String> { self.options.get(key) }
}

/// Supported object store providers.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Deserialize, Serialize, utoipa::ToSchema)]
#[cfg_attr(feature = "strum", derive(strum_macros::AsRefStr))]
#[schema(as = ObjectStore)]
#[serde(rename_all = "snake_case")]
pub enum ObjectStore {
    #[serde(alias = "s3", alias = "aws")]
    #[cfg_attr(feature = "strum", strum(serialize = "s3"))]
    Aws(ObjectStoreOptions),
    #[serde(alias = "gcs", alias = "google", alias = "gcp")]
    #[cfg_attr(feature = "strum", strum(serialize = "gs"))]
    Gcp(ObjectStoreOptions),
    #[serde(alias = "azure", alias = "microsoft")]
    #[cfg_attr(feature = "strum", strum(serialize = "az"))]
    Azure(ObjectStoreOptions),
    #[serde(alias = "local", alias = "file")]
    #[cfg_attr(feature = "strum", strum(serialize = "file"))]
    Local(ObjectStoreOptions),
}

impl ObjectStore {
    /// Return the bucket (or fully qualified path for local stores).
    pub fn bucket(&self) -> String {
        match self {
            ObjectStore::Aws(settings)
            | ObjectStore::Gcp(settings)
            | ObjectStore::Azure(settings) => settings.bucket.clone(),
            ObjectStore::Local(settings) => {
                let root = settings
                    .options
                    .get("root")
                    .or_else(|| settings.options.get("path"))
                    .or_else(|| settings.options.get("base_path"))
                    .or_else(|| settings.options.get("base_dir"));
                match root {
                    Some(path) => format!("{path}/{}", settings.bucket),
                    None => settings.bucket.clone(),
                }
            }
        }
    }

    /// Produce a canonical URL identifier for the bucket/path.
    pub fn url(&self) -> String {
        let scheme = match self {
            ObjectStore::Aws(_) => "s3",
            ObjectStore::Gcp(_) => "gs",
            ObjectStore::Azure(_) => "az",
            ObjectStore::Local(_) => "file",
        };
        format!("{scheme}://{}", self.bucket())
    }

    /// Access the underlying provider configuration.
    pub fn config(&self) -> &ObjectStoreOptions {
        match self {
            ObjectStore::Aws(cfg)
            | ObjectStore::Gcp(cfg)
            | ObjectStore::Azure(cfg)
            | ObjectStore::Local(cfg) => cfg,
        }
    }
}

impl Default for ObjectStore {
    fn default() -> Self { Self::Local(ObjectStoreOptions::default()) }
}

/// Default backend implementation for object store connectors.
pub struct ObjectStoreBackend {
    metadata:   ConnectionMetadata,
    store:      Arc<dyn ObjectStoreClient>,
    url:        ObjectStoreUrl,
    registered: Arc<AtomicBool>,
}

impl ObjectStoreBackend {
    /// Create a new object store backend.
    ///
    /// # Errors
    /// - If the object store creation fails.
    pub fn try_new(
        id: impl Into<String>,
        name: impl Into<String>,
        config: &Config,
    ) -> Result<Self> {
        let metadata = ConnectionMetadata {
            id:           id.into(),
            name:         name.into(),
            kind:         ConnectionKind::ObjectStore,
            capabilities: vec![Capability::ExecuteSql, Capability::List],
            catalog:      Some(config.store.url()),
        };

        let ObjectStoreRegistration { object_store: store, url, .. } =
            create_object_store(&config.store)
                .inspect_err(|error| error!(?error, "Failed to create object store"))?;
        let url = ObjectStoreUrl::parse(&url)
            .map_err(|e| Error::Internal(format!("Invalid bucket URL: {e}")))?;
        Ok(Self { metadata, store, url, registered: Arc::new(AtomicBool::new(false)) })
    }
}

#[async_trait]
impl Backend for ObjectStoreBackend {
    fn metadata(&self) -> &ConnectionMetadata { &self.metadata }

    async fn prepare_session(&self, session: &SessionContext) -> Result<()> {
        if self.registered.load(Ordering::Acquire) {
            debug!("Object store already registered, skipping registration");
            return Ok(());
        }

        let url = &self.url;
        let store = Arc::clone(&self.store);
        let previous = session.register_object_store(url.as_ref(), store);
        let overwrote = previous.is_some();
        debug!(url = url.as_str(), overwrote, "Registered object store with session");

        // TODO: Remove !!!
        drop(session.runtime_env().object_store(url).map_err(|e| {
            Error::Internal(format!("Failed to load registered object store: {e}"))
        })?);

        // Flag that connection has been registered
        self.registered.store(true, Ordering::Release);

        Ok(())
    }

    async fn list(&self, database: Option<&str>, _schema: Option<&str>) -> Result<ListSummary> {
        let prefix = database
            .filter(|s| !s.is_empty())
            .map(|db| ObjectStorePath::from(db.trim_start_matches('/')));

        let entries = self
            .store
            .list(prefix.as_ref())
            .try_collect::<Vec<_>>()
            .await?
            .into_iter()
            .filter(|meta| {
                !IGNORE_FILES
                    .iter()
                    .any(|i| meta.location.filename().is_some_and(|f| f.starts_with(i)))
            })
            .map(|meta| TableSummary {
                name:       meta.location.to_string(),
                rows:       None,
                size_bytes: Some(meta.size),
            })
            .collect::<Vec<_>>();

        if database.is_some() {
            Ok(ListSummary::Tables(entries))
        } else {
            Ok(ListSummary::Files(entries))
        }
    }
}

/// Object store registration object. Identifies the url, full path if any, and provides the object
/// store created
pub struct ObjectStoreRegistration {
    pub object_store: Arc<dyn ObjectStoreClient>,
    pub url:          String,
    pub full_path:    Option<String>,
}

/// Create an object store based on the provided configuration.
///
/// # Errors
/// - If the object store cannot be created.
pub fn create_object_store(store: &ObjectStore) -> Result<ObjectStoreRegistration> {
    macro_rules! build {
        ($url:expr, $conf:expr, $b:ident, $bn:ident) => {{
            let mut builder = if $conf.from_env { $b::from_env() } else { $b::new() }.$bn($url);
            for (key, value) in &$conf.options {
                builder = builder.with_config(key.parse()?, value);
            }
            Arc::new(builder.build()?) as Arc<dyn ObjectStoreClient>
        }};
    }

    let bucket = store.bucket();
    let url = store.url();
    let mut full_path = None;
    let object_store = match store {
        ObjectStore::Aws(s) => build!(bucket, s, AmazonS3Builder, with_bucket_name),
        ObjectStore::Gcp(s) => build!(bucket, s, GoogleCloudStorageBuilder, with_bucket_name),
        ObjectStore::Azure(s) => build!(bucket, s, MicrosoftAzureBuilder, with_container_name),
        ObjectStore::Local(_) => {
            // Canonicalize the base path and ensure it exists
            let path = PathBuf::from(bucket);
            let path = if path.is_relative() {
                std::env::current_dir()
                    .map(|c| c.join(path))
                    .map_err(|e| Error::ObjectStoreCreate(e.to_string()))?
            } else {
                path
            };

            if let Err(e) = fs::create_dir_all(&path) {
                error!(?path, "Failed to prepare local object store directory");
                return Err(Error::ObjectStoreCreate(format!(
                    "Failed to create local store path `{}`: {e}",
                    path.display()
                )));
            }

            full_path = Some(path.to_string_lossy().to_string());
            Arc::new(LocalFileSystem::new_with_prefix(&path)?)
        }
    };

    Ok(ObjectStoreRegistration { object_store, url, full_path })
}
