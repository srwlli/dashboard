/**
 * Platform-Agnostic Filesystem Interface
 *
 * Abstracts File System Access API (Web) and Node.js fs (Electron)
 * so the same code works in both environments.
 */

/**
 * Filesystem adapter interface
 * Implementations: WebFileSystemAdapter, ElectronFileSystemAdapter
 */
export interface FileSystemAdapter {
  /**
   * Get platform name
   */
  readonly platform: 'web' | 'electron';

  /**
   * Prompt user to select a directory
   *
   * Web: Opens File System Access API picker, returns "[Directory: folder-name]"
   * Electron: Opens native dialog, returns "C:/absolute/path"
   *
   * @returns Project path (format depends on platform) or null if cancelled
   */
  selectDirectory(): Promise<ProjectPath | null>;

  /**
   * Check if a saved project path is still valid and accessible
   *
   * Web: Checks if IndexedDB handle exists and permission granted
   * Electron: Checks if directory exists on filesystem
   *
   * @param projectId Unique project identifier
   * @param projectPath Path returned from selectDirectory()
   * @returns true if project is accessible, false if needs re-authorization
   */
  isProjectValid(projectId: string, projectPath: string): Promise<boolean>;

  /**
   * Read directory contents
   *
   * @param projectId Project identifier
   * @param projectPath Full path to directory
   * @returns Array of file/folder names (not full paths)
   */
  readDirectory(projectId: string, projectPath: string): Promise<string[]>;

  /**
   * Read file contents as text
   *
   * @param projectId Project identifier
   * @param filePath Full path to file
   * @returns File contents as UTF-8 string
   */
  readFile(projectId: string, filePath: string): Promise<string>;

  /**
   * Get full path for a file within a project
   *
   * Web: Resolves relative path using directory handle
   * Electron: Joins project path + relative path
   *
   * @param projectId Project identifier
   * @param projectPath Project root path
   * @param relativePath Relative path from project root (e.g., "src/index.ts")
   * @returns Platform-specific full path
   */
  resolvePath(projectId: string, projectPath: string, relativePath: string): Promise<string>;
}

/**
 * Project path format
 *
 * Web:      "[Directory: folder-name]"
 * Electron: "C:/Users/willh/projects/my-app"
 */
export type ProjectPath = string;

/**
 * Project metadata
 */
export interface Project {
  id: string;
  name: string;
  path: ProjectPath;
  addedAt: string;
}
