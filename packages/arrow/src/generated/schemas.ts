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
  "ClickHouseCompression": {
    "description": "Compression options for `ClickHouse` tables.",
    "nodeType": "enum",
    "values": [
      "none",
      "lz4",
      "zstd"
    ]
  },
  "ClickHouseConfig": {
    "description": "Additional ClickHouse-specific configuration.",
    "nodeType": "object",
    "properties": {
      "compression": {
        "innerSchema": {
          "description": "Compression options for `ClickHouse` tables.",
          "nodeType": "enum",
          "values": [
            "none",
            "lz4",
            "zstd"
          ]
        },
        "nodeType": "nullable"
      },
      "settings": {
        "nodeType": "map",
        "valueSchema": {
          "nodeType": "primitive",
          "primitiveType": "string"
        }
      }
    },
    "required": []
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
  "ConnectionOptions": {
    "description": "Common connection options shared by database connectors.",
    "nodeType": "object",
    "properties": {
      "check": {
        "description": "Whether the connector should validate connections before use",
        "nodeType": "primitive",
        "primitiveType": "boolean"
      },
      "endpoint": {
        "description": "Endpoint, url, or path to the database",
        "nodeType": "primitive",
        "primitiveType": "string"
      },
      "password": {
        "description": "Optional password for the database",
        "nodeType": "primitive",
        "primitiveType": "string"
      },
      "tls": {
        "innerSchema": {
          "nodeType": "object",
          "description": "TLS options for databases that require secure connections.",
          "properties": {
            "cafile": {
              "innerSchema": {
                "nodeType": "primitive",
                "primitiveType": "string"
              },
              "nodeType": "nullable"
            },
            "domain": {
              "innerSchema": {
                "nodeType": "primitive",
                "primitiveType": "string"
              },
              "nodeType": "nullable"
            },
            "enable": {
              "nodeType": "primitive",
              "primitiveType": "boolean"
            }
          },
          "required": []
        },
        "nodeType": "nullable"
      },
      "username": {
        "description": "Username used to connect to the database",
        "nodeType": "primitive",
        "primitiveType": "string"
      }
    },
    "required": [
      "endpoint",
      "username"
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
  "Connector": {
    "description": "Connector Stately `entity` type.\n\nUse this with [`Connectors`] and [`Registry`] to create a turnkey connector registry.",
    "nodeType": "object",
    "properties": {
      "config": {
        "nodeType": "untaggedEnum",
        "variants": [
          {
            "schema": {
              "nodeType": "object",
              "description": "Configuration for an object store-backed connector.",
              "properties": {
                "format": {
                  "nodeType": "untaggedEnum",
                  "description": "Supported file formats for object-store connectors.",
                  "variants": [
                    {
                      "schema": {
                        "description": "Apache Parquet format with optional key/value overrides.",
                        "innerSchema": {
                          "description": "Apache Parquet format with optional key/value overrides.",
                          "nodeType": "map",
                          "valueSchema": {
                            "nodeType": "primitive",
                            "primitiveType": "string"
                          }
                        },
                        "nodeType": "nullable"
                      },
                      "tag": "parquet"
                    }
                  ]
                },
                "store": {
                  "nodeType": "untaggedEnum",
                  "description": "Supported object store providers.",
                  "variants": [
                    {
                      "schema": {
                        "nodeType": "object",
                        "description": "Provider-agnostic object store settings.",
                        "properties": {
                          "bucket": {
                            "description": "*Required* bucket name (or base directory for local stores).",
                            "nodeType": "primitive",
                            "primitiveType": "string"
                          },
                          "from_env": {
                            "description": "Whether credentials should be resolved from environment variables.",
                            "nodeType": "primitive",
                            "primitiveType": "boolean"
                          },
                          "options": {
                            "description": "Additional provider-specific configuration parameters.",
                            "nodeType": "map",
                            "valueSchema": {
                              "nodeType": "primitive",
                              "primitiveType": "string"
                            }
                          }
                        },
                        "required": [
                          "bucket"
                        ]
                      },
                      "tag": "aws"
                    },
                    {
                      "schema": {
                        "nodeType": "object",
                        "description": "Provider-agnostic object store settings.",
                        "properties": {
                          "bucket": {
                            "description": "*Required* bucket name (or base directory for local stores).",
                            "nodeType": "primitive",
                            "primitiveType": "string"
                          },
                          "from_env": {
                            "description": "Whether credentials should be resolved from environment variables.",
                            "nodeType": "primitive",
                            "primitiveType": "boolean"
                          },
                          "options": {
                            "description": "Additional provider-specific configuration parameters.",
                            "nodeType": "map",
                            "valueSchema": {
                              "nodeType": "primitive",
                              "primitiveType": "string"
                            }
                          }
                        },
                        "required": [
                          "bucket"
                        ]
                      },
                      "tag": "gcp"
                    },
                    {
                      "schema": {
                        "nodeType": "object",
                        "description": "Provider-agnostic object store settings.",
                        "properties": {
                          "bucket": {
                            "description": "*Required* bucket name (or base directory for local stores).",
                            "nodeType": "primitive",
                            "primitiveType": "string"
                          },
                          "from_env": {
                            "description": "Whether credentials should be resolved from environment variables.",
                            "nodeType": "primitive",
                            "primitiveType": "boolean"
                          },
                          "options": {
                            "description": "Additional provider-specific configuration parameters.",
                            "nodeType": "map",
                            "valueSchema": {
                              "nodeType": "primitive",
                              "primitiveType": "string"
                            }
                          }
                        },
                        "required": [
                          "bucket"
                        ]
                      },
                      "tag": "azure"
                    },
                    {
                      "schema": {
                        "nodeType": "object",
                        "description": "Provider-agnostic object store settings.",
                        "properties": {
                          "bucket": {
                            "description": "*Required* bucket name (or base directory for local stores).",
                            "nodeType": "primitive",
                            "primitiveType": "string"
                          },
                          "from_env": {
                            "description": "Whether credentials should be resolved from environment variables.",
                            "nodeType": "primitive",
                            "primitiveType": "boolean"
                          },
                          "options": {
                            "description": "Additional provider-specific configuration parameters.",
                            "nodeType": "map",
                            "valueSchema": {
                              "nodeType": "primitive",
                              "primitiveType": "string"
                            }
                          }
                        },
                        "required": [
                          "bucket"
                        ]
                      },
                      "tag": "local"
                    }
                  ]
                }
              },
              "required": []
            },
            "tag": "object_store"
          },
          {
            "schema": {
              "nodeType": "object",
              "description": "Configuration for database-backed connectors.",
              "properties": {
                "driver": {
                  "nodeType": "untaggedEnum",
                  "description": "Supported databases for the default backend lineup.\n\nDefault implementations will be provided and over time the list will grow. For that reason, this\nenum is marked as `non_exhaustive`.",
                  "variants": [
                    {
                      "schema": {
                        "innerSchema": {
                          "description": "Additional ClickHouse-specific configuration.",
                          "nodeType": "object",
                          "properties": {
                            "compression": {
                              "innerSchema": {
                                "description": "Compression options for `ClickHouse` tables.",
                                "nodeType": "enum",
                                "values": [
                                  "none",
                                  "lz4",
                                  "zstd"
                                ]
                              },
                              "nodeType": "nullable"
                            },
                            "settings": {
                              "nodeType": "map",
                              "valueSchema": {
                                "nodeType": "primitive",
                                "primitiveType": "string"
                              }
                            }
                          },
                          "required": []
                        },
                        "nodeType": "nullable"
                      },
                      "tag": "click_house"
                    }
                  ]
                },
                "options": {
                  "description": "Common connection options shared by database connectors.",
                  "nodeType": "object",
                  "properties": {
                    "check": {
                      "description": "Whether the connector should validate connections before use",
                      "nodeType": "primitive",
                      "primitiveType": "boolean"
                    },
                    "endpoint": {
                      "description": "Endpoint, url, or path to the database",
                      "nodeType": "primitive",
                      "primitiveType": "string"
                    },
                    "password": {
                      "description": "Optional password for the database",
                      "nodeType": "primitive",
                      "primitiveType": "string"
                    },
                    "tls": {
                      "innerSchema": {
                        "nodeType": "object",
                        "description": "TLS options for databases that require secure connections.",
                        "properties": {
                          "cafile": {
                            "innerSchema": {
                              "nodeType": "primitive",
                              "primitiveType": "string"
                            },
                            "nodeType": "nullable"
                          },
                          "domain": {
                            "innerSchema": {
                              "nodeType": "primitive",
                              "primitiveType": "string"
                            },
                            "nodeType": "nullable"
                          },
                          "enable": {
                            "nodeType": "primitive",
                            "primitiveType": "boolean"
                          }
                        },
                        "required": []
                      },
                      "nodeType": "nullable"
                    },
                    "username": {
                      "description": "Username used to connect to the database",
                      "nodeType": "primitive",
                      "primitiveType": "string"
                    }
                  },
                  "required": [
                    "endpoint",
                    "username"
                  ]
                },
                "pool": {
                  "nodeType": "object",
                  "description": "Common configuration options shared across connector types.",
                  "properties": {
                    "connect_timeout": {
                      "innerSchema": {
                        "format": "int32",
                        "nodeType": "primitive",
                        "primitiveType": "integer"
                      },
                      "nodeType": "nullable"
                    },
                    "pool_size": {
                      "description": "Configure the maximum number of connections to the database. Note, not all connectors\nsupport pools.",
                      "innerSchema": {
                        "description": "Configure the maximum number of connections to the database. Note, not all connectors\nsupport pools.",
                        "format": "int32",
                        "nodeType": "primitive",
                        "primitiveType": "integer"
                      },
                      "nodeType": "nullable"
                    },
                    "transaction_timeout": {
                      "innerSchema": {
                        "format": "int32",
                        "nodeType": "primitive",
                        "primitiveType": "integer"
                      },
                      "nodeType": "nullable"
                    }
                  },
                  "required": []
                }
              },
              "required": [
                "options",
                "driver"
              ]
            },
            "tag": "database"
          }
        ]
      },
      "name": {
        "description": "Human-readable name for this connection.",
        "nodeType": "primitive",
        "primitiveType": "string"
      }
    },
    "required": [
      "config"
    ]
  },
  "ConnectorType": {
    "nodeType": "untaggedEnum",
    "variants": [
      {
        "schema": {
          "nodeType": "object",
          "description": "Configuration for an object store-backed connector.",
          "properties": {
            "format": {
              "nodeType": "untaggedEnum",
              "description": "Supported file formats for object-store connectors.",
              "variants": [
                {
                  "schema": {
                    "description": "Apache Parquet format with optional key/value overrides.",
                    "innerSchema": {
                      "description": "Apache Parquet format with optional key/value overrides.",
                      "nodeType": "map",
                      "valueSchema": {
                        "nodeType": "primitive",
                        "primitiveType": "string"
                      }
                    },
                    "nodeType": "nullable"
                  },
                  "tag": "parquet"
                }
              ]
            },
            "store": {
              "nodeType": "untaggedEnum",
              "description": "Supported object store providers.",
              "variants": [
                {
                  "schema": {
                    "nodeType": "object",
                    "description": "Provider-agnostic object store settings.",
                    "properties": {
                      "bucket": {
                        "description": "*Required* bucket name (or base directory for local stores).",
                        "nodeType": "primitive",
                        "primitiveType": "string"
                      },
                      "from_env": {
                        "description": "Whether credentials should be resolved from environment variables.",
                        "nodeType": "primitive",
                        "primitiveType": "boolean"
                      },
                      "options": {
                        "description": "Additional provider-specific configuration parameters.",
                        "nodeType": "map",
                        "valueSchema": {
                          "nodeType": "primitive",
                          "primitiveType": "string"
                        }
                      }
                    },
                    "required": [
                      "bucket"
                    ]
                  },
                  "tag": "aws"
                },
                {
                  "schema": {
                    "nodeType": "object",
                    "description": "Provider-agnostic object store settings.",
                    "properties": {
                      "bucket": {
                        "description": "*Required* bucket name (or base directory for local stores).",
                        "nodeType": "primitive",
                        "primitiveType": "string"
                      },
                      "from_env": {
                        "description": "Whether credentials should be resolved from environment variables.",
                        "nodeType": "primitive",
                        "primitiveType": "boolean"
                      },
                      "options": {
                        "description": "Additional provider-specific configuration parameters.",
                        "nodeType": "map",
                        "valueSchema": {
                          "nodeType": "primitive",
                          "primitiveType": "string"
                        }
                      }
                    },
                    "required": [
                      "bucket"
                    ]
                  },
                  "tag": "gcp"
                },
                {
                  "schema": {
                    "nodeType": "object",
                    "description": "Provider-agnostic object store settings.",
                    "properties": {
                      "bucket": {
                        "description": "*Required* bucket name (or base directory for local stores).",
                        "nodeType": "primitive",
                        "primitiveType": "string"
                      },
                      "from_env": {
                        "description": "Whether credentials should be resolved from environment variables.",
                        "nodeType": "primitive",
                        "primitiveType": "boolean"
                      },
                      "options": {
                        "description": "Additional provider-specific configuration parameters.",
                        "nodeType": "map",
                        "valueSchema": {
                          "nodeType": "primitive",
                          "primitiveType": "string"
                        }
                      }
                    },
                    "required": [
                      "bucket"
                    ]
                  },
                  "tag": "azure"
                },
                {
                  "schema": {
                    "nodeType": "object",
                    "description": "Provider-agnostic object store settings.",
                    "properties": {
                      "bucket": {
                        "description": "*Required* bucket name (or base directory for local stores).",
                        "nodeType": "primitive",
                        "primitiveType": "string"
                      },
                      "from_env": {
                        "description": "Whether credentials should be resolved from environment variables.",
                        "nodeType": "primitive",
                        "primitiveType": "boolean"
                      },
                      "options": {
                        "description": "Additional provider-specific configuration parameters.",
                        "nodeType": "map",
                        "valueSchema": {
                          "nodeType": "primitive",
                          "primitiveType": "string"
                        }
                      }
                    },
                    "required": [
                      "bucket"
                    ]
                  },
                  "tag": "local"
                }
              ]
            }
          },
          "required": []
        },
        "tag": "object_store"
      },
      {
        "schema": {
          "nodeType": "object",
          "description": "Configuration for database-backed connectors.",
          "properties": {
            "driver": {
              "nodeType": "untaggedEnum",
              "description": "Supported databases for the default backend lineup.\n\nDefault implementations will be provided and over time the list will grow. For that reason, this\nenum is marked as `non_exhaustive`.",
              "variants": [
                {
                  "schema": {
                    "innerSchema": {
                      "description": "Additional ClickHouse-specific configuration.",
                      "nodeType": "object",
                      "properties": {
                        "compression": {
                          "innerSchema": {
                            "description": "Compression options for `ClickHouse` tables.",
                            "nodeType": "enum",
                            "values": [
                              "none",
                              "lz4",
                              "zstd"
                            ]
                          },
                          "nodeType": "nullable"
                        },
                        "settings": {
                          "nodeType": "map",
                          "valueSchema": {
                            "nodeType": "primitive",
                            "primitiveType": "string"
                          }
                        }
                      },
                      "required": []
                    },
                    "nodeType": "nullable"
                  },
                  "tag": "click_house"
                }
              ]
            },
            "options": {
              "description": "Common connection options shared by database connectors.",
              "nodeType": "object",
              "properties": {
                "check": {
                  "description": "Whether the connector should validate connections before use",
                  "nodeType": "primitive",
                  "primitiveType": "boolean"
                },
                "endpoint": {
                  "description": "Endpoint, url, or path to the database",
                  "nodeType": "primitive",
                  "primitiveType": "string"
                },
                "password": {
                  "description": "Optional password for the database",
                  "nodeType": "primitive",
                  "primitiveType": "string"
                },
                "tls": {
                  "innerSchema": {
                    "nodeType": "object",
                    "description": "TLS options for databases that require secure connections.",
                    "properties": {
                      "cafile": {
                        "innerSchema": {
                          "nodeType": "primitive",
                          "primitiveType": "string"
                        },
                        "nodeType": "nullable"
                      },
                      "domain": {
                        "innerSchema": {
                          "nodeType": "primitive",
                          "primitiveType": "string"
                        },
                        "nodeType": "nullable"
                      },
                      "enable": {
                        "nodeType": "primitive",
                        "primitiveType": "boolean"
                      }
                    },
                    "required": []
                  },
                  "nodeType": "nullable"
                },
                "username": {
                  "description": "Username used to connect to the database",
                  "nodeType": "primitive",
                  "primitiveType": "string"
                }
              },
              "required": [
                "endpoint",
                "username"
              ]
            },
            "pool": {
              "nodeType": "object",
              "description": "Common configuration options shared across connector types.",
              "properties": {
                "connect_timeout": {
                  "innerSchema": {
                    "format": "int32",
                    "nodeType": "primitive",
                    "primitiveType": "integer"
                  },
                  "nodeType": "nullable"
                },
                "pool_size": {
                  "description": "Configure the maximum number of connections to the database. Note, not all connectors\nsupport pools.",
                  "innerSchema": {
                    "description": "Configure the maximum number of connections to the database. Note, not all connectors\nsupport pools.",
                    "format": "int32",
                    "nodeType": "primitive",
                    "primitiveType": "integer"
                  },
                  "nodeType": "nullable"
                },
                "transaction_timeout": {
                  "innerSchema": {
                    "format": "int32",
                    "nodeType": "primitive",
                    "primitiveType": "integer"
                  },
                  "nodeType": "nullable"
                }
              },
              "required": []
            }
          },
          "required": [
            "options",
            "driver"
          ]
        },
        "tag": "database"
      }
    ]
  },
  "Database": {
    "nodeType": "untaggedEnum",
    "description": "Supported databases for the default backend lineup.\n\nDefault implementations will be provided and over time the list will grow. For that reason, this\nenum is marked as `non_exhaustive`.",
    "variants": [
      {
        "schema": {
          "innerSchema": {
            "description": "Additional ClickHouse-specific configuration.",
            "nodeType": "object",
            "properties": {
              "compression": {
                "innerSchema": {
                  "description": "Compression options for `ClickHouse` tables.",
                  "nodeType": "enum",
                  "values": [
                    "none",
                    "lz4",
                    "zstd"
                  ]
                },
                "nodeType": "nullable"
              },
              "settings": {
                "nodeType": "map",
                "valueSchema": {
                  "nodeType": "primitive",
                  "primitiveType": "string"
                }
              }
            },
            "required": []
          },
          "nodeType": "nullable"
        },
        "tag": "click_house"
      }
    ]
  },
  "DatabaseConfiguration": {
    "nodeType": "object",
    "description": "Configuration for database-backed connectors.",
    "properties": {
      "driver": {
        "nodeType": "untaggedEnum",
        "description": "Supported databases for the default backend lineup.\n\nDefault implementations will be provided and over time the list will grow. For that reason, this\nenum is marked as `non_exhaustive`.",
        "variants": [
          {
            "schema": {
              "innerSchema": {
                "description": "Additional ClickHouse-specific configuration.",
                "nodeType": "object",
                "properties": {
                  "compression": {
                    "innerSchema": {
                      "description": "Compression options for `ClickHouse` tables.",
                      "nodeType": "enum",
                      "values": [
                        "none",
                        "lz4",
                        "zstd"
                      ]
                    },
                    "nodeType": "nullable"
                  },
                  "settings": {
                    "nodeType": "map",
                    "valueSchema": {
                      "nodeType": "primitive",
                      "primitiveType": "string"
                    }
                  }
                },
                "required": []
              },
              "nodeType": "nullable"
            },
            "tag": "click_house"
          }
        ]
      },
      "options": {
        "description": "Common connection options shared by database connectors.",
        "nodeType": "object",
        "properties": {
          "check": {
            "description": "Whether the connector should validate connections before use",
            "nodeType": "primitive",
            "primitiveType": "boolean"
          },
          "endpoint": {
            "description": "Endpoint, url, or path to the database",
            "nodeType": "primitive",
            "primitiveType": "string"
          },
          "password": {
            "description": "Optional password for the database",
            "nodeType": "primitive",
            "primitiveType": "string"
          },
          "tls": {
            "innerSchema": {
              "nodeType": "object",
              "description": "TLS options for databases that require secure connections.",
              "properties": {
                "cafile": {
                  "innerSchema": {
                    "nodeType": "primitive",
                    "primitiveType": "string"
                  },
                  "nodeType": "nullable"
                },
                "domain": {
                  "innerSchema": {
                    "nodeType": "primitive",
                    "primitiveType": "string"
                  },
                  "nodeType": "nullable"
                },
                "enable": {
                  "nodeType": "primitive",
                  "primitiveType": "boolean"
                }
              },
              "required": []
            },
            "nodeType": "nullable"
          },
          "username": {
            "description": "Username used to connect to the database",
            "nodeType": "primitive",
            "primitiveType": "string"
          }
        },
        "required": [
          "endpoint",
          "username"
        ]
      },
      "pool": {
        "nodeType": "object",
        "description": "Common configuration options shared across connector types.",
        "properties": {
          "connect_timeout": {
            "innerSchema": {
              "format": "int32",
              "nodeType": "primitive",
              "primitiveType": "integer"
            },
            "nodeType": "nullable"
          },
          "pool_size": {
            "description": "Configure the maximum number of connections to the database. Note, not all connectors\nsupport pools.",
            "innerSchema": {
              "description": "Configure the maximum number of connections to the database. Note, not all connectors\nsupport pools.",
              "format": "int32",
              "nodeType": "primitive",
              "primitiveType": "integer"
            },
            "nodeType": "nullable"
          },
          "transaction_timeout": {
            "innerSchema": {
              "format": "int32",
              "nodeType": "primitive",
              "primitiveType": "integer"
            },
            "nodeType": "nullable"
          }
        },
        "required": []
      }
    },
    "required": [
      "options",
      "driver"
    ]
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
  "ObjectStore": {
    "nodeType": "untaggedEnum",
    "description": "Supported object store providers.",
    "variants": [
      {
        "schema": {
          "nodeType": "object",
          "description": "Provider-agnostic object store settings.",
          "properties": {
            "bucket": {
              "description": "*Required* bucket name (or base directory for local stores).",
              "nodeType": "primitive",
              "primitiveType": "string"
            },
            "from_env": {
              "description": "Whether credentials should be resolved from environment variables.",
              "nodeType": "primitive",
              "primitiveType": "boolean"
            },
            "options": {
              "description": "Additional provider-specific configuration parameters.",
              "nodeType": "map",
              "valueSchema": {
                "nodeType": "primitive",
                "primitiveType": "string"
              }
            }
          },
          "required": [
            "bucket"
          ]
        },
        "tag": "aws"
      },
      {
        "schema": {
          "nodeType": "object",
          "description": "Provider-agnostic object store settings.",
          "properties": {
            "bucket": {
              "description": "*Required* bucket name (or base directory for local stores).",
              "nodeType": "primitive",
              "primitiveType": "string"
            },
            "from_env": {
              "description": "Whether credentials should be resolved from environment variables.",
              "nodeType": "primitive",
              "primitiveType": "boolean"
            },
            "options": {
              "description": "Additional provider-specific configuration parameters.",
              "nodeType": "map",
              "valueSchema": {
                "nodeType": "primitive",
                "primitiveType": "string"
              }
            }
          },
          "required": [
            "bucket"
          ]
        },
        "tag": "gcp"
      },
      {
        "schema": {
          "nodeType": "object",
          "description": "Provider-agnostic object store settings.",
          "properties": {
            "bucket": {
              "description": "*Required* bucket name (or base directory for local stores).",
              "nodeType": "primitive",
              "primitiveType": "string"
            },
            "from_env": {
              "description": "Whether credentials should be resolved from environment variables.",
              "nodeType": "primitive",
              "primitiveType": "boolean"
            },
            "options": {
              "description": "Additional provider-specific configuration parameters.",
              "nodeType": "map",
              "valueSchema": {
                "nodeType": "primitive",
                "primitiveType": "string"
              }
            }
          },
          "required": [
            "bucket"
          ]
        },
        "tag": "azure"
      },
      {
        "schema": {
          "nodeType": "object",
          "description": "Provider-agnostic object store settings.",
          "properties": {
            "bucket": {
              "description": "*Required* bucket name (or base directory for local stores).",
              "nodeType": "primitive",
              "primitiveType": "string"
            },
            "from_env": {
              "description": "Whether credentials should be resolved from environment variables.",
              "nodeType": "primitive",
              "primitiveType": "boolean"
            },
            "options": {
              "description": "Additional provider-specific configuration parameters.",
              "nodeType": "map",
              "valueSchema": {
                "nodeType": "primitive",
                "primitiveType": "string"
              }
            }
          },
          "required": [
            "bucket"
          ]
        },
        "tag": "local"
      }
    ]
  },
  "ObjectStoreConfiguration": {
    "nodeType": "object",
    "description": "Configuration for an object store-backed connector.",
    "properties": {
      "format": {
        "nodeType": "untaggedEnum",
        "description": "Supported file formats for object-store connectors.",
        "variants": [
          {
            "schema": {
              "description": "Apache Parquet format with optional key/value overrides.",
              "innerSchema": {
                "description": "Apache Parquet format with optional key/value overrides.",
                "nodeType": "map",
                "valueSchema": {
                  "nodeType": "primitive",
                  "primitiveType": "string"
                }
              },
              "nodeType": "nullable"
            },
            "tag": "parquet"
          }
        ]
      },
      "store": {
        "nodeType": "untaggedEnum",
        "description": "Supported object store providers.",
        "variants": [
          {
            "schema": {
              "nodeType": "object",
              "description": "Provider-agnostic object store settings.",
              "properties": {
                "bucket": {
                  "description": "*Required* bucket name (or base directory for local stores).",
                  "nodeType": "primitive",
                  "primitiveType": "string"
                },
                "from_env": {
                  "description": "Whether credentials should be resolved from environment variables.",
                  "nodeType": "primitive",
                  "primitiveType": "boolean"
                },
                "options": {
                  "description": "Additional provider-specific configuration parameters.",
                  "nodeType": "map",
                  "valueSchema": {
                    "nodeType": "primitive",
                    "primitiveType": "string"
                  }
                }
              },
              "required": [
                "bucket"
              ]
            },
            "tag": "aws"
          },
          {
            "schema": {
              "nodeType": "object",
              "description": "Provider-agnostic object store settings.",
              "properties": {
                "bucket": {
                  "description": "*Required* bucket name (or base directory for local stores).",
                  "nodeType": "primitive",
                  "primitiveType": "string"
                },
                "from_env": {
                  "description": "Whether credentials should be resolved from environment variables.",
                  "nodeType": "primitive",
                  "primitiveType": "boolean"
                },
                "options": {
                  "description": "Additional provider-specific configuration parameters.",
                  "nodeType": "map",
                  "valueSchema": {
                    "nodeType": "primitive",
                    "primitiveType": "string"
                  }
                }
              },
              "required": [
                "bucket"
              ]
            },
            "tag": "gcp"
          },
          {
            "schema": {
              "nodeType": "object",
              "description": "Provider-agnostic object store settings.",
              "properties": {
                "bucket": {
                  "description": "*Required* bucket name (or base directory for local stores).",
                  "nodeType": "primitive",
                  "primitiveType": "string"
                },
                "from_env": {
                  "description": "Whether credentials should be resolved from environment variables.",
                  "nodeType": "primitive",
                  "primitiveType": "boolean"
                },
                "options": {
                  "description": "Additional provider-specific configuration parameters.",
                  "nodeType": "map",
                  "valueSchema": {
                    "nodeType": "primitive",
                    "primitiveType": "string"
                  }
                }
              },
              "required": [
                "bucket"
              ]
            },
            "tag": "azure"
          },
          {
            "schema": {
              "nodeType": "object",
              "description": "Provider-agnostic object store settings.",
              "properties": {
                "bucket": {
                  "description": "*Required* bucket name (or base directory for local stores).",
                  "nodeType": "primitive",
                  "primitiveType": "string"
                },
                "from_env": {
                  "description": "Whether credentials should be resolved from environment variables.",
                  "nodeType": "primitive",
                  "primitiveType": "boolean"
                },
                "options": {
                  "description": "Additional provider-specific configuration parameters.",
                  "nodeType": "map",
                  "valueSchema": {
                    "nodeType": "primitive",
                    "primitiveType": "string"
                  }
                }
              },
              "required": [
                "bucket"
              ]
            },
            "tag": "local"
          }
        ]
      }
    },
    "required": []
  },
  "ObjectStoreFormat": {
    "nodeType": "untaggedEnum",
    "description": "Supported file formats for object-store connectors.",
    "variants": [
      {
        "schema": {
          "description": "Apache Parquet format with optional key/value overrides.",
          "innerSchema": {
            "description": "Apache Parquet format with optional key/value overrides.",
            "nodeType": "map",
            "valueSchema": {
              "nodeType": "primitive",
              "primitiveType": "string"
            }
          },
          "nodeType": "nullable"
        },
        "tag": "parquet"
      }
    ]
  },
  "ObjectStoreOptions": {
    "nodeType": "object",
    "description": "Provider-agnostic object store settings.",
    "properties": {
      "bucket": {
        "description": "*Required* bucket name (or base directory for local stores).",
        "nodeType": "primitive",
        "primitiveType": "string"
      },
      "from_env": {
        "description": "Whether credentials should be resolved from environment variables.",
        "nodeType": "primitive",
        "primitiveType": "boolean"
      },
      "options": {
        "description": "Additional provider-specific configuration parameters.",
        "nodeType": "map",
        "valueSchema": {
          "nodeType": "primitive",
          "primitiveType": "string"
        }
      }
    },
    "required": [
      "bucket"
    ]
  },
  "PoolOptions": {
    "nodeType": "object",
    "description": "Common configuration options shared across connector types.",
    "properties": {
      "connect_timeout": {
        "innerSchema": {
          "format": "int32",
          "nodeType": "primitive",
          "primitiveType": "integer"
        },
        "nodeType": "nullable"
      },
      "pool_size": {
        "description": "Configure the maximum number of connections to the database. Note, not all connectors\nsupport pools.",
        "innerSchema": {
          "description": "Configure the maximum number of connections to the database. Note, not all connectors\nsupport pools.",
          "format": "int32",
          "nodeType": "primitive",
          "primitiveType": "integer"
        },
        "nodeType": "nullable"
      },
      "transaction_timeout": {
        "innerSchema": {
          "format": "int32",
          "nodeType": "primitive",
          "primitiveType": "integer"
        },
        "nodeType": "nullable"
      }
    },
    "required": []
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
  "Secret": {
    "description": "Newtype to protect secrets from being logged\nA wrapper type for sensitive string data like passwords.\n\nThis type provides protection against accidental exposure of sensitive data\nin logs, debug output, or error messages. The inner value is not displayed\nin `Debug` implementations.\n\n# Example\n```\nuse stately_arrow::database::Secret;\n\nlet password = Secret::new(\"my_password\");\nprintln!(\"{password:?}\"); // Prints: Secret(*******)\n```",
    "nodeType": "primitive",
    "primitiveType": "string"
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
  },
  "TlsOptions": {
    "nodeType": "object",
    "description": "TLS options for databases that require secure connections.",
    "properties": {
      "cafile": {
        "innerSchema": {
          "nodeType": "primitive",
          "primitiveType": "string"
        },
        "nodeType": "nullable"
      },
      "domain": {
        "innerSchema": {
          "nodeType": "primitive",
          "primitiveType": "string"
        },
        "nodeType": "nullable"
      },
      "enable": {
        "nodeType": "primitive",
        "primitiveType": "boolean"
      }
    },
    "required": []
  }
} as const;

export type ParsedSchemaName = keyof typeof PARSED_SCHEMAS;
