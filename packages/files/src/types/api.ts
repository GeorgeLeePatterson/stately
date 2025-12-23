/**
 * File API types
 *
 * Type aliases for the generated OpenAPI types from stately-files crate.
 * See: crates/stately-files/src/types.rs
 *
 * These are re-exported from the generated types for convenience and stability.
 * Run `pnpm run generate` to regenerate from the Rust OpenAPI spec.
 */

import type { components } from '../generated/types.js';

// Re-export the full generated types for direct access
export type { components, paths, operations } from '../generated/types.js';

/** Request body for /files/save endpoint */
export type FileSaveRequest = components['schemas']['FileSaveRequest'];

/** Query params for /files/list endpoint */
export type FileListQuery = components['schemas']['FileListQuery'];

/** Response from /files/upload and /files/save endpoints */
export type FileUploadResponse = components['schemas']['FileUploadResponse'];

/** Response from /files/list endpoint */
export type FileListResponse = components['schemas']['FileListResponse'];

/** File entry type discriminator */
export type FileEntryType = components['schemas']['FileEntryType'];

/** File version information (for versioned files) */
export type FileVersion = components['schemas']['FileVersion'];

/** File information returned from list endpoint */
export type FileInfo = components['schemas']['FileInfo'];
