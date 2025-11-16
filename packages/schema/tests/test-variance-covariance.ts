// biome-ignore-all lint/correctness/noUnusedVariables: type-level test file
// biome-ignore-all lint/correctness/noUnusedFunctionParameters: type-level test file
/**
 * Variance covariance smoke test
 *
 * Validates that the 'out' variance annotations on StatelyConfig work correctly
 * by testing plugin extension scenarios similar to how @stately/ui and xeo4 use
 * the schema package.
 *
 * This test ensures:
 * 1. Extended configs satisfy base config constraints (covariance)
 * 2. The statelyUi integration pattern works (like @stately/ui does)
 * 3. Plugin augmentation doesn't break with extended configs
 */

import type { Client } from 'openapi-fetch';
import createClient from 'openapi-fetch';
import { CoreNodeType } from '../src/core/nodes.js';
import {
  type DefineComponents,
  type DefineConfig,
  type DefineGeneratedNodes,
  type DefinePaths,
  type Schemas,
  stately,
} from '../src/index.js';
import type { Stately } from '../src/stately.js';

// =============================================================================
// Base Config (minimal core setup)
// =============================================================================

type BaseComponents = DefineComponents<{
  schemas: {
    StateEntry: 'user' | 'post';
    Entity:
      | { type: 'user'; data: { id: string; name: string } }
      | { type: 'post'; data: { id: string; title: string } };
    EntityId: string;
    Summary: { id?: string; name?: string; description?: string | null };
  };
}>;

type BasePaths = DefinePaths<{
  '/entities': {
    get: { responses: { 200: { content: { 'application/json': Array<{ id: string }> } } } };
  };
}>;

const BASE_NODES: Schemas['config']['nodes'] = {
  Entity: { discriminator: 'type', nodeType: CoreNodeType.TaggedUnion, variants: [] },
};

type BaseConfig = DefineConfig<BaseComponents, BasePaths, DefineGeneratedNodes<typeof BASE_NODES>>;

type BaseSchemas = Schemas<BaseConfig>;

// =============================================================================
// Extended Config (simulates files plugin or xeo4 extension)
// =============================================================================

type ExtendedComponents = DefineComponents<{
  schemas: {
    StateEntry: 'user' | 'post' | 'file' | 'folder';
    Entity:
      | { type: 'user'; data: { id: string; name: string } }
      | { type: 'post'; data: { id: string; title: string } }
      | { type: 'file'; data: { id: string; path: string } }
      | { type: 'folder'; data: { id: string; path: string } };
    EntityId: string;
    Summary: { id?: string; name?: string; description?: string | null };
    FileMetadata: { size: number; mimeType: string };
  };
}>;

type ExtendedPaths = DefinePaths<{
  '/entities': {
    get: { responses: { 200: { content: { 'application/json': Array<{ id: string }> } } } };
  };
  '/files': {
    get: { responses: { 200: { content: { 'application/json': Array<{ path: string }> } } } };
  };
}>;

const EXTENDED_NODES: Schemas['config']['nodes'] = {
  Entity: { discriminator: 'type', nodeType: CoreNodeType.TaggedUnion, variants: [] },
  FileMetadata: { nodeType: CoreNodeType.Object, properties: {}, required: [] },
};

type ExtendedConfig = DefineConfig<
  ExtendedComponents,
  ExtendedPaths,
  DefineGeneratedNodes<typeof EXTENDED_NODES>
>;

type ExtendedSchemas = Schemas<ExtendedConfig>;

// =============================================================================
// CRITICAL TEST: Covariance at the type system level
// =============================================================================
// The 'out' annotation ensures that if you have a function accepting Schemas<BaseConfig>,
// it should be able to work with Schemas<ExtendedConfig> where ExtendedConfig properly
// extends BaseConfig. The real test is whether statelyUi accepts both configs.

// =============================================================================
// statelyUi Integration Test (matches @stately/ui pattern)
// =============================================================================

declare const mockOpenApiDoc: any;

const baseClient = createClient<BaseConfig['paths']>({ baseUrl: 'http://localhost:3000' });
const extendedClient = createClient<ExtendedConfig['paths']>({ baseUrl: 'http://localhost:3000' });

const baseSchema = stately<BaseSchemas>(mockOpenApiDoc, BASE_NODES);
const extendedSchema = stately<ExtendedSchemas>(mockOpenApiDoc, EXTENDED_NODES);

// This function simulates how @stately/ui and xeo4 use the schema
function statelyUi<Schema extends Schemas>(
  state: Stately<Schema>,
  client: Client<Schema['config']['paths']>,
) {
  return { client, state };
}

// Should work with base config
const baseUi = statelyUi(baseSchema, baseClient);

// Should work with extended config (this is the key test for real-world usage)
const extendedUi = statelyUi(extendedSchema, extendedClient);

// =============================================================================
// Generic function test (CoreUtils pattern)
// =============================================================================

import { coreUtils } from '../src/core/utils.js';

// Generic functions should work with any config's types
declare const baseEntityData: BaseSchemas['types']['EntityData'];
declare const extendedEntityData: ExtendedSchemas['types']['EntityData'];

const baseIsValid = coreUtils.isEntityValid(baseEntityData, undefined);
const extendedIsValid = coreUtils.isEntityValid(extendedEntityData, undefined);

// =============================================================================
// Export for verification
// =============================================================================

export type { BaseConfig, ExtendedConfig, BaseSchemas, ExtendedSchemas };

export { baseSchema, extendedSchema, baseUi, extendedUi };
