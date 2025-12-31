/**
 * Platform Detection & Filesystem Adapter Selection
 *
 * Automatically detects if running in Electron or Web browser
 * and provides the appropriate filesystem adapter.
 */

import { ElectronFileSystemAdapter } from '@coderef-dashboard/core/src/filesystem/electron';
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
function createFileSystemAdapter(): FileSystemAdapter {
  if (platform === 'electron') {
    console.log('🖥️ [Platform] Running in Electron - using Node.js fs adapter');
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
 * Singleton filesystem adapter instance
 * Use this throughout the application
 */
export const fileSystem: FileSystemAdapter = createFileSystemAdapter();

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
