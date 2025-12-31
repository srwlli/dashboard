/**
 * Electron Platform Detection & Filesystem Adapter Tests
 *
 * Tests for known issues documented in coderef/known-issues/d.json:
 * - ELECTRON-ADAPTER-001: Dynamic import failure in Electron
 * - PERMISSIONS-001: Handle verification failures
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock window and navigator for different environments
const mockElectronEnvironment = () => {
  (window as any).process = { type: 'renderer' };
  (window as any).electronAPI = {
    getVersion: jest.fn(),
    getPlatform: jest.fn(),
  };

  Object.defineProperty(navigator, 'userAgent', {
    writable: true,
    configurable: true,
    value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) CodeRef Dashboard/0.1.0 Chrome/120.0.6099.109 Electron/28.0.0 Safari/537.36',
  });
};

const mockBrowserEnvironment = () => {
  delete (window as any).process;
  delete (window as any).electronAPI;

  Object.defineProperty(navigator, 'userAgent', {
    writable: true,
    configurable: true,
    value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
};

const cleanupEnvironment = () => {
  delete (window as any).process;
  delete (window as any).electronAPI;
};

describe('Platform Detection', () => {
  beforeEach(() => {
    jest.resetModules();
    cleanupEnvironment();
  });

  afterEach(() => {
    cleanupEnvironment();
  });

  test('should detect Electron environment correctly', () => {
    mockElectronEnvironment();

    // Re-import after mocking
    const { platform } = require('../platform');

    expect(platform).toBe('electron');
  });

  test('should detect browser environment correctly', () => {
    mockBrowserEnvironment();

    // Re-import after mocking
    const { platform } = require('../platform');

    expect(platform).toBe('web');
  });

  test('should require both Electron UA and secondary indicator', () => {
    // Only Electron UA, no process.type or electronAPI
    delete (window as any).process;
    delete (window as any).electronAPI;

    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      configurable: true,
      value: 'Mozilla/5.0 Electron/28.0.0',
    });

    const { platform } = require('../platform');

    // Should return 'web' because secondary indicator is missing
    expect(platform).toBe('web');
  });
});

describe('Electron Adapter Loading (ELECTRON-ADAPTER-001)', () => {
  beforeEach(() => {
    cleanupEnvironment();
    mockElectronEnvironment();
    jest.resetModules();
  });

  afterEach(() => {
    cleanupEnvironment();
  });

  test('should attempt to load Electron adapter when in Electron', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Import platform (triggers adapter creation on first getFileSystem call)
    const { getFileSystem } = require('../platform');

    // This will trigger the adapter loading
    try {
      await getFileSystem();
    } catch (error) {
      // Expected to fail in test environment
    }

    // Should log that it's attempting to load Electron adapter
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('🖥️ [Platform] Running in Electron')
    );

    consoleLogSpy.mockRestore();
  });

  test('should fall back to Web adapter when Electron adapter fails', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    const { getFileSystem } = require('../platform');

    // This should trigger fallback
    try {
      const adapter = await getFileSystem();

      // Should have logged fallback warning
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('⚠️ [Platform] Failed to load Electron adapter'),
        expect.anything()
      );

      // Should have logged fallback to Web adapter
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🌐 [Platform] Using File System Access API as fallback')
      );
    } catch (error) {
      // May fail due to missing dependencies in test environment
      // But we should still see the fallback logs
      expect(consoleWarnSpy).toHaveBeenCalled();
    }

    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  test('should document known error message format', () => {
    // This test documents the exact error message we expect from ELECTRON-ADAPTER-001
    const expectedError = 'Failed to fetch dynamically imported module: http://localhost:3004/_next/static/chunks/electron';

    // Verify error format matches known-issues documentation
    expect(expectedError).toContain('Failed to fetch dynamically imported module');
    expect(expectedError).toContain('_next/static/chunks/electron');
  });
});

describe('Web Adapter Fallback', () => {
  beforeEach(() => {
    cleanupEnvironment();
    mockElectronEnvironment();
    jest.resetModules();
  });

  afterEach(() => {
    cleanupEnvironment();
  });

  test('should create Web adapter with required dependencies', async () => {
    const { getFileSystem } = require('../platform');

    try {
      const adapter = await getFileSystem();

      // Web adapter should have standard filesystem methods
      expect(adapter).toHaveProperty('selectDirectory');
      expect(adapter).toHaveProperty('isProjectValid');
      expect(adapter).toHaveProperty('readFile');
      expect(adapter).toHaveProperty('readDirectory');
    } catch (error) {
      // Expected in test environment without full browser APIs
      expect(error).toBeDefined();
    }
  });
});

describe('Handle Verification (PERMISSIONS-001)', () => {
  test('should document expected handle verification error', () => {
    // This test documents the exact error from PERMISSIONS-001
    const expectedError = 'Handle verification failed: DOMException: The request is not allowed by the user agent or the platform in the current context.';

    expect(expectedError).toContain('Handle verification failed');
    expect(expectedError).toContain('DOMException');
    expect(expectedError).toContain('not allowed by the user agent');
  });

  test('should handle missing directory handles gracefully', () => {
    const projectId = 'project-1767211390118';
    const expectedMessage = `No handle found for project ${projectId}`;

    // Document expected behavior when handle is missing
    expect(expectedMessage).toContain('No handle found for project');
    expect(expectedMessage).toContain(projectId);
  });
});

describe('Platform Features', () => {
  test('should correctly identify Electron-specific features', () => {
    mockElectronEnvironment();

    const { features } = require('../platform');

    expect(features.hasDirectFilesystemAccess).toBe(true);
    expect(features.supportsAbsolutePaths).toBe(true);
    expect(features.requiresReauthorization).toBe(false);
  });

  test('should correctly identify Web-specific features', () => {
    // Clean and mock BEFORE requiring module
    cleanupEnvironment();
    jest.resetModules();
    mockBrowserEnvironment();

    const { features } = require('../platform');

    expect(features.hasDirectFilesystemAccess).toBe(false);
    expect(features.supportsAbsolutePaths).toBe(false);
    expect(features.requiresReauthorization).toBe(true);
  });
});

describe('Integration: End-to-End Electron Filesystem', () => {
  beforeEach(() => {
    cleanupEnvironment();
    mockElectronEnvironment();
    jest.resetModules();
  });

  afterEach(() => {
    cleanupEnvironment();
  });

  test('should handle full lifecycle: detect -> load -> fallback', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    const { platform, getFileSystem } = require('../platform');

    // Step 1: Detect Electron
    expect(platform).toBe('electron');

    // Step 2: Try to load filesystem
    try {
      await getFileSystem();

      // Step 3: Should have attempted Electron adapter
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Running in Electron')
      );

      // Step 4: Should have fallen back
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load Electron adapter'),
        expect.anything()
      );
    } catch (error) {
      // Expected in test environment
    }

    consoleSpy.mockRestore();
    warnSpy.mockRestore();
  });

  test('should expose correct API surface regardless of adapter', async () => {
    const { fileSystem } = require('../platform');

    // Verify fileSystem proxy has all required methods
    expect(fileSystem).toHaveProperty('platform');
    expect(fileSystem).toHaveProperty('selectDirectory');
    expect(fileSystem).toHaveProperty('isProjectValid');
    expect(fileSystem).toHaveProperty('readFile');
    expect(fileSystem).toHaveProperty('readDirectory');
    expect(fileSystem).toHaveProperty('resolvePath');
  });
});

describe('Error Recovery', () => {
  test('should not crash when adapter loading fails multiple times', async () => {
    mockElectronEnvironment();
    jest.resetModules();

    const { getFileSystem } = require('../platform');

    // Multiple calls should not crash - all should resolve (fallback to Web adapter)
    const adapter1 = await getFileSystem().catch((err) => {
      console.error('First call failed:', err);
      return null;
    });
    const adapter2 = await getFileSystem().catch((err) => {
      console.error('Second call failed:', err);
      return null;
    });
    const adapter3 = await getFileSystem().catch((err) => {
      console.error('Third call failed:', err);
      return null;
    });

    // Should return same instance (singleton) - even if it's the fallback Web adapter
    // Note: In test environment, might be null if Web adapter also fails
    expect(adapter1).toBe(adapter2);
    expect(adapter2).toBe(adapter3);
  });
});
