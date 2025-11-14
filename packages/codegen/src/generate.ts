/**
 * Build-time schema generator (ported from xeo4)
 *
 * Parses all OpenAPI schemas and serializes them to a TypeScript file.
 * Handles circular references by converting them to RecursiveRef nodes.
 *
 * WARNING: This logic is VERY BRITTLE. Any changes risk breaking schema parsing.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { CoreNodeType } from "@stately/schema/core/nodes";
import openapiTS, { astToString } from "openapi-typescript";
import { createCoreCodegenPlugin } from "./core/index.js";
import {
  getCodegenPlugins,
  loadPluginsFromConfig,
  setCodegenPlugins,
  type CodegenPluginContext,
} from "./plugin-manager.js";

// Accept paths as arguments (will be called by CLI)
const openapiPath = process.argv[2];
const outputPath = process.argv[3];
const pluginConfigPath = process.argv[4];

if (!openapiPath || !outputPath) {
  console.error(
    "Usage: node generate.js <openapi.json> <output.ts> [pluginConfig.js]",
  );
  process.exit(1);
}

type SerializedNode = any;

async function main() {
  const resolvedOpenapiPath = openapiPath!;
  const resolvedOutputPath = outputPath!;
  const userPlugins = await loadPluginsFromConfig(pluginConfigPath);
  if (userPlugins.length) {
    console.log(`🔌 Loaded ${userPlugins.length} stately-codegen plugin(s)`);
  }
  const plugins = [...userPlugins, createCoreCodegenPlugin()];
  setCodegenPlugins(plugins);

  const openapi = JSON.parse(fs.readFileSync(resolvedOpenapiPath, "utf-8"));

  console.log("🔧 Generating schemas from openapi.json...");

  const schemaCache = new Map<
    string,
    {
      node: SerializedNode | null;
      state: "uninitialized" | "parsing" | "complete";
    }
  >();
  const componentSchemas = openapi.components?.schemas || {};

  for (const schemaName in componentSchemas) {
    schemaCache.set(`#/components/schemas/${schemaName}`, {
      node: null,
      state: "uninitialized",
    });
  }

  console.log(
    `📋 Found ${Object.keys(componentSchemas).length} component schemas`,
  );

  const parsedSchemas: Record<string, SerializedNode> = {};

  function resolveRef(ref: string): any {
    const schemaName = ref.split("/").pop();
    return schemaName ? componentSchemas[schemaName] : null;
  }

  const basePluginContext: Omit<CodegenPluginContext, "schemaName"> = {
    resolveRef,
    parseSchema: (schema: any, schemaName?: string) =>
      parseSchema(schema, schemaName),
  };

  function parseSchema(
    schema: any,
    schemaName?: string,
  ): SerializedNode | null {
    if (!schema) return null;

    // Handle $ref resolution with cycle detection
    if (schema.$ref) {
      const cached = schemaCache.get(schema.$ref);

      if (cached?.state === "parsing") {
        // Circular reference detected!
        console.log(`  🔄 Circular reference detected: ${schema.$ref}`);
        return {
          nodeType: CoreNodeType.RecursiveRef,
          refName: schema.$ref.split("/").pop() || "",
          description: schema.description,
        };
      }

      if (cached?.state === "complete") {
        return cached.node;
      }

      const resolved = resolveRef(schema.$ref);
      if (!resolved) return null;

      // Mark as parsing and create placeholder
      if (cached) {
        cached.state = "parsing";
        const placeholder: any = { nodeType: null };
        cached.node = placeholder;

        const parsed = parseSchema(resolved, schemaName);

        if (parsed) {
          Object.assign(placeholder, parsed);
        }

        cached.state = "complete";
        return cached.node;
      }

      return parseSchema(resolved, schemaName);
    }

    // Handle nullable via type array (e.g., type: ["string", "null"])
    const pluginContext: CodegenPluginContext = {
      schemaName,
      ...basePluginContext,
    };
    for (const plugin of getCodegenPlugins()) {
      try {
        const matches = plugin.match
          ? plugin.match(schema, pluginContext)
          : true;
        if (!matches) continue;
        const result = plugin.transform(schema, pluginContext);
        if (result) {
          return result;
        }
      } catch (error) {
        console.warn(
          `[stately-codegen] Plugin "${plugin.name}" failed:`,
          error,
        );
      }
    }

    return null;
  }

  // Parse all component schemas
  for (const [schemaName, schema] of Object.entries(componentSchemas)) {
    try {
      console.log(`  📝 Parsing ${schemaName}...`);
      const refName = `#/components/schemas/${schemaName}`;

      const cached = schemaCache.get(refName);
      if (cached?.state === "complete" && cached.node) {
        parsedSchemas[schemaName] = cached.node;
        continue;
      }

      const parsed = parseSchema(schema, schemaName);
      if (parsed) {
        parsedSchemas[schemaName] = parsed;

        const cacheEntry = schemaCache.get(refName);
        if (cacheEntry) {
          cacheEntry.node = parsed;
          cacheEntry.state = "complete";
        }
      } else {
        console.warn(`  ⚠️  Failed to parse ${schemaName}`);
      }
    } catch (err) {
      console.error(`  ❌ Error parsing ${schemaName}:`, err);
    }
  }

  console.log(`✅ Parsed ${Object.keys(parsedSchemas).length} schemas`);

  const output = `// Auto-generated at build time from openapi.json
// DO NOT EDIT MANUALLY - run 'npm run generate-schemas' to regenerate

export const PARSED_SCHEMAS = ${JSON.stringify(parsedSchemas, null, 2)} as const;

export type ParsedSchemaName = keyof typeof PARSED_SCHEMAS;
`;

  fs.writeFileSync(resolvedOutputPath, output);

  console.log(`💾 Written to ${resolvedOutputPath}`);

  // Generate TypeScript types using openapi-typescript
  console.log("🔧 Generating TypeScript types from OpenAPI spec...");

  const outputDir = path.dirname(resolvedOutputPath);
  const typesOutputPath = path.join(outputDir, "generated-types.ts");

  try {
    // openapiTS returns a TypeScript AST, convert it to a string
    const ast = await openapiTS(new URL(`file://${path.resolve(resolvedOpenapiPath)}`));
    const typesString = astToString(ast);

    const typesFileContent = `// Auto-generated at build time from openapi.json
// DO NOT EDIT MANUALLY - run 'npm run generate-schemas' to regenerate

${typesString}
`;

    fs.writeFileSync(typesOutputPath, typesFileContent);
    console.log(`💾 Written types to ${typesOutputPath}`);
  } catch (error) {
    console.error("❌ Failed to generate TypeScript types:", error);
    console.error("Error details:", error);
    throw error;
  }

  console.log("✨ Schema generation complete!");
}

main().catch((error) => {
  console.error("[stately-codegen] generation failed:", error);
  process.exit(1);
});
