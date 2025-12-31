/**
 * Electron Filesystem Adapter (IPC-based)
 *
 * Uses window.electronAPI.fs instead of direct Node.js fs access.
 * All filesystem operations go through IPC to the main process.
 *
 * Benefits:
 * - No permission prompts
 * - Paths persist forever
 * - Full native filesystem access
 * - Secure (context isolation maintained)
 */

import type { FileSystemAdapter, ProjectPath } from './types';

export class ElectronFileSystemAdapter implements FileSystemAdapter {
  readonly platform = 'electron' as const;

  /**
   * Show native folder picker dialog
   * Returns absolute path (e.g., "C:/Users/willh/projects/my-app")
   */
  async selectDirectory(): Promise<ProjectPath | null> {
    if (!window.electronAPI?.fs) {
      throw new Error('electronAPI.fs not available - not running in Electron');
    }

    try {
      const absolutePath = await window.electronAPI.fs.selectDirectory();

      if (!absolutePath) {
        console.log('[Electron] User cancelled folder selection');
        return null;
      }

      console.log('[Electron] Selected folder:', absolutePath);
      return absolutePath;
    } catch (error) {
      console.error('[Electron] Failed to show folder picker:', error);
      return null;
    }
  }

  /**
   * Check if directory still exists on filesystem
   * No permission checks needed - Electron has full access!
   */
  async isProjectValid(projectId: string, projectPath: string): Promise<boolean> {
    if (!window.electronAPI?.fs) {
      throw new Error('electronAPI.fs not available');
    }

    try {
      const stats = await window.electronAPI.fs.stat(projectPath);
      const isValid = stats.isDirectory;

      if (isValid) {
        console.log(`[Electron] Project ${projectId} is valid:`, projectPath);
      } else {
        console.warn(`[Electron] Path exists but is not a directory:`, projectPath);
      }

      return isValid;
    } catch (error) {
      console.warn(`[Electron] Project ${projectId} not accessible:`, projectPath);
      return false;
    }
  }

  /**
   * Read directory contents
   */
  async readDirectory(projectId: string, projectPath: string): Promise<string[]> {
    if (!window.electronAPI?.fs) {
      throw new Error('electronAPI.fs not available');
    }

    try {
      const entries = await window.electronAPI.fs.readdir(projectPath);
      const names = entries.map((entry) => entry.name);

      console.log(`[Electron] Read ${names.length} entries from:`, projectPath);
      return names;
    } catch (error) {
      console.error(`[Electron] Failed to read directory:`, projectPath, error);
      throw error;
    }
  }

  /**
   * Read file contents as UTF-8 text
   */
  async readFile(projectId: string, filePath: string): Promise<string> {
    if (!window.electronAPI?.fs) {
      throw new Error('electronAPI.fs not available');
    }

    try {
      const content = await window.electronAPI.fs.readFile(filePath);
      console.log(`[Electron] Read file (${content.length} bytes):`, filePath);
      return content;
    } catch (error) {
      console.error(`[Electron] Failed to read file:`, filePath, error);
      throw error;
    }
  }

  /**
   * Resolve relative path to absolute path
   * Simple path join implementation (Node.js path module not available in renderer)
   */
  async resolvePath(
    projectId: string,
    projectPath: string,
    relativePath: string
  ): Promise<string> {
    // Normalize separators to forward slashes
    const normalizedBase = projectPath.replace(/\\/g, '/');
    const normalizedRelative = relativePath.replace(/\\/g, '/');

    // Remove trailing slash from base if present
    const base = normalizedBase.endsWith('/')
      ? normalizedBase.slice(0, -1)
      : normalizedBase;

    // Remove leading slash from relative if present
    const relative = normalizedRelative.startsWith('/')
      ? normalizedRelative.slice(1)
      : normalizedRelative;

    const absolutePath = `${base}/${relative}`;
    console.log(`[Electron] Resolved path:`, relativePath, '→', absolutePath);
    return absolutePath;
  }
}
