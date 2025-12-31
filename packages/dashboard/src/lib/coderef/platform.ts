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
  // Must be in browser environment
  if (typeof window === 'undefined') {
    return false;
  }

  // Method 1: Check for electron in user agent (most reliable)
  const userAgent = navigator.userAgent.toLowerCase();
  const hasElectronUA = userAgent.includes('electron');

  // Method 2: Check for process.type (Electron sets this)
  const hasRendererProcess = typeof (window as any).process === 'object' &&
    (window as any).process.type === 'renderer';

  // Method 3: Check for window.electronAPI (our preload script)
  const hasElectronAPI = typeof (window as any).electronAPI !== 'undefined';

  // STRICT CHECK: Must have Electron user agent AND at least one other indicator
  // This prevents false positives from browser extensions or dev tools
  const result = hasElectronUA && (hasRendererProcess || hasElectronAPI);

  console.log('🔍 [Platform] isElectron() check:', {
    userAgent: navigator.userAgent,
    hasElectronUA,
    hasRendererProcess,
    hasElectronAPI,
    result
  });

  return result;
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
    console.log('🖥️ [Platform] Running in Electron - attempting to load Node.js fs adapter');
    try {
      // Use dynamic loader to prevent build-time bundling of Electron modules
      const { loadElectronAdapter } = await import('@coderef-dashboard/core/src/filesystem/electron-loader');
      return await loadElectronAdapter();
    } catch (error) {
      console.warn('⚠️ [Platform] Failed to load Electron adapter, falling back to Web adapter:', error);
      console.log('🌐 [Platform] Using File System Access API as fallback in Electron');
      // Fall back to web adapter
      return createWebFileSystemAdapter({
        showDirectoryPicker,
        saveDirectoryHandle,
        getDirectoryHandle,
        verifyHandleValid,
        ensurePermission,
      });
    }
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
  async readFile(projectId: string, filePath: string) {
    const fs = await getFileSystem();
    return fs.readFile(projectId, filePath);
  },
  async readDirectory(projectId: string, projectPath: string) {
    const fs = await getFileSystem();
    return fs.readDirectory(projectId, projectPath);
  },
  async resolvePath(projectId: string, projectPath: string, relativePath: string) {
    const fs = await getFileSystem();
    return fs.resolvePath(projectId, projectPath, relativePath);
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
// Safe check for NODE_ENV in case process.env is undefined (e.g., during Jest module reset)
if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
  logPlatformInfo();
}
