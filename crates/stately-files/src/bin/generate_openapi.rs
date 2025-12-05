//! Generate `OpenAPI` spec for stately-files.
//!
//! Run with: `cargo run --bin generate-openapi -- <output_dir>`
//!
//! This outputs `openapi.json` to the specified directory,
//! which can then be processed by `@stately/codegen` to generate TypeScript types.
#![allow(unused_crate_dependencies)]
use stately_files::api::OpenApiDoc;

fn main() {
    let output_dir = std::env::args().nth(1).unwrap_or_else(|| {
        eprintln!("Usage: generate-openapi <output_dir>");
        std::process::exit(1);
    });

    match stately::codegen::generate_openapi::<OpenApiDoc>(&output_dir) {
        Ok(path) => println!("OpenAPI spec written to {}", path.display()),
        Err(e) => {
            eprintln!("Failed to generate OpenAPI spec: {e}");
            std::process::exit(1);
        }
    }
}
