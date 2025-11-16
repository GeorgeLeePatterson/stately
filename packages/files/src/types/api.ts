/**
 * File API types
 *
 * These types mirror the Rust types from stately-files crate.
 * See: crates/stately-files/src/types.rs
 */

/**
 * Request body for /files/save endpoint
 */
export interface FileSaveRequest {
  /** File content as string */
  content: string;
  /** Optional filename */
  name?: string;
}

/**
 * Query params for /files/list endpoint
 */
export interface FileListQuery {
  /** Optional path to list files from (relative to data directory) */
  path?: string;
}

/**
 * Response from /files/upload and /files/save endpoints
 */
export interface FileUploadResponse {
  /** Whether the operation was successful */
  success: boolean;
  /** Relative path from data directory (e.g., "uploads/config.json") */
  path: string;
  /** The UUID version identifier */
  uuid: string;
  /** Full absolute path on the server */
  full_path: string;
}

/**
 * Response from /files/list endpoint
 */
export interface FileListResponse {
  /** List of files and directories */
  files: FileInfo[];
}

/**
 * File entry type discriminator
 */
export type FileEntryType = 'file' | 'directory' | 'versioned_file';

/**
 * File version information (for versioned files)
 */
export interface FileVersion {
  /** UUID identifier for this version */
  uuid: string;
  /** Size of this specific version in bytes */
  size: number;
  /** Creation timestamp (Unix epoch seconds) */
  created?: number;
}

/**
 * File information returned from list endpoint
 */
export interface FileInfo {
  /** File name (relative path from target directory) */
  name: string;
  /** File size in bytes (latest version for versioned files) */
  size: number;
  /** Entry type: file, directory, or versioned_file */
  type: FileEntryType;
  /** Creation timestamp (Unix epoch seconds) - oldest version for versioned files */
  created?: number;
  /** Last modified timestamp (Unix epoch seconds) - newest version for versioned files */
  modified?: number;
  /** List of all versions (only populated for versioned files) */
  versions?: FileVersion[];
}
