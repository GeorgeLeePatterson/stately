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
  "FileEntryType": {
    "nodeType": "enum",
    "values": [
      "directory",
      "file",
      "versioned_file"
    ]
  },
  "FileInfo": {
    "nodeType": "object",
    "properties": {
      "created": {
        "description": "Creation timestamp (Unix epoch seconds) - oldest version for versioned files",
        "innerSchema": {
          "description": "Creation timestamp (Unix epoch seconds) - oldest version for versioned files",
          "format": "int64",
          "nodeType": "primitive",
          "primitiveType": "integer"
        },
        "nodeType": "nullable"
      },
      "modified": {
        "description": "Last modified timestamp (Unix epoch seconds) - newest version for versioned files",
        "innerSchema": {
          "description": "Last modified timestamp (Unix epoch seconds) - newest version for versioned files",
          "format": "int64",
          "nodeType": "primitive",
          "primitiveType": "integer"
        },
        "nodeType": "nullable"
      },
      "name": {
        "description": "File name (relative path from target directory)",
        "nodeType": "primitive",
        "primitiveType": "string"
      },
      "size": {
        "description": "File size in bytes",
        "format": "int64",
        "nodeType": "primitive",
        "primitiveType": "integer"
      },
      "type": {
        "nodeType": "enum",
        "values": [
          "directory",
          "file",
          "versioned_file"
        ]
      },
      "versions": {
        "description": "List of all versions (only populated for versioned files)",
        "innerSchema": {
          "description": "List of all versions (only populated for versioned files)",
          "items": {
            "nodeType": "object",
            "properties": {
              "created": {
                "description": "Creation timestamp (Unix epoch seconds)",
                "innerSchema": {
                  "description": "Creation timestamp (Unix epoch seconds)",
                  "format": "int64",
                  "nodeType": "primitive",
                  "primitiveType": "integer"
                },
                "nodeType": "nullable"
              },
              "size": {
                "description": "Size of this specific version in bytes",
                "format": "int64",
                "nodeType": "primitive",
                "primitiveType": "integer"
              },
              "uuid": {
                "description": "UUID identifier for this version",
                "nodeType": "primitive",
                "primitiveType": "string"
              }
            },
            "required": [
              "uuid",
              "size"
            ]
          },
          "nodeType": "array"
        },
        "nodeType": "nullable"
      }
    },
    "required": [
      "name",
      "size",
      "type"
    ]
  },
  "FileListQuery": {
    "nodeType": "object",
    "properties": {
      "path": {
        "description": "Optional path to list files from (relative to data directory)",
        "innerSchema": {
          "description": "Optional path to list files from (relative to data directory)",
          "nodeType": "primitive",
          "primitiveType": "string"
        },
        "nodeType": "nullable"
      }
    },
    "required": []
  },
  "FileListResponse": {
    "nodeType": "object",
    "properties": {
      "files": {
        "description": "List of files",
        "items": {
          "nodeType": "object",
          "properties": {
            "created": {
              "description": "Creation timestamp (Unix epoch seconds) - oldest version for versioned files",
              "innerSchema": {
                "description": "Creation timestamp (Unix epoch seconds) - oldest version for versioned files",
                "format": "int64",
                "nodeType": "primitive",
                "primitiveType": "integer"
              },
              "nodeType": "nullable"
            },
            "modified": {
              "description": "Last modified timestamp (Unix epoch seconds) - newest version for versioned files",
              "innerSchema": {
                "description": "Last modified timestamp (Unix epoch seconds) - newest version for versioned files",
                "format": "int64",
                "nodeType": "primitive",
                "primitiveType": "integer"
              },
              "nodeType": "nullable"
            },
            "name": {
              "description": "File name (relative path from target directory)",
              "nodeType": "primitive",
              "primitiveType": "string"
            },
            "size": {
              "description": "File size in bytes",
              "format": "int64",
              "nodeType": "primitive",
              "primitiveType": "integer"
            },
            "type": {
              "nodeType": "enum",
              "values": [
                "directory",
                "file",
                "versioned_file"
              ]
            },
            "versions": {
              "description": "List of all versions (only populated for versioned files)",
              "innerSchema": {
                "description": "List of all versions (only populated for versioned files)",
                "items": {
                  "nodeType": "object",
                  "properties": {
                    "created": {
                      "description": "Creation timestamp (Unix epoch seconds)",
                      "innerSchema": {
                        "description": "Creation timestamp (Unix epoch seconds)",
                        "format": "int64",
                        "nodeType": "primitive",
                        "primitiveType": "integer"
                      },
                      "nodeType": "nullable"
                    },
                    "size": {
                      "description": "Size of this specific version in bytes",
                      "format": "int64",
                      "nodeType": "primitive",
                      "primitiveType": "integer"
                    },
                    "uuid": {
                      "description": "UUID identifier for this version",
                      "nodeType": "primitive",
                      "primitiveType": "string"
                    }
                  },
                  "required": [
                    "uuid",
                    "size"
                  ]
                },
                "nodeType": "array"
              },
              "nodeType": "nullable"
            }
          },
          "required": [
            "name",
            "size",
            "type"
          ]
        },
        "nodeType": "array"
      }
    },
    "required": [
      "files"
    ]
  },
  "FileSaveRequest": {
    "nodeType": "object",
    "properties": {
      "content": {
        "description": "File content as string",
        "nodeType": "primitive",
        "primitiveType": "string"
      },
      "name": {
        "description": "Optional filename",
        "innerSchema": {
          "description": "Optional filename",
          "nodeType": "primitive",
          "primitiveType": "string"
        },
        "nodeType": "nullable"
      }
    },
    "required": [
      "content"
    ]
  },
  "FileUploadResponse": {
    "nodeType": "object",
    "properties": {
      "full_path": {
        "description": "Full absolute path on the server",
        "nodeType": "primitive",
        "primitiveType": "string"
      },
      "path": {
        "description": "Relative path from data directory (e.g., \"uploads/config.json\")",
        "nodeType": "primitive",
        "primitiveType": "string"
      },
      "success": {
        "description": "Whether the operation was successful",
        "nodeType": "primitive",
        "primitiveType": "boolean"
      },
      "uuid": {
        "description": "The UUID version identifier",
        "nodeType": "primitive",
        "primitiveType": "string"
      }
    },
    "required": [
      "success",
      "path",
      "uuid",
      "full_path"
    ]
  },
  "FileVersion": {
    "nodeType": "object",
    "properties": {
      "created": {
        "description": "Creation timestamp (Unix epoch seconds)",
        "innerSchema": {
          "description": "Creation timestamp (Unix epoch seconds)",
          "format": "int64",
          "nodeType": "primitive",
          "primitiveType": "integer"
        },
        "nodeType": "nullable"
      },
      "size": {
        "description": "Size of this specific version in bytes",
        "format": "int64",
        "nodeType": "primitive",
        "primitiveType": "integer"
      },
      "uuid": {
        "description": "UUID identifier for this version",
        "nodeType": "primitive",
        "primitiveType": "string"
      }
    },
    "required": [
      "uuid",
      "size"
    ]
  },
  "RelativePath": {
    "description": "Path relative to an app directory (upload, data, config, or cache).\n\nUse this type in configuration structs when you need paths relative to\napp directories with optional version resolution for uploaded files.\n\nFor paths that are just strings (e.g., user-provided absolute paths or\nURLs), use `String` or `PathBuf` directly instead.",
    "discriminator": "dir",
    "nodeType": "taggedUnion",
    "variants": [
      {
        "schema": {
          "nodeType": "object",
          "properties": {
            "path": {
              "description": "Path relative to the cache directory",
              "nodeType": "primitive",
              "primitiveType": "string"
            }
          },
          "required": [
            "path"
          ]
        },
        "tag": "cache"
      },
      {
        "schema": {
          "nodeType": "object",
          "properties": {
            "path": {
              "description": "Path relative to the data directory (non-versioned files)",
              "nodeType": "primitive",
              "primitiveType": "string"
            }
          },
          "required": [
            "path"
          ]
        },
        "tag": "data"
      },
      {
        "schema": {
          "nodeType": "object",
          "properties": {
            "path": {
              "nodeType": "primitive",
              "description": "Newtype wrapper for versioned file paths.\n\nRepresents a logical file name that resolves to the latest UUID-versioned\nfile in a directory (e.g., \"config.json\" → \"uploads/config.json/{latest-uuid}\").\n\nThe inner string is not directly accessible to prevent bypassing version resolution.",
              "primitiveType": "string"
            }
          },
          "required": [
            "path"
          ]
        },
        "tag": "upload"
      }
    ]
  },
  "UserDefinedPath": {
    "description": "Path that can be either managed by the application or user-defined.\n\nUse this type when a path could be either:\n- An uploaded file managed by the app (with version resolution)\n- A user-provided path on the filesystem\n\n# Examples\n```\n// Managed: uploads/config.json (resolved to latest UUID)\nUserDefinedPath::Managed(RelativePath::Data(VersionedPath::new(\"uploads/config.json\")))\n\n// External: /usr/local/bin/script.sh\nUserDefinedPath::External(\"/usr/local/bin/script.sh\".to_string())\n```",
    "nodeType": "unknown"
  },
  "VersionedPath": {
    "nodeType": "primitive",
    "description": "Newtype wrapper for versioned file paths.\n\nRepresents a logical file name that resolves to the latest UUID-versioned\nfile in a directory (e.g., \"config.json\" → \"uploads/config.json/{latest-uuid}\").\n\nThe inner string is not directly accessible to prevent bypassing version resolution.",
    "primitiveType": "string"
  }
} as const;

export type ParsedSchemaName = keyof typeof PARSED_SCHEMAS;
