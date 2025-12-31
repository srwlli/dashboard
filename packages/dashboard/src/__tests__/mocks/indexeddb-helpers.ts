/**
 * IndexedDB Test Helpers
 *
 * Utilities for testing IndexedDB operations with fake-indexeddb.
 * These helpers simplify test setup and provide common assertions.
 */

import { openDB, saveDirectoryHandle, getDirectoryHandle } from '@/lib/coderef/indexeddb';

/**
 * Clear all IndexedDB databases (reset between tests)
 */
export async function clearIndexedDB(): Promise<void> {
  const databases = await indexedDB.databases();
  for (const db of databases) {
    if (db.name) {
      indexedDB.deleteDatabase(db.name);
    }
  }
}

/**
 * Verify database exists and has correct structure
 */
export async function verifyDatabaseStructure(): Promise<boolean> {
  try {
    const db = await openDB();
    const hasStore = db.objectStoreNames.contains('directoryHandles');
    db.close();
    return hasStore;
  } catch {
    return false;
  }
}

/**
 * Create a mock FileSystemDirectoryHandle for testing
 */
export function createMockDirectoryHandle(
  name: string,
  options: {
    queryPermission?: 'granted' | 'denied' | 'prompt';
    isValid?: boolean;
  } = {}
): FileSystemDirectoryHandle {
  const { queryPermission = 'granted', isValid = true } = options;

  const mockHandle = {
    kind: 'directory' as const,
    name,
    isSameEntry: jest.fn(() => Promise.resolve(true)),

    // Permission methods
    queryPermission: jest.fn(() => Promise.resolve(queryPermission)),
    requestPermission: jest.fn(() => Promise.resolve('granted' as PermissionState)),

    // Directory iteration (for validity checks)
    values: jest.fn(() => {
      if (!isValid) {
        throw new DOMException('Handle is stale', 'NotFoundError');
      }
      return {
        next: jest.fn(() => Promise.resolve({ done: true, value: undefined })),
        [Symbol.asyncIterator]: function () {
          return this;
        },
      };
    }),

    // Other required methods
    getDirectoryHandle: jest.fn(),
    getFileHandle: jest.fn(),
    removeEntry: jest.fn(),
    resolve: jest.fn(),
    entries: jest.fn(),
    keys: jest.fn(),
    [Symbol.asyncIterator]: jest.fn(),
  } as unknown as FileSystemDirectoryHandle;

  return mockHandle;
}

/**
 * Helper to save a mock handle and verify it's stored
 */
export async function saveMockHandle(
  projectId: string,
  handleName: string = 'test-project'
): Promise<FileSystemDirectoryHandle> {
  const mockHandle = createMockDirectoryHandle(handleName);
  await saveDirectoryHandle(projectId, mockHandle);

  // Verify it was saved
  const retrieved = await getDirectoryHandle(projectId);
  if (!retrieved) {
    throw new Error(`Failed to save handle for ${projectId}`);
  }

  return mockHandle;
}

/**
 * Assert that a handle is stored correctly in IndexedDB
 */
export async function assertHandleStored(
  projectId: string,
  expectedName?: string
): Promise<void> {
  const handle = await getDirectoryHandle(projectId);
  expect(handle).toBeDefined();

  if (expectedName) {
    expect(handle?.name).toBe(expectedName);
  }
}

/**
 * Assert that a handle is NOT in IndexedDB
 */
export async function assertHandleNotStored(projectId: string): Promise<void> {
  const handle = await getDirectoryHandle(projectId);
  expect(handle).toBeUndefined();
}

/**
 * Test helper: Create multiple mock projects in IndexedDB
 */
export async function createMultipleMockProjects(count: number): Promise<string[]> {
  const projectIds: string[] = [];

  for (let i = 0; i < count; i++) {
    const projectId = `project-${i}`;
    await saveMockHandle(projectId, `test-project-${i}`);
    projectIds.push(projectId);
  }

  return projectIds;
}
