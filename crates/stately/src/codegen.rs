//! Code generation utilities for plugin authors.
//!
//! This module provides helpers for generating `OpenAPI` specs that can then be
//! processed by `@stately/codegen` to produce TypeScript types.
//!
//! # Usage
//!
//! Plugin authors should create a binary target in their crate:
//!
//! ```toml
//! # Cargo.toml
//! [[bin]]
//! name = "generate-openapi"
//! path = "src/bin/generate_openapi.rs"
//! ```
//!
//! Then use the [`generate_openapi`] function:
//!
//! ```rust,ignore
//! // src/bin/generate_openapi.rs
//! use my_plugin::api::OpenApiDoc;
//!
//! fn main() {
//!     // Output to the TS package directory for codegen
//!     stately::codegen::generate_openapi::<OpenApiDoc>("../packages/my-plugin")
//!         .expect("Failed to generate OpenAPI spec");
//! }
//! ```
//!
//! After running `cargo run --bin generate-openapi`, use the `@stately/codegen`
//! package to generate TypeScript types from the spec.

use std::io;
use std::path::{Path, PathBuf};

/// Generate an `OpenAPI` JSON spec from a `utoipa::OpenApi` implementation.
///
/// Writes `openapi.json` to the specified output directory.
///
/// # Arguments
///
/// * `output_dir` - Directory to write `openapi.json` to (typically your TS package root)
///
/// # Returns
///
/// The full path to the generated `openapi.json` file.
///
/// # Errors
///
/// Returns an error if:
/// - The output directory doesn't exist and can't be created
/// - The `OpenAPI` spec can't be serialized
/// - The file can't be written
///
/// # Example
///
/// ```rust,ignore
/// use my_plugin::api::OpenApiDoc;
///
/// let path = stately::codegen::generate_openapi::<OpenApiDoc>("../packages/my-plugin")?;
/// println!("Generated: {}", path.display());
/// ```
pub fn generate_openapi<T: utoipa::OpenApi>(output_dir: impl AsRef<Path>) -> io::Result<PathBuf> {
    generate_openapi_with_filename::<T>(output_dir, "openapi.json")
}

/// Generate an `OpenAPI` JSON spec with a custom filename.
///
/// The same as [`generate_openapi`], but allows specifying a custom filename.
///
/// # Errors
/// - Returns an error if the `OpenAPI` spec can't be serialized or the file can't be written.
///
/// # Example
///
/// ```rust,ignore
/// let path = stately::codegen::generate_openapi_with_filename::<OpenApiDoc>(
///     "../packages/my-plugin",
///     "my-plugin-openapi.json",
/// )?;
/// ```
pub fn generate_openapi_with_filename<T: utoipa::OpenApi>(
    output_dir: impl AsRef<Path>,
    filename: &str,
) -> io::Result<PathBuf> {
    let output_dir = output_dir.as_ref();

    // Create directory if it doesn't exist
    if !output_dir.exists() {
        std::fs::create_dir_all(output_dir)?;
    }

    let output_path = output_dir.join(filename);

    // Generate the spec
    let spec =
        T::openapi().to_pretty_json().map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?;

    // Write the file
    std::fs::write(&output_path, spec)?;

    // Return canonicalized path for nice output
    std::fs::canonicalize(&output_path).or(Ok(output_path))
}
