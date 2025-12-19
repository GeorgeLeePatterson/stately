// Auto-generated at build time from openapi.json
// DO NOT EDIT MANUALLY - run 'stately generate' to regenerate

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
  "FileDownloadQuery": {
    "description": "Query parameters for downloading files.",
    "keys": [
      "version"
    ],
    "nodeType": "object",
    "properties": {
      "version": {
        "description": "Specific version UUID to download.\nIf not provided, returns the latest version.",
        "innerSchema": {
          "description": "Specific version UUID to download.\nIf not provided, returns the latest version.",
          "nodeType": "primitive",
          "primitiveType": "string"
        },
        "nodeType": "nullable"
      }
    },
    "required": []
  },
  "FileEntryType": {
    "description": "Type of file system entry.",
    "nodeType": "enum",
    "values": [
      "directory",
      "file",
      "versioned_file"
    ]
  },
  "FileInfo": {
    "description": "Information about a file or directory entry.",
    "keys": [
      "created",
      "modified",
      "name",
      "size",
      "type",
      "versions"
    ],
    "nodeType": "object",
    "properties": {
      "created": {
        "description": "Creation timestamp as Unix epoch seconds.\nFor versioned files, this is when the first version was created.",
        "innerSchema": {
          "description": "Creation timestamp as Unix epoch seconds.\nFor versioned files, this is when the first version was created.",
          "format": "int64",
          "nodeType": "primitive",
          "primitiveType": "integer"
        },
        "nodeType": "nullable"
      },
      "modified": {
        "description": "Last modified timestamp as Unix epoch seconds.\nFor versioned files, this is when the latest version was created.",
        "innerSchema": {
          "description": "Last modified timestamp as Unix epoch seconds.\nFor versioned files, this is when the latest version was created.",
          "format": "int64",
          "nodeType": "primitive",
          "primitiveType": "integer"
        },
        "nodeType": "nullable"
      },
      "name": {
        "description": "Entry name (filename or directory name).",
        "nodeType": "primitive",
        "primitiveType": "string"
      },
      "size": {
        "description": "Size in bytes. For versioned files, this is the size of the latest version.\nFor directories, this is 0.",
        "format": "int64",
        "nodeType": "primitive",
        "primitiveType": "integer"
      },
      "type": {
        "description": "Type of file system entry.",
        "nodeType": "enum",
        "values": [
          "directory",
          "file",
          "versioned_file"
        ]
      },
      "versions": {
        "description": "List of all versions, sorted newest first.\nOnly populated for versioned files.",
        "innerSchema": {
          "description": "List of all versions, sorted newest first.\nOnly populated for versioned files.",
          "items": {
            "nodeType": "object",
            "description": "Information about a specific file version.",
            "keys": [
              "created",
              "size",
              "uuid"
            ],
            "properties": {
              "created": {
                "description": "Creation timestamp as Unix epoch seconds.",
                "innerSchema": {
                  "description": "Creation timestamp as Unix epoch seconds.",
                  "format": "int64",
                  "nodeType": "primitive",
                  "primitiveType": "integer"
                },
                "nodeType": "nullable"
              },
              "size": {
                "description": "Size of this version in bytes.",
                "format": "int64",
                "nodeType": "primitive",
                "primitiveType": "integer"
              },
              "uuid": {
                "description": "UUID v7 identifier for this version.",
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
    "description": "Query parameters for listing files.",
    "keys": [
      "path"
    ],
    "nodeType": "object",
    "properties": {
      "path": {
        "description": "Path to list files from, relative to the uploads directory.\nIf not provided, lists the root uploads directory.",
        "innerSchema": {
          "description": "Path to list files from, relative to the uploads directory.\nIf not provided, lists the root uploads directory.",
          "nodeType": "primitive",
          "primitiveType": "string"
        },
        "nodeType": "nullable"
      }
    },
    "required": []
  },
  "FileListResponse": {
    "description": "Response from listing files in a directory.",
    "keys": [
      "files"
    ],
    "nodeType": "object",
    "properties": {
      "files": {
        "description": "List of files and directories.",
        "items": {
          "description": "Information about a file or directory entry.",
          "keys": [
            "created",
            "modified",
            "name",
            "size",
            "type",
            "versions"
          ],
          "nodeType": "object",
          "properties": {
            "created": {
              "description": "Creation timestamp as Unix epoch seconds.\nFor versioned files, this is when the first version was created.",
              "innerSchema": {
                "description": "Creation timestamp as Unix epoch seconds.\nFor versioned files, this is when the first version was created.",
                "format": "int64",
                "nodeType": "primitive",
                "primitiveType": "integer"
              },
              "nodeType": "nullable"
            },
            "modified": {
              "description": "Last modified timestamp as Unix epoch seconds.\nFor versioned files, this is when the latest version was created.",
              "innerSchema": {
                "description": "Last modified timestamp as Unix epoch seconds.\nFor versioned files, this is when the latest version was created.",
                "format": "int64",
                "nodeType": "primitive",
                "primitiveType": "integer"
              },
              "nodeType": "nullable"
            },
            "name": {
              "description": "Entry name (filename or directory name).",
              "nodeType": "primitive",
              "primitiveType": "string"
            },
            "size": {
              "description": "Size in bytes. For versioned files, this is the size of the latest version.\nFor directories, this is 0.",
              "format": "int64",
              "nodeType": "primitive",
              "primitiveType": "integer"
            },
            "type": {
              "description": "Type of file system entry.",
              "nodeType": "enum",
              "values": [
                "directory",
                "file",
                "versioned_file"
              ]
            },
            "versions": {
              "description": "List of all versions, sorted newest first.\nOnly populated for versioned files.",
              "innerSchema": {
                "description": "List of all versions, sorted newest first.\nOnly populated for versioned files.",
                "items": {
                  "nodeType": "object",
                  "description": "Information about a specific file version.",
                  "keys": [
                    "created",
                    "size",
                    "uuid"
                  ],
                  "properties": {
                    "created": {
                      "description": "Creation timestamp as Unix epoch seconds.",
                      "innerSchema": {
                        "description": "Creation timestamp as Unix epoch seconds.",
                        "format": "int64",
                        "nodeType": "primitive",
                        "primitiveType": "integer"
                      },
                      "nodeType": "nullable"
                    },
                    "size": {
                      "description": "Size of this version in bytes.",
                      "format": "int64",
                      "nodeType": "primitive",
                      "primitiveType": "integer"
                    },
                    "uuid": {
                      "description": "UUID v7 identifier for this version.",
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
    "description": "Request body for saving file content directly.",
    "keys": [
      "content",
      "name"
    ],
    "nodeType": "object",
    "properties": {
      "content": {
        "description": "File content as string.",
        "nodeType": "primitive",
        "primitiveType": "string"
      },
      "name": {
        "description": "Optional filename. Defaults to \"unnamed.txt\" if not provided.",
        "innerSchema": {
          "description": "Optional filename. Defaults to \"unnamed.txt\" if not provided.",
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
    "description": "Response from file upload or save operations.",
    "keys": [
      "full_path",
      "path",
      "success",
      "uuid"
    ],
    "nodeType": "object",
    "properties": {
      "full_path": {
        "description": "Full absolute path on the server filesystem.",
        "nodeType": "primitive",
        "primitiveType": "string"
      },
      "path": {
        "description": "Relative path from uploads directory (e.g., \"config.json\").",
        "nodeType": "primitive",
        "primitiveType": "string"
      },
      "success": {
        "description": "Whether the operation was successful.",
        "nodeType": "primitive",
        "primitiveType": "boolean"
      },
      "uuid": {
        "description": "The UUID version identifier for this upload.",
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
    "description": "Information about a specific file version.",
    "keys": [
      "created",
      "size",
      "uuid"
    ],
    "properties": {
      "created": {
        "description": "Creation timestamp as Unix epoch seconds.",
        "innerSchema": {
          "description": "Creation timestamp as Unix epoch seconds.",
          "format": "int64",
          "nodeType": "primitive",
          "primitiveType": "integer"
        },
        "nodeType": "nullable"
      },
      "size": {
        "description": "Size of this version in bytes.",
        "format": "int64",
        "nodeType": "primitive",
        "primitiveType": "integer"
      },
      "uuid": {
        "description": "UUID v7 identifier for this version.",
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
    "keys": [
      "dir",
      "path"
    ],
    "nodeType": "taggedUnion",
    "variants": [
      {
        "schema": {
          "keys": [
            "path"
          ],
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
          "keys": [
            "path"
          ],
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
          "keys": [
            "path"
          ],
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
    "keys": [
      "dir",
      "path"
    ],
    "nodeType": "union",
    "variants": [
      {
        "label": "Path relative to an app directory (upload, data, config, or cache).\n\nUse this type in configuration structs when you need paths relative to\napp directories with optional version resolution for uploaded files.\n\nFor paths that are just strings (e.g., user-provided absolute paths or\nURLs), use `String` or `PathBuf` directly instead.",
        "schema": {
          "description": "Path relative to an app directory (upload, data, config, or cache).\n\nUse this type in configuration structs when you need paths relative to\napp directories with optional version resolution for uploaded files.\n\nFor paths that are just strings (e.g., user-provided absolute paths or\nURLs), use `String` or `PathBuf` directly instead.",
          "discriminator": "dir",
          "keys": [
            "dir",
            "path"
          ],
          "nodeType": "taggedUnion",
          "variants": [
            {
              "schema": {
                "keys": [
                  "path"
                ],
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
                "keys": [
                  "path"
                ],
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
                "keys": [
                  "path"
                ],
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
        }
      },
      {
        "label": "User-provided external path (filesystem path or URL)",
        "schema": {
          "description": "User-provided external path (filesystem path or URL)",
          "nodeType": "primitive",
          "primitiveType": "string"
        }
      }
    ]
  },
  "VersionedPath": {
    "nodeType": "primitive",
    "description": "Newtype wrapper for versioned file paths.\n\nRepresents a logical file name that resolves to the latest UUID-versioned\nfile in a directory (e.g., \"config.json\" → \"uploads/config.json/{latest-uuid}\").\n\nThe inner string is not directly accessible to prevent bypassing version resolution.",
    "primitiveType": "string"
  }
} as const;

export type ParsedSchemaName = keyof typeof PARSED_SCHEMAS;
