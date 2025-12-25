// Auto-generated at build time from openapi.json
// DO NOT EDIT MANUALLY - run 'stately generate' to regenerate

export const PARSED_SCHEMAS = {
  "Task": {
    "description": "A task in our application",
    "keys": [
      "assigned_to",
      "description",
      "name",
      "status"
    ],
    "nodeType": "object",
    "properties": {
      "assigned_to": {
        "innerSchema": {
          "nodeType": "link",
          "description": "Reference configuration either by ID or inline, with entity type metadata",
          "inlineSchema": {
            "nodeType": "object",
            "description": "A user in our application",
            "keys": [
              "name",
              "status",
              "title"
            ],
            "properties": {
              "name": {
                "nodeType": "primitive",
                "primitiveType": "string"
              },
              "status": {
                "nodeType": "enum",
                "description": "A user's status",
                "values": [
                  "Working",
                  "PTO",
                  "OOO",
                  "Absent"
                ]
              },
              "title": {
                "innerSchema": {
                  "nodeType": "primitive",
                  "primitiveType": "string"
                },
                "nodeType": "nullable"
              }
            },
            "required": [
              "name"
            ]
          },
          "targetType": "user"
        },
        "nodeType": "nullable"
      },
      "description": {
        "innerSchema": {
          "nodeType": "primitive",
          "primitiveType": "string"
        },
        "nodeType": "nullable"
      },
      "name": {
        "nodeType": "primitive",
        "primitiveType": "string"
      },
      "status": {
        "nodeType": "enum",
        "description": "A task's status",
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
  "User": {
    "nodeType": "object",
    "description": "A user in our application",
    "keys": [
      "name",
      "status",
      "title"
    ],
    "properties": {
      "name": {
        "nodeType": "primitive",
        "primitiveType": "string"
      },
      "status": {
        "nodeType": "enum",
        "description": "A user's status",
        "values": [
          "Working",
          "PTO",
          "OOO",
          "Absent"
        ]
      },
      "title": {
        "innerSchema": {
          "nodeType": "primitive",
          "primitiveType": "string"
        },
        "nodeType": "nullable"
      }
    },
    "required": [
      "name"
    ]
  },
  "StateEntry": {
    "nodeType": "enum",
    "values": [
      "task",
      "user"
    ]
  }
} as const;

export type ParsedSchema = typeof PARSED_SCHEMAS;
