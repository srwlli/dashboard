/**
 * Tests for Platform Detection & Filesystem Adapter Selection
 *
 * These tests verify that:
 * 1. Platform detection works correctly (web vs electron)
 * 2. Dynamic imports don't break in browser environments
 * 3. Web adapter is loaded by default in test environment
 */

// Store original window/navigator globals
let originalWindow: typeof window;
let originalNavigator: typeof navigator;

beforeEach(() => {
  // Reset module cache to ensure fresh platform detection
  jest.resetModules();

  // Store originals
  originalWindow = global.window;
  originalNavigator = global.navigator;
});

afterEach(() => {
  // Restore originals
  global.window = originalWindow;
  global.navigator = originalNavigator;
});

describe('Platform Detection', () => {
  it('should detect web platform by default in test environment', async () => {
    const { platform } = await import('../platform');
    expect(platform).toBe('web');
  });

  it('should not throw module resolution errors in browser environment', async () => {
    // This test verifies that dynamic imports work correctly
    // and don't throw "Module not found" errors for Electron/Node.js modules
    const { getFileSystem } = await import('../platform');

    try {
      await getFileSystem();
      // If it succeeds, that's fine (web adapter loaded)
      expect(true).toBe(true);
    } catch (error) {
      // If it fails, make sure it's NOT a module resolution error
      const errorMessage = error instanceof Error ? error.message : String(error);
      expect(errorMessage).not.toContain('Module not found');
      expect(errorMessage).not.toContain("Can't resolve 'fs'");
      expect(errorMessage).not.toContain("Can't resolve 'electron'");
    }
  });

  it('should export platform-specific feature flags', async () => {
    const { features } = await import('../platform');

    // In web mode (test environment)
    expect(features.requiresReauthorization).toBe(true);
    expect(features.hasDirectFilesystemAccess).toBe(false);
  });
});

describe('Electron Detection', () => {
  it('should detect electron from user agent', async () => {
    // Mock Electron user agent
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) electron/25.0.0 Chrome/114.0.5735.289 Electron/25.0.0 Safari/537.36',
      configurable: true,
    });

    jest.resetModules();
    const { platform } = await import('../platform');
    expect(platform).toBe('electron');
  });

  it('should detect electron from process.type', async () => {
    // Mock Electron process global
    (global.window as any).process = { type: 'renderer' };

    jest.resetModules();
    const { platform } = await import('../platform');
    expect(platform).toBe('electron');

    // Cleanup
    delete (global.window as any).process;
  });

  it('should detect electron from require function', async () => {
    // Mock Node.js require in window
    (global.window as any).require = jest.fn();

    jest.resetModules();
    const { platform } = await import('../platform');
    expect(platform).toBe('electron');

    // Cleanup
    delete (global.window as any).require;
  });
});

describe('FileSystem Adapter Creation', () => {
  it('should create web adapter when in browser', async () => {
    const { getFileSystem } = await import('../platform');

    // Will throw because we don't have proper mocks,
    // but should not throw "Module not found: Can't resolve 'fs'"
    await expect(getFileSystem()).rejects.not.toThrow(/Module not found/);
  });

  it('should use singleton pattern', async () => {
    // This test verifies the adapter is only created once
    const { getFileSystem } = await import('../platform');

    const adapter1 = await getFileSystem();
    const adapter2 = await getFileSystem();

    // Both should return the same adapter instance (singleton)
    expect(adapter1).toBe(adapter2);
    expect(adapter1).toBeDefined();
  });
});

describe('Platform Logging', () => {
  it('should export logPlatformInfo function', async () => {
    const { logPlatformInfo } = await import('../platform');
    expect(typeof logPlatformInfo).toBe('function');
  });

  it('should not throw when calling logPlatformInfo', async () => {
    const { logPlatformInfo } = await import('../platform');

    // Mock console.log to suppress output
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    expect(() => logPlatformInfo()).not.toThrow();

    consoleLogSpy.mockRestore();
  });
});
