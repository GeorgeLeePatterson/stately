---
title: Stately Files Plugin Overview
description: File upload, versioning, and management with the Stately files plugin
---

# Stately Files Plugin

The files plugin provides comprehensive file management capabilities for Stately applications, including uploads, versioning, and path types for entity forms.

## Features

- **File Upload**: Multipart form and JSON-based uploads
- **Automatic Versioning**: UUID v7-based version tracking
- **Path Types**: Three path abstractions for entity fields
- **File Browser**: Navigate directories and manage files
- **Download Support**: Serve files with version selection

## Installation

### Backend

```toml
[dependencies]
stately-files = "0.4"
```

### Frontend

```bash
pnpm add @statelyjs/files
```

## Quick Start

### Backend Setup

```rust
use axum::extract::FromRef;
use stately_files::{router, FileState, Dirs};

use crate::state::ApiState;

// Configure directories
impl FromRef<ApiState> for FileState {
    fn from_ref(state: &ApiState) -> Self {
        let dirs = Dirs::new(
            state.config.cache_dir.clone(),
            state.config.data_dir.clone(),
        );
        FileState::new(dirs)
    }
}

// Add to router
pub fn app(state: ApiState) -> Router {
    Router::new()
        .nest("/files", router(state.clone()))
        .with_state(state)
}
```

### Frontend Setup

```typescript
import { statelyUi, statelyUiProvider, useStatelyUi } from '@statelyjs/stately';
import { type DefineConfig, type Schemas, stately } from '@statelyjs/stately/schema';
import { type FilesPlugin, type FilesUiPlugin, filesPlugin, filesUiPlugin } from '@statelyjs/files';

import openApiSpec from '../../openapi.json';
import { PARSED_SCHEMAS, type ParsedSchema } from '../generated/schemas';
import type { components, operations, paths } from '../generated/types';

// Define app schema with plugin extensions 
type AppSchemas = Schemas<
  DefineConfig<components, paths, operations, ParsedSchema>,
  readonly [FilesPlugin]
>;

const schema = stately<AppSchemas>(openApiSpec, PARSED_SCHEMAS)
  .withPlugin(filesPlugin());

const runtime = statelyUi<AppSchemas, readonly [FilesUiPlugin]>({ client, schema, core, options })
  .withPlugin(filesUiPlugin({ api: { pathPrefix: '/api/files' } }));
```


## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/upload` | Multipart file upload |
| POST | `/save` | JSON-based file save |
| GET | `/list` | List directory contents |
| GET | `/file/cache/{path}` | Download from cache |
| GET | `/file/data/{path}` | Download from data |
| GET | `/file/upload/{path}` | Download uploaded file |

## Path Types

The plugin defines three path types for use in entity fields:

### VersionedPath

A logical filename that resolves to the latest version:

```rust
pub struct VersionedPath(String);

// Resolves to: {uploads_dir}/{filename}/__versions__/{latest-uuid}
```

### RelativePath

Path relative to a managed directory:

```rust
pub enum RelativePath {
    Cache(String),       // Relative to cache directory
    Data(String),        // Relative to data directory
    Upload(VersionedPath), // Uploaded file with versioning
}
```

### UserDefinedPath

Union of managed and external paths:

```rust
pub enum UserDefinedPath {
    Managed(RelativePath),  // Application-managed
    External(String),       // User-provided path or URL
}
```

## Versioning

Files are automatically versioned using UUID v7:

```
uploads/
└── config.json/
    └── __versions__/
        ├── 01912345-6789-7abc-def0-123456789abc  # Older
        └── 01923456-789a-7bcd-ef01-23456789abcd  # Newer (latest)
```

UUID v7 is time-sortable, so the latest version is always the lexicographically largest.

## Frontend Components

### FileManager

Full-featured file management page:

```typescript
import { FileManager } from '@statelyjs/files/pages';

function FilesPage() {
  return <FileManager />;
}
```

### FileExplorer

Directory browser component:

```typescript
import { FileExplorer } from '@statelyjs/files/views';

function MyComponent() {
  return (
    <FileExplorer
      path="/uploads"
      onSelect={(file) => console.log('Selected:', file)}
    />
  );
}
```

### RelativePathEdit

Form field for selecting files:

```typescript
import { RelativePathEdit } from '@statelyjs/files/fields/edit';

// Included automatically when parsed schema contains RelativePath node. 
// No need to use directly unless you have a use case to.
```

## Hooks

```typescript
import {
  useFileExplore,
  useFileVersions,
  useUpload,
  useDownload,
} from '@statelyjs/files/hooks';

function MyComponent() {
  const { files, navigate, refresh } = useFileExplore('/uploads');
  const { versions } = useFileVersions('config.json');
  const { upload, isUploading } = useUpload();
  const { download } = useDownload();
  
  // ...
}
```

## Next Steps

- [Plugin Development](../../plugin-development/README.md) - Learn how to create your own plugins
- [Concepts: Plugins](../../concepts/plugins.md) - Understand plugin architecture
