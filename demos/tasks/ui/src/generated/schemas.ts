// Auto-generated at build time from openapi.json
// DO NOT EDIT MANUALLY - run 'stately generate' to regenerate

export const PARSED_SCHEMAS = {
  "Task": {
    "description": "A dispatched task",
    "keys": [
      "description",
      "name",
      "status"
    ],
    "nodeType": "object",
    "properties": {
      "description": {
        "description": "The description of the task",
        "innerSchema": {
          "description": "The description of the task",
          "nodeType": "primitive",
          "primitiveType": "string"
        },
        "nodeType": "nullable"
      },
      "name": {
        "description": "The name of the task",
        "nodeType": "primitive",
        "primitiveType": "string"
      },
      "status": {
        "nodeType": "enum",
        "description": "The status of a task",
        "values": [
          "Pending",
          "InProgress",
          "Complete"
        ]
      }
    },
    "required": [
      "name",
      "status"
    ]
  },
  "StateEntry": {
    "nodeType": "enum",
    "values": [
      "task"
    ]
  }
} as const;

export type ParsedSchema = typeof PARSED_SCHEMAS;
