/**
 * File System Access API Permission Management
 *
 * Handles permission checking and requesting for directory handles
 */

import type { PermissionCheckResult } from './types';

/**
 * Check if File System Access API is supported
 */
export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

/**
 * Check permission status for a directory handle
 */
export async function checkPermission(
  dirHandle: FileSystemDirectoryHandle,
  mode: 'read' | 'readwrite' = 'read'
): Promise<PermissionCheckResult> {
  try {
    const permission = await dirHandle.queryPermission({ mode });

    return {
      state: permission,
      granted: permission === 'granted',
    };
  } catch (error) {
    console.error('Error checking permission:', error);
    return {
      state: 'denied',
      granted: false,
    };
  }
}

/**
 * Request permission for a directory handle
 */
export async function requestPermission(
  dirHandle: FileSystemDirectoryHandle,
  mode: 'read' | 'readwrite' = 'read'
): Promise<boolean> {
  try {
    const permission = await dirHandle.requestPermission({ mode });
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting permission:', error);
    return false;
  }
}

/**
 * Ensure permission is granted, requesting if needed
 * Returns true if permission is granted after this call
 */
export async function ensurePermission(
  dirHandle: FileSystemDirectoryHandle,
  mode: 'read' | 'readwrite' = 'read'
): Promise<boolean> {
  // First check if we already have permission
  const check = await checkPermission(dirHandle, mode);

  if (check.granted) {
    return true;
  }

  // If not, request permission
  if (check.state === 'prompt') {
    return await requestPermission(dirHandle, mode);
  }

  // Permission denied
  return false;
}

/**
 * Verify handle is still valid
 * Stale handles (e.g., directory deleted) will throw errors
 */
export async function verifyHandleValid(
  dirHandle: FileSystemDirectoryHandle
): Promise<boolean> {
  try {
    // Try to iterate entries (will fail for stale handles)
    const iterator = dirHandle.values();
    await iterator.next();
    return true;
  } catch (error) {
    console.error('Handle verification failed:', error);
    return false;
  }
}
