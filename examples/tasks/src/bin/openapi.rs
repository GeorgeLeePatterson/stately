#![expect(unused_crate_dependencies)] // Suppresses lints if pedantic lints are set
use tasks::api::EntityState;

fn main() {
    let output_dir = std::env::args().nth(1).unwrap_or_else(|| {
        eprintln!("Usage: generate-openapi <output_dir>");
        std::process::exit(1);
    });

    match stately::codegen::generate_openapi::<EntityState>(&output_dir) {
        Ok(path) => println!("OpenAPI spec written to {}", path.display()),
        Err(e) => {
            eprintln!("Failed to generate OpenAPI spec: {e}");
            std::process::exit(1);
        }
    }
}
