# stately-files

File upload, versioning, and download management for stately applications.

## Overview

This crate provides HTTP endpoints and path types for managing files with automatic UUID-based versioning. It's designed to be mounted as an axum router and pairs with the [`@statelyjs/files`](../../packages/files/README.md) frontend plugin.

## Features

- **File Uploads** - Multipart form and JSON-based uploads with automatic versioning
- **File Downloads** - Streaming downloads with content-type detection
- **Path Types** - Configuration property types for referencing files in entities
- **Version Resolution** - Automatic latest-version resolution using UUID v7

## Install

Add to your `Cargo.toml`:

```toml
[dependencies]
stately-files = { path = "../stately-files" }
```

## Quick Start

```rust
use axum::Router;
use stately_files::{router, Dirs, FileState};

#[tokio::main]
async fn main() {
    // Configure directories
    let dirs = Dirs::new(
        "/app/cache".into(),
        "/app/data".into(),
    );
    dirs.ensure_exists().expect("Failed to create directories");

    // Create the files router
    let files_router = router::router(FileState::new(dirs));

    // Mount under /files
    let app = Router::new()
        .nest("/files", files_router);

    // Start server...
}
```

## Storage Structure

Uploaded files are stored with automatic versioning:

```
{data_dir}/
└── uploads/
    └── {filename}/
        └── __versions__/
            ├── 01234567-89ab-cdef-0123-456789abcdef
            ├── 01234567-89ab-cdef-0123-456789abcdf0
            └── 01234567-89ab-cdef-0123-456789abcdf1  (latest)
```

UUID v7 identifiers are time-sortable, so the latest version is always the lexicographically largest UUID in the directory.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/upload` | Upload via multipart form |
| `POST` | `/save` | Save content from JSON body |
| `GET` | `/list` | List files and directories |
| `GET` | `/file/cache/{path}` | Download from cache directory |
| `GET` | `/file/data/{path}` | Download from data directory |
| `GET` | `/file/upload/{path}` | Download uploaded file (with version resolution) |

### Upload

```bash
curl -X POST http://localhost:3000/files/upload \
  -F "file=@config.json"
```

Response:
```json
{
  "success": true,
  "path": "config.json",
  "uuid": "01234567-89ab-cdef-0123-456789abcdef",
  "full_path": "/app/data/uploads/config.json/__versions__/01234567-..."
}
```

### List Files

```bash
curl "http://localhost:3000/files/list?path=configs"
```

Response:
```json
{
  "files": [
    {
      "name": "settings.json",
      "size": 1024,
      "type": "versioned_file",
      "created": 1699900000,
      "modified": 1699950000,
      "versions": [
        { "uuid": "...", "size": 1024, "created": 1699950000 },
        { "uuid": "...", "size": 980, "created": 1699900000 }
      ]
    }
  ]
}
```

### Download

```bash
# Latest version
curl "http://localhost:3000/files/file/upload/config.json" -o config.json

# Specific version
curl "http://localhost:3000/files/file/upload/config.json?version=01234567-..." -o config.json
```

## Path Types

Use these types in your entity configurations to reference files:

### `VersionedPath`

Logical filename that resolves to the latest version:

```rust
use stately_files::VersionedPath;

let path = VersionedPath::new("config.json");
let resolved = path.resolve(&uploads_dir)?;
// -> /app/data/uploads/config.json/__versions__/{latest-uuid}
```

### `RelativePath`

Path relative to cache, data, or uploads directory:

```rust
use stately_files::RelativePath;

// Reference a cached file
let cache_path = RelativePath::Cache("temp/output.txt".into());

// Reference a data file
let data_path = RelativePath::Data("configs/default.json".into());

// Reference an uploaded file (with version resolution)
let upload_path = RelativePath::Upload(VersionedPath::new("user-config.json"));
```

### `UserDefinedPath`

Union of managed paths or external (user-provided) paths:

```rust
use stately_files::UserDefinedPath;

// Application-managed path
let managed = UserDefinedPath::Managed(RelativePath::Data("config.json".into()));

// User-provided external path
let external = UserDefinedPath::External("/usr/local/etc/app.conf".into());
```

## Configuration

### Default Directories

Default paths are relative to the current working directory:

- **Cache**: `.cache`
- **Data**: `.data`

### Custom Directories

Provide custom directories via `FileState`:

```rust
use stately_files::{Dirs, FileState};

let state = FileState::new(Dirs::new(
    "/var/cache/myapp".into(),
    "/var/lib/myapp".into(),
));
```

Or initialize globally before any handlers run:

```rust
use stately_files::Dirs;

Dirs::init(Dirs::new(
    "/var/cache/myapp".into(),
    "/var/lib/myapp".into(),
)).expect("Dirs already initialized");
```

## OpenAPI

Generate the OpenAPI spec for frontend codegen:

```bash
cargo run --bin generate-openapi -- ./packages/files/src/generated
```

This outputs `openapi.json` which is consumed by `@statelyjs/codegen` to generate TypeScript types.

## Module Structure

```
stately-files/
├── error.rs      # Error types with axum IntoResponse
├── handlers.rs   # HTTP handlers (upload, save, list, download)
├── openapi.rs    # OpenAPI documentation
├── path.rs       # Path types (VersionedPath, RelativePath, UserDefinedPath)
├── request.rs    # Request DTOs
├── response.rs   # Response DTOs
├── router.rs     # Axum router factory
├── settings.rs   # Directory configuration
├── state.rs      # FileState extractor
└── utils.rs      # Path sanitization, helpers
```

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](../../LICENSE) for details.
