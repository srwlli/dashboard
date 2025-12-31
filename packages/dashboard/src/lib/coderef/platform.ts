/**
 * Platform Detection & Filesystem Adapter Selection
 *
 * Automatically detects if running in Electron or Web browser
 * and provides the appropriate filesystem adapter.
 */

import { createWebFileSystemAdapter } from '@coderef-dashboard/core/src/filesystem/web';
import type { FileSystemAdapter } from '@coderef-dashboard/core/src/filesystem/types';

// Import Web-specific dependencies
import { showDirectoryPicker } from './local-access';
import { saveDirectoryHandle, getDirectoryHandle } from './indexeddb';
import { verifyHandleValid, ensurePermission } from './permissions';

/**
 * Detect if running in Electron environment
 */
function isElectron(): boolean {
  // Check for Electron-specific globals
  if (typeof window === 'undefined') {
    return false;
  }

  // Method 1: Check for electron in user agent
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('electron')) {
    return true;
  }

  // Method 2: Check for process.type (Electron sets this)
  if (typeof (window as any).process === 'object' && (window as any).process.type === 'renderer') {
    return true;
  }

  // Method 3: Check for require (Electron exposes Node.js require)
  if (typeof (window as any).require === 'function') {
    return true;
  }

  return false;
}

/**
 * Detect platform type
 */
export const platform: 'electron' | 'web' = isElectron() ? 'electron' : 'web';

/**
 * Create appropriate filesystem adapter based on platform
 */
async function createFileSystemAdapter(): Promise<FileSystemAdapter> {
  if (platform === 'electron') {
    console.log('🖥️ [Platform] Running in Electron - using Node.js fs adapter');
    // Dynamic import to avoid bundling Electron code in web builds
    const { ElectronFileSystemAdapter } = await import('@coderef-dashboard/core/src/filesystem/electron');
    return new ElectronFileSystemAdapter();
  } else {
    console.log('🌐 [Platform] Running in Web - using File System Access API adapter');
    return createWebFileSystemAdapter({
      showDirectoryPicker,
      saveDirectoryHandle,
      getDirectoryHandle,
      verifyHandleValid,
      ensurePermission,
    });
  }
}

/**
 * Singleton filesystem adapter instance promise
 * Use await fileSystem throughout the application
 */
let _fileSystemInstance: FileSystemAdapter | null = null;

/**
 * Get the filesystem adapter (lazy-initialized singleton)
 * Returns a promise that resolves to the adapter instance
 */
export async function getFileSystem(): Promise<FileSystemAdapter> {
  if (!_fileSystemInstance) {
    _fileSystemInstance = await createFileSystemAdapter();
  }
  return _fileSystemInstance;
}

/**
 * Synchronous access to fileSystem (for compatibility)
 * Note: Only works after getFileSystem() has been called at least once
 */
export const fileSystem = {
  get platform() {
    return platform;
  },
  async selectDirectory() {
    const fs = await getFileSystem();
    return fs.selectDirectory();
  },
  async isProjectValid(projectId: string, projectPath: string) {
    const fs = await getFileSystem();
    return fs.isProjectValid(projectId, projectPath);
  },
  async restoreProject(projectId: string, projectPath: string) {
    const fs = await getFileSystem();
    return fs.restoreProject(projectId, projectPath);
  },
  async readFile(projectId: string, projectPath: string, filePath: string) {
    const fs = await getFileSystem();
    return fs.readFile(projectId, projectPath, filePath);
  },
  async readDirectory(projectId: string, projectPath: string, dirPath: string) {
    const fs = await getFileSystem();
    return fs.readDirectory(projectId, projectPath, dirPath);
  },
} as FileSystemAdapter;

/**
 * Platform-specific feature flags
 */
export const features = {
  /**
   * Does this platform require re-authorization after restart?
   */
  requiresReauthorization: platform === 'web',

  /**
   * Does this platform support persistent storage requests?
   */
  supportsPersistentStorage: platform === 'web' && typeof navigator !== 'undefined' && !!navigator.storage?.persist,

  /**
   * Does this platform have direct filesystem access?
   */
  hasDirectFilesystemAccess: platform === 'electron',

  /**
   * Can this platform store absolute paths?
   */
  supportsAbsolutePaths: platform === 'electron',
};

/**
 * Log platform information for debugging
 */
export function logPlatformInfo(): void {
  console.log('📊 [Platform] Environment Information:');
  console.log('   Platform:', platform);
  console.log('   Requires Re-auth:', features.requiresReauthorization);
  console.log('   Direct FS Access:', features.hasDirectFilesystemAccess);
  console.log('   Persistent Storage:', features.supportsPersistentStorage);
  console.log('   User Agent:', navigator.userAgent);
}

// Log on module load (only in development)
if (process.env.NODE_ENV === 'development') {
  logPlatformInfo();
}
