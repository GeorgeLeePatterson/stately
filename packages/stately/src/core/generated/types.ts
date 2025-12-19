/**
 * Generated OpenAPI types for Core Plugin
 *
 * This file would typically be generated from the plugin's openapi.json spec
 * using openapi-typescript. For now, it's a manual placeholder defining the
 * canonical paths structure.
 *
 * TODO: Generate this from Rust proc macros via openapi.json
 */

/**
 * Core plugin canonical paths
 *
 * These are the paths WITHOUT any prefix - the canonical API surface.
 * Users will mount these at their chosen prefix (e.g., /*)
 */
export interface paths {
  '': {
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
  '/list/{type}': {
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
  '/{entry}/{id}': {
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
  '/{id}': {
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

export interface components {
  schemas: {
    /** @description Standard error shape returned by handlers */
    ApiError: {
      error: string;
      /** Format: int32 */
      status: number;
    };
    EntitiesMap: {
      entities: { [key: string]: { [key: string]: components['schemas']['Entity'] } };
    };
    /** @description Response for full entity queries */
    EntitiesResponse: { entities: components['schemas']['EntitiesMap'] };
    Entity: {
      data: { name?: string; [key: string]: unknown };
      type: components['schemas']['StateEntry'];
    };
    /**
     * @description Entity identifier type - wraps String for flexibility with UUID v7 generation. Use the singleton ID '00000000-0000-0000-0000-000000000000' for singleton entities.
     * @example 00000000-0000-0000-0000-000000000000
     */
    EntityId: string;
    GetEntityResponse: {
      entity: components['schemas']['Entity'];
      id: components['schemas']['EntityId'];
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
    /** @description Standard operation response with ID and optional message */
    OperationResponse: {
      /** Format: uuid */
      id: string;
      message: string;
    };
    /** @enum {string} */
    StateEntry: string;
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
  };
  responses: {
    /** @description Standard error shape returned by handlers */
    ApiError: {
      headers: { [name: string]: unknown };
      content: {
        'application/json': {
          error: string;
          /** Format: int32 */
          status: number;
        };
      };
    };
    /** @description Response for full entity queries */
    EntitiesResponse: {
      headers: { [name: string]: unknown };
      content: { 'application/json': { entities: components['schemas']['EntitiesMap'] } };
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
  };
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export interface operations {
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
}
