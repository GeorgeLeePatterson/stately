# Paginated Query Design: Scalable Arrow Data Exploration

> **Status**: Design Phase  
> **Last Updated**: 2024-12-14  
> **Authors**: George Patterson, Claude

## Problem Statement

Currently, `stately-arrow` streams entire query results to the client via Arrow IPC. While the UI uses virtual scrolling for efficient rendering, **all data is materialized in browser memory**. This works for datasets up to ~1M rows but fails catastrophically for larger datasets (100M+ rows).

**Goal**: Enable exploration of arbitrarily large datasets (billions of rows) with bounded memory usage on both client and server, while maintaining the smooth scrolling experience.

---

## Design Overview

### Core Concepts

1. **RecordBatch as the atomic unit**: All pagination, caching, and storage operates at the RecordBatch level
2. **Server-side spillover**: Results exceeding a threshold spill to storage (local or object store)
3. **Stateless server**: No cursor lifecycle management; storage handles its own cleanup
4. **Batch-indexed access**: Client requests batches by index, not row ranges
5. **Deterministic ordering**: User-provided ORDER BY enables consistent pagination

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                              CLIENT                                  │
├─────────────────────────────────────────────────────────────────────┤
│  1. Submits query (optionally with ORDER BY for large results)      │
│  2. Receives initial batches via streaming (up to threshold)        │
│  3. Receives metadata: { total_rows, batch_count, query_id }        │
│  4. Requests additional batches by index as user scrolls            │
│  5. Maintains bounded LRU cache of batches (windowed)               │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          STATELY-ARROW                               │
├─────────────────────────────────────────────────────────────────────┤
│  Query Execution:                                                    │
│    1. Execute query via DataFusion                                  │
│    2. Stream RecordBatches from execution                           │
│    3. If total rows ≤ threshold: stream all to client               │
│    4. If total rows > threshold: stream initial + spill remainder   │
│                                                                      │
│  Spillover Storage:                                                  │
│    - Write excess batches as Arrow IPC files                        │
│    - Storage path: {base_path}/queries/{query_id}/batch_{n}.arrow   │
│    - Automatic cleanup after 24 hours                               │
│                                                                      │
│  Batch Retrieval:                                                    │
│    - GET /query/{id}/batch/{n} → Arrow IPC for batch N              │
│    - Reads directly from spillover storage                          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         STORAGE LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│  Backends (via object_store crate):                                  │
│    - Local filesystem (development)                                  │
│    - S3 / GCS / Azure (production)                                  │
│                                                                      │
│  Cleanup:                                                            │
│    - Background task scans for queries older than 24 hours          │
│    - Deletes entire query directory                                 │
│    - Object store lifecycle rules can supplement/replace this       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Design

### 1. Query Request Enhancement

```rust
/// Enhanced query request supporting paginated mode
#[derive(Debug, Deserialize)]
pub struct QueryRequest {
    pub connector_id: Option<String>,
    pub sql: String,
    
    /// Enable paginated mode for large results
    /// When true, results spill to storage and client fetches batches on-demand
    #[serde(default)]
    pub paginated: bool,
    
    /// For paginated queries, specify ordering to ensure deterministic pagination
    /// Required when paginated=true for queries without explicit ORDER BY
    pub order_by: Option<Vec<OrderByColumn>>,
}

#[derive(Debug, Deserialize)]
pub struct OrderByColumn {
    pub column: String,
    #[serde(default)]
    pub descending: bool,
}
```

### 2. Query Response Types

```rust
/// Response for paginated queries
#[derive(Debug, Serialize)]
pub struct PaginatedQueryResponse {
    /// Unique identifier for this query result set
    pub query_id: String,
    
    /// Arrow schema (JSON-serialized for initial response)
    pub schema: Schema,
    
    /// Total number of rows (may be estimated for very large results)
    pub total_rows: u64,
    
    /// Number of batches available
    pub batch_count: usize,
    
    /// Rows per batch (consistent across all batches except possibly the last)
    pub batch_size: usize,
    
    /// Number of batches included in initial streaming response
    pub initial_batches: usize,
    
    /// When this query result expires (UTC timestamp)
    pub expires_at: DateTime<Utc>,
}

/// Metadata stored alongside spilled batches
#[derive(Debug, Serialize, Deserialize)]
pub struct QueryMetadata {
    pub query_id: String,
    pub schema: Schema,
    pub total_rows: u64,
    pub batch_count: usize,
    pub batch_size: usize,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub sql_hash: String,  // For potential cache reuse
}
```

### 3. Spillover Storage Interface

```rust
use object_store::{ObjectStore, path::Path};

/// Manages spillover storage for paginated query results
pub struct SpilloverStore {
    store: Arc<dyn ObjectStore>,
    base_path: Path,
    retention_hours: u64,  // Default: 24
}

impl SpilloverStore {
    /// Write a single batch to storage
    pub async fn write_batch(
        &self,
        query_id: &str,
        batch_index: usize,
        batch: &RecordBatch,
    ) -> Result<()> {
        let path = self.batch_path(query_id, batch_index);
        let bytes = serialize_batch_to_ipc(batch)?;
        self.store.put(&path, bytes.into()).await?;
        Ok(())
    }
    
    /// Read a single batch from storage
    pub async fn read_batch(
        &self,
        query_id: &str,
        batch_index: usize,
    ) -> Result<RecordBatch> {
        let path = self.batch_path(query_id, batch_index);
        let bytes = self.store.get(&path).await?.bytes().await?;
        deserialize_batch_from_ipc(&bytes)
    }
    
    /// Write query metadata
    pub async fn write_metadata(
        &self,
        metadata: &QueryMetadata,
    ) -> Result<()> {
        let path = self.metadata_path(&metadata.query_id);
        let json = serde_json::to_vec(metadata)?;
        self.store.put(&path, json.into()).await?;
        Ok(())
    }
    
    /// Read query metadata
    pub async fn read_metadata(
        &self,
        query_id: &str,
    ) -> Result<QueryMetadata> {
        let path = self.metadata_path(query_id);
        let bytes = self.store.get(&path).await?.bytes().await?;
        Ok(serde_json::from_slice(&bytes)?)
    }
    
    /// Delete all data for a query
    pub async fn delete_query(&self, query_id: &str) -> Result<()> {
        let prefix = self.query_path(query_id);
        let objects = self.store.list(Some(&prefix)).await?;
        for obj in objects {
            self.store.delete(&obj.location).await?;
        }
        Ok(())
    }
    
    /// Cleanup expired queries (called by background task)
    pub async fn cleanup_expired(&self) -> Result<CleanupStats> {
        let now = Utc::now();
        let mut deleted_queries = 0;
        let mut deleted_bytes = 0;
        
        // List all query directories
        let queries = self.list_queries().await?;
        
        for query_id in queries {
            if let Ok(metadata) = self.read_metadata(&query_id).await {
                if metadata.expires_at < now {
                    let size = self.query_size(&query_id).await.unwrap_or(0);
                    self.delete_query(&query_id).await?;
                    deleted_queries += 1;
                    deleted_bytes += size;
                }
            }
        }
        
        Ok(CleanupStats { deleted_queries, deleted_bytes })
    }
    
    // Path helpers
    fn query_path(&self, query_id: &str) -> Path {
        self.base_path.child("queries").child(query_id)
    }
    
    fn batch_path(&self, query_id: &str, batch_index: usize) -> Path {
        self.query_path(query_id).child(format!("batch_{:06}.arrow", batch_index))
    }
    
    fn metadata_path(&self, query_id: &str) -> Path {
        self.query_path(query_id).child("metadata.json")
    }
}
```

### 4. Query Execution Flow

```rust
/// Configuration for paginated query execution
pub struct PaginatedQueryConfig {
    /// Maximum rows to stream directly before spilling
    pub streaming_threshold: usize,  // Default: 100_000
    
    /// Target rows per batch
    pub batch_size: usize,  // Default: 65_536
    
    /// How long to retain spilled results
    pub retention_hours: u64,  // Default: 24
}

impl Default for PaginatedQueryConfig {
    fn default() -> Self {
        Self {
            streaming_threshold: 100_000,
            batch_size: 65_536,
            retention_hours: 24,
        }
    }
}

/// Execute a paginated query
pub async fn execute_paginated_query(
    context: &QueryContext,
    request: QueryRequest,
    config: &PaginatedQueryConfig,
    spillover: &SpilloverStore,
) -> Result<PaginatedQueryResult> {
    // Generate unique query ID
    let query_id = Uuid::new_v4().to_string();
    
    // Compose query with ORDER BY if provided
    let sql = if let Some(order_by) = &request.order_by {
        compose_ordered_query(&request.sql, order_by)?
    } else {
        request.sql.clone()
    };
    
    // Execute query
    let stream = context.execute_query(request.connector_id.as_deref(), &sql).await?;
    let schema = stream.schema().clone();
    
    // Collect batches, deciding whether to spill
    let mut all_batches = Vec::new();
    let mut total_rows = 0usize;
    let mut should_spill = false;
    
    pin_mut!(stream);
    while let Some(batch) = stream.next().await.transpose()? {
        total_rows += batch.num_rows();
        all_batches.push(batch);
        
        if total_rows > config.streaming_threshold && !should_spill {
            should_spill = true;
        }
    }
    
    let batch_count = all_batches.len();
    let expires_at = Utc::now() + Duration::hours(config.retention_hours as i64);
    
    if should_spill {
        // Spill all batches to storage
        let metadata = QueryMetadata {
            query_id: query_id.clone(),
            schema: schema.as_ref().clone(),
            total_rows: total_rows as u64,
            batch_count,
            batch_size: config.batch_size,
            created_at: Utc::now(),
            expires_at,
            sql_hash: hash_sql(&request.sql),
        };
        
        spillover.write_metadata(&metadata).await?;
        
        for (i, batch) in all_batches.iter().enumerate() {
            spillover.write_batch(&query_id, i, batch).await?;
        }
        
        // Determine how many initial batches to stream
        let initial_batch_count = (config.streaming_threshold / config.batch_size).max(1);
        let initial_batches: Vec<_> = all_batches.into_iter().take(initial_batch_count).collect();
        
        Ok(PaginatedQueryResult::Spilled {
            query_id,
            schema,
            total_rows: total_rows as u64,
            batch_count,
            initial_batches,
            expires_at,
        })
    } else {
        // Stream all batches directly, no spillover needed
        Ok(PaginatedQueryResult::Complete {
            schema,
            batches: all_batches,
        })
    }
}

pub enum PaginatedQueryResult {
    /// All results fit in memory, stream directly
    Complete {
        schema: SchemaRef,
        batches: Vec<RecordBatch>,
    },
    /// Results spilled to storage, stream initial + metadata
    Spilled {
        query_id: String,
        schema: SchemaRef,
        total_rows: u64,
        batch_count: usize,
        initial_batches: Vec<RecordBatch>,
        expires_at: DateTime<Utc>,
    },
}
```

### 5. API Endpoints

```rust
/// New endpoints for paginated queries
pub fn paginated_router<S>(state: S) -> Router<S> {
    Router::new()
        // Execute paginated query, returns metadata + initial batches
        .route("/query/paginated", post(execute_paginated))
        
        // Fetch specific batch by index
        .route("/query/:query_id/batch/:batch_index", get(get_batch))
        
        // Fetch batch range (optimization for prefetching)
        .route("/query/:query_id/batches", get(get_batch_range))
        
        // Get query metadata (useful for reconnecting)
        .route("/query/:query_id", get(get_query_metadata))
}

/// Handler: Execute paginated query
async fn execute_paginated(
    State(state): State<AppState>,
    Json(request): Json<QueryRequest>,
) -> Result<Response> {
    let result = execute_paginated_query(
        &state.query_context,
        request,
        &state.paginated_config,
        &state.spillover,
    ).await?;
    
    match result {
        PaginatedQueryResult::Complete { schema, batches } => {
            // Stream all batches as Arrow IPC (existing behavior)
            arrow_ipc_response(futures::stream::iter(batches.into_iter().map(Ok)))
        }
        PaginatedQueryResult::Spilled { 
            query_id, 
            schema, 
            total_rows, 
            batch_count, 
            initial_batches,
            expires_at,
        } => {
            // Return multipart response:
            // 1. JSON metadata
            // 2. Arrow IPC stream of initial batches
            paginated_response(
                PaginatedQueryResponse {
                    query_id,
                    schema: schema.as_ref().clone(),
                    total_rows,
                    batch_count,
                    batch_size: state.paginated_config.batch_size,
                    initial_batches: initial_batches.len(),
                    expires_at,
                },
                initial_batches,
            )
        }
    }
}

/// Handler: Get single batch
async fn get_batch(
    State(state): State<AppState>,
    Path((query_id, batch_index)): Path<(String, usize)>,
) -> Result<Response> {
    let batch = state.spillover.read_batch(&query_id, batch_index).await?;
    arrow_ipc_response(futures::stream::once(async { Ok(batch) }))
}

/// Handler: Get batch range
async fn get_batch_range(
    State(state): State<AppState>,
    Path(query_id): Path<String>,
    Query(params): Query<BatchRangeParams>,
) -> Result<Response> {
    let batches = futures::stream::iter(params.start..params.end)
        .then(|i| state.spillover.read_batch(&query_id, i))
        .try_collect::<Vec<_>>()
        .await?;
    
    arrow_ipc_response(futures::stream::iter(batches.into_iter().map(Ok)))
}

#[derive(Deserialize)]
struct BatchRangeParams {
    start: usize,
    end: usize,
}
```

### 6. Background Cleanup Task

```rust
/// Spawns background task for cleaning up expired queries
pub fn spawn_cleanup_task(
    spillover: Arc<SpilloverStore>,
    interval: Duration,  // Default: 1 hour
) -> JoinHandle<()> {
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(interval);
        
        loop {
            interval.tick().await;
            
            match spillover.cleanup_expired().await {
                Ok(stats) => {
                    if stats.deleted_queries > 0 {
                        tracing::info!(
                            "Cleaned up {} expired queries ({} bytes)",
                            stats.deleted_queries,
                            stats.deleted_bytes
                        );
                    }
                }
                Err(e) => {
                    tracing::error!("Cleanup task failed: {}", e);
                }
            }
        }
    })
}
```

---

## Client-Side Design

### Batch Window Store

```typescript
interface QueryMetadata {
  queryId: string;
  schema: Schema;
  totalRows: number;
  batchCount: number;
  batchSize: number;
  initialBatches: number;
  expiresAt: Date;
}

interface BatchWindowConfig {
  /** Maximum batches to keep in memory */
  maxCachedBatches: number;  // Default: 50
  
  /** Batches to prefetch ahead/behind viewport */
  prefetchBuffer: number;  // Default: 2
}

class BatchWindowStore {
  private metadata: QueryMetadata;
  private cache: Map<number, RecordBatch> = new Map();
  private accessOrder: number[] = [];
  private loading: Set<number> = new Set();
  private config: BatchWindowConfig;
  
  constructor(metadata: QueryMetadata, config: BatchWindowConfig) {
    this.metadata = metadata;
    this.config = config;
  }
  
  /** Called when viewport changes */
  async onViewportChange(startRow: number, endRow: number): Promise<void> {
    const startBatch = Math.floor(startRow / this.metadata.batchSize);
    const endBatch = Math.ceil(endRow / this.metadata.batchSize);
    
    // Include prefetch buffer
    const fetchStart = Math.max(0, startBatch - this.config.prefetchBuffer);
    const fetchEnd = Math.min(
      this.metadata.batchCount,
      endBatch + this.config.prefetchBuffer
    );
    
    // Fetch missing batches
    const toFetch: number[] = [];
    for (let i = fetchStart; i < fetchEnd; i++) {
      if (!this.cache.has(i) && !this.loading.has(i)) {
        toFetch.push(i);
      }
    }
    
    if (toFetch.length > 0) {
      await this.fetchBatches(toFetch);
    }
    
    // Evict distant batches if over limit
    this.evictIfNeeded(startBatch, endBatch);
  }
  
  /** Get value at specific row/column */
  getValue(rowIndex: number, columnIndex: number): unknown | undefined {
    const batchIndex = Math.floor(rowIndex / this.metadata.batchSize);
    const localRow = rowIndex % this.metadata.batchSize;
    
    const batch = this.cache.get(batchIndex);
    if (!batch) {
      return undefined;  // Render placeholder/skeleton
    }
    
    return batch.getChildAt(columnIndex)?.get(localRow);
  }
  
  /** Check if a row is loaded */
  isRowLoaded(rowIndex: number): boolean {
    const batchIndex = Math.floor(rowIndex / this.metadata.batchSize);
    return this.cache.has(batchIndex);
  }
  
  private async fetchBatches(indices: number[]): Promise<void> {
    indices.forEach(i => this.loading.add(i));
    
    try {
      // Batch fetch for efficiency
      const response = await fetch(
        `/query/${this.metadata.queryId}/batches?start=${Math.min(...indices)}&end=${Math.max(...indices) + 1}`
      );
      const reader = await RecordBatchReader.from(response);
      
      let currentIndex = Math.min(...indices);
      for await (const batch of reader) {
        this.cache.set(currentIndex, batch);
        this.accessOrder.push(currentIndex);
        this.loading.delete(currentIndex);
        currentIndex++;
      }
    } catch (error) {
      indices.forEach(i => this.loading.delete(i));
      throw error;
    }
  }
  
  private evictIfNeeded(viewportStart: number, viewportEnd: number): void {
    while (this.cache.size > this.config.maxCachedBatches) {
      // Find least recently used batch that's far from viewport
      const lru = this.accessOrder.find(
        i => i < viewportStart - this.config.prefetchBuffer * 2 ||
             i > viewportEnd + this.config.prefetchBuffer * 2
      );
      
      if (lru !== undefined) {
        this.cache.delete(lru);
        this.accessOrder = this.accessOrder.filter(i => i !== lru);
      } else {
        // All batches are near viewport, evict oldest anyway
        const oldest = this.accessOrder.shift();
        if (oldest !== undefined) {
          this.cache.delete(oldest);
        }
      }
    }
  }
}
```

### React Integration

```typescript
function usePaginatedQuery(sql: string, options?: PaginatedQueryOptions) {
  const [metadata, setMetadata] = useState<QueryMetadata | null>(null);
  const [store, setStore] = useState<BatchWindowStore | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'streaming' | 'ready'>('idle');
  
  const execute = useCallback(async () => {
    setStatus('loading');
    
    const response = await fetch('/query/paginated', {
      method: 'POST',
      body: JSON.stringify({
        sql,
        paginated: true,
        order_by: options?.orderBy,
      }),
    });
    
    // Parse multipart response: metadata + initial batches
    const { metadata, initialBatches } = await parsePaginatedResponse(response);
    
    setMetadata(metadata);
    
    const newStore = new BatchWindowStore(metadata, {
      maxCachedBatches: options?.maxCachedBatches ?? 50,
      prefetchBuffer: options?.prefetchBuffer ?? 2,
    });
    
    // Add initial batches to cache
    initialBatches.forEach((batch, i) => {
      newStore.addBatch(i, batch);
    });
    
    setStore(newStore);
    setStatus('ready');
  }, [sql, options]);
  
  return {
    metadata,
    store,
    status,
    execute,
  };
}
```

---

## UI Design: Paginated Mode

### Query Editor Enhancement

```
┌─────────────────────────────────────────────────────────────────────┐
│  Query Editor                                                        │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ SELECT * FROM events                                            ││
│  │ WHERE timestamp > '2024-01-01'                                  ││
│  │                                                                  ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  Mode: ○ Standard   ● Large Results (Paginated)                     │
│                                                                      │
│  ┌─ Ordering (required for large results) ─────────────────────────┐│
│  │                                                                  ││
│  │  Column 1: [ timestamp        ▼]  [ DESC ▼]  [+]                ││
│  │  Column 2: [ event_id         ▼]  [ ASC  ▼]  [-]                ││
│  │                                                                  ││
│  │  ⓘ Ordering ensures consistent pagination for large datasets   ││
│  └──────────────────────────────────────────────────────────────────┘│
│                                                                      │
│                                              [ Run Query ]           │
└─────────────────────────────────────────────────────────────────────┘
```

### Results Display

```
┌─────────────────────────────────────────────────────────────────────┐
│  Results: 1,234,567,890 rows (19,890 batches)                       │
│  Query ID: abc123  •  Expires: 23h 45m                              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───┬────────────────────┬─────────────────┬──────────────────────┐│
│  │ # │ timestamp          │ event_id        │ user_id              ││
│  ├───┼────────────────────┼─────────────────┼──────────────────────┤│
│  │ 1 │ 2024-01-15 08:00   │ evt_001         │ usr_abc              ││
│  │ 2 │ 2024-01-15 08:01   │ evt_002         │ usr_def              ││
│  │...│ (scrolling...)     │                 │                      ││
│  │ ░░│ ░░░░░░░░░░░░░░░░░░ │ ░░░░░░░░░░░░░░░ │ ░░░░░░░░░░░░░░░░░░░░ ││ ← Loading skeleton
│  │ ░░│ ░░░░░░░░░░░░░░░░░░ │ ░░░░░░░░░░░░░░░ │ ░░░░░░░░░░░░░░░░░░░░ ││
│  └───┴────────────────────┴─────────────────┴──────────────────────┘│
│                                                                      │
│  Viewing rows 500,000 - 500,050 of 1,234,567,890                    │
│  Batches cached: 12/50 • Memory: ~48MB                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Configuration

```rust
/// Configuration for the paginated query system
#[derive(Debug, Clone, Deserialize)]
pub struct PaginatedQuerySettings {
    /// Enable paginated query support
    #[serde(default = "default_enabled")]
    pub enabled: bool,
    
    /// Row threshold before spillover occurs
    #[serde(default = "default_streaming_threshold")]
    pub streaming_threshold: usize,  // 100_000
    
    /// Target rows per batch
    #[serde(default = "default_batch_size")]
    pub batch_size: usize,  // 65_536
    
    /// Hours to retain spilled results
    #[serde(default = "default_retention_hours")]
    pub retention_hours: u64,  // 24
    
    /// Cleanup interval in seconds
    #[serde(default = "default_cleanup_interval")]
    pub cleanup_interval_secs: u64,  // 3600 (1 hour)
    
    /// Storage backend configuration
    pub storage: SpilloverStorageConfig,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "type")]
pub enum SpilloverStorageConfig {
    /// Local filesystem storage
    Local {
        path: PathBuf,
    },
    /// S3-compatible storage
    S3 {
        bucket: String,
        prefix: Option<String>,
        region: Option<String>,
        endpoint: Option<String>,
    },
    /// Google Cloud Storage
    Gcs {
        bucket: String,
        prefix: Option<String>,
    },
    /// Azure Blob Storage
    Azure {
        container: String,
        prefix: Option<String>,
    },
}
```

---

## Implementation Phases

### Phase 1: Core Spillover Infrastructure
- [ ] Implement `SpilloverStore` with local filesystem backend
- [ ] Add `PaginatedQueryConfig` and settings
- [ ] Implement `execute_paginated_query` function
- [ ] Add `/query/paginated` endpoint
- [ ] Add `/query/:id/batch/:n` endpoint
- [ ] Implement background cleanup task

### Phase 2: Object Store Integration
- [ ] Extend `SpilloverStore` to use `object_store` crate
- [ ] Support S3, GCS, Azure backends via configuration
- [ ] Test with large datasets on object storage

### Phase 3: Client-Side Implementation
- [ ] Implement `BatchWindowStore` in TypeScript
- [ ] Create `usePaginatedQuery` hook
- [ ] Integrate with TanStack Virtual for viewport tracking
- [ ] Add skeleton/loading states for pending batches

### Phase 4: UI Enhancements
- [ ] Add "Large Results" mode toggle to query editor
- [ ] Add ORDER BY column picker UI
- [ ] Display pagination metadata (batch count, expiry, etc.)
- [ ] Show memory usage indicator

### Phase 5: Optimizations
- [ ] Batch range fetching (single request for multiple batches)
- [ ] Scroll velocity detection for adaptive prefetching
- [ ] Query result caching by SQL hash
- [ ] Compression for stored batches

---

## Open Questions

1. **Batch size tuning**: Should batch size be configurable per-query, or global?
   - Larger batches = fewer requests, more memory per batch
   - Smaller batches = more requests, finer-grained loading

2. **Partial batch support**: What if the client only needs specific columns?
   - Could project columns before storage (smaller files)
   - Or always store full batches and project on read

3. **Result sharing**: Should multiple users be able to share a query result?
   - Currently: each query gets unique ID
   - Alternative: hash-based deduplication

4. **Streaming vs. collect**: Current design collects all batches before deciding to spill
   - Alternative: Stream threshold based on batch count, spill as we go
   - Tradeoff: Can't know total_rows until complete

5. **Object store lifecycle rules**: Should we document recommended S3/GCS lifecycle policies?
   - Can supplement or replace background cleanup task
   - Zero-code cleanup if cloud-native

---

## References

- [Apache Arrow IPC Format](https://arrow.apache.org/docs/format/Columnar.html#ipc-file-format)
- [DataFusion DataFrame API](https://docs.rs/datafusion/latest/datafusion/dataframe/struct.DataFrame.html)
- [object_store crate](https://docs.rs/object_store/latest/object_store/)
- [TanStack Virtual](https://tanstack.com/virtual/latest)
