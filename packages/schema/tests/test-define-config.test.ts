// biome-ignore-all lint/correctness/noUnusedVariables: type-level test file
// biome-ignore-all lint/correctness/noUnusedFunctionParameters: type-level test file

import type { CoreStatelyConfig } from '../src/core/generated.js';
import type { ObjectNode } from '../src/core/nodes.js';
import type { DefineComponents, DefineGeneratedNodes, DefinePaths } from '../src/generated.js';
import type { AssertTrue } from '../src/helpers.js';
import type { DefineConfig, Schemas } from '../src/index.js';
import type { Stately } from '../src/stately.js';

type FilesComponents = DefineComponents<{ schemas: { FileEntity: { id: string; name: string } } }>;

type FilesPaths = DefinePaths<{
  '/files': {
    get: { responses: { 200: { content: { 'application/json': Array<{ id: string }> } } } };
  };
}>;

type FilesNodes = DefineGeneratedNodes<{ FileEntity: ObjectNode }>;

type FilesConfig = DefineConfig<FilesComponents, FilesPaths, FilesNodes>;

type FilesSchemas = Schemas<FilesConfig>;

type FilesSchemaAugments = FilesSchemas['augments'];
type CoreAugmentName = FilesSchemaAugments[0]['name'];
type FilesSchemasData = FilesSchemas['data'];
type FilesSchemasTypes = FilesSchemas['types'];
type FilesSchemasUtils = FilesSchemas['utils'];

type FilesSchemasDataEntityDisplay = FilesSchemasData['entityDisplayNames'];
type FilesSchemasDataEntityMap = FilesSchemasData['entitySchemaCache'];

type HasEntityNode = 'Entity' extends keyof FilesSchemas['config']['nodes'] ? true : false;
type HasFileNode = 'FileEntity' extends keyof FilesSchemas['config']['nodes'] ? true : false;
type ConfigExtendsCore = FilesConfig extends CoreStatelyConfig ? true : false;

declare const filesRuntime: Stately<FilesSchemas>;
declare const filesNode: FilesSchemas['plugin']['AnyNode'];

function filesComponent<Schema extends Schemas<FilesConfig>>(
  runtime: Stately<Schema>,
  node: Schema['plugin']['AnyNode'],
) {
  // @ts-expect-error Verify that only the expected keys exist
  const doesNotExist = runtime.plugins.something?.isPrimitive(node);

  return runtime.plugins.core.isPrimitiveNode(node);
}

const filesComponentResult = filesComponent(filesRuntime, filesNode);
type ComponentRenders = typeof filesComponentResult extends boolean ? true : false;

type Checks = AssertTrue<
  ConfigExtendsCore extends true
    ? HasEntityNode extends true
      ? HasFileNode extends true
        ? ComponentRenders extends true
          ? true
          : false
        : false
      : false
    : false
>;

export type DefineConfigAssertions = Checks;
