import type { CodegenPlugin, CodegenPluginContext } from '@statelyjs/stately/codegen';
import { FilesNodeType } from './schema.js';

const REQUIRED_DIRS = ['cache', 'data', 'upload'];

const deref = (schema: any, pluginCtx: CodegenPluginContext) => {
  if (!schema) return null;
  if (schema.$ref) return pluginCtx.resolveRef(schema.$ref) ?? null;
  return schema;
};

const hasDirPathShape = (schema: any) => {
  if (!schema?.properties) return false;
  const dir = schema.properties.dir;
  const path = schema.properties.path;
  return (
    dir?.enum &&
    Array.isArray(dir.enum) &&
    dir.enum.length > 0 &&
    path &&
    Array.isArray(schema.required) &&
    schema.required.includes('dir') &&
    schema.required.includes('path')
  );
};

const extractDirValues = (variants: any[]): string[] =>
  variants
    .map((variant: any) => {
      const value = variant?.properties?.dir?.enum?.[0];
      return typeof value === 'string' ? value.toLowerCase() : '';
    })
    .filter(Boolean);

const isRelativePathObject = (schema: any, ctx: CodegenPluginContext) => {
  const resolved = deref(schema, ctx);
  if (!resolved?.oneOf || resolved.oneOf.length !== REQUIRED_DIRS.length) return false;
  const variants = resolved.oneOf.map((variant: any) => deref(variant, ctx)).filter(Boolean);
  if (variants.length !== REQUIRED_DIRS.length) return false;
  if (!variants.every(hasDirPathShape)) return false;
  const dirValues = extractDirValues(variants);
  return REQUIRED_DIRS.every(dir => dirValues.includes(dir));
};

const isUserDefinedPathUnion = (schema: any, ctx: CodegenPluginContext) => {
  const resolved = deref(schema, ctx);
  if (!resolved?.oneOf || resolved.oneOf.length !== 2) return false;
  const variants = resolved.oneOf.map((variant: any) => deref(variant, ctx)).filter(Boolean);
  if (variants.length !== 2) return false;
  const hasStringVariant = variants.some((variant: any) => variant?.type === 'string');
  const relativeVariant = variants.find((variant: any) => isRelativePathObject(variant, ctx));
  return Boolean(hasStringVariant && relativeVariant);
};

export const filesCodegenPlugin: CodegenPlugin = {
  description: 'Detects RelativePath nodes emitted by @statelyjs/files',
  match(schema) {
    return Boolean(schema?.oneOf);
  },
  name: 'stately-files-relative-path',
  transform(schema, ctx) {
    if (isRelativePathObject(schema, ctx) || isUserDefinedPathUnion(schema, ctx)) {
      return { description: schema?.description, nodeType: FilesNodeType.RelativePath };
    }
    return null;
  },
};

export default filesCodegenPlugin;
