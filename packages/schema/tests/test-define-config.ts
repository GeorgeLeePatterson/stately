import type { DefineComponents, DefineGeneratedNodes, DefinePaths } from '../src/generated.js';
import type { DefineConfig, Schemas } from '../src/index.js';
import type { CoreStatelyConfig } from '../src/core/generated.js';
import type { ObjectNode } from '../src/core/nodes.js';
import type { Stately } from '../src/stately.js';

type FilesComponents = DefineComponents<{
  schemas: {
    FileEntity: {
      id: string;
      name: string;
    };
  };
}>;

type FilesPaths = DefinePaths<{
  '/files': {
    get: {
      responses: {
        200: {
          content: {
            'application/json': Array<{ id: string }>;
          };
        };
      };
    };
  };
}>;

type FilesNodes = DefineGeneratedNodes<{
  FileEntity: ObjectNode<CoreStatelyConfig>;
}>;

type FilesConfig = DefineConfig<FilesComponents, FilesPaths, FilesNodes>;

type FilesSchemas = Schemas<FilesConfig>;

type HasEntityNode = 'Entity' extends keyof FilesSchemas['config']['nodes'] ? true : false;
type HasFileNode = 'FileEntity' extends keyof FilesSchemas['config']['nodes'] ? true : false;
type ConfigExtendsCore = FilesConfig extends CoreStatelyConfig ? true : false;

declare const filesRuntime: Stately<FilesSchemas>;
declare const filesNode: FilesSchemas['plugin']['AnyNode'];

function filesComponent<Schema extends Schemas<FilesConfig>>(
  runtime: Stately<Schema>,
  node: Schema['plugin']['AnyNode'],
) {
  return runtime.plugins.core.isPrimitive(node);
}

const filesComponentResult = filesComponent(filesRuntime, filesNode);
type ComponentRenders = typeof filesComponentResult extends boolean ? true : false;

type AssertTrue<T extends true> = T;

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
