/**
 * Smoke Test - Verify Jest + Testing Infrastructure Setup
 *
 * This test verifies that:
 * 1. Jest is configured correctly
 * 2. IndexedDB mocking works (fake-indexeddb)
 * 3. localStorage mocking works
 * 4. navigator.storage API mocking works
 * 5. Test utilities are available
 *
 * If this test passes, the testing infrastructure is ready.
 */

import { openDB, saveDirectoryHandle, getDirectoryHandle } from '@/lib/coderef/indexeddb';
import { createMockDirectoryHandle } from '../mocks/file-system-access';

describe('Testing Infrastructure - Smoke Tests', () => {
  describe('Jest Configuration', () => {
    test('should run tests in jsdom environment', () => {
      expect(typeof window).toBe('object');
      expect(typeof document).toBe('object');
    });

    test('should support TypeScript imports', () => {
      expect(openDB).toBeDefined();
      expect(saveDirectoryHandle).toBeDefined();
      expect(getDirectoryHandle).toBeDefined();
    });
  });

  describe('IndexedDB Mocking (fake-indexeddb)', () => {
    test('should support IndexedDB API', () => {
      expect(indexedDB).toBeDefined();
      expect(indexedDB.open).toBeDefined();
    });

    test('should create and open database', async () => {
      const db = await openDB();
      expect(db).toBeDefined();
      expect(db.name).toBe('CodeRefExplorer');
      expect(db.version).toBe(1);
      db.close();
    });

    test('should save and retrieve directory handle', async () => {
      const projectId = 'test-project-1';
      const mockHandle = createMockDirectoryHandle('test-folder');

      // Save handle
      await saveDirectoryHandle(projectId, mockHandle);

      // Retrieve handle
      const retrieved = await getDirectoryHandle(projectId);
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('test-folder');
    });

    test('should return undefined for non-existent handle', async () => {
      const retrieved = await getDirectoryHandle('non-existent-project');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('localStorage Mocking', () => {
    test('should support localStorage API', () => {
      expect(localStorage).toBeDefined();
      expect(localStorage.setItem).toBeDefined();
      expect(localStorage.getItem).toBeDefined();
    });

    test('should store and retrieve values', () => {
      localStorage.setItem('test-key', 'test-value');
      const value = localStorage.getItem('test-key');
      expect(value).toBe('test-value');
    });

    test('should clear correctly', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      expect(localStorage.length).toBe(2);

      localStorage.clear();
      expect(localStorage.length).toBe(0);
    });

    test('should auto-clear after each test', () => {
      // This test verifies afterEach() in jest.setup.js works
      expect(localStorage.length).toBe(0);
    });
  });

  describe('navigator.storage API Mocking', () => {
    test('should support navigator.storage API', () => {
      expect(navigator.storage).toBeDefined();
      expect(navigator.storage.persist).toBeDefined();
      expect(navigator.storage.persisted).toBeDefined();
    });

    test('should mock persist() method', async () => {
      const result = await navigator.storage.persist();
      expect(result).toBe(true);
    });

    test('should mock persisted() method', async () => {
      const result = await navigator.storage.persisted();
      expect(result).toBe(true);
    });

    test('should mock estimate() method', async () => {
      const estimate = await navigator.storage.estimate();
      expect(estimate).toBeDefined();
      expect(estimate.usage).toBeDefined();
      expect(estimate.quota).toBeDefined();
    });
  });

  describe('Test Utilities', () => {
    test('should provide console spy utilities', () => {
      expect(global.testUtils).toBeDefined();
      expect(global.testUtils.spyConsole).toBeDefined();
      expect(global.testUtils.suppressErrors).toBeDefined();
    });

    test('should spy on console.log', () => {
      const { spy, restore } = global.testUtils.spyConsole();

      console.log('test message');
      expect(spy).toHaveBeenCalledWith('test message');

      restore();
    });

    test('should suppress console errors', () => {
      const { restore } = global.testUtils.suppressErrors();

      // These should not appear in test output
      console.error('This error is suppressed');
      console.warn('This warning is suppressed');

      restore();
    });
  });

  describe('Mock Utilities', () => {
    test('should create mock directory handles', () => {
      const handle = createMockDirectoryHandle('test-folder');
      expect(handle).toBeDefined();
      expect(handle.name).toBe('test-folder');
      expect(handle.kind).toBe('directory');
    });

    test('should mock permission states', async () => {
      const handle = createMockDirectoryHandle('test', {
        permissionState: 'granted',
      });

      const permission = await handle.queryPermission({ mode: 'read' });
      expect(permission).toBe('granted');
    });

    test('should simulate stale handles', async () => {
      const handle = createMockDirectoryHandle('test', { isValid: false });

      await expect(async () => {
        const iterator = handle.values();
        await iterator.next();
      }).rejects.toThrow();
    });
  });
});
