/**
 * Generated OpenAPI types for Files Plugin
 *
 * This file would typically be generated from the plugin's openapi.json spec
 * using openapi-typescript. For now, it's a manual placeholder defining the
 * canonical paths structure.
 *
 * TODO: Generate this from Rust proc macros via openapi.json
 */

import type { FileListResponse, FileSaveRequest, FileUploadResponse } from './types/api';

/**
 * Files plugin canonical paths
 *
 * These are the paths WITHOUT any prefix - the canonical API surface.
 * Users will mount these at their chosen prefix (e.g., /files/*)
 */
export interface paths {
  '/list': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
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
    get: operations['list_files'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/save': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
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
    post: operations['save_file'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/upload': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
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
    post: operations['upload'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}

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
        headers: { [name: string]: unknown };
        content: { 'application/json': FileListResponse };
      };
      /** @description Bad request */
      400: { headers: { [name: string]: unknown }; content?: never };
      /** @description Internal server error */
      500: { headers: { [name: string]: unknown }; content?: never };
    };
  };
  save_file: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { 'application/json': FileSaveRequest } };
    responses: {
      /** @description File saved successfully */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': FileUploadResponse };
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
        content: { 'application/json': FileUploadResponse };
      };
      /** @description Bad request */
      400: { headers: { [name: string]: unknown }; content?: never };
      /** @description Internal server error */
      500: { headers: { [name: string]: unknown }; content?: never };
    };
  };
}
