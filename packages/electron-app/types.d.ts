/**
 * TypeScript type definitions for Electron IPC
 *
 * Defines types for window.electronAPI exposed via preload.js
 */

/**
 * Path validation response from fs:validatePath IPC handler
 */
export interface ValidationResult {
  /** Whether the path is valid and accessible */
  valid: boolean;

  /** Optional reason when path is invalid */
  reason?: 'Path not found' | 'Permission denied' | 'Not a directory' | 'Path not accessible';
}

/**
 * File system statistics response
 */
export interface FileStats {
  isDirectory: boolean;
  isFile: boolean;
}

/**
 * Directory entry
 */
export interface DirectoryEntry {
  name: string;
  isDirectory: boolean;
}

/**
 * Electron API exposed to renderer process via contextBridge
 */
declare global {
  interface Window {
    electronAPI: {
      /** Get application version */
      getVersion(): Promise<string>;

      /** Get platform (win32, darwin, linux) */
      getPlatform(): Promise<string>;

      /** Check backend health */
      checkBackendHealth(): Promise<{ status: string }>;

      /** Filesystem operations */
      fs: {
        /** Show directory selection dialog */
        selectDirectory(): Promise<string | null>;

        /** Get file/directory statistics */
        stat(filePath: string): Promise<FileStats>;

        /** Read directory contents */
        readdir(dirPath: string): Promise<DirectoryEntry[]>;

        /** Read file as UTF-8 text */
        readFile(filePath: string): Promise<string>;

        /** Validate path without permission dialogs */
        validatePath(pathToValidate: string): Promise<ValidationResult>;
      };

      /** IPC communication */
      send(channel: string, ...args: any[]): void;

      /** Subscribe to IPC events */
      receive(channel: string, func: (...args: any[]) => void): (() => void) | undefined;
    };
  }
}

export {};
