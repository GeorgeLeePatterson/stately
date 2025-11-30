export interface components {
  schemas: {
    /**
     * @description Capabilities a connector can expose to the viewer.
     * @enum {string}
     */
    Capability: 'execute_sql' | 'list';
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
    /** @description Request for multiple connection details */
    ConnectionDetailsRequest: {
      /** @description IDs -> filters of each connector to list */
      connectors: { [key: string]: components['schemas']['ConnectionDetailQuery'] };
      /** @description Whether one failure should fail the entire request */
      fail_on_error?: boolean;
    };
    /** @description Response to execute a SQL query */
    ConnectionDetailsResponse: {
      /** @description IDs -> `ListSummary` of each connector to list */
      connections: { [key: string]: components['schemas']['ListSummary'] };
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
    /** @description Connector Stately `entity` type */
    Connector: {
      config?: components['schemas']['ConnectorType'];
      /** @description Human-readable name for this connection. */
      name?: string;
    };
    ConnectorType:
      | { object_store: components['schemas']['ObjectStoreConfiguration'] }
      | { database: components['schemas']['DatabaseConfiguration'] };
    /** @description Supported databases for the default backend lineup. */
    Database: { click_house: null | components['schemas']['ClickHouseConfig'] };
    /** @description Configuration for database-backed connectors. */
    DatabaseConfiguration: {
      driver: components['schemas']['Database'];
      options: components['schemas']['ConnectionOptions'];
      pool?: components['schemas']['PoolOptions'];
    };
    /** @description Common connection options shared by database connectors. */
    ConnectionOptions: {
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
    /** @description Supported object store providers. */
    ObjectStore:
      | { aws: components['schemas']['ObjectStoreOptions'] }
      | { gcp: components['schemas']['ObjectStoreOptions'] }
      | { azure: components['schemas']['ObjectStoreOptions'] }
      | { local: components['schemas']['ObjectStoreOptions'] };
    /** @description Provider-agnostic object store settings. */
    ObjectStoreOptions: {
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
    QueryRequest: {
      /** @description ID of the connector to use */
      connector_id?: string | null;
      /** @description SQL query to execute (can use URL tables like `s3://bucket/path/*.parquet`) */
      sql: string;
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
    SessionCapability: 'execute_without_connector';
    ConnectionDetailQuery: {
      catalog?: string | null;
      database?: string | null;
      schema?: string | null;
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
  };
  responses: {
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

export interface paths {
  '/catalogs': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    /**
     * List all registered catalogs
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
  '/connectors': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    /**
     * List all available connectors
     * @description # Errors
     *     - Internal server error
     */
    get: operations['list_connectors'];
    put?: never;
    /**
     * List databases or tables/files available in a set of connectors's underlying data stores
     * @description # Errors
     *     - Connector not found
     *     - Internal server error
     */
    post: operations['connector_list_many'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/connectors/{connector_id}': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    /**
     * List databases or tables/files available in a connector's underlying data store
     * @description # Errors
     *     - Connector not found
     *     - Internal server error
     */
    get: operations['connector_list'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/query': {
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
  '/register/{connector_id}': {
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
}

export interface operations {
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
      /** @description List of available connections */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': components['schemas']['ConnectionMetadata'][] };
      };
      /** @description Internal server error */
      500: { headers: { [name: string]: unknown }; content?: never };
    };
  };
  connector_list_many: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: {
      content: { 'application/json': components['schemas']['ConnectionDetailsRequest'] };
    };
    responses: {
      /** @description List of databases or tables/files keyed by connection */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': components['schemas']['ConnectionDetailsResponse'] };
      };
      /** @description Connector not found */
      404: { headers: { [name: string]: unknown }; content?: never };
      /** @description Internal server error */
      500: { headers: { [name: string]: unknown }; content?: never };
    };
  };
  connector_list: {
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
      /** @description List of databases or tables/files */
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
}
