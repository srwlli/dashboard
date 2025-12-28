/**
 * CodeRef Shared Type Definitions
 *
 * Types used across local and API modes
 */

/**
 * Project registration
 */
export interface Project {
  /** Unique project identifier */
  id: string;

  /** Human-readable project name */
  name: string;

  /** Project path - absolute path or [Directory: name] for File System API */
  path: string;

  /** ISO 8601 timestamp when project was added */
  addedAt: string;
}

/**
 * Tree node (file or directory)
 */
export interface TreeNode {
  /** Node name */
  name: string;

  /** Node type */
  type: 'file' | 'directory';

  /** Relative path from project root */
  path: string;

  /** Children nodes (only for directories) */
  children?: TreeNode[];

  /** File size in bytes (only for files) */
  size?: number;

  /** File extension (only for files) */
  extension?: string;
}

/**
 * File information with content
 */
export interface FileInfo {
  /** Absolute or relative file path */
  path: string;

  /** File name */
  name: string;

  /** File extension */
  extension: string;

  /** File size in bytes */
  size: number;

  /** File content */
  content: string;

  /** Content encoding */
  encoding: 'utf-8' | 'base64';

  /** MIME type */
  mimeType: string;

  /** Last modified timestamp */
  lastModified: string;
}

/**
 * Directory handle record for IndexedDB storage
 */
export interface DirectoryHandleRecord {
  /** Project ID (primary key) */
  projectId: string;

  /** FileSystemDirectoryHandle (stored directly in IndexedDB) */
  handle: FileSystemDirectoryHandle;

  /** Timestamp when handle was saved */
  savedAt: string;
}

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  /** Permission state */
  state: 'granted' | 'prompt' | 'denied';

  /** Whether permission is granted */
  granted: boolean;
}

/**
 * Access mode for hybrid routing
 */
export type AccessMode = 'local' | 'api';

/**
 * Hybrid routing result
 */
export interface HybridResult<T> {
  /** Result data */
  data: T;

  /** Access mode used */
  mode: AccessMode;
}
