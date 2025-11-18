// Auto-generated at build time from openapi.json
// DO NOT EDIT MANUALLY - run 'npm run generate-schemas' to regenerate

export interface paths {
  '/admin/cancel': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations['cancel'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/quit': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations['quit'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/shutdown': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations['shutdown'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/entity': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get?: never;
    /** Create a new entity */
    put: operations['create_entity'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/entity/list/{type}': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    /** List entity summaries */
    get: operations['list_entities'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/entity/{entry}/{id}': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get?: never;
    put?: never;
    post?: never;
    /** Remove an entity */
    delete: operations['remove_entity'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/entity/{id}': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    /** Get entity by ID and type */
    get: operations['get_entity_by_id'];
    put?: never;
    /** Update an existing entity (full replacement) */
    post: operations['update_entity'];
    delete?: never;
    options?: never;
    head?: never;
    /** Patch an existing entity (same as update) */
    patch: operations['patch_entity_by_id'];
    trace?: never;
  };
  '/api/v1/files/list': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    /**
     * List files and directories
     * @description Lists all files and directories in the specified path (or root data directory if no path
     *     specified). Returns both files and directories with a flag indicating which is which.
     *
     *     Versioned files are stored as: `{filename}/__versions__/{uuid}`
     *     The UI is responsible for aggregating versions for display.
     */
    get: operations['list'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/files/save': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get?: never;
    put?: never;
    /**
     * Save file content directly (without multipart upload)
     * @description This endpoint allows saving file content from a text input.
     */
    post: operations['save'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/files/upload': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get?: never;
    put?: never;
    /**
     * Upload a file to the data directory
     * @description Files are stored in a versioned structure:
     *     `data/uploads/{name}/{uuid}`
     *
     *     This allows automatic versioning without conflicts.
     */
    post: operations['upload'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/history': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations['get_history'];
    put?: never;
    post: operations['filter_history'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/history/pipeline/config': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get?: never;
    put?: never;
    post: operations['get_pipeline_config_by_filter'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/history/pipeline/config/{run_uid}': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations['get_pipeline_config'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/history/search/{needle}': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations['search_history'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/pipeline/dispatch': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get?: never;
    put?: never;
    post: operations['dispatch_pipeline'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/pipeline/dispatch/{id}': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations['dispatch_pipeline_by_id'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/pipeline/subscribe': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get?: never;
    put?: never;
    post: operations['event_stream'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/viewer/catalogs': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    /**
     * List all available connectors
     * @description # Errors
     *     - Internal server error
     */
    get: operations['list_catalogs'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/viewer/connectors': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    /**
     * List all available connectors
     * @description # Errors
     *     - Internal server error
     */
    get: operations['list_connectors'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/viewer/connectors/{connector_id}': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    /**
     * List files available in a connector's object store
     * @description # Errors
     *     - Connector not found
     *     - Internal server error
     */
    get: operations['stat'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/viewer/query': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get?: never;
    put?: never;
    /**
     * Execute a SQL query using URL tables
     * @description # Errors
     *     - Connector not found
     *     - Internal server error
     */
    post: operations['execute_query'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/viewer/register/{connector_id}': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    /**
     * Register a connector. Useful when federating queries since registration is lazy
     * @description # Errors
     *     - Connector not found
     *     - Internal server error
     */
    get: operations['register'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/health': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    get: operations['health'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    AppParallelism: {
      main?: number | null;
      /** Format: int32 */
      sink_workers?: number | null;
      /** Format: int32 */
      source_workers?: number | null;
      /** Format: int32 */
      writers: number;
    };
    /** @description Configuration options for moving between internal schema representations and arrow. */
    ArrowSchemaOptions: {
      /** @description Whether to represent [`crate::values::DataValue::String`] as binary or UTF8 */
      string_as_utf8?: boolean;
    };
    /** @description Configuration related to parsing streaming json */
    BufferSettings: {
      /**
       * Format: int32
       * @description Set the size of the arrow buffer before flushing
       */
      arrow_buffer_size?: number | null;
      /**
       * Format: int32
       * @description Set record flush threshold
       */
      buffer_size?: number | null;
      /**
       * @description Whether parsed nested data should flush rows when returning to the root of the
       *     data
       */
      flush_at_root?: boolean;
      /**
       * Format: int32
       * @description Set flush cache threshold
       */
      max_buffer_count?: number | null;
      /**
       * Format: int32
       * @description Set min flush cache threshold
       */
      min_buffer_count?: number | null;
    };
    /**
     * @description Capabilities a connector can expose to the viewer.
     * @enum {string}
     */
    Capability: 'execute_sql' | 'list';
    /**
     * @description The maximum key size of low cardinality values
     * @enum {string}
     */
    CardinalitySize: 'Int8' | 'Int16' | 'Int32';
    /** @description Wrapper around a [`StaticStr`] to ensure proper formatting */
    CatalogName: string;
    /**
     * @description Compression options for `ClickHouse` tables.
     * @enum {string}
     */
    ClickHouseCompression: 'none' | 'lz4' | 'zstd';
    /** @description Additional ClickHouse-specific configuration. */
    ClickHouseConfig: {
      compression?: null | components['schemas']['ClickHouseCompression'];
      settings?: { [key: string]: string };
    };
    /** @description Catalog schema options */
    CollectionConfig: {
      /** @description Additional fields to add to schema */
      additional?: components['schemas']['SchemaField_String'][];
      /** @description Filter fields for schema, pass a regex to be compiled statically */
      exclude?: string[];
      /** @description Provide field overrides (from automatic schema creation) */
      overrides?: components['schemas']['SchemaField_String'][];
      /** @description List of field names that are primary keys and thus will be forced non-nullable */
      primary_keys?: string[] | null;
    };
    /** @description Collection override configuration */
    CollectionConfigs: {
      /** @description Configuration per collection, modifying the schema of the collection */
      collections: { [key: string]: components['schemas']['CollectionConfig'] };
      name?: string;
    };
    /** @enum {string} */
    Comparator: 'and' | 'or';
    /** @description Compression formats supported by `async_compression` */
    CompressionSettings: {
      /** @default true */
      multiple_members: boolean;
    };
    /** @description Compression formats supported by `async_compression` */
    CompressionType:
      | {
          options: null | components['schemas']['CompressionSettings'];
          /** @enum {string} */
          type: 'gzip';
        }
      | {
          options: null | components['schemas']['CompressionSettings'];
          /** @enum {string} */
          type: 'brotli';
        }
      | {
          options: null | components['schemas']['CompressionSettings'];
          /** @enum {string} */
          type: 'zstd';
        }
      | {
          options: null | components['schemas']['CompressionSettings'];
          /** @enum {string} */
          type: 'deflate';
        }
      | {
          options: null | components['schemas']['CompressionSettings'];
          /** @enum {string} */
          type: 'xz';
        };
    /** @description Main configuration for a connection */
    Connection: {
      config?: components['schemas']['ConnectorType'];
      /** @description Human-readable name for this connection. */
      name?: string;
    };
    /** @description Capabilities a connector can expose to the viewer. */
    ConnectionKind: null | string;
    /** @description Static metadata describing a connector instance. */
    ConnectionMetadata: {
      /** @description A list of capabilities the connector supports. */
      capabilities: components['schemas']['Capability'][];
      /** @description The datafusion catalog the connector is registered in. */
      catalog?: string | null;
      id: string;
      /** @description The 'kind' of connector */
      kind: components['schemas']['ConnectionKind'];
      name: string;
    };
    /** @enum {string} */
    ConnectorDebugConfig: 'print' | 'blackhole';
    ConnectorType:
      | { debug: components['schemas']['ConnectorDebugConfig'] }
      | { object_store: components['schemas']['ObjectStoreConfiguration'] }
      | { database: components['schemas']['DatabaseConfig'] };
    /** @description Wrapper type for [`PrimitiveDataType`]s */
    DataType:
      | { Primitive: components['schemas']['PrimitiveDataType'] }
      | { Array: components['schemas']['PrimitiveDataType'] }
      | {
          Dictionary: {
            data_type: components['schemas']['PrimitiveDataType'];
            key_size: components['schemas']['CardinalitySize'];
          };
        }
      | { LowCardinality: components['schemas']['CardinalitySize'] };
    /** @description Supported databases for the default backend lineup. */
    Database: { click_house: null | components['schemas']['ClickHouseConfig'] };
    /** @description Configuration for database-backed connectors. */
    DatabaseConfig: {
      connection: components['schemas']['DatabaseConfiguration'];
      migration?: null | components['schemas']['DatabaseMigration'];
    };
    /** @description Configuration for database-backed connectors. */
    DatabaseConfiguration: {
      driver: components['schemas']['Database'];
      options: components['schemas']['DatabaseOptions'];
      pool?: components['schemas']['PoolOptions'];
    };
    /** @description Table migration overrides for `ClickHouse` connectors. */
    DatabaseMigration: {
      /** @description The default table engine to use if not specified for a particular table. */
      default_engine?: string | null;
      /** @description The types of tables created, keyed by table name. */
      engines?: { [key: string]: string } | null;
      /** @description Optionally provide order by if the underlying database supports it. */
      order_by?: { [key: string]: string[] } | null;
      settings?: { [key: string]: { [key: string]: string } } | null;
    };
    /** @description Common connection options shared by database connectors. */
    DatabaseOptions: {
      /**
       * @description Whether the connector should validate connections before use
       * @default false
       */
      check: boolean;
      /** @description Endpoint, url, or path to the database */
      endpoint: string;
      /** @description Optional password for the database */
      password?: string;
      tls?: null | components['schemas']['TlsOptions'];
      /** @description Username used to connect to the database */
      username: string;
    };
    /** @description Configuration hints and buffer settings for transport drivers */
    DriverOptions: {
      /** @description Configure the buffer size of the driver's underlying buffer if applicable */
      buffer_size?: number | null;
      /**
       * Format: int64
       * @description Configure the max size of the sources read
       */
      max_size?: number | null;
      /**
       * @description Identify whether the input is expected to be "large". This is subjective but can
       *     drive behavior in the driver. A driver can choose whether to behave
       *     differently if the expected input size is large, such as trying range requests
       *     in the case of the Http driver.
       */
      size_hint?: components['schemas']['SizeHint'];
    };
    /**
     * @description Configuration related to dynamic parsing of data. The "paths" defined represent nested levels of
     *     parent/child data.
     */
    DynamicConfig: {
      /** @description Human-readable name for this dynamic config. */
      name?: string;
      /** @description A key => value map of how and where in the file data is broken up into collections */
      paths: { [key: string]: components['schemas']['ParsePathsConfig'] };
      /** @description Configure the name of the collection that stores the file information itself. */
      root?: string | null;
    };
    EntitiesMap: {
      entities: { [key: string]: { [key: string]: components['schemas']['Entity'] } };
    };
    /** @description Response for full entity queries */
    EntitiesResponse: { entities: components['schemas']['EntitiesMap'] };
    Entity:
      | {
          data: components['schemas']['Pipeline'];
          /** @enum {string} */
          type: 'pipeline';
        }
      | {
          data: components['schemas']['SourceConfig'];
          /** @enum {string} */
          type: 'source_config';
        }
      | {
          data: components['schemas']['SinkConfig'];
          /** @enum {string} */
          type: 'sink_config';
        }
      | {
          data: components['schemas']['SourceDriverConfig'];
          /** @enum {string} */
          type: 'source_driver_config';
        }
      | {
          data: components['schemas']['InputConfig'];
          /** @enum {string} */
          type: 'input_config';
        }
      | {
          data: components['schemas']['MigrationConfig'];
          /** @enum {string} */
          type: 'migration_config';
        }
      | {
          data: components['schemas']['MigrationDriverConfig'];
          /** @enum {string} */
          type: 'migration_driver_config';
        }
      | {
          data: components['schemas']['Connection'];
          /** @enum {string} */
          type: 'connection';
        }
      | {
          data: components['schemas']['CollectionConfigs'];
          /** @enum {string} */
          type: 'collection_configs';
        }
      | {
          data: components['schemas']['ScriptConfig'];
          /** @enum {string} */
          type: 'script_config';
        }
      | {
          data: components['schemas']['OperationTask'];
          /** @enum {string} */
          type: 'operation_task';
        }
      | {
          data: components['schemas']['Predicates'];
          /** @enum {string} */
          type: 'predicates';
        }
      | {
          data: components['schemas']['DynamicConfig'];
          /** @enum {string} */
          type: 'dynamic_config';
        }
      | {
          data: components['schemas']['BufferSettings'];
          /** @enum {string} */
          type: 'buffer_settings';
        }
      | {
          data: components['schemas']['SchemaSettings'];
          /** @enum {string} */
          type: 'parse_schema_settings';
        }
      | {
          data: components['schemas']['SinkSettings'];
          /** @enum {string} */
          type: 'sink_settings';
        };
    /**
     * @description Entity identifier type - wraps String for flexibility with UUID v7 generation. Use the singleton ID '00000000-0000-0000-0000-000000000000' for singleton entities.
     * @example 00000000-0000-0000-0000-000000000000
     */
    EntityId: string;
    FieldPredicate: {
      /** @description Compare "and" or "or" */
      comparator?: components['schemas']['Comparator'];
      /** @description The value comparision operators */
      operators: components['schemas']['OperatorCompareDef'][];
    };
    /** @description File access configuration for File transports */
    FileConfiguration: {
      /** @description Configure the base path where files are referenced from */
      base_path?: string | null;
      /** @description Cleanup any files read from the filesystem */
      cleanup?: boolean;
    };
    /** @enum {string} */
    FileEntryType: 'directory' | 'file' | 'versioned_file';
    FileInfo: {
      /**
       * Format: int64
       * @description Creation timestamp (Unix epoch seconds) - oldest version for versioned files
       */
      created?: number | null;
      /**
       * Format: int64
       * @description Last modified timestamp (Unix epoch seconds) - newest version for versioned files
       */
      modified?: number | null;
      /** @description File name (relative path from target directory) */
      name: string;
      /**
       * Format: int64
       * @description File size in bytes
       */
      size: number;
      /** @description Entry type: `directory`, `file`, or `versioned_file` */
      type: components['schemas']['FileEntryType'];
      /** @description List of all versions (only populated for versioned files) */
      versions?: components['schemas']['FileVersion'][] | null;
    };
    FileListQuery: {
      /** @description Optional path to list files from (relative to data directory) */
      path?: string | null;
    };
    FileListResponse: {
      /** @description List of files */
      files: components['schemas']['FileInfo'][];
    };
    FileSaveRequest: {
      /** @description File content as string */
      content: string;
      /** @description Optional filename */
      name?: string | null;
    };
    FileUploadResponse: {
      /** @description Full absolute path on the server */
      full_path: string;
      /** @description Relative path from data directory (e.g., "uploads/config.json") */
      path: string;
      /** @description Whether the operation was successful */
      success: boolean;
      /** @description The UUID version identifier */
      uuid: string;
    };
    FileVersion: {
      /**
       * Format: int64
       * @description Creation timestamp (Unix epoch seconds)
       */
      created?: number | null;
      /**
       * Format: int64
       * @description Size of this specific version in bytes
       */
      size: number;
      /** @description UUID identifier for this version */
      uuid: string;
    };
    /** @description Query parameters for getting a single entity by ID and type */
    GetEntityResponse: {
      entity: components['schemas']['Entity'];
      id: components['schemas']['EntityId'];
    };
    HealthStatus: {
      parallelism: components['schemas']['AppParallelism'];
      status: string;
      /** Format: int64 */
      uptime: number;
      version: string;
    };
    History: {
      /** Format: int64 */
      completed_at?: number | null;
      error?: string | null;
      pipeline_name: string;
      /** Format: int64 */
      process_uid: number;
      /** Format: int64 */
      run_uid: number;
      sink_metrics: components['schemas']['Metrics'];
      sink_status: components['schemas']['SinkStage'];
      source_metrics: components['schemas']['Metrics'];
      source_status: components['schemas']['SourceStage'];
      /** Format: int64 */
      started_at: number;
      status: components['schemas']['PipelineStage'];
    };
    HistoryFilter:
      | {
          /** @enum {string} */
          filter: 'ByProcessUid';
          value: components['schemas']['u64'];
        }
      | {
          /** @enum {string} */
          filter: 'ByName';
          value: string;
        }
      | {
          /** @enum {string} */
          filter: 'ByRunUid';
          value: components['schemas']['u64'];
        };
    Http2Options: {
      disable_adaptive_window?: boolean;
      /** Format: int32 */
      initial_connection_window_size?: number | null;
      /** Format: int32 */
      initial_stream_window_size?: number | null;
      /** Format: int32 */
      max_frame_size?: number | null;
    };
    /** @description Request configuration for HTTP transports */
    HttpConfiguration: {
      /** @description Include any additional headers in the requests */
      headers?: { [key: string]: string } | null;
      range_options?: null | components['schemas']['RangeOptions'];
      /** @description Common request configuration */
      request?: components['schemas']['RequestConfig'];
    };
    /** @enum {string} */
    Ignore: 'children' | 'collection';
    /** @description The type of input that will provide source locations for Source drivers. */
    InputConfig: {
      /** @description The type of the input driver */
      config?: components['schemas']['InputType'];
      /** @description Human-readable name for this input. */
      name?: string;
    };
    /** @description Configuration for an input driver. */
    InputType:
      | {
          /** @description Read the source locations from a database. */
          database: {
            catalog?: string;
            connector: components['schemas']['LinkConnection_Connection'];
            database?: string | null;
            schema?: string | null;
            sql: string;
          };
        }
      | {
          /** @description Run a shell command or script to generate source locations. */
          shell: components['schemas']['ShellConfig'];
        }
      | {
          /** @description Provide a static list of source locations. */
          list: string[];
        }
      | 'empty';
    KeepAliveOptions: {
      /** Format: int64 */
      keep_alive?: number | null;
      /** Format: int64 */
      keep_alive_interval?: number | null;
      /** Format: int64 */
      keep_alive_timeout?: number | null;
      keep_alive_while_idle?: boolean | null;
    };
    Level: string;
    /** @enum {string} */
    LineDelim: 'new_line' | 'space' | 'comma' | 'tab' | 'pipe';
    /** @description Reference configuration either by ID or inline, with entity type metadata */
    LinkCollectionConfigs:
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'collection_configs';
          /** @description Reference to an entity by ID */
          ref: string;
        }
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'collection_configs';
          inline: components['schemas']['CollectionConfigs'];
        };
    /** @description Reference configuration either by ID or inline, with entity type metadata */
    LinkCollectionConfigs_CollectionConfigs:
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'collection_configs';
          /** @description Reference to an entity by ID */
          ref: string;
        }
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'collection_configs';
          inline: components['schemas']['CollectionConfigs'];
        };
    /** @description Reference configuration either by ID or inline, with entity type metadata */
    LinkConnection:
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'connection';
          /** @description Reference to an entity by ID */
          ref: string;
        }
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'connection';
          inline: components['schemas']['Connection'];
        };
    /** @description Reference configuration either by ID or inline, with entity type metadata */
    LinkConnection_Connection:
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'connection';
          /** @description Reference to an entity by ID */
          ref: string;
        }
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'connection';
          inline: components['schemas']['Connection'];
        };
    /** @description Reference configuration either by ID or inline, with entity type metadata */
    LinkDynamicConfig:
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'dynamic_config';
          /** @description Reference to an entity by ID */
          ref: string;
        }
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'dynamic_config';
          inline: components['schemas']['DynamicConfig'];
        };
    /** @description Reference configuration either by ID or inline, with entity type metadata */
    LinkDynamicConfig_DynamicConfig:
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'dynamic_config';
          /** @description Reference to an entity by ID */
          ref: string;
        }
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'dynamic_config';
          inline: components['schemas']['DynamicConfig'];
        };
    /** @description Reference configuration either by ID or inline, with entity type metadata */
    LinkInputConfig:
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'input_config';
          /** @description Reference to an entity by ID */
          ref: string;
        }
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'input_config';
          inline: components['schemas']['InputConfig'];
        };
    /** @description Reference configuration either by ID or inline, with entity type metadata */
    LinkInputConfig_InputConfig:
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'input_config';
          /** @description Reference to an entity by ID */
          ref: string;
        }
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'input_config';
          inline: components['schemas']['InputConfig'];
        };
    /** @description Reference configuration either by ID or inline, with entity type metadata */
    LinkMigrationConfig:
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'migration_config';
          /** @description Reference to an entity by ID */
          ref: string;
        }
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'migration_config';
          inline: components['schemas']['MigrationConfig'];
        };
    /** @description Reference configuration either by ID or inline, with entity type metadata */
    LinkMigrationConfig_MigrationConfig:
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'migration_config';
          /** @description Reference to an entity by ID */
          ref: string;
        }
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'migration_config';
          inline: components['schemas']['MigrationConfig'];
        };
    /** @description Reference configuration either by ID or inline, with entity type metadata */
    LinkMigrationDriverConfig:
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'migration_driver_config';
          /** @description Reference to an entity by ID */
          ref: string;
        }
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'migration_driver_config';
          inline: components['schemas']['MigrationDriverConfig'];
        };
    /** @description Reference configuration either by ID or inline, with entity type metadata */
    LinkMigrationDriverConfig_MigrationDriverConfig:
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'migration_driver_config';
          /** @description Reference to an entity by ID */
          ref: string;
        }
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'migration_driver_config';
          inline: components['schemas']['MigrationDriverConfig'];
        };
    /** @description Reference configuration either by ID or inline, with entity type metadata */
    LinkOperationTask:
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'operation_task';
          /** @description Reference to an entity by ID */
          ref: string;
        }
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'operation_task';
          inline: components['schemas']['OperationTask'];
        };
    /** @description Reference configuration either by ID or inline, with entity type metadata */
    LinkOperationTask_OperationTask:
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'operation_task';
          /** @description Reference to an entity by ID */
          ref: string;
        }
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'operation_task';
          inline: components['schemas']['OperationTask'];
        };
    /** @description Reference configuration either by ID or inline, with entity type metadata */
    LinkPipeline:
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'pipeline';
          /** @description Reference to an entity by ID */
          ref: string;
        }
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'pipeline';
          inline: components['schemas']['Pipeline'];
        };
    /** @description Reference configuration either by ID or inline, with entity type metadata */
    LinkPredicates:
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'predicates';
          /** @description Reference to an entity by ID */
          ref: string;
        }
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'predicates';
          inline: components['schemas']['Predicates'];
        };
    /** @description Reference configuration either by ID or inline, with entity type metadata */
    LinkPredicates_Predicates:
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'predicates';
          /** @description Reference to an entity by ID */
          ref: string;
        }
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'predicates';
          inline: components['schemas']['Predicates'];
        };
    /** @description Reference configuration either by ID or inline, with entity type metadata */
    LinkScriptConfig:
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'script_config';
          /** @description Reference to an entity by ID */
          ref: string;
        }
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'script_config';
          inline: components['schemas']['ScriptConfig'];
        };
    /** @description Reference configuration either by ID or inline, with entity type metadata */
    LinkScriptConfig_ScriptConfig:
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'script_config';
          /** @description Reference to an entity by ID */
          ref: string;
        }
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'script_config';
          inline: components['schemas']['ScriptConfig'];
        };
    /** @description Reference configuration either by ID or inline, with entity type metadata */
    LinkSinkConfig:
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'sink_config';
          /** @description Reference to an entity by ID */
          ref: string;
        }
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'sink_config';
          inline: components['schemas']['SinkConfig'];
        };
    /** @description Reference configuration either by ID or inline, with entity type metadata */
    LinkSinkConfig_SinkConfig:
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'sink_config';
          /** @description Reference to an entity by ID */
          ref: string;
        }
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'sink_config';
          inline: components['schemas']['SinkConfig'];
        };
    /** @description Reference configuration either by ID or inline, with entity type metadata */
    LinkSourceConfig:
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'source_config';
          /** @description Reference to an entity by ID */
          ref: string;
        }
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'source_config';
          inline: components['schemas']['SourceConfig'];
        };
    /** @description Reference configuration either by ID or inline, with entity type metadata */
    LinkSourceConfig_SourceConfig:
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'source_config';
          /** @description Reference to an entity by ID */
          ref: string;
        }
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'source_config';
          inline: components['schemas']['SourceConfig'];
        };
    /** @description Reference configuration either by ID or inline, with entity type metadata */
    LinkSourceDriverConfig:
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'source_driver_config';
          /** @description Reference to an entity by ID */
          ref: string;
        }
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'source_driver_config';
          inline: components['schemas']['SourceDriverConfig'];
        };
    /** @description Reference configuration either by ID or inline, with entity type metadata */
    LinkSourceDriverConfig_SourceDriverConfig:
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'source_driver_config';
          /** @description Reference to an entity by ID */
          ref: string;
        }
      | {
          /**
           * @description The entity type this Link references
           * @enum {string}
           */
          entity_type: 'source_driver_config';
          inline: components['schemas']['SourceDriverConfig'];
        };
    /** @description Response for entity summary list queries */
    ListResponse: {
      /**
       * @example {
       *       "pipeline": [
       *         {
       *           "description": "Example pipeline",
       *           "id": "my-pipeline",
       *           "name": "My Pipeline"
       *         }
       *       ],
       *       "source": [
       *         {
       *           "description": "Example source",
       *           "id": "my-source",
       *           "name": "My Source"
       *         }
       *       ]
       *     }
       */
      entities: { [key: string]: components['schemas']['Summary'][] };
    };
    /** @description Summaries provided by listing */
    ListSummary:
      | {
          summary: string[];
          /** @enum {string} */
          type: 'databases';
        }
      | {
          summary: components['schemas']['TableSummary'][];
          /** @enum {string} */
          type: 'files';
        }
      | {
          summary: components['schemas']['TableSummary'][];
          /** @enum {string} */
          type: 'tables';
        };
    /** @description Common metrics captured during streaming */
    Metrics: { batches: number; bytes: number; rows: number };
    /** @description Configuration for source migrations during streaming */
    MigrationConfig: {
      /** @description Arrow schema configuration */
      arrow?: components['schemas']['ArrowSchemaOptions'];
      /** @description Optional input for migration sources */
      input: components['schemas']['LinkInputConfig_InputConfig'];
      /** @description Human-readable name for this migration. */
      name?: string;
      /** @description A key referring to a source configuration or the source configuration inline. */
      source: components['schemas']['LinkMigrationDriverConfig_MigrationDriverConfig'];
    };
    /** @description Configuration for migration drivers, which read data to generate a schema for the source */
    MigrationDriverConfig: {
      /** @description The type of the migration driver */
      config: components['schemas']['MigrationSource'];
      /** @description Human-readable name for this migration driver. */
      name?: string;
    };
    /** @description Special type of schema source where a file is deserialized into an arrow schema */
    MigrationSource:
      | {
          /**
           * @description Local files, one per table.
           *
           *     NOTE: If the schema is in a single file as "example" data, use `MigrationSource::Json`. This
           *     assumes a DESERIALIZABLE set of arrow schemas.
           */
          files: { tables: { [key: string]: string } };
        }
      | {
          /** @description Remote or local file containing full serialized arrow schema */
          file: components['schemas']['TransportType'];
        }
      | {
          /** @description Http or File containing json data to parse */
          json: {
            dynamic?: null | components['schemas']['LinkDynamicConfig_DynamicConfig'];
            /** @description If true, no stored schemas will be used, parsing will be forced */
            force_parse?: boolean;
            options: components['schemas']['TransportOptions'];
          };
        }
      | {
          /** @description Fetch the schema from a database */
          database: {
            connector: components['schemas']['LinkConnection_Connection'];
            database?: string;
            schema?: string | null;
            tables?: string[];
          };
        }
      | {
          /** @description Fetch a schema stored in state. NOTE: Not currently supported. */
          state: { catalog: string; tables: string[] };
        };
    /** @description Supported object store providers. */
    ObjectStore:
      | { aws: components['schemas']['ObjectStoreConfig'] }
      | { gcp: components['schemas']['ObjectStoreConfig'] }
      | { azure: components['schemas']['ObjectStoreConfig'] }
      | { local: components['schemas']['ObjectStoreConfig'] };
    /** @description Provider-agnostic object store settings. */
    ObjectStoreConfig: {
      /** @description *Required* bucket name (or base directory for local stores). */
      bucket: string;
      /** @description Whether credentials should be resolved from environment variables. */
      from_env?: boolean;
      /** @description Additional provider-specific configuration parameters. */
      options?: { [key: string]: string };
    };
    /** @description Configuration for an object store-backed connector. */
    ObjectStoreConfiguration: {
      /** @description The format to read/write within the store. */
      format?: components['schemas']['ObjectStoreFormat'];
      /** @description Provider specific configuration for the store itself. */
      store?: components['schemas']['ObjectStore'];
    };
    /** @description Supported file formats for object-store connectors. */
    ObjectStoreFormat: {
      /** @description Apache Parquet format with optional key/value overrides. */
      parquet: { [key: string]: string } | null;
    };
    /** @description Standard operation response with ID and optional message */
    OperationResponse: {
      /** Format: uuid */
      id: string;
      message: string;
    };
    /** @description Operation task */
    OperationTask: {
      /** @description Human-readable name for this operation. */
      name?: string;
      once?: boolean;
      tasks?: string[];
    };
    OperatorCompareDef: components['schemas']['ParseValue'] & {
      not?: boolean;
      op: components['schemas']['OperatorDef'];
    };
    /**
     * @description Internal representation of an [`Operator`]. Used for deserialization and thus is the
     *     format used in configuration. Follow this to see the format used in configuration.
     * @enum {string}
     */
    OperatorDef: 'regex' | 'eq' | 'lt' | 'gt' | 'in' | 'contains' | 'null' | 'bool';
    /**
     * @description `ParsePaths` represent parent/child relationships in data.
     *
     *     Configuration for parsing paths in data.
     * @example {
     *       "identifier": [
     *         "provider_references"
     *       ],
     *       "paths": [
     *         "provider_references",
     *         "provider_references.provider_groups",
     *         "in_network",
     *         "in_network.negotiated_rates",
     *         "in_network.negotiated_rates.negotiated_prices"
     *       ]
     *     }
     */
    ParsePathsConfig: {
      /**
       * @description The path that identifies this *variant* of a schema. When present, this configuration is
       *     identified as the configuration being used for the parsing.
       */
      identifier?: string[];
      /**
       * @description Paths accounting for each "table" the nested data represents, use dot syntax to specify the
       *     nesting path.
       */
      paths?: string[];
    };
    /** @description Represents values for various parsing configuration */
    ParseValue:
      | {
          /** @enum {string} */
          type: 'Int8';
          /** Format: int32 */
          value: number;
        }
      | {
          /** @enum {string} */
          type: 'Int16';
          /** Format: int32 */
          value: number;
        }
      | {
          /** @enum {string} */
          type: 'Int32';
          /** Format: int32 */
          value: number;
        }
      | {
          /** @enum {string} */
          type: 'Int64';
          /** Format: int64 */
          value: number;
        }
      | {
          /** @enum {string} */
          type: 'Float32';
          /** Format: float */
          value: number;
        }
      | {
          /** @enum {string} */
          type: 'Float64';
          /** Format: double */
          value: number;
        }
      | {
          /** @enum {string} */
          type: 'UInt8';
          /** Format: int32 */
          value: number;
        }
      | {
          /** @enum {string} */
          type: 'UInt16';
          /** Format: int32 */
          value: number;
        }
      | {
          /** @enum {string} */
          type: 'UInt32';
          /** Format: int32 */
          value: number;
        }
      | {
          /** @enum {string} */
          type: 'UInt64';
          /** Format: int64 */
          value: number;
        }
      | {
          /** @enum {string} */
          type: 'Null';
          value: components['schemas']['DataType'];
        }
      | {
          /** @enum {string} */
          type: 'Bool';
          value: boolean;
        }
      | {
          /** @enum {string} */
          type: 'String';
          value: string;
        }
      | {
          /** @enum {string} */
          type: 'Array';
          value: components['schemas']['ParseValue'][];
        };
    Pipeline: {
      /** @description Human-readable name for this pipeline. */
      name?: string;
      script?: null | components['schemas']['LinkScriptConfig_ScriptConfig'];
      /** @description The sink configuration for the pipeline. */
      sink: components['schemas']['LinkSinkConfig_SinkConfig'];
      /** @description The source configuration for the pipeline. */
      source: components['schemas']['LinkSourceConfig_SourceConfig'];
    };
    PipelineConfig: { config: components['schemas']['Pipeline']; name: string };
    PipelineConfigResponse: {
      data?: null | components['schemas']['PipelineConfig'];
      success: boolean;
    };
    /** @description Pipeline metrics with separated event channels for UI consumption */
    PipelineMetrics: {
      event: components['schemas']['PipelineMetricsEvent'];
      history: components['schemas']['History'];
      process_uid: components['schemas']['u64'];
    };
    PipelineMetricsEvent:
      | {
          event: components['schemas']['PipelineStage'];
          /** @enum {string} */
          type: 'pipeline';
        }
      | {
          event: components['schemas']['SourceStage'];
          /** @enum {string} */
          type: 'source';
        }
      | {
          event: components['schemas']['SinkStage'];
          /** @enum {string} */
          type: 'sink';
        };
    /** @description Standard API response */
    PipelineResponse: { message: string; success: boolean };
    /** @enum {string} */
    PipelineStage: 'started' | 'finished' | 'running' | 'error' | 'cancelled';
    /** @description Common configuration options shared across connector types. */
    PoolOptions: {
      /** Format: int32 */
      connect_timeout?: number | null;
      /**
       * Format: int32
       * @description Configure the maximum number of connections to the database. Note, not all connectors
       *     support pools.
       */
      pool_size?: number | null;
      /** Format: int32 */
      transaction_timeout?: number | null;
    };
    Predicate: {
      /** @description Compare "and" or "or" */
      comparator?: components['schemas']['Comparator'];
      /**
       * @description The operator to apply
       *
       *     This guarantees the each operator is applied to a unique field
       */
      filters?: { [key: string]: components['schemas']['FieldPredicate'] };
      /** @description Whether to ignore children in addition to the collection or just collection */
      ignore?: components['schemas']['Ignore'];
    };
    Predicates: {
      /** @description Human-readable name for this filter. */
      name?: string;
      predicates?: { [key: string]: components['schemas']['Predicate'] };
    };
    /** @enum {string} */
    PrimitiveDataType:
      | 'Bool'
      | 'String'
      | 'Timestamp'
      | 'Date'
      | 'Object'
      | 'UInt8'
      | 'UInt16'
      | 'UInt32'
      | 'UInt64'
      | 'Int8'
      | 'Int16'
      | 'Int32'
      | 'Int64'
      | 'Float32'
      | 'Float64';
    /** @description Request to execute a SQL query */
    QueryRequest: {
      /** @description ID of the connector to use */
      connector_id?: string | null;
      /** @description SQL query to execute (can use URL tables like `s3://bucket/path/*.parquet`) */
      sql: string;
    };
    RangeOptions: {
      /** Format: int64 */
      chunk_size?: number;
      /** Format: int32 */
      initial_retry_delay?: number;
      validate_etag?: boolean;
    };
    /**
     * @description Path relative to an app directory (upload, data, config, or cache).
     *
     *     Use this type in configuration structs when you need paths relative to
     *     app directories with optional version resolution for uploaded files.
     *
     *     For paths that are just strings (e.g., user-provided absolute paths or
     *     URLs), use `String` or `PathBuf` directly instead.
     */
    RelativePath:
      | {
          /** @enum {string} */
          dir: 'cache';
          /** @description Path relative to the cache directory */
          path: string;
        }
      | {
          /** @enum {string} */
          dir: 'data';
          /** @description Path relative to the data directory (non-versioned files) */
          path: string;
        }
      | {
          /** @enum {string} */
          dir: 'upload';
          /** @description Path to uploaded file with version resolution support (in uploads/ directory) */
          path: components['schemas']['VersionedPath'];
        }
      | {
          /** @enum {string} */
          dir: 'config';
          /** @description Path relative to the config directory */
          path: string;
        };
    /** @enum {string} */
    RequestCompression: 'none' | 'gzip' | 'brotli';
    RequestConfig: {
      /** @description Compression options */
      compression?: components['schemas']['RequestCompression'];
      /** Format: int64 */
      connect_timeout?: number | null;
      /** @description HTTP2 options */
      http2?: components['schemas']['Http2Options'];
      /** @description Keep alive */
      keep_alive?: components['schemas']['KeepAliveOptions'];
      /** Format: int64 */
      pool_idle_timeout?: number | null;
      pool_max_idle_per_host?: number | null;
      /** Format: int64 */
      read_timeout?: number | null;
      /** Format: int64 */
      timeout?: number | null;
      /** @description TLS options */
      tls?: components['schemas']['TlsOptions'];
    };
    /** @description Load schema configuration and overrides for the migration phase. */
    SchemaConfig: {
      /** @description Source Catalog */
      catalog: string;
      /** @description Which schema configurations to load */
      load: components['schemas']['LinkCollectionConfigs_CollectionConfigs'][];
    };
    /** @description (Column name, [`FieldKey`], [`datatypes::DataType`]) */
    SchemaField: {
      data_type?: components['schemas']['DataType'];
      frozen?: boolean;
      inner_nullable?: boolean;
      name: string;
      nullable?: boolean;
      system?: boolean;
    };
    /** @description (Column name, [`FieldKey`], [`datatypes::DataType`]) */
    SchemaField_String: {
      data_type?: components['schemas']['DataType'];
      frozen?: boolean;
      inner_nullable?: boolean;
      name: string;
      nullable?: boolean;
      system?: boolean;
    };
    /**
     * @deprecated
     * @description Parse Schema settings
     */
    SchemaSettings: {
      /** @description Whether to ignore any saved schemas */
      ignore_saved_schemas?: boolean;
      /** @description Where to store generated serialized schemas */
      save_location?: string | null;
      /** @description Prefix the stored schema */
      schema_file_prefix?: string | null;
    };
    ScriptConfig: {
      name?: string;
      /** @description Variables to be interpolated in various places */
      variables?: { [key: string]: string };
    };
    /**
     * @description Newtype to protect secrets from being logged
     *     A wrapper type for sensitive string data like passwords.
     *
     *     This type provides protection against accidental exposure of sensitive data
     *     in logs, debug output, or error messages. The inner value is not displayed
     *     in `Debug` implementations.
     *
     *     # Example
     *     ```
     *     use clickhouse_arrow::prelude::Secret;
     *
     *     let password = Secret::new("my_password");
     *     println!("{:?}", password); // Prints: Secret(*******)
     *     ```
     */
    Secret: string;
    /**
     * @description Session capabilities a `QuerySession` can expose to the `QueryContext`.
     * @enum {string}
     */
    SessionCapability: 'execute_without_connector';
    ShellConfig: {
      current_dir?: string | null;
      delim?: components['schemas']['LineDelim'];
      env?: { [key: string]: string };
      log_level?: null | components['schemas']['Level'];
      shell?: components['schemas']['ShellType'];
      source: components['schemas']['ShellSource'];
    };
    ShellSource:
      | { cmd: { command: string } }
      | { script: { args: string[]; path: components['schemas']['UserDefinedPath'] } };
    /** @enum {string} */
    ShellType: 'bash' | 'sh' | 'zsh' | 'fish' | 'nu';
    SinkAutoAdjust: {
      /**
       * @description Whether the workers should disable auto adjusting
       * @default false
       */
      disable_worker_auto_load: boolean;
      /**
       * @description If workers auto adjust, set the minimum number of unbuffered batches before adjusting
       * @default 10
       */
      worker_auto_load_batches: number;
      /**
       * Format: float
       * @description If workers auto adjust, set the amount it adjust by
       * @default 1.2000000476837158
       */
      worker_auto_load_step: number;
      /**
       * Format: float
       * @description If workers auto adjust, set the threshold of buffered/batches for adjusting
       * @default 0.10000000149011612
       */
      worker_auto_load_threshold: number;
      /**
       * Format: int32
       * @description If workers auto adjust, set the maximum number of workers
       */
      workers_max?: number;
    };
    SinkConfig: {
      /** @description Allows specifying a separate "catalog" for management operations and tasks */
      catalog: string;
      cleanup?: null | components['schemas']['LinkOperationTask_OperationTask'];
      /** @description The connector to sink the data to */
      connector: components['schemas']['LinkConnection_Connection'];
      /** @description Allows specifying a separate "catalog" for management operations and tasks */
      manage?: string | null;
      /** @description Human-readable name for this sink. */
      name?: string;
      provision?: null | components['schemas']['LinkOperationTask_OperationTask'];
      /** @description Override the default starting parallelism for sink workers */
      workers?: number | null;
    };
    SinkSettings: {
      /** @description Sink worker auto adjust settings */
      auto_adjust?: components['schemas']['SinkAutoAdjust'];
    };
    /** @enum {string} */
    SinkStage:
      | 'started'
      | 'preflight_finished'
      | 'cleanup_finished'
      | 'finished'
      | 'error'
      | 'unknown';
    /**
     * @description Size hint can be provided by configuration and used by a driver implementation.
     * @enum {string}
     */
    SizeHint: 'large' | 'small' | 'unknown';
    SourceConfig: {
      /**
       * @description Prevent one empty list of inputs (which is the default) if no inputs are provided. Some
       *     sources may not require inputs to function (like a Database, or set of Parquet files). But
       *     other times you may want an error to occur if the inputs are empty.
       */
      disable_default_empty_input?: boolean;
      /** @description A key referring to an input configuration or input configuration inline */
      input: components['schemas']['LinkInputConfig_InputConfig'][];
      migration?: null | components['schemas']['LinkMigrationConfig_MigrationConfig'];
      /** @description Human-readable name for this source. */
      name?: string;
      /** @description Various configurations for an individual source stream */
      options?: components['schemas']['SourceConfigOptions'];
      /** @description Configuration for loading schema overrides for this source */
      schema: components['schemas']['SchemaConfig'];
      /** @description A key referring to a source driver or source driver configuration inline */
      source: components['schemas']['LinkSourceDriverConfig_SourceDriverConfig'];
    };
    /** @description Various configurations for an individual source stream */
    SourceConfigOptions: {
      /**
       * @description Buffer the inputs to sources. This is helpful if the individual sources are tiny, which
       *     allows buffering sources into larger `RecordBatch`es which can be more efficient.
       */
      buffer?: number | null;
      /** @description Limit the number of inputs to be sourced */
      limit?: number | null;
      /** @description If sources should be run in parallel (the default), configure the number of workers to use. */
      workers?: number | null;
    };
    /** @description Configuration for a source driver */
    SourceDriverConfig: {
      /** @description The type of the source driver */
      config: components['schemas']['SourceFormat'];
      /** @description Human-readable name for this source driver. */
      name?: string;
    };
    /** @description Source drivers that are designed to stream `RecordBatch`es to a sink. */
    SourceFormat:
      | {
          json: {
            filter?: null | components['schemas']['LinkPredicates_Predicates'];
            options: components['schemas']['TransportOptions'];
          };
        }
      | {
          connector: {
            connector: components['schemas']['LinkConnection_Connection'];
            database?: null | components['schemas']['CatalogName'];
            schema?: string | null;
            tables?: string[] | null;
          };
        };
    /** @enum {string} */
    SourceStage:
      | 'migrate_started'
      | 'migrate_finished'
      | 'started'
      | 'finished'
      | 'error'
      | 'unknown';
    StatQuery: { catalog?: string | null; database?: string | null; schema?: string | null };
    /** @enum {string} */
    StateEntry:
      | 'pipeline'
      | 'source_config'
      | 'sink_config'
      | 'source_driver_config'
      | 'input_config'
      | 'migration_config'
      | 'migration_driver_config'
      | 'connection'
      | 'collection_configs'
      | 'script_config'
      | 'operation_task'
      | 'predicates'
      | 'dynamic_config'
      | 'buffer_settings'
      | 'parse_schema_settings'
      | 'sink_settings';
    /** @description Summary of an entity for listings */
    Summary: {
      /** @description Optional description */
      description?: string | null;
      /**
       * Format: uuid
       * @description The unique identifier of the entity
       */
      id: string;
      /** @description Human-readable name */
      name: string;
    };
    /** @description Lightweight description of a table/file exposed by a connector. */
    TableSummary: {
      name: string;
      /** Format: int64 */
      rows?: number | null;
      /** Format: int64 */
      size_bytes?: number | null;
    };
    TlsOptions: { disable_tls13?: boolean; native_tls?: boolean };
    /** @description Options provided to transport drivers during runtime */
    TransportOptions: {
      compression?: null | components['schemas']['CompressionType'];
      /** @description Options passed to drivers, context dependent */
      options?: components['schemas']['DriverOptions'];
      transport: components['schemas']['TransportType'];
    };
    /** @description Configuration for reading byte streams, like files on disk */
    TransportType:
      | { http: null | components['schemas']['HttpConfiguration'] }
      | { file: null | components['schemas']['FileConfiguration'] }
      | { download: null | components['schemas']['HttpConfiguration'] };
    /**
     * @description Path that can be either managed by the application or user-defined.
     *
     *     Use this type when a path could be either:
     *     - An uploaded file managed by the app (with version resolution)
     *     - A user-provided path on the filesystem
     *
     *     # Examples
     *     ```
     *     // Managed: uploads/config.json (resolved to latest UUID)
     *     UserDefinedPath::Managed(RelativePath::Data(VersionedPath::new("uploads/config.json")))
     *
     *     // External: /usr/local/bin/script.sh
     *     UserDefinedPath::External("/usr/local/bin/script.sh".to_string())
     *     ```
     */
    UserDefinedPath: components['schemas']['RelativePath'] | string;
    /**
     * @description Newtype wrapper for versioned file paths.
     *
     *     Represents a logical file name that resolves to the latest UUID-versioned
     *     file in a directory (e.g., "config.json" → "uploads/config.json/{latest-uuid}").
     *
     *     The inner string is not directly accessible to prevent bypassing version resolution.
     */
    VersionedPath: string;
    /** Format: int64 */
    u64: number;
  };
  responses: {
    AppParallelism: {
      headers: { [name: string]: unknown };
      content: {
        'application/json': {
          main?: number | null;
          /** Format: int32 */
          sink_workers?: number | null;
          /** Format: int32 */
          source_workers?: number | null;
          /** Format: int32 */
          writers: number;
        };
      };
    };
    /** @description Static metadata describing a connector instance. */
    ConnectionMetadata: {
      headers: { [name: string]: unknown };
      content: {
        'application/json': {
          /** @description A list of capabilities the connector supports. */
          capabilities: components['schemas']['Capability'][];
          /** @description The datafusion catalog the connector is registered in. */
          catalog?: string | null;
          id: string;
          /** @description The 'kind' of connector */
          kind: components['schemas']['ConnectionKind'];
          name: string;
        };
      };
    };
    /** @description Response for full entity queries */
    EntitiesResponse: {
      headers: { [name: string]: unknown };
      content: { 'application/json': { entities: components['schemas']['EntitiesMap'] } };
    };
    FileListResponse: {
      headers: { [name: string]: unknown };
      content: {
        'application/json': {
          /** @description List of files */
          files: components['schemas']['FileInfo'][];
        };
      };
    };
    FileUploadResponse: {
      headers: { [name: string]: unknown };
      content: {
        'application/json': {
          /** @description Full absolute path on the server */
          full_path: string;
          /** @description Relative path from data directory (e.g., "uploads/config.json") */
          path: string;
          /** @description Whether the operation was successful */
          success: boolean;
          /** @description The UUID version identifier */
          uuid: string;
        };
      };
    };
    /** @description Query parameters for getting a single entity by ID and type */
    GetEntityResponse: {
      headers: { [name: string]: unknown };
      content: {
        'application/json': {
          entity: components['schemas']['Entity'];
          id: components['schemas']['EntityId'];
        };
      };
    };
    HealthStatus: {
      headers: { [name: string]: unknown };
      content: {
        'application/json': {
          parallelism: components['schemas']['AppParallelism'];
          status: string;
          /** Format: int64 */
          uptime: number;
          version: string;
        };
      };
    };
    /** @description Response for entity summary list queries */
    ListResponse: {
      headers: { [name: string]: unknown };
      content: {
        'application/json': {
          /**
           * @example {
           *       "pipeline": [
           *         {
           *           "description": "Example pipeline",
           *           "id": "my-pipeline",
           *           "name": "My Pipeline"
           *         }
           *       ],
           *       "source": [
           *         {
           *           "description": "Example source",
           *           "id": "my-source",
           *           "name": "My Source"
           *         }
           *       ]
           *     }
           */
          entities: { [key: string]: components['schemas']['Summary'][] };
        };
      };
    };
    /** @description Summaries provided by listing */
    ListSummary: {
      headers: { [name: string]: unknown };
      content: {
        'application/json':
          | {
              summary: string[];
              /** @enum {string} */
              type: 'databases';
            }
          | {
              summary: components['schemas']['TableSummary'][];
              /** @enum {string} */
              type: 'files';
            }
          | {
              summary: components['schemas']['TableSummary'][];
              /** @enum {string} */
              type: 'tables';
            };
      };
    };
    /** @description Standard operation response with ID and optional message */
    OperationResponse: {
      headers: { [name: string]: unknown };
      content: {
        'application/json': {
          /** Format: uuid */
          id: string;
          message: string;
        };
      };
    };
    PipelineConfig: {
      headers: { [name: string]: unknown };
      content: { 'application/json': { config: components['schemas']['Pipeline']; name: string } };
    };
    PipelineConfigResponse: {
      headers: { [name: string]: unknown };
      content: {
        'application/json': {
          data?: null | components['schemas']['PipelineConfig'];
          success: boolean;
        };
      };
    };
    /** @description Standard API response */
    PipelineResponse: {
      headers: { [name: string]: unknown };
      content: { 'application/json': { message: string; success: boolean } };
    };
    /** @description Lightweight description of a table/file exposed by a connector. */
    TableSummary: {
      headers: { [name: string]: unknown };
      content: {
        'application/json': {
          name: string;
          /** Format: int64 */
          rows?: number | null;
          /** Format: int64 */
          size_bytes?: number | null;
        };
      };
    };
  };
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  cancel: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      /** @description Pipeline cancel initiated */
      200: { headers: { [name: string]: unknown }; content?: never };
    };
  };
  quit: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      /** @description Shutdown signal sent */
      200: { headers: { [name: string]: unknown }; content?: never };
    };
  };
  shutdown: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      /** @description Graceful shutdown initiated */
      200: { headers: { [name: string]: unknown }; content?: never };
    };
  };
  create_entity: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { 'application/json': components['schemas']['Entity'] } };
    responses: {
      /** @description Entity created successfully */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': components['schemas']['OperationResponse'] };
      };
      /** @description Internal server error */
      500: { headers: { [name: string]: unknown }; content: { 'text/plain': string } };
    };
  };
  list_entities: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Entity type to list */
        type: components['schemas']['StateEntry'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description List entities by type */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': components['schemas']['ListResponse'] };
      };
    };
  };
  remove_entity: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Entity type */
        entry: components['schemas']['StateEntry'];
        /** @description Entity ID */
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Entity removed successfully */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': components['schemas']['OperationResponse'] };
      };
      /** @description Entity not found */
      404: { headers: { [name: string]: unknown }; content?: never };
      /** @description Internal server error */
      500: { headers: { [name: string]: unknown }; content: { 'text/plain': string } };
    };
  };
  get_entity_by_id: {
    parameters: {
      query: { type: components['schemas']['StateEntry'] };
      header?: never;
      path: {
        /** @description Entity ID */
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successfully retrieved entity */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': components['schemas']['GetEntityResponse'] };
      };
      /** @description Entity not found */
      404: { headers: { [name: string]: unknown }; content?: never };
    };
  };
  update_entity: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Entity ID */
        id: string;
      };
      cookie?: never;
    };
    requestBody: { content: { 'application/json': components['schemas']['Entity'] } };
    responses: {
      /** @description Entity updated successfully */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': components['schemas']['OperationResponse'] };
      };
      /** @description Internal server error */
      500: { headers: { [name: string]: unknown }; content: { 'text/plain': string } };
    };
  };
  patch_entity_by_id: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Entity ID */
        id: string;
      };
      cookie?: never;
    };
    requestBody: { content: { 'application/json': components['schemas']['Entity'] } };
    responses: {
      /** @description Entity patched successfully */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': components['schemas']['OperationResponse'] };
      };
      /** @description Internal server error */
      500: { headers: { [name: string]: unknown }; content: { 'text/plain': string } };
    };
  };
  list: {
    parameters: {
      query?: {
        /** @description Optional path relative to data directory (e.g., 'uploads'). Defaults to root data directory if not specified. */
        path?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Files and directories listed successfully */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': components['schemas']['FileListResponse'] };
      };
      /** @description Bad request */
      400: { headers: { [name: string]: unknown }; content?: never };
      /** @description Internal server error */
      500: { headers: { [name: string]: unknown }; content?: never };
    };
  };
  save: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { 'application/json': components['schemas']['FileSaveRequest'] } };
    responses: {
      /** @description File saved successfully */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': components['schemas']['FileUploadResponse'] };
      };
      /** @description Bad request */
      400: { headers: { [name: string]: unknown }; content?: never };
      /** @description Internal server error */
      500: { headers: { [name: string]: unknown }; content?: never };
    };
  };
  upload: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { 'multipart/form-data': string } };
    responses: {
      /** @description File uploaded successfully */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': components['schemas']['FileUploadResponse'] };
      };
      /** @description Bad request */
      400: { headers: { [name: string]: unknown }; content?: never };
      /** @description Internal server error */
      500: { headers: { [name: string]: unknown }; content?: never };
    };
  };
  get_history: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      /** @description Get all history records */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': components['schemas']['History'][] };
      };
    };
  };
  filter_history: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { 'application/json': components['schemas']['HistoryFilter'] } };
    responses: {
      /** @description Filter history records */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': components['schemas']['History'][] };
      };
    };
  };
  get_pipeline_config_by_filter: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { 'application/json': components['schemas']['HistoryFilter'] } };
    responses: {
      /** @description Get pipeline config by filter */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': components['schemas']['PipelineConfigResponse'] };
      };
    };
  };
  get_pipeline_config: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Run UID */
        run_uid: components['schemas']['u64'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Get pipeline config by run_uid */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': components['schemas']['PipelineConfigResponse'] };
      };
    };
  };
  search_history: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Search string */
        needle: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Search history records */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': components['schemas']['History'][] };
      };
    };
  };
  dispatch_pipeline: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { 'application/json': components['schemas']['Pipeline'] } };
    responses: {
      /** @description Pipeline dispatched successfully */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': components['schemas']['PipelineResponse'] };
      };
    };
  };
  dispatch_pipeline_by_id: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Pipeline configuration ID or name */
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Pipeline dispatched successfully */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': components['schemas']['PipelineResponse'] };
      };
    };
  };
  event_stream: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      /** @description SSE stream of pipeline metrics */
      200: { headers: { [name: string]: unknown }; content: { 'text/event-stream': unknown } };
    };
  };
  list_catalogs: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      /** @description List of registered catalogs */
      200: { headers: { [name: string]: unknown }; content: { 'application/json': string[] } };
      /** @description Internal server error */
      500: { headers: { [name: string]: unknown }; content?: never };
    };
  };
  list_connectors: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      /** @description List of available connectors */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': components['schemas']['ConnectionMetadata'][] };
      };
      /** @description Internal server error */
      500: { headers: { [name: string]: unknown }; content?: never };
    };
  };
  stat: {
    parameters: {
      query?: { catalog?: string | null; database?: string | null; schema?: string | null };
      header?: never;
      path: {
        /** @description Connector ID */
        connector_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description List of files */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': components['schemas']['ListSummary'] };
      };
      /** @description Connector not found */
      404: { headers: { [name: string]: unknown }; content?: never };
      /** @description Internal server error */
      500: { headers: { [name: string]: unknown }; content?: never };
    };
  };
  execute_query: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { 'application/json': components['schemas']['QueryRequest'] } };
    responses: {
      /** @description Query results as Arrow IPC stream */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/vnd.apache.arrow.stream': unknown };
      };
      /** @description Invalid query */
      400: { headers: { [name: string]: unknown }; content?: never };
      /** @description Connector not found */
      404: { headers: { [name: string]: unknown }; content?: never };
      /** @description Internal server error */
      500: { headers: { [name: string]: unknown }; content?: never };
    };
  };
  register: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Connector ID */
        connector_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Registered Connection */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': components['schemas']['ConnectionMetadata'] };
      };
      /** @description Connector not found */
      404: { headers: { [name: string]: unknown }; content?: never };
      /** @description Internal server error */
      500: { headers: { [name: string]: unknown }; content?: never };
    };
  };
  health: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody?: never;
    responses: {
      /** @description Health check status */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': components['schemas']['HealthStatus'] };
      };
    };
  };
}
