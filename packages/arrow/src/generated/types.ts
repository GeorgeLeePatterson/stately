// Auto-generated at build time from openapi.json
// DO NOT EDIT MANUALLY - run 'stately generate' to regenerate

export interface paths {
    "/catalogs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all catalogs in `Datafusion`
         * @description # Errors
         *     - Internal server error
         */
        get: operations["list_catalogs"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/connectors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all available connectors
         * @description # Errors
         *     - Internal server error
         */
        get: operations["list_connectors"];
        put?: never;
        /**
         * List databases or tables/files available in a set of connectors's underlying data stores
         * @description # Errors
         *     - Connector not found
         *     - Internal server error
         */
        post: operations["connector_list_many"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/connectors/{connector_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List databases or tables/files available in a connector's underlying data store
         * @description # Errors
         *     - Connector not found
         *     - Internal server error
         */
        get: operations["connector_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Execute a SQL query using URL tables
         * @description # Errors
         *     - Connector not found
         *     - Internal server error
         */
        post: operations["execute_query"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all registered connections
         * @description # Errors
         *     - Internal server error
         */
        get: operations["list_registered"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/register/{connector_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Register a connector. Useful when federating queries since registration is lazy
         * @description # Errors
         *     - Connector not found
         *     - Internal server error
         */
        get: operations["register"];
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
        /** @description Standard error shape returned by handlers */
        ApiError: {
            error: string;
            /** Format: int32 */
            status: number;
        };
        /**
         * @description Static metadata describing a backend implementation.
         *
         *     Backends provide this metadata to indicate their type and capabilities.
         *     Use the builder methods to construct instances.
         */
        BackendMetadata: {
            /** @description Capabilities this backend supports. */
            capabilities: components["schemas"]["Capability"][];
            /** @description The kind of data source this backend connects to. */
            kind: components["schemas"]["ConnectionKind"];
        };
        /**
         * @description Capabilities a connector can expose.
         * @enum {string}
         */
        Capability: "execute_sql" | "list";
        /**
         * @description Compression options for `ClickHouse` tables.
         * @enum {string}
         */
        ClickHouseCompression: "none" | "lz4" | "zstd";
        /** @description Additional ClickHouse-specific configuration. */
        ClickHouseConfig: {
            compression?: null | components["schemas"]["ClickHouseCompression"];
            settings?: {
                [key: string]: string;
            };
        };
        /** @description Request for fetching details from multiple connectors. */
        ConnectionDetailsRequest: {
            /** @description Map of connector IDs to their search parameters. */
            connectors: {
                [key: string]: components["schemas"]["ConnectionSearchQuery"];
            };
            /**
             * @description If true, a failure in any connector fails the entire request.
             *     If false (default), failures are skipped and successful results returned.
             */
            fail_on_error?: boolean;
        };
        /** @description Response containing details from multiple connectors. */
        ConnectionDetailsResponse: {
            /** @description Map of connector IDs to their listing results. */
            connections: {
                [key: string]: components["schemas"]["ListSummary"];
            };
        };
        /** @description The type of data source a connector connects to. */
        ConnectionKind: "object_store" | "database" | {
            /** @description Custom connector type. */
            other: string;
        };
        /**
         * @description Runtime metadata describing a connector instance.
         *
         *     This combines the connector's identity with its backend metadata,
         *     including the `DataFusion` catalog it's registered under.
         */
        ConnectionMetadata: {
            /** @description The `DataFusion` catalog this connector is registered under. */
            catalog?: string | null;
            /** @description Unique identifier for this connector. */
            id: string;
            /** @description Backend metadata (kind and capabilities). */
            metadata: components["schemas"]["BackendMetadata"];
            /** @description Human-readable name. */
            name: string;
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
            tls?: null | components["schemas"]["TlsOptions"];
            /** @description Username used to connect to the database */
            username: string;
        };
        /** @description Query parameters for searching connection contents. */
        ConnectionSearchQuery: {
            /** @description Optional search term to filter results. */
            search?: string | null;
        };
        /**
         * @description Connector Stately `entity` type.
         *
         *     Use this with [`Connectors`] and [`Registry`] to create a turnkey connector registry.
         */
        Connector: {
            config: components["schemas"]["ConnectorType"];
            /** @description Human-readable name for this connection. */
            name?: string;
        };
        ConnectorType: {
            object_store: components["schemas"]["ObjectStoreConfiguration"];
        } | {
            database: components["schemas"]["DatabaseConfiguration"];
        };
        /**
         * @description Supported databases for the default backend lineup.
         *
         *     Default implementations will be provided and over time the list will grow. For that reason, this
         *     enum is marked as `non_exhaustive`.
         */
        Database: {
            clickhouse: null | components["schemas"]["ClickHouseConfig"];
        };
        /** @description Configuration for database-backed connectors. */
        DatabaseConfiguration: {
            driver: components["schemas"]["Database"];
            options: components["schemas"]["ConnectionOptions"];
            pool?: components["schemas"]["PoolOptions"];
        };
        /**
         * @description Summary of items available in a connector.
         *
         *     The variant indicates what type of items were found based on the connector
         *     type and search context.
         */
        ListSummary: {
            /** @description List of database names (for database connectors at root level). */
            summary: string[];
            /** @enum {string} */
            type: "databases";
        } | {
            /** @description List of tables with metadata (for database connectors within a database). */
            summary: components["schemas"]["TableSummary"][];
            /** @enum {string} */
            type: "tables";
        } | {
            /** @description List of path prefixes (for object store connectors at root level). */
            summary: string[];
            /** @enum {string} */
            type: "paths";
        } | {
            /** @description List of files with metadata (for object store connectors within a path). */
            summary: components["schemas"]["TableSummary"][];
            /** @enum {string} */
            type: "files";
        };
        /** @description Supported object store providers. */
        ObjectStore: {
            aws: components["schemas"]["ObjectStoreOptions"];
        } | {
            gcp: components["schemas"]["ObjectStoreOptions"];
        } | {
            azure: components["schemas"]["ObjectStoreOptions"];
        } | {
            local: components["schemas"]["ObjectStoreOptions"];
        };
        /** @description Configuration for an object store-backed connector. */
        ObjectStoreConfiguration: {
            /** @description The format to read/write within the store. */
            format?: components["schemas"]["ObjectStoreFormat"];
            /** @description Provider specific configuration for the store itself. */
            store?: components["schemas"]["ObjectStore"];
        };
        /** @description Supported file formats for object-store connectors. */
        ObjectStoreFormat: {
            /** @description Apache Parquet format with optional key/value overrides. */
            parquet: {
                [key: string]: string;
            } | null;
        };
        /** @description Provider-agnostic object store settings. */
        ObjectStoreOptions: {
            /** @description *Required* bucket name (or base directory for local stores). */
            bucket: string;
            /** @description Whether credentials should be resolved from environment variables. */
            from_env?: boolean;
            /** @description Additional provider-specific configuration parameters. */
            options?: {
                [key: string]: string;
            };
        };
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
        /** @description Request to execute a SQL query. */
        QueryRequest: {
            /**
             * @description ID of the connector to use. If not provided, the query runs against
             *     the session's default catalog (if supported).
             */
            connector_id?: string | null;
            /** @description SQL query to execute. Supports URL tables like `s3://bucket/path/*.parquet`. */
            sql: string;
        };
        /**
         * @description Generic registry options.
         *
         *     Provided as a convenience if using state entity types directly, ie [`Connector`]
         */
        RegistryOptions: {
            /**
             * Format: int64
             * @description Set the maximum lifetime that a connection should be kept around for.
             */
            max_lifetime?: number | null;
            /**
             * Format: int32
             * @description Set the maximum size any connector will use for its pool. Set to 0 to disable pooling.
             */
            max_pool_size?: number | null;
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
         *     use stately_arrow::database::Secret;
         *
         *     let password = Secret::new("my_password");
         *     println!("{password:?}"); // Prints: Secret(*******)
         *     ```
         */
        Secret: string;
        /**
         * @description Session capabilities a `QuerySession` can expose to the `QueryContext`.
         * @enum {string}
         */
        SessionCapability: "execute_without_connector";
        String: string;
        /** @description Summary information about a table or file. */
        TableSummary: {
            /** @description Table or file name/path. */
            name: string;
            /**
             * Format: int64
             * @description Number of rows (if known).
             */
            rows?: number | null;
            /**
             * Format: int64
             * @description Size in bytes (if known).
             */
            size_bytes?: number | null;
        };
        /** @description TLS options for databases that require secure connections. */
        TlsOptions: {
            cafile?: string | null;
            domain?: string | null;
            /** @default false */
            enable: boolean;
        };
    };
    responses: {
        /** @description Response containing details from multiple connectors. */
        ConnectionDetailsResponse: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    /** @description Map of connector IDs to their listing results. */
                    connections: {
                        [key: string]: components["schemas"]["ListSummary"];
                    };
                };
            };
        };
        /**
         * @description Summary of items available in a connector.
         *
         *     The variant indicates what type of items were found based on the connector
         *     type and search context.
         */
        ListSummary: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    /** @description List of database names (for database connectors at root level). */
                    summary: string[];
                    /** @enum {string} */
                    type: "databases";
                } | {
                    /** @description List of tables with metadata (for database connectors within a database). */
                    summary: components["schemas"]["TableSummary"][];
                    /** @enum {string} */
                    type: "tables";
                } | {
                    /** @description List of path prefixes (for object store connectors at root level). */
                    summary: string[];
                    /** @enum {string} */
                    type: "paths";
                } | {
                    /** @description List of files with metadata (for object store connectors within a path). */
                    summary: components["schemas"]["TableSummary"][];
                    /** @enum {string} */
                    type: "files";
                };
            };
        };
        /** @description Summary information about a table or file. */
        TableSummary: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    /** @description Table or file name/path. */
                    name: string;
                    /**
                     * Format: int64
                     * @description Number of rows (if known).
                     */
                    rows?: number | null;
                    /**
                     * Format: int64
                     * @description Size in bytes (if known).
                     */
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
    list_catalogs: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of registered catalogs */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string[];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiError"];
                };
            };
        };
    };
    list_connectors: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of available connections */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConnectionMetadata"][];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiError"];
                };
            };
        };
    };
    connector_list_many: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConnectionDetailsRequest"];
            };
        };
        responses: {
            /** @description List of databases or tables/files keyed by connection */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConnectionDetailsResponse"];
                };
            };
            /** @description Connector not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiError"];
                };
            };
        };
    };
    connector_list: {
        parameters: {
            query?: {
                /** @description Optional search term to filter results. */
                search?: string | null;
            };
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
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListSummary"];
                };
            };
            /** @description Connector not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiError"];
                };
            };
        };
    };
    execute_query: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QueryRequest"];
            };
        };
        responses: {
            /** @description Query results as Arrow IPC stream */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/vnd.apache.arrow.stream": unknown;
                };
            };
            /** @description Invalid query */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiError"];
                };
            };
            /** @description Connector not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiError"];
                };
            };
        };
    };
    list_registered: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of registered connections */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConnectionMetadata"][];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiError"];
                };
            };
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
            /** @description Registered Connections */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConnectionMetadata"][];
                };
            };
            /** @description Connector not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiError"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiError"];
                };
            };
        };
    };
}
