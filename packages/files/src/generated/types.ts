// Auto-generated at build time from openapi.json
// DO NOT EDIT MANUALLY - run 'npm run generate-schemas' to regenerate

export interface paths {
    "/file/cache/{path}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Download a file from the cache directory
         * @description Returns the raw file content with appropriate Content-Type header.
         *     No version resolution is performed - the path is used directly.
         *
         *     # Errors
         *     - `Error::NotFound` if the file does not exist
         *     - `Error::Internal` if the file could not be read
         */
        get: operations["download_cache"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/file/data/{path}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Download a file from the data directory
         * @description Returns the raw file content with appropriate Content-Type header.
         *     No version resolution is performed - the path is used directly.
         *
         *     # Errors
         *     - `Error::NotFound` if the file does not exist
         *     - `Error::Internal` if the file could not be read
         */
        get: operations["download_data"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/file/upload/{path}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Download a file from the uploads directory
         * @description Returns the raw file content with appropriate Content-Type header.
         *     Automatically resolves to the latest version unless a specific version UUID is provided.
         *
         *     # Errors
         *     - `Error::NotFound` if the file does not exist
         *     - `Error::Internal` if the file could not be read
         */
        get: operations["download_upload"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
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
        /** @description Query parameters for downloading files. */
        FileDownloadQuery: {
            /**
             * @description Specific version UUID to download.
             *     If not provided, returns the latest version.
             */
            version?: string | null;
        };
        /**
         * @description Type of file system entry.
         * @enum {string}
         */
        FileEntryType: "directory" | "file" | "versioned_file";
        /** @description Information about a file or directory entry. */
        FileInfo: {
            /**
             * Format: int64
             * @description Creation timestamp as Unix epoch seconds.
             *     For versioned files, this is when the first version was created.
             */
            created?: number | null;
            /**
             * Format: int64
             * @description Last modified timestamp as Unix epoch seconds.
             *     For versioned files, this is when the latest version was created.
             */
            modified?: number | null;
            /** @description Entry name (filename or directory name). */
            name: string;
            /**
             * Format: int64
             * @description Size in bytes. For versioned files, this is the size of the latest version.
             *     For directories, this is 0.
             */
            size: number;
            /** @description Type of this entry. */
            type: components["schemas"]["FileEntryType"];
            /**
             * @description List of all versions, sorted newest first.
             *     Only populated for versioned files.
             */
            versions?: components["schemas"]["FileVersion"][] | null;
        };
        /** @description Query parameters for listing files. */
        FileListQuery: {
            /**
             * @description Path to list files from, relative to the uploads directory.
             *     If not provided, lists the root uploads directory.
             */
            path?: string | null;
        };
        /** @description Response from listing files in a directory. */
        FileListResponse: {
            /** @description List of files and directories. */
            files: components["schemas"]["FileInfo"][];
        };
        /** @description Request body for saving file content directly. */
        FileSaveRequest: {
            /** @description File content as string. */
            content: string;
            /** @description Optional filename. Defaults to "unnamed.txt" if not provided. */
            name?: string | null;
        };
        /** @description Response from file upload or save operations. */
        FileUploadResponse: {
            /** @description Full absolute path on the server filesystem. */
            full_path: string;
            /** @description Relative path from uploads directory (e.g., "config.json"). */
            path: string;
            /** @description Whether the operation was successful. */
            success: boolean;
            /** @description The UUID version identifier for this upload. */
            uuid: string;
        };
        /** @description Information about a specific file version. */
        FileVersion: {
            /**
             * Format: int64
             * @description Creation timestamp as Unix epoch seconds.
             */
            created?: number | null;
            /**
             * Format: int64
             * @description Size of this version in bytes.
             */
            size: number;
            /** @description UUID v7 identifier for this version. */
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
        /** @description Response from listing files in a directory. */
        FileListResponse: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    /** @description List of files and directories. */
                    files: components["schemas"]["FileInfo"][];
                };
            };
        };
        /** @description Response from file upload or save operations. */
        FileUploadResponse: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    /** @description Full absolute path on the server filesystem. */
                    full_path: string;
                    /** @description Relative path from uploads directory (e.g., "config.json"). */
                    path: string;
                    /** @description Whether the operation was successful. */
                    success: boolean;
                    /** @description The UUID version identifier for this upload. */
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
    download_cache: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Path to file relative to cache directory */
                path: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description File content */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/octet-stream": unknown;
                };
            };
            /** @description File not found */
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
    download_data: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Path to file relative to data directory */
                path: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description File content */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/octet-stream": unknown;
                };
            };
            /** @description File not found */
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
    download_upload: {
        parameters: {
            query?: {
                /**
                 * @description Specific version UUID to download.
                 *     If not provided, returns the latest version.
                 */
                version?: string;
            };
            header?: never;
            path: {
                /** @description Path to versioned file relative to uploads directory */
                path: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description File content */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/octet-stream": unknown;
                };
            };
            /** @description File not found */
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
    list_files: {
        parameters: {
            query?: {
                /**
                 * @description Path to list files from, relative to the uploads directory.
                 *     If not provided, lists the root uploads directory.
                 */
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

