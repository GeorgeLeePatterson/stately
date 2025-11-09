# @stately/files

File system integration plugin for Stately UI.

## Status

🚧 **Work in Progress** - This package is being extracted from `@stately/ui` to establish a plugin architecture.

## What Will Go Here

- `RelativePathNode` type definition (extends NodeType)
- `RelativePathField` components (edit/view)
- `useSaveFile()` hook
- `useFileView()` hook
- `Upload` component
- File browser components

## Architecture

This package demonstrates the plugin pattern:
1. Extends base schema with new node types
2. Provides UI components for those types
3. Registers with `@stately/ui` via plugin API

## License

Apache-2.0
