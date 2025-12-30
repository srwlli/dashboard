/**
 * Enhanced Persistence Layer for File System Access API
 *
 * Implements persistent storage + automatic permission restoration
 * to minimize re-authorization needs across browser sessions.
 */

import { getDirectoryHandle, saveDirectoryHandle } from './indexeddb';
import { ensurePermission, verifyHandleValid } from './permissions';
import type { Project } from './types';

/**
 * Request persistent storage permission from browser
 * This makes IndexedDB data (including directory handles) more likely to survive browser restarts
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage || !navigator.storage.persist) {
    console.warn('[Persistence] Persistent storage API not available');
    return false;
  }

  try {
    // Check if already granted
    const isPersisted = await navigator.storage.persisted();
    if (isPersisted) {
      console.log('[Persistence] Storage is already persistent');
      return true;
    }

    // Request persistent storage
    const granted = await navigator.storage.persist();
    if (granted) {
      console.log('[Persistence] Persistent storage granted');
    } else {
      console.warn('[Persistence] Persistent storage denied - handles may not survive browser restart');
    }

    return granted;
  } catch (error) {
    console.error('[Persistence] Error requesting persistent storage:', error);
    return false;
  }
}

/**
 * Check if storage is persistent
 */
export async function isStoragePersistent(): Promise<boolean> {
  if (!navigator.storage || !navigator.storage.persisted) {
    return false;
  }

  try {
    return await navigator.storage.persisted();
  } catch {
    return false;
  }
}

/**
 * Attempt to silently restore permissions for a project
 * Returns true if successfully restored, false if user interaction needed
 */
export async function attemptSilentRestore(projectId: string): Promise<boolean> {
  try {
    // Get handle from IndexedDB
    const dirHandle = await getDirectoryHandle(projectId);
    if (!dirHandle) {
      console.log(`[Persistence] No handle found for project ${projectId}`);
      return false;
    }

    // Verify handle is still valid
    const isValid = await verifyHandleValid(dirHandle);
    if (!isValid) {
      console.log(`[Persistence] Handle is stale for project ${projectId}`);
      return false;
    }

    // Try to restore permission silently (no user prompt)
    // queryPermission doesn't trigger prompt, so this is safe
    const permission = await dirHandle.queryPermission({ mode: 'read' });

    if (permission === 'granted') {
      console.log(`[Persistence] Permission already granted for ${projectId}`);
      return true;
    }

    // Permission is 'prompt' or 'denied' - can't restore silently
    console.log(`[Persistence] Permission ${permission} for ${projectId} - user interaction required`);
    return false;
  } catch (error) {
    console.error(`[Persistence] Silent restore failed for ${projectId}:`, error);
    return false;
  }
}

/**
 * Batch restore permissions for all projects
 * Returns map of projectId -> restored status
 */
export async function batchRestorePermissions(
  projects: Project[]
): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();

  // Filter projects using File System Access API
  const fsaProjects = projects.filter(p => p.path.startsWith('[Directory:'));

  console.log(`[Persistence] Attempting to restore ${fsaProjects.length} projects`);

  // Attempt silent restore for each project in parallel
  const restorePromises = fsaProjects.map(async (project) => {
    const restored = await attemptSilentRestore(project.id);
    results.set(project.id, restored);
  });

  await Promise.all(restorePromises);

  const successCount = Array.from(results.values()).filter(v => v).length;
  console.log(`[Persistence] Restored ${successCount}/${fsaProjects.length} projects silently`);

  return results;
}

/**
 * Initialize persistence layer on app startup
 * - Requests persistent storage permission
 * - Attempts to restore all project permissions
 * - Returns list of projects that need re-authorization
 */
export async function initializePersistence(
  projects: Project[]
): Promise<string[]> {
  console.log('[Persistence] Initializing persistence layer');

  // Step 1: Request persistent storage
  await requestPersistentStorage();

  // Step 2: Attempt to restore all projects
  const restoreResults = await batchRestorePermissions(projects);

  // Step 3: Return list of projects that need user interaction
  const needsReauth = Array.from(restoreResults.entries())
    .filter(([_, restored]) => !restored)
    .map(([projectId]) => projectId);

  if (needsReauth.length > 0) {
    console.log(`[Persistence] ${needsReauth.length} projects need re-authorization:`, needsReauth);
  } else {
    console.log('[Persistence] All projects restored successfully');
  }

  return needsReauth;
}

/**
 * Enhanced save function that also requests persistent storage
 */
export async function saveDirectoryHandlePersistent(
  projectId: string,
  dirHandle: FileSystemDirectoryHandle
): Promise<void> {
  // Request persistent storage first (if not already granted)
  await requestPersistentStorage();

  // Save handle to IndexedDB
  await saveDirectoryHandle(projectId, dirHandle);

  console.log(`[Persistence] Saved handle for ${projectId} with persistent storage`);
}
