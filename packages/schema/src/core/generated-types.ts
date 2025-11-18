/**
 * Generated OpenAPI types for Core Plugin
 *
 * This file would typically be generated from the plugin's openapi.json spec
 * using openapi-typescript. For now, it's a manual placeholder defining the
 * canonical paths structure.
 *
 * TODO: Generate this from Rust proc macros via openapi.json
 */

import type { CoreComponents } from './generated';

/**
 * Core plugin canonical paths
 *
 * These are the paths WITHOUT any prefix - the canonical API surface.
 * Users will mount these at their chosen prefix (e.g., /*)
 */
export interface paths {
  '/entity': {
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
  '/entity/list/{type}': {
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
  '/entity/{entry}/{id}': {
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
  '/entity/{id}': {
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
}

export interface operations {
  create_entity: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never };
    requestBody: { content: { 'application/json': CoreComponents['schemas']['Entity'] } };
    responses: {
      /** @description Entity created successfully */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': CoreComponents['schemas']['OperationResponse'] };
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
        type: CoreComponents['schemas']['StateEntry'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description List entities by type */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': CoreComponents['schemas']['ListResponse'] };
      };
    };
  };
  remove_entity: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Entity type */
        entry: CoreComponents['schemas']['StateEntry'];
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
        content: { 'application/json': CoreComponents['schemas']['OperationResponse'] };
      };
      /** @description Entity not found */
      404: { headers: { [name: string]: unknown }; content?: never };
      /** @description Internal server error */
      500: { headers: { [name: string]: unknown }; content: { 'text/plain': string } };
    };
  };
  get_entity_by_id: {
    parameters: {
      query: { type: CoreComponents['schemas']['StateEntry'] };
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
        content: { 'application/json': CoreComponents['schemas']['GetEntityResponse'] };
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
    requestBody: { content: { 'application/json': CoreComponents['schemas']['Entity'] } };
    responses: {
      /** @description Entity updated successfully */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': CoreComponents['schemas']['OperationResponse'] };
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
    requestBody: { content: { 'application/json': CoreComponents['schemas']['Entity'] } };
    responses: {
      /** @description Entity patched successfully */
      200: {
        headers: { [name: string]: unknown };
        content: { 'application/json': CoreComponents['schemas']['OperationResponse'] };
      };
      /** @description Internal server error */
      500: { headers: { [name: string]: unknown }; content: { 'text/plain': string } };
    };
  };
}
