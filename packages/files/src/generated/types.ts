// Auto-generated at build time from openapi.json
// DO NOT EDIT MANUALLY - run 'npm run generate-schemas' to regenerate

export interface paths {
    "/list": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List files and directories
         * @description Lists all files and directories in the specified path (or root data directory if no path
         *     specified). Returns both files and directories with a flag indicating which is which.
         *
         *     Versioned files are stored as: `{filename}/__versions__/{uuid}`
         *     The UI is responsible for aggregating versions for display.
         *
         *     # Errors
         *     - `Error::BadRequest` if the path is invalid
         *     - `Error::Internal` if the files could not be listed
         */
        get: operations["list_files"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/save": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Save file content directly (without multipart upload)
         * @description This endpoint allows saving file content from a text input.
         *
         *     # Errors
         *     - `Error::BadRequest` if the file name is invalid
         *     - `Error::Internal` if the file could not be saved
         */
        post: operations["save_file"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/upload": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Upload a file to the data directory
         * @description Files are stored in a versioned structure:
         *     `data/uploads/{name}/{uuid}`
         *
         *     This allows automatic versioning without conflicts.
         *
         *     # Errors
         *     - `Error::BadRequest` if the file name is invalid
         *     - `Error::Internal` if the file could not be saved
         */
        post: operations["upload"];
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
        /** @enum {string} */
        FileEntryType: "directory" | "file" | "versioned_file";
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
            type: components["schemas"]["FileEntryType"];
            /** @description List of all versions (only populated for versioned files) */
            versions?: components["schemas"]["FileVersion"][] | null;
        };
        FileListQuery: {
            /** @description Optional path to list files from (relative to data directory) */
            path?: string | null;
        };
        FileListResponse: {
            /** @description List of files */
            files: components["schemas"]["FileInfo"][];
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
        /**
         * @description Path relative to an app directory (upload, data, config, or cache).
         *
         *     Use this type in configuration structs when you need paths relative to
         *     app directories with optional version resolution for uploaded files.
         *
         *     For paths that are just strings (e.g., user-provided absolute paths or
         *     URLs), use `String` or `PathBuf` directly instead.
         */
        RelativePath: {
            /** @enum {string} */
            dir: "cache";
            /** @description Path relative to the cache directory */
            path: string;
        } | {
            /** @enum {string} */
            dir: "data";
            /** @description Path relative to the data directory (non-versioned files) */
            path: string;
        } | {
            /** @enum {string} */
            dir: "upload";
            /** @description Path to uploaded file with version resolution support (in uploads/ directory) */
            path: components["schemas"]["VersionedPath"];
        };
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
        UserDefinedPath: components["schemas"]["RelativePath"] | string;
        /**
         * @description Newtype wrapper for versioned file paths.
         *
         *     Represents a logical file name that resolves to the latest UUID-versioned
         *     file in a directory (e.g., "config.json" → "uploads/config.json/{latest-uuid}").
         *
         *     The inner string is not directly accessible to prevent bypassing version resolution.
         */
        VersionedPath: string;
    };
    responses: {
        /** @description Standard error shape returned by handlers */
        ApiError: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    error: string;
                    /** Format: int32 */
                    status: number;
                };
            };
        };
        FileListResponse: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    /** @description List of files */
                    files: components["schemas"]["FileInfo"][];
                };
            };
        };
        FileUploadResponse: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": {
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
    };
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    list_files: {
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
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FileListResponse"];
                };
            };
            /** @description Bad request */
            400: {
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
    save_file: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FileSaveRequest"];
            };
        };
        responses: {
            /** @description File saved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FileUploadResponse"];
                };
            };
            /** @description Bad request */
            400: {
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
    upload: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": string;
            };
        };
        responses: {
            /** @description File uploaded successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FileUploadResponse"];
                };
            };
            /** @description Bad request */
            400: {
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

