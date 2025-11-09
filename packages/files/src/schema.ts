/**
 * @stately/files - Schema Extensions
 *
 * Defines the RelativePath node type for file path handling
 */

/**
 * Node type for relative paths
 */
export const FilesNodeType = {
  RelativePath: 'relativePath',
} as const;

export type FilesNodeType = (typeof FilesNodeType)[keyof typeof FilesNodeType];

/**
 * Base interface for nodes
 */
interface BaseNode {
  nodeType: string;
  description?: string;
}

/**
 * RelativePath: Path relative to app directory
 *
 * This can be:
 * - A string path: "path/to/file.txt"
 * - An object with dir/path: { dir: "upload", path: "file.txt" }
 */
export interface RelativePathNode extends BaseNode {
  nodeType: typeof FilesNodeType.RelativePath;
}
