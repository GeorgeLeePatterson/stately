// biome-ignore-all lint/correctness/noUnusedVariables: type-level test file
// biome-ignore-all lint/correctness/noUnusedFunctionParameters: type-level test file
/**
 * Tests plugin augmentation patterns - verifies that plugin authors can:
 * 1. Create their own DefinePlugin with custom nodes
 * 2. Compose multiple augments together
 * 3. Access nodes from different plugins
 * 4. Extend core with additional node types
 *
 * Run: npx tsc --noEmit tests/test-plugin-augmentation.ts
 */
import type { CoreStatelyConfig } from '../src/core/generated.js';
import type { AssertTrue } from '../src/helpers.js';
import type {
  DefineGeneratedNodes,
  PluginNodes,
  PluginNodeTypes,
  PluginNodeUnion,
  Schemas,
} from '../src/index.js';
import type { DefineNodeMap, DefinePlugin } from '../src/plugin.js';
import { isNodeOfType, type StatelySchemas } from '../src/schema.js';

/**
 * =============================================================================
 * MOCK PLUGIN: Files Plugin
 * =============================================================================
 * Simulates a plugin that adds file-related node types
 */

type FileNode = { nodeType: 'file'; path: string; mimeType?: string };

type DirectoryNode = { nodeType: 'directory'; path: string; children: string[] };

type FilesNodeMap = { file: FileNode; directory: DirectoryNode };

type FilesAugment = DefinePlugin<'files', FilesNodeMap>;

/**
 * =============================================================================
 * MOCK PLUGIN: Workflow Plugin
 * =============================================================================
 * Simulates a plugin that adds workflow-related node types
 */

type ActionNode = { nodeType: 'action'; actionType: string; config: Record<string, unknown> };

type TriggerNode = { nodeType: 'trigger'; event: string; conditions: unknown[] };

type WorkflowNodeMap = { action: ActionNode; trigger: TriggerNode };

type WorkflowAugment = DefinePlugin<'workflow', WorkflowNodeMap>;

/**
 * =============================================================================
 * USER SCHEMA WITH MULTIPLE PLUGINS
 * =============================================================================
 */

type TestNode = { nodeType: 'test' };
const TestNode: TestNode = { nodeType: 'test' };
type TestNodeMap = DefineNodeMap<{ test: TestNode }>;

type X = TestNodeMap['unknown'];
type XXX = X extends { nodeType: 'unknown' } ? X : never;

type TestConfig = CoreStatelyConfig<
  CoreStatelyConfig['components'],
  CoreStatelyConfig['paths'],
  DefineGeneratedNodes<{ TestNode: { nodeType: 'test' } }>
>;

type Y = TestConfig['nodes']['TestNode'];
const YYY: TestNodeMap['test'] = { nodeType: 'test' };
const YYYY: TestNodeMap['unknown'] = { nodeType: 'unknown' };

// User composes core + files + workflow plugins
type MultiPluginSchemas = Schemas<TestConfig, readonly [FilesAugment, WorkflowAugment]>;

type MultiPluginSchemasBase = StatelySchemas<TestConfig, readonly []>;

type Z = MultiPluginSchemas['generated']['AnyNode'];
type ZZ = MultiPluginSchemas['generated']['Nodes'];
type ZZZZ = MultiPluginSchemas['generated']['Nodes']['TestNode'];
type ZZZZZ = MultiPluginSchemas['generated']['NodeNames'];
type ZZZZZZ = MultiPluginSchemas['generated']['NodeTypes'];

type Z_ = MultiPluginSchemas['plugin']['AnyNode'];
type ZZ_ = MultiPluginSchemas['plugin']['Nodes'];
type ZZZ_ = MultiPluginSchemas['plugin']['Nodes']['unknown'];
type ZZZZ_ = MultiPluginSchemas['plugin']['Nodes']['trigger'];
type ZZZZZ_ = MultiPluginSchemas['plugin']['NodeNames'];
type ZZZZZZ_ = MultiPluginSchemas['plugin']['NodeTypes'];

const Z_: Z_ = { nodeType: 'unknown' };
const ZZZZZ__: ZZZZZ_ = 'trigger'; // NodeName
const ZZZZZZ_: ZZZZZZ_ = 'unknown';
const ZZZZZZ__: ZZZZZZ_ = 'trigger';

type z = MultiPluginSchemasBase['generated']['AnyNode'];
type zzz = MultiPluginSchemasBase['generated']['Nodes']['TestNode'];
type zzzz = MultiPluginSchemasBase['generated']['NodeNames'];
type zzzzz = MultiPluginSchemasBase['generated']['NodeTypes'];

type z_ = MultiPluginSchemasBase['plugin']['AnyNode'];
type zz_ = MultiPluginSchemasBase['plugin']['Nodes']['unknown'];
type zzz_ = MultiPluginSchemasBase['plugin']['Nodes'];
type zzzz_ = MultiPluginSchemasBase['plugin']['NodeNames'];
type zzzzz_ = MultiPluginSchemasBase['plugin']['NodeTypes'];

// Extract plugin nodes - should include core + files + workflow
type AllPluginNodes = PluginNodes<MultiPluginSchemas>;
type AllNodeUnion = PluginNodeUnion<MultiPluginSchemas>;
type AllNodeTypes = PluginNodeTypes<MultiPluginSchemas>;

/**
 * =============================================================================
 * TESTS: Plugin node access
 * =============================================================================
 */

// Test: Can access core nodes
type CoreObjectNode = AllPluginNodes['object'];
type CorePrimitiveNode = AllPluginNodes['primitive'];

// Test: Can access files plugin nodes
type FilesFileNode = AllPluginNodes['file'];
type FilesDirectoryNode = AllPluginNodes['directory'];

// Test: Can access workflow plugin nodes
type WorkflowActionNode = AllPluginNodes['action'];
type WorkflowTriggerNode = AllPluginNodes['trigger'];
type UnknownBaseNode = AllPluginNodes['unknown'];

// Test: Node type union includes all plugins
type NodeTypeIncludes = {
  hasCore: 'object' extends AllNodeTypes ? true : false;
  hasFiles: 'file' extends AllNodeTypes ? true : false;
  hasWorkflow: 'action' extends AllNodeTypes ? true : false;
  hasUnknown: 'unknown' extends AllNodeTypes ? true : false;
};

type CorePrimitiveNodeIsPrimitive = AssertTrue<
  CorePrimitiveNode extends { nodeType: 'primitive' } ? true : false
>;
type FilesDirectoryNodeShape = AssertTrue<
  FilesDirectoryNode extends { nodeType: 'directory' } ? true : false
>;
type WorkflowTriggerNodeShape = AssertTrue<
  WorkflowTriggerNode extends { nodeType: 'trigger' } ? true : false
>;
type UnknownNodeShape = AssertTrue<UnknownBaseNode extends { nodeType: 'unknown' } ? true : false>;

type AllPluginsPresent = AssertTrue<
  NodeTypeIncludes['hasCore'] extends true
    ? NodeTypeIncludes['hasFiles'] extends true
      ? NodeTypeIncludes['hasWorkflow'] extends true
        ? NodeTypeIncludes['hasUnknown'] extends true
          ? true
          : false
        : false
      : false
    : false
>;

/**
 * =============================================================================
 * TESTS: Type guard with multi-plugin setup
 * =============================================================================
 */

function processMultiPluginNode(schema: AllNodeUnion): string {
  // Test: Can narrow to core node
  if (isNodeOfType<MultiPluginSchemas, 'object'>(schema, 'object')) {
    return `core object with ${Object.keys(schema.properties).length} properties`;
  }

  // Test: Can narrow to files plugin node
  if (isNodeOfType<MultiPluginSchemas, 'file'>(schema, 'file')) {
    return `file at ${schema.path}${schema.mimeType ? ` (${schema.mimeType})` : ''}`;
  }

  // Test: Can narrow to workflow plugin node
  if (isNodeOfType<MultiPluginSchemas, 'action'>(schema, 'action')) {
    return `action: ${schema.actionType}`;
  }

  return 'unknown node type';
}

/**
 * =============================================================================
 * TESTS: Augment data/types/utils merging
 * =============================================================================
 */

type FilesData = { fileRegistry: Map<string, string> };
type FilesTypes = { FileMetadata: { size: number; created: Date } };
type FilesUtils = { resolveFilePath: (path: string) => string };

type FilesAugmentWithExtras = DefinePlugin<
  'files',
  FilesNodeMap,
  FilesTypes,
  FilesData,
  FilesUtils
>;

type SchemasWithExtras = Schemas<TestConfig, readonly [FilesAugmentWithExtras]>;

// Test: Can access plugin data/types/utils
type ExtractedData = SchemasWithExtras['data'];
type ExtractedTypes = SchemasWithExtras['types'];
type ExtractedUtils = SchemasWithExtras['utils'];

// Verify they contain the plugin's additions
type HasFileRegistry = 'fileRegistry' extends keyof ExtractedData ? true : false;
type HasFileMetadata = 'FileMetadata' extends keyof ExtractedTypes ? true : false;
type HasFilesUtils = 'files' extends keyof ExtractedUtils ? true : false;

type AllExtrasPresent = AssertTrue<
  HasFileRegistry extends true
    ? HasFileMetadata extends true
      ? HasFilesUtils extends true
        ? true
        : false
      : false
    : false
>;

export const augmentationTests = { processMultiPluginNode } satisfies Record<string, unknown>;

export type AugmentationAssertions = {
  allPluginsPresent: AllPluginsPresent;
  allExtrasPresent: AllExtrasPresent;
  // Type-level verification
  coreNodes: CoreObjectNode;
  filesNodes: FilesFileNode;
  workflowNodes: WorkflowActionNode;
  corePrimitiveShape: CorePrimitiveNodeIsPrimitive;
  filesDirectoryShape: FilesDirectoryNodeShape;
  workflowTriggerShape: WorkflowTriggerNodeShape;
  unknownShape: UnknownNodeShape;
};
