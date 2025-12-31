/**
 * File System Access API Mocks
 *
 * Provides mock implementations of the File System Access API for testing.
 * Includes utilities for simulating user interactions, permission states,
 * and error conditions.
 */

/**
 * Mock window.showDirectoryPicker for testing
 *
 * Usage in tests:
 * ```
 * mockShowDirectoryPicker('my-folder', { cancelled: false });
 * ```
 */
export function mockShowDirectoryPicker(
  folderName: string = 'test-folder',
  options: {
    cancelled?: boolean;
    error?: Error;
  } = {}
): jest.Mock {
  const { cancelled = false, error } = options;

  const mock = jest.fn(() => {
    if (error) {
      return Promise.reject(error);
    }

    if (cancelled) {
      // User cancelled - return null or throw AbortError
      return Promise.reject(new DOMException('User cancelled', 'AbortError'));
    }

    // Return mock directory handle
    return Promise.resolve(createMockDirectoryHandle(folderName));
  });

  // @ts-ignore - Assign to global window
  global.showDirectoryPicker = mock;

  return mock;
}

/**
 * Create a mock FileSystemDirectoryHandle with configurable behavior
 */
export function createMockDirectoryHandle(
  name: string,
  options: {
    permissionState?: 'granted' | 'denied' | 'prompt';
    isValid?: boolean;
    shouldRequestSucceed?: boolean;
  } = {}
): FileSystemDirectoryHandle {
  const {
    permissionState = 'granted',
    isValid = true,
    shouldRequestSucceed = true,
  } = options;

  let currentPermission = permissionState;

  const mockHandle = {
    kind: 'directory' as const,
    name,

    // Permission APIs
    queryPermission: jest.fn((descriptor?: { mode?: 'read' | 'readwrite' }) =>
      Promise.resolve(currentPermission as PermissionState)
    ),

    requestPermission: jest.fn((descriptor?: { mode?: 'read' | 'readwrite' }) => {
      if (shouldRequestSucceed && currentPermission === 'prompt') {
        currentPermission = 'granted';
      }
      return Promise.resolve(currentPermission as PermissionState);
    }),

    // Validity check - used by verifyHandleValid()
    values: jest.fn(() => {
      if (!isValid) {
        throw new DOMException('Handle is no longer valid', 'NotFoundError');
      }

      return {
        next: jest.fn(() => Promise.resolve({ done: true, value: undefined })),
        [Symbol.asyncIterator]: function () {
          return this;
        },
      };
    }),

    // Entry comparison
    isSameEntry: jest.fn((other: FileSystemHandle) =>
      Promise.resolve(other === mockHandle)
    ),

    // Directory operations (stubs)
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
 * Mock navigator.storage.persist() behavior
 */
export function mockPersistentStorage(
  options: {
    persist?: boolean;
    persisted?: boolean;
  } = {}
): void {
  const { persist = true, persisted = true } = options;

  global.navigator.storage = {
    persist: jest.fn(() => Promise.resolve(persist)),
    persisted: jest.fn(() => Promise.resolve(persisted)),
    estimate: jest.fn(() =>
      Promise.resolve({
        usage: 1024 * 1024, // 1 MB
        quota: 1024 * 1024 * 1024, // 1 GB
      })
    ),
  };
}

/**
 * Simulate browser not supporting File System Access API
 */
export function mockUnsupportedBrowser(): void {
  // @ts-ignore - Remove API from window
  delete global.showDirectoryPicker;
}

/**
 * Restore File System Access API support
 */
export function restoreBrowserSupport(): void {
  mockShowDirectoryPicker();
}

/**
 * Create a stale handle (directory was deleted)
 */
export function createStaleHandle(name: string): FileSystemDirectoryHandle {
  return createMockDirectoryHandle(name, {
    isValid: false,
    permissionState: 'granted',
  });
}

/**
 * Create a handle that needs permission (state: prompt)
 */
export function createHandleNeedingPermission(
  name: string
): FileSystemDirectoryHandle {
  return createMockDirectoryHandle(name, {
    permissionState: 'prompt',
    shouldRequestSucceed: true,
  });
}

/**
 * Create a handle with denied permission
 */
export function createHandleWithDeniedPermission(
  name: string
): FileSystemDirectoryHandle {
  return createMockDirectoryHandle(name, {
    permissionState: 'denied',
    shouldRequestSucceed: false,
  });
}

/**
 * Test scenario: Simulate full permission flow
 *
 * 1. Handle created with 'prompt' state
 * 2. queryPermission returns 'prompt'
 * 3. requestPermission called → returns 'granted'
 * 4. queryPermission now returns 'granted'
 */
export function createPermissionFlowHandle(
  name: string
): FileSystemDirectoryHandle {
  let state: 'granted' | 'prompt' | 'denied' = 'prompt';

  const handle = createMockDirectoryHandle(name, { permissionState: state });

  // Override to track state changes
  handle.queryPermission = jest.fn(() => Promise.resolve(state as PermissionState));

  handle.requestPermission = jest.fn(() => {
    if (state === 'prompt') {
      state = 'granted';
    }
    return Promise.resolve(state as PermissionState);
  });

  return handle;
}

/**
 * Assert that permission was requested (user interaction)
 */
export function assertPermissionRequested(
  handle: FileSystemDirectoryHandle
): void {
  expect(handle.requestPermission).toHaveBeenCalled();
}

/**
 * Assert that permission was NOT requested (silent check only)
 */
export function assertPermissionNotRequested(
  handle: FileSystemDirectoryHandle
): void {
  expect(handle.requestPermission).not.toHaveBeenCalled();
}
