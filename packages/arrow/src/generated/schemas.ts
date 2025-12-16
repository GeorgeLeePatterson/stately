// Auto-generated at build time from openapi.json
// DO NOT EDIT MANUALLY - run 'pnpx @statelyjs/codegen' to regenerate

export const PARSED_SCHEMAS = {
  "ApiError": {
    "description": "Standard error shape returned by handlers",
    "keys": [
      "error",
      "status"
    ],
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
    "description": "Static metadata describing a backend implementation.\n\nBackends provide this metadata to indicate their type and capabilities.\nUse the builder methods to construct instances.",
    "keys": [
      "capabilities",
      "kind"
    ],
    "nodeType": "object",
    "properties": {
      "capabilities": {
        "description": "Capabilities this backend supports.",
        "items": {
          "nodeType": "enum",
          "description": "Capabilities a connector can expose.",
          "values": [
            "execute_sql",
            "list"
          ]
        },
        "nodeType": "array"
      },
      "kind": {
        "nodeType": "untaggedEnum",
        "description": "The type of data source a connector connects to.",
        "keys": [
          "object_store",
          "database",
          "other"
        ],
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
              "description": "Custom connector type.",
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
    "description": "Capabilities a connector can expose.",
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
    "keys": [
      "compression",
      "settings"
    ],
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
    "description": "Request for fetching details from multiple connectors.",
    "keys": [
      "connectors",
      "fail_on_error"
    ],
    "nodeType": "object",
    "properties": {
      "connectors": {
        "description": "Map of connector IDs to their search parameters.",
        "nodeType": "map",
        "valueSchema": {
          "nodeType": "object",
          "description": "Query parameters for searching connection contents.",
          "keys": [
            "search"
          ],
          "properties": {
            "search": {
              "description": "Optional search term to filter results.",
              "innerSchema": {
                "description": "Optional search term to filter results.",
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
        "description": "If true, a failure in any connector fails the entire request.\nIf false (default), failures are skipped and successful results returned.",
        "nodeType": "primitive",
        "primitiveType": "boolean"
      }
    },
    "required": [
      "connectors"
    ]
  },
  "ConnectionDetailsResponse": {
    "description": "Response containing details from multiple connectors.",
    "keys": [
      "connections"
    ],
    "nodeType": "object",
    "properties": {
      "connections": {
        "description": "Map of connector IDs to their listing results.",
        "nodeType": "map",
        "valueSchema": {
          "nodeType": "taggedUnion",
          "description": "Summary of items available in a connector.\n\nThe variant indicates what type of items were found based on the connector\ntype and search context.",
          "discriminator": "type",
          "keys": [
            "type",
            "summary"
          ],
          "variants": [
            {
              "schema": {
                "keys": [
                  "summary"
                ],
                "nodeType": "object",
                "properties": {
                  "summary": {
                    "description": "List of database names (for database connectors at root level).",
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
                "keys": [
                  "summary"
                ],
                "nodeType": "object",
                "properties": {
                  "summary": {
                    "description": "List of tables with metadata (for database connectors within a database).",
                    "items": {
                      "nodeType": "object",
                      "description": "Summary information about a table or file.",
                      "keys": [
                        "name",
                        "rows",
                        "size_bytes"
                      ],
                      "properties": {
                        "name": {
                          "description": "Table or file name/path.",
                          "nodeType": "primitive",
                          "primitiveType": "string"
                        },
                        "rows": {
                          "description": "Number of rows (if known).",
                          "innerSchema": {
                            "description": "Number of rows (if known).",
                            "format": "int64",
                            "nodeType": "primitive",
                            "primitiveType": "integer"
                          },
                          "nodeType": "nullable"
                        },
                        "size_bytes": {
                          "description": "Size in bytes (if known).",
                          "innerSchema": {
                            "description": "Size in bytes (if known).",
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
                "keys": [
                  "summary"
                ],
                "nodeType": "object",
                "properties": {
                  "summary": {
                    "description": "List of path prefixes (for object store connectors at root level).",
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
                "keys": [
                  "summary"
                ],
                "nodeType": "object",
                "properties": {
                  "summary": {
                    "description": "List of files with metadata (for object store connectors within a path).",
                    "items": {
                      "nodeType": "object",
                      "description": "Summary information about a table or file.",
                      "keys": [
                        "name",
                        "rows",
                        "size_bytes"
                      ],
                      "properties": {
                        "name": {
                          "description": "Table or file name/path.",
                          "nodeType": "primitive",
                          "primitiveType": "string"
                        },
                        "rows": {
                          "description": "Number of rows (if known).",
                          "innerSchema": {
                            "description": "Number of rows (if known).",
                            "format": "int64",
                            "nodeType": "primitive",
                            "primitiveType": "integer"
                          },
                          "nodeType": "nullable"
                        },
                        "size_bytes": {
                          "description": "Size in bytes (if known).",
                          "innerSchema": {
                            "description": "Size in bytes (if known).",
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
    "description": "The type of data source a connector connects to.",
    "keys": [
      "object_store",
      "database",
      "other"
    ],
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
          "description": "Custom connector type.",
          "nodeType": "primitive",
          "primitiveType": "string"
        },
        "tag": "other"
      }
    ]
  },
  "ConnectionMetadata": {
    "description": "Runtime metadata describing a connector instance.\n\nThis combines the connector's identity with its backend metadata,\nincluding the `DataFusion` catalog it's registered under.",
    "keys": [
      "catalog",
      "id",
      "metadata",
      "name"
    ],
    "nodeType": "object",
    "properties": {
      "catalog": {
        "description": "The `DataFusion` catalog this connector is registered under.",
        "innerSchema": {
          "description": "The `DataFusion` catalog this connector is registered under.",
          "nodeType": "primitive",
          "primitiveType": "string"
        },
        "nodeType": "nullable"
      },
      "id": {
        "description": "Unique identifier for this connector.",
        "nodeType": "primitive",
        "primitiveType": "string"
      },
      "metadata": {
        "description": "Static metadata describing a backend implementation.\n\nBackends provide this metadata to indicate their type and capabilities.\nUse the builder methods to construct instances.",
        "keys": [
          "capabilities",
          "kind"
        ],
        "nodeType": "object",
        "properties": {
          "capabilities": {
            "description": "Capabilities this backend supports.",
            "items": {
              "nodeType": "enum",
              "description": "Capabilities a connector can expose.",
              "values": [
                "execute_sql",
                "list"
              ]
            },
            "nodeType": "array"
          },
          "kind": {
            "nodeType": "untaggedEnum",
            "description": "The type of data source a connector connects to.",
            "keys": [
              "object_store",
              "database",
              "other"
            ],
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
                  "description": "Custom connector type.",
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
        "description": "Human-readable name.",
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
    "keys": [
      "check",
      "endpoint",
      "password",
      "tls",
      "username"
    ],
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
          "keys": [
            "cafile",
            "domain",
            "enable"
          ],
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
    "description": "Query parameters for searching connection contents.",
    "keys": [
      "search"
    ],
    "properties": {
      "search": {
        "description": "Optional search term to filter results.",
        "innerSchema": {
          "description": "Optional search term to filter results.",
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
    "keys": [
      "config",
      "name"
    ],
    "nodeType": "object",
    "properties": {
      "config": {
        "nodeType": "untaggedEnum",
        "keys": [
          "object_store",
          "database"
        ],
        "variants": [
          {
            "schema": {
              "nodeType": "object",
              "description": "Configuration for an object store-backed connector.",
              "keys": [
                "format",
                "store"
              ],
              "properties": {
                "format": {
                  "nodeType": "untaggedEnum",
                  "description": "Supported file formats for object-store connectors.",
                  "keys": [
                    "parquet"
                  ],
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
                  "keys": [
                    "aws",
                    "gcp",
                    "azure",
                    "local"
                  ],
                  "variants": [
                    {
                      "schema": {
                        "nodeType": "object",
                        "description": "Provider-agnostic object store settings.",
                        "keys": [
                          "bucket",
                          "from_env",
                          "options"
                        ],
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
                        "keys": [
                          "bucket",
                          "from_env",
                          "options"
                        ],
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
                        "keys": [
                          "bucket",
                          "from_env",
                          "options"
                        ],
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
                        "keys": [
                          "bucket",
                          "from_env",
                          "options"
                        ],
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
              "keys": [
                "driver",
                "options",
                "pool"
              ],
              "properties": {
                "driver": {
                  "nodeType": "untaggedEnum",
                  "description": "Supported databases for the default backend lineup.\n\nDefault implementations will be provided and over time the list will grow. For that reason, this\nenum is marked as `non_exhaustive`.",
                  "keys": [
                    "clickhouse"
                  ],
                  "variants": [
                    {
                      "schema": {
                        "innerSchema": {
                          "description": "Additional ClickHouse-specific configuration.",
                          "keys": [
                            "compression",
                            "settings"
                          ],
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
                      "tag": "clickhouse"
                    }
                  ]
                },
                "options": {
                  "description": "Common connection options shared by database connectors.",
                  "keys": [
                    "check",
                    "endpoint",
                    "password",
                    "tls",
                    "username"
                  ],
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
                        "keys": [
                          "cafile",
                          "domain",
                          "enable"
                        ],
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
                  "keys": [
                    "connect_timeout",
                    "pool_size",
                    "transaction_timeout"
                  ],
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
    "keys": [
      "object_store",
      "database"
    ],
    "variants": [
      {
        "schema": {
          "nodeType": "object",
          "description": "Configuration for an object store-backed connector.",
          "keys": [
            "format",
            "store"
          ],
          "properties": {
            "format": {
              "nodeType": "untaggedEnum",
              "description": "Supported file formats for object-store connectors.",
              "keys": [
                "parquet"
              ],
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
              "keys": [
                "aws",
                "gcp",
                "azure",
                "local"
              ],
              "variants": [
                {
                  "schema": {
                    "nodeType": "object",
                    "description": "Provider-agnostic object store settings.",
                    "keys": [
                      "bucket",
                      "from_env",
                      "options"
                    ],
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
                    "keys": [
                      "bucket",
                      "from_env",
                      "options"
                    ],
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
                    "keys": [
                      "bucket",
                      "from_env",
                      "options"
                    ],
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
                    "keys": [
                      "bucket",
                      "from_env",
                      "options"
                    ],
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
          "keys": [
            "driver",
            "options",
            "pool"
          ],
          "properties": {
            "driver": {
              "nodeType": "untaggedEnum",
              "description": "Supported databases for the default backend lineup.\n\nDefault implementations will be provided and over time the list will grow. For that reason, this\nenum is marked as `non_exhaustive`.",
              "keys": [
                "clickhouse"
              ],
              "variants": [
                {
                  "schema": {
                    "innerSchema": {
                      "description": "Additional ClickHouse-specific configuration.",
                      "keys": [
                        "compression",
                        "settings"
                      ],
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
                  "tag": "clickhouse"
                }
              ]
            },
            "options": {
              "description": "Common connection options shared by database connectors.",
              "keys": [
                "check",
                "endpoint",
                "password",
                "tls",
                "username"
              ],
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
                    "keys": [
                      "cafile",
                      "domain",
                      "enable"
                    ],
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
              "keys": [
                "connect_timeout",
                "pool_size",
                "transaction_timeout"
              ],
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
    "keys": [
      "clickhouse"
    ],
    "variants": [
      {
        "schema": {
          "innerSchema": {
            "description": "Additional ClickHouse-specific configuration.",
            "keys": [
              "compression",
              "settings"
            ],
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
        "tag": "clickhouse"
      }
    ]
  },
  "DatabaseConfiguration": {
    "nodeType": "object",
    "description": "Configuration for database-backed connectors.",
    "keys": [
      "driver",
      "options",
      "pool"
    ],
    "properties": {
      "driver": {
        "nodeType": "untaggedEnum",
        "description": "Supported databases for the default backend lineup.\n\nDefault implementations will be provided and over time the list will grow. For that reason, this\nenum is marked as `non_exhaustive`.",
        "keys": [
          "clickhouse"
        ],
        "variants": [
          {
            "schema": {
              "innerSchema": {
                "description": "Additional ClickHouse-specific configuration.",
                "keys": [
                  "compression",
                  "settings"
                ],
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
            "tag": "clickhouse"
          }
        ]
      },
      "options": {
        "description": "Common connection options shared by database connectors.",
        "keys": [
          "check",
          "endpoint",
          "password",
          "tls",
          "username"
        ],
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
              "keys": [
                "cafile",
                "domain",
                "enable"
              ],
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
        "keys": [
          "connect_timeout",
          "pool_size",
          "transaction_timeout"
        ],
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
    "description": "Summary of items available in a connector.\n\nThe variant indicates what type of items were found based on the connector\ntype and search context.",
    "discriminator": "type",
    "keys": [
      "type",
      "summary"
    ],
    "variants": [
      {
        "schema": {
          "keys": [
            "summary"
          ],
          "nodeType": "object",
          "properties": {
            "summary": {
              "description": "List of database names (for database connectors at root level).",
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
          "keys": [
            "summary"
          ],
          "nodeType": "object",
          "properties": {
            "summary": {
              "description": "List of tables with metadata (for database connectors within a database).",
              "items": {
                "nodeType": "object",
                "description": "Summary information about a table or file.",
                "keys": [
                  "name",
                  "rows",
                  "size_bytes"
                ],
                "properties": {
                  "name": {
                    "description": "Table or file name/path.",
                    "nodeType": "primitive",
                    "primitiveType": "string"
                  },
                  "rows": {
                    "description": "Number of rows (if known).",
                    "innerSchema": {
                      "description": "Number of rows (if known).",
                      "format": "int64",
                      "nodeType": "primitive",
                      "primitiveType": "integer"
                    },
                    "nodeType": "nullable"
                  },
                  "size_bytes": {
                    "description": "Size in bytes (if known).",
                    "innerSchema": {
                      "description": "Size in bytes (if known).",
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
          "keys": [
            "summary"
          ],
          "nodeType": "object",
          "properties": {
            "summary": {
              "description": "List of path prefixes (for object store connectors at root level).",
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
          "keys": [
            "summary"
          ],
          "nodeType": "object",
          "properties": {
            "summary": {
              "description": "List of files with metadata (for object store connectors within a path).",
              "items": {
                "nodeType": "object",
                "description": "Summary information about a table or file.",
                "keys": [
                  "name",
                  "rows",
                  "size_bytes"
                ],
                "properties": {
                  "name": {
                    "description": "Table or file name/path.",
                    "nodeType": "primitive",
                    "primitiveType": "string"
                  },
                  "rows": {
                    "description": "Number of rows (if known).",
                    "innerSchema": {
                      "description": "Number of rows (if known).",
                      "format": "int64",
                      "nodeType": "primitive",
                      "primitiveType": "integer"
                    },
                    "nodeType": "nullable"
                  },
                  "size_bytes": {
                    "description": "Size in bytes (if known).",
                    "innerSchema": {
                      "description": "Size in bytes (if known).",
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
    "keys": [
      "aws",
      "gcp",
      "azure",
      "local"
    ],
    "variants": [
      {
        "schema": {
          "nodeType": "object",
          "description": "Provider-agnostic object store settings.",
          "keys": [
            "bucket",
            "from_env",
            "options"
          ],
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
          "keys": [
            "bucket",
            "from_env",
            "options"
          ],
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
          "keys": [
            "bucket",
            "from_env",
            "options"
          ],
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
          "keys": [
            "bucket",
            "from_env",
            "options"
          ],
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
    "keys": [
      "format",
      "store"
    ],
    "properties": {
      "format": {
        "nodeType": "untaggedEnum",
        "description": "Supported file formats for object-store connectors.",
        "keys": [
          "parquet"
        ],
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
        "keys": [
          "aws",
          "gcp",
          "azure",
          "local"
        ],
        "variants": [
          {
            "schema": {
              "nodeType": "object",
              "description": "Provider-agnostic object store settings.",
              "keys": [
                "bucket",
                "from_env",
                "options"
              ],
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
              "keys": [
                "bucket",
                "from_env",
                "options"
              ],
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
              "keys": [
                "bucket",
                "from_env",
                "options"
              ],
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
              "keys": [
                "bucket",
                "from_env",
                "options"
              ],
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
    "keys": [
      "parquet"
    ],
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
    "keys": [
      "bucket",
      "from_env",
      "options"
    ],
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
    "keys": [
      "connect_timeout",
      "pool_size",
      "transaction_timeout"
    ],
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
    "description": "Request to execute a SQL query.",
    "keys": [
      "connector_id",
      "sql"
    ],
    "nodeType": "object",
    "properties": {
      "connector_id": {
        "description": "ID of the connector to use. If not provided, the query runs against\nthe session's default catalog (if supported).",
        "innerSchema": {
          "description": "ID of the connector to use. If not provided, the query runs against\nthe session's default catalog (if supported).",
          "nodeType": "primitive",
          "primitiveType": "string"
        },
        "nodeType": "nullable"
      },
      "sql": {
        "description": "SQL query to execute. Supports URL tables like `s3://bucket/path/*.parquet`.",
        "nodeType": "primitive",
        "primitiveType": "string"
      }
    },
    "required": [
      "sql"
    ]
  },
  "RegistryOptions": {
    "description": "Generic registry options.\n\nProvided as a convenience if using state entity types directly, ie [`Connector`]",
    "keys": [
      "max_lifetime",
      "max_pool_size"
    ],
    "nodeType": "object",
    "properties": {
      "max_lifetime": {
        "description": "Set the maximum lifetime that a connection should be kept around for.",
        "innerSchema": {
          "description": "Set the maximum lifetime that a connection should be kept around for.",
          "format": "int64",
          "nodeType": "primitive",
          "primitiveType": "integer"
        },
        "nodeType": "nullable"
      },
      "max_pool_size": {
        "description": "Set the maximum size any connector will use for its pool. Set to 0 to disable pooling.",
        "innerSchema": {
          "description": "Set the maximum size any connector will use for its pool. Set to 0 to disable pooling.",
          "format": "int32",
          "nodeType": "primitive",
          "primitiveType": "integer"
        },
        "nodeType": "nullable"
      }
    },
    "required": []
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
    "description": "Summary information about a table or file.",
    "keys": [
      "name",
      "rows",
      "size_bytes"
    ],
    "properties": {
      "name": {
        "description": "Table or file name/path.",
        "nodeType": "primitive",
        "primitiveType": "string"
      },
      "rows": {
        "description": "Number of rows (if known).",
        "innerSchema": {
          "description": "Number of rows (if known).",
          "format": "int64",
          "nodeType": "primitive",
          "primitiveType": "integer"
        },
        "nodeType": "nullable"
      },
      "size_bytes": {
        "description": "Size in bytes (if known).",
        "innerSchema": {
          "description": "Size in bytes (if known).",
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
    "keys": [
      "cafile",
      "domain",
      "enable"
    ],
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
