/**
 * Web Filesystem Adapter
 *
 * Uses File System Access API with IndexedDB for handle storage.
 * Limitations: Handles invalidate on browser restart, requires re-authorization.
 */

import type { FileSystemAdapter, ProjectPath } from './types';

// These will be imported from the dashboard package
// For now, we declare the interfaces
interface DirectoryHandle extends FileSystemDirectoryHandle {}

export class WebFileSystemAdapter implements FileSystemAdapter {
  readonly platform = 'web' as const;

  // Reference to IndexedDB and permissions utilities
  // These are injected via constructor to avoid circular dependencies
  constructor(
    private showDirectoryPicker: () => Promise<DirectoryHandle | null>,
    private saveDirectoryHandle: (projectId: string, handle: DirectoryHandle) => Promise<void>,
    private getDirectoryHandle: (projectId: string) => Promise<DirectoryHandle | undefined>,
    private verifyHandleValid: (handle: DirectoryHandle) => Promise<boolean>,
    private ensurePermission: (handle: DirectoryHandle, mode: 'read' | 'readwrite') => Promise<boolean>
  ) {}

  /**
   * Show File System Access API picker
   * Returns pseudo-path: "[Directory: folder-name]"
   */
  async selectDirectory(): Promise<ProjectPath | null> {
    try {
      console.log('[Web] Opening directory picker...');

      const dirHandle = await this.showDirectoryPicker();

      if (!dirHandle) {
        console.log('[Web] User cancelled directory picker');
        return null;
      }

      console.log('[Web] Selected directory:', dirHandle.name);

      // Return pseudo-path (not a real filesystem path)
      // The actual handle is saved separately via saveDirectoryHandle
      return `[Directory: ${dirHandle.name}]`;
    } catch (error) {
      console.error('[Web] Failed to show directory picker:', error);
      return null;
    }
  }

  /**
   * Check if IndexedDB handle is valid and has permission
   * Returns false if handle is stale or permission was revoked
   */
  async isProjectValid(projectId: string, _projectPath: string): Promise<boolean> {
    try {
      // Get handle from IndexedDB
      const dirHandle = await this.getDirectoryHandle(projectId);

      if (!dirHandle) {
        console.warn(`[Web] No handle found for project ${projectId}`);
        return false;
      }

      // Verify handle is still valid (directory not deleted)
      const isValid = await this.verifyHandleValid(dirHandle);

      if (!isValid) {
        console.warn(`[Web] Handle is stale for project ${projectId}`);
        return false;
      }

      // Check permission status
      const hasPermission = await this.ensurePermission(dirHandle, 'read');

      if (!hasPermission) {
        console.warn(`[Web] Permission denied for project ${projectId}`);
        return false;
      }

      console.log(`[Web] Project ${projectId} is valid`);
      return true;
    } catch (error) {
      console.error(`[Web] Failed to validate project ${projectId}:`, error);
      return false;
    }
  }

  /**
   * Read directory contents using FileSystemDirectoryHandle
   */
  async readDirectory(projectId: string, projectPath: string): Promise<string[]> {
    try {
      const dirHandle = await this.getDirectoryHandle(projectId);

      if (!dirHandle) {
        throw new Error(`No directory handle for project ${projectId}`);
      }

      // Ensure we have permission
      const hasPermission = await this.ensurePermission(dirHandle, 'read');
      if (!hasPermission) {
        throw new Error(`Permission denied for project ${projectId}`);
      }

      // Iterate directory entries
      const entries: string[] = [];
      for await (const [name, handle] of dirHandle.entries()) {
        entries.push(name);
      }

      console.log(`[Web] Read ${entries.length} entries from project ${projectId}`);
      return entries;
    } catch (error) {
      console.error(`[Web] Failed to read directory for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Read file contents using FileSystemFileHandle
   */
  async readFile(projectId: string, filePath: string): Promise<string> {
    try {
      const dirHandle = await this.getDirectoryHandle(projectId);

      if (!dirHandle) {
        throw new Error(`No directory handle for project ${projectId}`);
      }

      // Ensure permission
      const hasPermission = await this.ensurePermission(dirHandle, 'read');
      if (!hasPermission) {
        throw new Error(`Permission denied for project ${projectId}`);
      }

      // Navigate to file using relative path
      const fileHandle = await this.getFileHandleFromPath(dirHandle, filePath);
      const file = await fileHandle.getFile();
      const content = await file.text();

      console.log(`[Web] Read file (${content.length} bytes):`, filePath);
      return content;
    } catch (error) {
      console.error(`[Web] Failed to read file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Resolve relative path (Web just returns the relative path as-is)
   */
  async resolvePath(
    projectId: string,
    projectPath: string,
    relativePath: string
  ): Promise<string> {
    // For Web, we don't have absolute paths
    // Just return the relative path
    return relativePath;
  }

  /**
   * Helper: Navigate to file handle using path
   */
  private async getFileHandleFromPath(
    dirHandle: DirectoryHandle,
    relativePath: string
  ): Promise<FileSystemFileHandle> {
    const parts = relativePath.split('/').filter((p) => p);
    let currentHandle: FileSystemDirectoryHandle | FileSystemFileHandle = dirHandle;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLastPart = i === parts.length - 1;

      if (isLastPart) {
        // Get file handle
        currentHandle = await (currentHandle as FileSystemDirectoryHandle).getFileHandle(part);
      } else {
        // Get directory handle
        currentHandle = await (currentHandle as FileSystemDirectoryHandle).getDirectoryHandle(part);
      }
    }

    return currentHandle as FileSystemFileHandle;
  }

  /**
   * Helper: Save a directory handle after selecting
   */
  async saveHandle(projectId: string, dirHandle: DirectoryHandle): Promise<void> {
    await this.saveDirectoryHandle(projectId, dirHandle);
    console.log(`[Web] Saved directory handle for project ${projectId}`);
  }
}

/**
 * Factory function to create WebFileSystemAdapter with dependencies
 */
export function createWebFileSystemAdapter(dependencies: {
  showDirectoryPicker: () => Promise<FileSystemDirectoryHandle | null>;
  saveDirectoryHandle: (projectId: string, handle: FileSystemDirectoryHandle) => Promise<void>;
  getDirectoryHandle: (projectId: string) => Promise<FileSystemDirectoryHandle | undefined>;
  verifyHandleValid: (handle: FileSystemDirectoryHandle) => Promise<boolean>;
  ensurePermission: (handle: FileSystemDirectoryHandle, mode: 'read' | 'readwrite') => Promise<boolean>;
}): WebFileSystemAdapter {
  return new WebFileSystemAdapter(
    dependencies.showDirectoryPicker,
    dependencies.saveDirectoryHandle,
    dependencies.getDirectoryHandle,
    dependencies.verifyHandleValid,
    dependencies.ensurePermission
  );
}
