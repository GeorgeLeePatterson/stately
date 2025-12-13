# Stately Files

File upload, versioning, and download management for stately applications. This crate provides
HTTP endpoints and path types for managing files with automatic UUID-based versioning.

## Features

- **File Uploads** - Multipart form and JSON-based file uploads
- **Automatic Versioning** - UUID v7-based versioning prevents conflicts and enables history
- **File Downloads** - Streaming downloads with automatic content-type detection
- **Path Types** - Configuration property types for referencing managed and external files
- **Version Resolution** - Automatic latest-version resolution for uploaded files

## Storage Structure

Uploaded files are stored with automatic versioning:

```
data/
└── uploads/
    └── {filename}/
        └── __versions__/
            ├── 018f7d5c-xxxx-xxxx-xxxx-xxxxxxxxxxxx
            ├── 018f7d5d-xxxx-xxxx-xxxx-xxxxxxxxxxxx
            └── 018f7d5e-xxxx-xxxx-xxxx-xxxxxxxxxxxx  (latest)
```

UUID v7 identifiers are time-sortable, so the latest version is always the lexicographically
largest UUID in the directory.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/upload` | Upload file via multipart form |
| `POST` | `/save` | Save file content from JSON body |
| `GET` | `/list` | List files and directories |
| `GET` | `/file/cache/*path` | Download from cache directory |
| `GET` | `/file/data/*path` | Download from data directory |
| `GET` | `/file/upload/*path` | Download uploaded file (latest version) |

The `/file/upload/*path` endpoint accepts an optional `?version=<uuid>` query parameter
to retrieve a specific version instead of the latest.

## Usage

### Setting Up the Router

```rust,ignore
use axum::Router;
use stately_files::{api::FileState, router};

// FileState must be extractable from your app state
let app = Router::new()
    .nest("/files", router::router(app_state));
```

### Path Types for Entity Properties

Use the provided path types in your entity configurations:

```rust,ignore
use stately_files::path::{RelativePath, UserDefinedPath, VersionedPath};

// Reference an uploaded file (auto-resolves to latest version)
let config_path = RelativePath::Upload(VersionedPath::new("config.json"));

// Reference a file in the data directory
let data_path = RelativePath::Data("schemas/user.json".into());

// User-provided path (can be managed or external)
let user_path = UserDefinedPath::External("/etc/app/config.yaml".into());

// Resolve to absolute path
let resolved = config_path.get(None)?;
```

### Uploading Files

```rust,ignore
// Via multipart form
let form_data = multipart::Form::new()
    .file("file", "config.json");

// Via JSON body
let request = FileSaveRequest {
    content: "file contents".into(),
    name: Some("config.json".into()),
};
```

## Path Types

### `VersionedPath`

Wraps a logical filename that resolves to the latest UUID-versioned file:

```rust,ignore
let path = VersionedPath::new("config.json");
let resolved = path.resolve(&uploads_dir)?;  // → uploads/config.json/__versions__/{latest-uuid}
```

### `RelativePath`

Enum for paths relative to application directories:

- `Cache(String)` - Relative to cache directory
- `Data(String)` - Relative to data directory  
- `Upload(VersionedPath)` - Uploaded file with version resolution

### `UserDefinedPath`

Union type for managed or external paths:

- `Managed(RelativePath)` - App-managed with optional version resolution
- `External(String)` - User-provided filesystem path or URL

## Configuration

Default directories (configurable via `Dirs`):

- **Cache**: `.stately/cache/xeo4`
- **Data**: `.stately/share/xeo4`
- **Uploads**: `{data}/uploads`

## License

See the repository root for license information.
