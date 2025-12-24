/**
 * Filesystem abstraction for the codegen system.
 *
 * Provides an interface (CodegenIO) and a default Node.js implementation (nodeFS).
 * This allows swapping implementations for testing or alternative backends.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// =============================================================================
// Interface
// =============================================================================

/**
 * Filesystem and logging operations required by the codegen system.
 */
export interface CodegenIO {
  /** Read a file and return its contents as a string */
  readFile(filePath: string): string;

  /** Write content to a file */
  writeFile(filePath: string, content: string): void;

  /** Check if a file or directory exists */
  exists(filePath: string): boolean;

  /** Ensure a directory exists, creating it if necessary */
  ensureDir(dir: string): void;

  /** Resolve path segments to an absolute path */
  resolvePath(...segments: string[]): string;

  /** Join path segments */
  joinPath(...segments: string[]): string;

  /** Log a message */
  log(message: string): void;
}

// =============================================================================
// Node.js Implementation
// =============================================================================

/**
 * Default Node.js filesystem implementation.
 */
export const nodeFS: CodegenIO = {
  readFile(filePath: string): string {
    return fs.readFileSync(filePath, 'utf-8');
  },

  writeFile(filePath: string, content: string): void {
    fs.writeFileSync(filePath, content);
  },

  exists(filePath: string): boolean {
    return fs.existsSync(filePath);
  },

  ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  },

  resolvePath(...segments: string[]): string {
    return path.resolve(...segments);
  },

  joinPath(...segments: string[]): string {
    return path.join(...segments);
  },

  log(message: string): void {
    console.log(message);
  },
};
