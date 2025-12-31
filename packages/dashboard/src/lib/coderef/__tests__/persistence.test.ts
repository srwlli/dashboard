/**
 * Persistence Layer Tests - Issue 1: File System Access API Persistence
 *
 * Tests the enhanced persistence layer that should make directory handles
 * survive browser restarts without requiring re-authorization.
 *
 * Test Coverage:
 * - requestPersistentStorage() - 4 tests
 * - isStoragePersistent() - 2 tests
 * - attemptSilentRestore() - 6 tests
 * - batchRestorePermissions() - 3 tests
 * - initializePersistence() - 3 tests
 * - saveDirectoryHandlePersistent() - 2 tests
 *
 * Total: 20 tests
 */

import {
  requestPersistentStorage,
  isStoragePersistent,
  attemptSilentRestore,
  batchRestorePermissions,
  initializePersistence,
  saveDirectoryHandlePersistent,
} from '../persistence';
import { saveDirectoryHandle, getDirectoryHandle } from '../indexeddb';
import {
  createMockDirectoryHandle,
  createStaleHandle,
  createHandleNeedingPermission,
  createHandleWithDeniedPermission,
  mockPersistentStorage,
} from '@/__tests__/mocks/file-system-access';
import type { Project } from '../types';

// Mock the indexeddb module
jest.mock('../indexeddb', () => ({
  saveDirectoryHandle: jest.fn(),
  getDirectoryHandle: jest.fn(),
}));

// Mock the permissions module
jest.mock('../permissions', () => ({
  verifyHandleValid: jest.fn(),
}));

const mockSaveDirectoryHandle = saveDirectoryHandle as jest.Mock;
const mockGetDirectoryHandle = getDirectoryHandle as jest.Mock;

describe('Persistence Layer - Issue 1 Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset navigator.storage mock
    mockPersistentStorage({ persist: true, persisted: true });
  });

  // ============================================================================
  // requestPersistentStorage() - 4 tests
  // ============================================================================

  describe('requestPersistentStorage()', () => {
    test('should return true when storage is already persistent', async () => {
      mockPersistentStorage({ persisted: true });

      const result = await requestPersistentStorage();

      expect(result).toBe(true);
      expect(navigator.storage.persisted).toHaveBeenCalled();
    });

    test('should request permission when storage is not persistent', async () => {
      mockPersistentStorage({ persisted: false, persist: true });

      const result = await requestPersistentStorage();

      expect(result).toBe(true);
      expect(navigator.storage.persist).toHaveBeenCalled();
    });

    test('should return false when permission is denied', async () => {
      mockPersistentStorage({ persisted: false, persist: false });

      const result = await requestPersistentStorage();

      expect(result).toBe(false);
      expect(navigator.storage.persist).toHaveBeenCalled();
    });

    test('should return false when API is not available (Safari)', async () => {
      // Simulate Safari - no navigator.storage
      // @ts-ignore
      delete global.navigator.storage;

      const result = await requestPersistentStorage();

      expect(result).toBe(false);

      // Restore for other tests
      mockPersistentStorage();
    });
  });

  // ============================================================================
  // isStoragePersistent() - 2 tests
  // ============================================================================

  describe('isStoragePersistent()', () => {
    test('should return true when storage is persistent', async () => {
      mockPersistentStorage({ persisted: true });

      const result = await isStoragePersistent();

      expect(result).toBe(true);
    });

    test('should return false when API is not available', async () => {
      // @ts-ignore
      delete global.navigator.storage;

      const result = await isStoragePersistent();

      expect(result).toBe(false);

      // Restore
      mockPersistentStorage();
    });
  });

  // ============================================================================
  // attemptSilentRestore() - 6 tests
  // ============================================================================

  describe('attemptSilentRestore() - Silent Permission Restoration', () => {
    test('should return true when handle has granted permission', async () => {
      const mockHandle = createMockDirectoryHandle('test-project', {
        permissionState: 'granted',
        isValid: true,
      });

      mockGetDirectoryHandle.mockResolvedValue(mockHandle);

      // Mock verifyHandleValid from permissions module
      const { verifyHandleValid } = require('../permissions');
      verifyHandleValid.mockResolvedValue(true);

      const result = await attemptSilentRestore('project-123');

      expect(result).toBe(true);
      expect(mockGetDirectoryHandle).toHaveBeenCalledWith('project-123');
      expect(mockHandle.queryPermission).toHaveBeenCalledWith({ mode: 'read' });
      // Should NOT call requestPermission (silent restore)
      expect(mockHandle.requestPermission).not.toHaveBeenCalled();
    });

    test('should return false when handle is not in IndexedDB', async () => {
      mockGetDirectoryHandle.mockResolvedValue(undefined);

      const result = await attemptSilentRestore('missing-project');

      expect(result).toBe(false);
    });

    test('should return false when handle is stale (directory deleted)', async () => {
      const staleHandle = createStaleHandle('deleted-project');
      mockGetDirectoryHandle.mockResolvedValue(staleHandle);

      // Mock verifyHandleValid to return false
      const { verifyHandleValid } = require('../permissions');
      verifyHandleValid.mockResolvedValue(false);

      const result = await attemptSilentRestore('project-456');

      expect(result).toBe(false);
    });

    test('should return false when permission is "prompt" (needs user interaction)', async () => {
      const handleNeedingPermission = createHandleNeedingPermission('test');
      mockGetDirectoryHandle.mockResolvedValue(handleNeedingPermission);

      const { verifyHandleValid } = require('../permissions');
      verifyHandleValid.mockResolvedValue(true);

      const result = await attemptSilentRestore('project-789');

      expect(result).toBe(false);
      // Should NOT call requestPermission (silent restore only)
      expect(handleNeedingPermission.requestPermission).not.toHaveBeenCalled();
    });

    test('should return false when permission is "denied"', async () => {
      const deniedHandle = createHandleWithDeniedPermission('denied-project');
      mockGetDirectoryHandle.mockResolvedValue(deniedHandle);

      const { verifyHandleValid } = require('../permissions');
      verifyHandleValid.mockResolvedValue(true);

      const result = await attemptSilentRestore('project-denied');

      expect(result).toBe(false);
    });

    test('should handle errors gracefully', async () => {
      mockGetDirectoryHandle.mockRejectedValue(new Error('IndexedDB error'));

      const result = await attemptSilentRestore('error-project');

      expect(result).toBe(false);
    });
  });

  // ============================================================================
  // batchRestorePermissions() - 3 tests
  // ============================================================================

  describe('batchRestorePermissions() - Batch Restoration', () => {
    test('should restore multiple projects in parallel', async () => {
      const projects: Project[] = [
        {
          id: 'project-1',
          name: 'Project 1',
          path: '[Directory: project-1]',
          addedAt: '2024-01-01',
        },
        {
          id: 'project-2',
          name: 'Project 2',
          path: '[Directory: project-2]',
          addedAt: '2024-01-01',
        },
      ];

      const handle1 = createMockDirectoryHandle('project-1', {
        permissionState: 'granted',
      });
      const handle2 = createMockDirectoryHandle('project-2', {
        permissionState: 'granted',
      });

      mockGetDirectoryHandle
        .mockResolvedValueOnce(handle1)
        .mockResolvedValueOnce(handle2);

      const { verifyHandleValid } = require('../permissions');
      verifyHandleValid.mockResolvedValue(true);

      const results = await batchRestorePermissions(projects);

      expect(results.size).toBe(2);
      expect(results.get('project-1')).toBe(true);
      expect(results.get('project-2')).toBe(true);
    });

    test('should filter and only restore File System Access API projects', async () => {
      const projects: Project[] = [
        {
          id: 'fsa-project',
          name: 'FSA Project',
          path: '[Directory: fsa-project]', // File System Access API
          addedAt: '2024-01-01',
        },
        {
          id: 'local-project',
          name: 'Local Project',
          path: '/Users/test/projects/local', // Regular path
          addedAt: '2024-01-01',
        },
      ];

      const handle = createMockDirectoryHandle('fsa-project', {
        permissionState: 'granted',
      });
      mockGetDirectoryHandle.mockResolvedValue(handle);

      const { verifyHandleValid } = require('../permissions');
      verifyHandleValid.mockResolvedValue(true);

      const results = await batchRestorePermissions(projects);

      // Only FSA project should be processed
      expect(results.size).toBe(1);
      expect(results.has('fsa-project')).toBe(true);
      expect(results.has('local-project')).toBe(false);
    });

    test('should return mixed results when some projects fail', async () => {
      const projects: Project[] = [
        {
          id: 'success-project',
          name: 'Success',
          path: '[Directory: success]',
          addedAt: '2024-01-01',
        },
        {
          id: 'fail-project',
          name: 'Fail',
          path: '[Directory: fail]',
          addedAt: '2024-01-01',
        },
      ];

      const successHandle = createMockDirectoryHandle('success', {
        permissionState: 'granted',
      });
      mockGetDirectoryHandle
        .mockResolvedValueOnce(successHandle)
        .mockResolvedValueOnce(undefined); // Missing handle

      const { verifyHandleValid } = require('../permissions');
      verifyHandleValid.mockResolvedValue(true);

      const results = await batchRestorePermissions(projects);

      expect(results.get('success-project')).toBe(true);
      expect(results.get('fail-project')).toBe(false);
    });
  });

  // ============================================================================
  // initializePersistence() - 3 tests
  // ============================================================================

  describe('initializePersistence() - Full Initialization', () => {
    test('should request persistent storage and restore all projects', async () => {
      mockPersistentStorage({ persist: true });

      const projects: Project[] = [
        {
          id: 'project-a',
          name: 'Project A',
          path: '[Directory: project-a]',
          addedAt: '2024-01-01',
        },
      ];

      const handle = createMockDirectoryHandle('project-a', {
        permissionState: 'granted',
      });
      mockGetDirectoryHandle.mockResolvedValue(handle);

      const { verifyHandleValid } = require('../permissions');
      verifyHandleValid.mockResolvedValue(true);

      const needsReauth = await initializePersistence(projects);

      expect(navigator.storage.persist).toHaveBeenCalled();
      expect(needsReauth).toEqual([]);
    });

    test('should return list of projects needing re-authorization', async () => {
      const projects: Project[] = [
        {
          id: 'restored-project',
          name: 'Restored',
          path: '[Directory: restored]',
          addedAt: '2024-01-01',
        },
        {
          id: 'needs-reauth',
          name: 'Needs Reauth',
          path: '[Directory: needs-reauth]',
          addedAt: '2024-01-01',
        },
      ];

      const restoredHandle = createMockDirectoryHandle('restored', {
        permissionState: 'granted',
      });
      const needsAuthHandle = createHandleNeedingPermission('needs-reauth');

      mockGetDirectoryHandle
        .mockResolvedValueOnce(restoredHandle)
        .mockResolvedValueOnce(needsAuthHandle);

      const { verifyHandleValid } = require('../permissions');
      verifyHandleValid.mockResolvedValue(true);

      const needsReauth = await initializePersistence(projects);

      expect(needsReauth).toEqual(['needs-reauth']);
    });

    test('should work even if persistent storage is denied', async () => {
      mockPersistentStorage({ persist: false, persisted: false });

      const projects: Project[] = [
        {
          id: 'project-x',
          name: 'Project X',
          path: '[Directory: project-x]',
          addedAt: '2024-01-01',
        },
      ];

      const handle = createMockDirectoryHandle('project-x', {
        permissionState: 'granted',
      });
      mockGetDirectoryHandle.mockResolvedValue(handle);

      const { verifyHandleValid } = require('../permissions');
      verifyHandleValid.mockResolvedValue(true);

      const needsReauth = await initializePersistence(projects);

      // Should still attempt restoration even if persist() returned false
      expect(needsReauth).toEqual([]);
    });
  });

  // ============================================================================
  // saveDirectoryHandlePersistent() - 2 tests
  // ============================================================================

  describe('saveDirectoryHandlePersistent()', () => {
    test('should request persistent storage before saving', async () => {
      mockPersistentStorage({ persist: true });

      const mockHandle = createMockDirectoryHandle('test');
      mockSaveDirectoryHandle.mockResolvedValue(undefined);

      await saveDirectoryHandlePersistent('project-save', mockHandle);

      expect(navigator.storage.persist).toHaveBeenCalled();
      expect(mockSaveDirectoryHandle).toHaveBeenCalledWith(
        'project-save',
        mockHandle
      );
    });

    test('should save even if persistent storage is denied', async () => {
      mockPersistentStorage({ persist: false });

      const mockHandle = createMockDirectoryHandle('test');
      mockSaveDirectoryHandle.mockResolvedValue(undefined);

      await saveDirectoryHandlePersistent('project-fallback', mockHandle);

      // Should still save to IndexedDB
      expect(mockSaveDirectoryHandle).toHaveBeenCalledWith(
        'project-fallback',
        mockHandle
      );
    });
  });
});
