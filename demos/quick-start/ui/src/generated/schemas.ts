// Auto-generated at build time from openapi.json
// DO NOT EDIT MANUALLY - run 'stately generate' to regenerate

export const PARSED_SCHEMAS = {
  "Example": {
    "description": "Example entity",
    "keys": [
      "count",
      "name"
    ],
    "nodeType": "object",
    "properties": {
      "count": {
        "description": "Example count",
        "nodeType": "primitive",
        "primitiveType": "integer"
      },
      "name": {
        "description": "Example name",
        "nodeType": "primitive",
        "primitiveType": "string"
      }
    },
    "required": [
      "name",
      "count"
    ]
  },
  "StateEntry": {
    "nodeType": "enum",
    "values": [
      "example"
    ]
  }
} as const;

export type ParsedSchema = typeof PARSED_SCHEMAS;
