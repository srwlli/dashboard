/**
 * IndexedDB Tests - Directory Handle Storage
 *
 * Tests the IndexedDB layer that stores FileSystemDirectoryHandle objects.
 * This is critical for Issue 1 - handles must survive browser restart.
 *
 * Test Coverage:
 * - openDB() - 3 tests
 * - saveDirectoryHandle() - 4 tests
 * - getDirectoryHandle() - 4 tests
 * - deleteDirectoryHandle() - 2 tests
 * - listStoredProjects() - 2 tests
 *
 * Total: 15 tests
 */

import {
  openDB,
  saveDirectoryHandle,
  getDirectoryHandle,
  deleteDirectoryHandle,
  listStoredProjects,
} from '../indexeddb';
import { createMockDirectoryHandle } from '@/__tests__/mocks/file-system-access';

describe('IndexedDB - Directory Handle Storage', () => {
  // Clear IndexedDB before each test
  beforeEach(async () => {
    // Delete the database to start fresh
    const databases = await indexedDB.databases();
    for (const db of databases) {
      if (db.name === 'CodeRefExplorer') {
        indexedDB.deleteDatabase(db.name);
      }
    }
  });

  // ============================================================================
  // openDB() - 3 tests
  // ============================================================================

  describe('openDB()', () => {
    test('should create database with correct name and version', async () => {
      const db = await openDB();

      expect(db.name).toBe('CodeRefExplorer');
      expect(db.version).toBe(1);

      db.close();
    });

    test('should create "directoryHandles" object store', async () => {
      const db = await openDB();

      expect(db.objectStoreNames.contains('directoryHandles')).toBe(true);

      db.close();
    });

    test('should reuse existing database on subsequent opens', async () => {
      const db1 = await openDB();
      db1.close();

      const db2 = await openDB();
      expect(db2.name).toBe('CodeRefExplorer');
      expect(db2.version).toBe(1);

      db2.close();
    });
  });

  // ============================================================================
  // saveDirectoryHandle() - 4 tests
  // ============================================================================

  describe('saveDirectoryHandle()', () => {
    test('should save directory handle to IndexedDB', async () => {
      const projectId = 'test-project-1';
      const mockHandle = createMockDirectoryHandle('my-project');

      await saveDirectoryHandle(projectId, mockHandle);

      // Verify it was saved
      const retrieved = await getDirectoryHandle(projectId);
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('my-project');
    });

    test('should include savedAt timestamp', async () => {
      const projectId = 'test-project-2';
      const mockHandle = createMockDirectoryHandle('timestamped-project');

      const beforeSave = new Date().toISOString();
      await saveDirectoryHandle(projectId, mockHandle);
      const afterSave = new Date().toISOString();

      // Verify timestamp was saved
      const db = await openDB();
      const transaction = db.transaction('directoryHandles', 'readonly');
      const store = transaction.objectStore('directoryHandles');
      const request = store.get(projectId);

      const record = await new Promise<any>((resolve) => {
        request.onsuccess = () => resolve(request.result);
      });

      expect(record.savedAt).toBeDefined();
      expect(record.savedAt >= beforeSave).toBe(true);
      expect(record.savedAt <= afterSave).toBe(true);

      db.close();
    });

    test('should update existing handle when saving again', async () => {
      const projectId = 'test-project-3';
      const handle1 = createMockDirectoryHandle('version-1');
      const handle2 = createMockDirectoryHandle('version-2');

      // Save first handle
      await saveDirectoryHandle(projectId, handle1);
      const retrieved1 = await getDirectoryHandle(projectId);
      expect(retrieved1?.name).toBe('version-1');

      // Update with second handle
      await saveDirectoryHandle(projectId, handle2);
      const retrieved2 = await getDirectoryHandle(projectId);
      expect(retrieved2?.name).toBe('version-2');
    });

    test('should handle multiple concurrent saves', async () => {
      const saves = [
        saveDirectoryHandle('project-a', createMockDirectoryHandle('Project A')),
        saveDirectoryHandle('project-b', createMockDirectoryHandle('Project B')),
        saveDirectoryHandle('project-c', createMockDirectoryHandle('Project C')),
      ];

      await Promise.all(saves);

      const handleA = await getDirectoryHandle('project-a');
      const handleB = await getDirectoryHandle('project-b');
      const handleC = await getDirectoryHandle('project-c');

      expect(handleA?.name).toBe('Project A');
      expect(handleB?.name).toBe('Project B');
      expect(handleC?.name).toBe('Project C');
    });
  });

  // ============================================================================
  // getDirectoryHandle() - 4 tests
  // ============================================================================

  describe('getDirectoryHandle()', () => {
    test('should retrieve saved directory handle', async () => {
      const projectId = 'retrieve-test-1';
      const mockHandle = createMockDirectoryHandle('retrieved-project');

      await saveDirectoryHandle(projectId, mockHandle);
      const retrieved = await getDirectoryHandle(projectId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('retrieved-project');
      expect(retrieved?.kind).toBe('directory');
    });

    test('should return undefined for non-existent project', async () => {
      const retrieved = await getDirectoryHandle('does-not-exist');

      expect(retrieved).toBeUndefined();
    });

    test('should retrieve correct handle among multiple saved handles', async () => {
      await saveDirectoryHandle('project-x', createMockDirectoryHandle('Project X'));
      await saveDirectoryHandle('project-y', createMockDirectoryHandle('Project Y'));
      await saveDirectoryHandle('project-z', createMockDirectoryHandle('Project Z'));

      const retrievedY = await getDirectoryHandle('project-y');
      expect(retrievedY?.name).toBe('Project Y');
    });

    test('should preserve handle properties after save/retrieve cycle', async () => {
      const mockHandle = createMockDirectoryHandle('property-test', {
        permissionState: 'granted',
        isValid: true,
      });

      await saveDirectoryHandle('property-project', mockHandle);
      const retrieved = await getDirectoryHandle('property-project');

      // Verify the handle methods are preserved
      expect(retrieved?.queryPermission).toBeDefined();
      expect(retrieved?.requestPermission).toBeDefined();
      expect(retrieved?.values).toBeDefined();
    });
  });

  // ============================================================================
  // deleteDirectoryHandle() - 2 tests
  // ============================================================================

  describe('deleteDirectoryHandle()', () => {
    test('should delete directory handle from IndexedDB', async () => {
      const projectId = 'delete-test-1';
      const mockHandle = createMockDirectoryHandle('to-be-deleted');

      // Save then delete
      await saveDirectoryHandle(projectId, mockHandle);
      const beforeDelete = await getDirectoryHandle(projectId);
      expect(beforeDelete).toBeDefined();

      await deleteDirectoryHandle(projectId);
      const afterDelete = await getDirectoryHandle(projectId);
      expect(afterDelete).toBeUndefined();
    });

    test('should not throw error when deleting non-existent handle', async () => {
      // Should not throw
      await expect(
        deleteDirectoryHandle('never-existed')
      ).resolves.not.toThrow();
    });
  });

  // ============================================================================
  // listStoredProjects() - 2 tests
  // ============================================================================

  describe('listStoredProjects()', () => {
    test('should return list of all stored project IDs', async () => {
      await saveDirectoryHandle('list-project-1', createMockDirectoryHandle('P1'));
      await saveDirectoryHandle('list-project-2', createMockDirectoryHandle('P2'));
      await saveDirectoryHandle('list-project-3', createMockDirectoryHandle('P3'));

      const projectIds = await listStoredProjects();

      expect(projectIds).toHaveLength(3);
      expect(projectIds).toContain('list-project-1');
      expect(projectIds).toContain('list-project-2');
      expect(projectIds).toContain('list-project-3');
    });

    test('should return empty array when no projects stored', async () => {
      const projectIds = await listStoredProjects();

      expect(projectIds).toEqual([]);
    });
  });

  // ============================================================================
  // CRITICAL TEST: Browser Restart Simulation
  // ============================================================================

  describe('Browser Restart Simulation', () => {
    test('CRITICAL: Handle should survive database close/reopen (simulated restart)', async () => {
      const projectId = 'restart-test';
      const mockHandle = createMockDirectoryHandle('survives-restart', {
        permissionState: 'granted',
      });

      // Save handle
      await saveDirectoryHandle(projectId, mockHandle);

      // Close database (simulate browser close)
      let db = await openDB();
      db.close();

      // "Restart browser" - reopen database
      db = await openDB();
      db.close();

      // Retrieve handle (this should work if handles survive restart)
      const retrieved = await getDirectoryHandle(projectId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('survives-restart');
    });

    test('CRITICAL: Multiple handles should survive restart', async () => {
      // Save 5 handles
      for (let i = 1; i <= 5; i++) {
        await saveDirectoryHandle(
          `restart-project-${i}`,
          createMockDirectoryHandle(`Project ${i}`)
        );
      }

      // Close database
      let db = await openDB();
      db.close();

      // Reopen database (simulated restart)
      db = await openDB();
      db.close();

      // All handles should still be there
      const projectIds = await listStoredProjects();
      expect(projectIds).toHaveLength(5);

      for (let i = 1; i <= 5; i++) {
        const handle = await getDirectoryHandle(`restart-project-${i}`);
        expect(handle).toBeDefined();
        expect(handle?.name).toBe(`Project ${i}`);
      }
    });
  });
});
