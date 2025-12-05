// Auto-generated at build time from openapi.json
// DO NOT EDIT MANUALLY - run 'npm run generate-schemas' to regenerate

export const PARSED_SCHEMAS = {
  "ApiError": {
    "description": "Standard error shape returned by handlers",
    "nodeType": "object",
    "properties": {
      "error": {
        "nodeType": "primitive",
        "primitiveType": "string"
      },
      "status": {
        "format": "int32",
        "nodeType": "primitive",
        "primitiveType": "integer"
      }
    },
    "required": [
      "error",
      "status"
    ]
  },
  "BackendMetadata": {
    "description": "Static metadata describing a backend connection.\n\nA backend is the underlying implementation of a connector/connection. For this reason, the\nbackend provides its capabilities, kind, and catalog.",
    "nodeType": "object",
    "properties": {
      "capabilities": {
        "description": "A list of capabilities the connector supports.",
        "items": {
          "nodeType": "enum",
          "description": "Capabilities a connector can expose to the viewer.",
          "values": [
            "execute_sql",
            "list"
          ]
        },
        "nodeType": "array"
      },
      "kind": {
        "nodeType": "untaggedEnum",
        "description": "The types of connectors supported",
        "variants": [
          {
            "schema": null,
            "tag": "object_store"
          },
          {
            "schema": null,
            "tag": "database"
          },
          {
            "schema": {
              "nodeType": "primitive",
              "primitiveType": "string"
            },
            "tag": "other"
          }
        ]
      }
    },
    "required": [
      "kind",
      "capabilities"
    ]
  },
  "Capability": {
    "nodeType": "enum",
    "description": "Capabilities a connector can expose to the viewer.",
    "values": [
      "execute_sql",
      "list"
    ]
  },
  "ConnectionDetailsRequest": {
    "description": "Request for multiple connection details",
    "nodeType": "object",
    "properties": {
      "connectors": {
        "description": "IDs -> searches of each connector to list",
        "nodeType": "map",
        "valueSchema": {
          "nodeType": "object",
          "description": "Query param for searching connections",
          "properties": {
            "search": {
              "innerSchema": {
                "nodeType": "primitive",
                "primitiveType": "string"
              },
              "nodeType": "nullable"
            }
          },
          "required": []
        }
      },
      "fail_on_error": {
        "description": "Whether one failure should fail the entire request",
        "nodeType": "primitive",
        "primitiveType": "boolean"
      }
    },
    "required": [
      "connectors"
    ]
  },
  "ConnectionDetailsResponse": {
    "description": "Response to execute a SQL query",
    "nodeType": "object",
    "properties": {
      "connections": {
        "description": "IDs -> `ListSummary` of each connector to list",
        "nodeType": "map",
        "valueSchema": {
          "nodeType": "taggedUnion",
          "description": "Summaries provided by listing",
          "discriminator": "type",
          "variants": [
            {
              "schema": {
                "nodeType": "object",
                "properties": {
                  "summary": {
                    "items": {
                      "nodeType": "primitive",
                      "primitiveType": "string"
                    },
                    "nodeType": "array"
                  }
                },
                "required": [
                  "summary"
                ]
              },
              "tag": "databases"
            },
            {
              "schema": {
                "nodeType": "object",
                "properties": {
                  "summary": {
                    "items": {
                      "nodeType": "object",
                      "description": "Lightweight description of a table/file exposed by a connector.",
                      "properties": {
                        "name": {
                          "nodeType": "primitive",
                          "primitiveType": "string"
                        },
                        "rows": {
                          "innerSchema": {
                            "format": "int64",
                            "nodeType": "primitive",
                            "primitiveType": "integer"
                          },
                          "nodeType": "nullable"
                        },
                        "size_bytes": {
                          "innerSchema": {
                            "format": "int64",
                            "nodeType": "primitive",
                            "primitiveType": "integer"
                          },
                          "nodeType": "nullable"
                        }
                      },
                      "required": [
                        "name"
                      ]
                    },
                    "nodeType": "array"
                  }
                },
                "required": [
                  "summary"
                ]
              },
              "tag": "tables"
            },
            {
              "schema": {
                "nodeType": "object",
                "properties": {
                  "summary": {
                    "items": {
                      "nodeType": "primitive",
                      "primitiveType": "string"
                    },
                    "nodeType": "array"
                  }
                },
                "required": [
                  "summary"
                ]
              },
              "tag": "paths"
            },
            {
              "schema": {
                "nodeType": "object",
                "properties": {
                  "summary": {
                    "items": {
                      "nodeType": "object",
                      "description": "Lightweight description of a table/file exposed by a connector.",
                      "properties": {
                        "name": {
                          "nodeType": "primitive",
                          "primitiveType": "string"
                        },
                        "rows": {
                          "innerSchema": {
                            "format": "int64",
                            "nodeType": "primitive",
                            "primitiveType": "integer"
                          },
                          "nodeType": "nullable"
                        },
                        "size_bytes": {
                          "innerSchema": {
                            "format": "int64",
                            "nodeType": "primitive",
                            "primitiveType": "integer"
                          },
                          "nodeType": "nullable"
                        }
                      },
                      "required": [
                        "name"
                      ]
                    },
                    "nodeType": "array"
                  }
                },
                "required": [
                  "summary"
                ]
              },
              "tag": "files"
            }
          ]
        }
      }
    },
    "required": [
      "connections"
    ]
  },
  "ConnectionKind": {
    "nodeType": "untaggedEnum",
    "description": "The types of connectors supported",
    "variants": [
      {
        "schema": null,
        "tag": "object_store"
      },
      {
        "schema": null,
        "tag": "database"
      },
      {
        "schema": {
          "nodeType": "primitive",
          "primitiveType": "string"
        },
        "tag": "other"
      }
    ]
  },
  "ConnectionMetadata": {
    "description": "Runtime metadata describing a connector instance.\n\nA connection refers to a connector in the context of the underlying query engine.",
    "nodeType": "object",
    "properties": {
      "catalog": {
        "description": "The datafusion catalog the connector is registered in.",
        "innerSchema": {
          "description": "The datafusion catalog the connector is registered in.",
          "nodeType": "primitive",
          "primitiveType": "string"
        },
        "nodeType": "nullable"
      },
      "id": {
        "nodeType": "primitive",
        "primitiveType": "string"
      },
      "metadata": {
        "description": "Static metadata describing a backend connection.\n\nA backend is the underlying implementation of a connector/connection. For this reason, the\nbackend provides its capabilities, kind, and catalog.",
        "nodeType": "object",
        "properties": {
          "capabilities": {
            "description": "A list of capabilities the connector supports.",
            "items": {
              "nodeType": "enum",
              "description": "Capabilities a connector can expose to the viewer.",
              "values": [
                "execute_sql",
                "list"
              ]
            },
            "nodeType": "array"
          },
          "kind": {
            "nodeType": "untaggedEnum",
            "description": "The types of connectors supported",
            "variants": [
              {
                "schema": null,
                "tag": "object_store"
              },
              {
                "schema": null,
                "tag": "database"
              },
              {
                "schema": {
                  "nodeType": "primitive",
                  "primitiveType": "string"
                },
                "tag": "other"
              }
            ]
          }
        },
        "required": [
          "kind",
          "capabilities"
        ]
      },
      "name": {
        "nodeType": "primitive",
        "primitiveType": "string"
      }
    },
    "required": [
      "id",
      "name",
      "metadata"
    ]
  },
  "ConnectionSearchQuery": {
    "nodeType": "object",
    "description": "Query param for searching connections",
    "properties": {
      "search": {
        "innerSchema": {
          "nodeType": "primitive",
          "primitiveType": "string"
        },
        "nodeType": "nullable"
      }
    },
    "required": []
  },
  "ListSummary": {
    "nodeType": "taggedUnion",
    "description": "Summaries provided by listing",
    "discriminator": "type",
    "variants": [
      {
        "schema": {
          "nodeType": "object",
          "properties": {
            "summary": {
              "items": {
                "nodeType": "primitive",
                "primitiveType": "string"
              },
              "nodeType": "array"
            }
          },
          "required": [
            "summary"
          ]
        },
        "tag": "databases"
      },
      {
        "schema": {
          "nodeType": "object",
          "properties": {
            "summary": {
              "items": {
                "nodeType": "object",
                "description": "Lightweight description of a table/file exposed by a connector.",
                "properties": {
                  "name": {
                    "nodeType": "primitive",
                    "primitiveType": "string"
                  },
                  "rows": {
                    "innerSchema": {
                      "format": "int64",
                      "nodeType": "primitive",
                      "primitiveType": "integer"
                    },
                    "nodeType": "nullable"
                  },
                  "size_bytes": {
                    "innerSchema": {
                      "format": "int64",
                      "nodeType": "primitive",
                      "primitiveType": "integer"
                    },
                    "nodeType": "nullable"
                  }
                },
                "required": [
                  "name"
                ]
              },
              "nodeType": "array"
            }
          },
          "required": [
            "summary"
          ]
        },
        "tag": "tables"
      },
      {
        "schema": {
          "nodeType": "object",
          "properties": {
            "summary": {
              "items": {
                "nodeType": "primitive",
                "primitiveType": "string"
              },
              "nodeType": "array"
            }
          },
          "required": [
            "summary"
          ]
        },
        "tag": "paths"
      },
      {
        "schema": {
          "nodeType": "object",
          "properties": {
            "summary": {
              "items": {
                "nodeType": "object",
                "description": "Lightweight description of a table/file exposed by a connector.",
                "properties": {
                  "name": {
                    "nodeType": "primitive",
                    "primitiveType": "string"
                  },
                  "rows": {
                    "innerSchema": {
                      "format": "int64",
                      "nodeType": "primitive",
                      "primitiveType": "integer"
                    },
                    "nodeType": "nullable"
                  },
                  "size_bytes": {
                    "innerSchema": {
                      "format": "int64",
                      "nodeType": "primitive",
                      "primitiveType": "integer"
                    },
                    "nodeType": "nullable"
                  }
                },
                "required": [
                  "name"
                ]
              },
              "nodeType": "array"
            }
          },
          "required": [
            "summary"
          ]
        },
        "tag": "files"
      }
    ]
  },
  "QueryRequest": {
    "description": "Request to execute a SQL query",
    "nodeType": "object",
    "properties": {
      "connector_id": {
        "description": "ID of the connector to use",
        "innerSchema": {
          "description": "ID of the connector to use",
          "nodeType": "primitive",
          "primitiveType": "string"
        },
        "nodeType": "nullable"
      },
      "sql": {
        "description": "SQL query to execute (can use URL tables like `s3://bucket/path/*.parquet`)",
        "nodeType": "primitive",
        "primitiveType": "string"
      }
    },
    "required": [
      "sql"
    ]
  },
  "SessionCapability": {
    "description": "Session capabilities a `QuerySession` can expose to the `QueryContext`.",
    "nodeType": "enum",
    "values": [
      "execute_without_connector"
    ]
  },
  "String": {
    "nodeType": "primitive",
    "primitiveType": "string"
  },
  "TableSummary": {
    "nodeType": "object",
    "description": "Lightweight description of a table/file exposed by a connector.",
    "properties": {
      "name": {
        "nodeType": "primitive",
        "primitiveType": "string"
      },
      "rows": {
        "innerSchema": {
          "format": "int64",
          "nodeType": "primitive",
          "primitiveType": "integer"
        },
        "nodeType": "nullable"
      },
      "size_bytes": {
        "innerSchema": {
          "format": "int64",
          "nodeType": "primitive",
          "primitiveType": "integer"
        },
        "nodeType": "nullable"
      }
    },
    "required": [
      "name"
    ]
  }
} as const;

export type ParsedSchemaName = keyof typeof PARSED_SCHEMAS;
