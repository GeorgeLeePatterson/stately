//! Binary to generate `OpenAPI` spec for stately-arrow.
//!
//! Usage: `cargo run -p stately-arrow --bin generate-openapi -- <output_dir>`
#![allow(unused_crate_dependencies)]

use stately_arrow::api::openapi::OpenApiDoc;

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
