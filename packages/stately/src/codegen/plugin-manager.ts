import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

export type SerializedNode = any;

export interface CodegenPluginContext {
  schemaName?: string;
  resolveRef: (ref: string) => any | undefined;
  parseSchema: (schema: any, schemaName?: string) => SerializedNode | null;
}

/**
 * OpenAPI specification structure (minimal typing for plugin use)
 */
export interface OpenAPISpec {
  components?: { schemas?: Record<string, any> };
  [key: string]: any;
}

export interface CodegenPlugin {
  name: string;
  description?: string;
  /**
   * Optional function to declare entry point schemas for code splitting.
   * Entry points are parsed into the main bundle; schemas reached only
   * through recursion are split into a runtime bundle for lazy loading.
   *
   * If not provided or returns undefined/empty, all schemas are bundled together.
   *
   * @param spec - The full OpenAPI specification
   * @returns Array of schema names to use as entry points
   */
  entryPoints?: (spec: OpenAPISpec) => string[] | undefined;
  match?: (schema: any, ctx: CodegenPluginContext) => boolean;
  transform: (schema: any, ctx: CodegenPluginContext) => SerializedNode | null | undefined;
}

let activePlugins: CodegenPlugin[] = [];

export function setCodegenPlugins(plugins: CodegenPlugin[]) {
  activePlugins = plugins;
}

export function getCodegenPlugins(): CodegenPlugin[] {
  return activePlugins;
}

export async function loadPluginsFromConfig(configPath?: string): Promise<CodegenPlugin[]> {
  if (!configPath) return [];
  const resolved = path.resolve(process.cwd(), configPath);
  if (!fs.existsSync(resolved)) {
    console.warn(`[@statelyjs/codegen] Plugin config not found at ${resolved}`);
    return [];
  }

  try {
    const moduleUrl = pathToFileURL(resolved).href;
    const imported = await import(moduleUrl);
    const candidates = normalizeCandidate(imported?.default).concat(
      normalizeCandidate(imported?.plugins),
      normalizeCandidate(imported?.codegenPlugins),
    );
    const plugins = candidates.filter(isCodegenPlugin);
    if (!plugins.length) {
      console.warn('[@statelyjs/codegen] No plugins exported from config');
    }
    return plugins;
  } catch (error) {
    console.error('[@statelyjs/codegen] Failed to load plugin config:', error);
    return [];
  }
}

function normalizeCandidate(value: unknown): CodegenPlugin[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap(normalizeCandidate);
  }
  return [value as CodegenPlugin];
}

function isCodegenPlugin(candidate: unknown): candidate is CodegenPlugin {
  return (
    typeof candidate === 'object' &&
    candidate !== null &&
    typeof (candidate as CodegenPlugin).name === 'string' &&
    typeof (candidate as CodegenPlugin).transform === 'function'
  );
}
