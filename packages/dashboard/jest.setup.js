/**
 * Jest Setup - Global Test Configuration
 *
 * Runs before each test file to setup:
 * - IndexedDB mocking (fake-indexeddb)
 * - localStorage/sessionStorage mocking
 * - Console spy utilities
 * - React Testing Library extensions
 */

// Import React Testing Library matchers
import '@testing-library/jest-dom';

// Import fake-indexeddb for IndexedDB mocking
import 'fake-indexeddb/auto';

// Polyfill for structuredClone (required by fake-indexeddb)
// This is needed for Node.js < 17 and Jest environments
if (!global.structuredClone) {
  global.structuredClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  };
}

// ============================================================================
// Global Mocks
// ============================================================================

// Mock localStorage and sessionStorage
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

global.localStorage = localStorageMock;
global.sessionStorage = localStorageMock;

// Mock navigator.storage API for persistent storage
global.navigator.storage = {
  persist: jest.fn(() => Promise.resolve(true)),
  persisted: jest.fn(() => Promise.resolve(true)),
  estimate: jest.fn(() =>
    Promise.resolve({
      usage: 1024,
      quota: 1024 * 1024 * 1024,
    })
  ),
};

// ============================================================================
// Console Spy Helpers
// ============================================================================

/**
 * Global test utilities for console spying
 */
global.testUtils = {
  /**
   * Spy on console.log and return captured calls
   */
  spyConsole: () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    return {
      spy: consoleSpy,
      getCalls: () => consoleSpy.mock.calls,
      restore: () => consoleSpy.mockRestore(),
    };
  },

  /**
   * Suppress console errors during tests
   */
  suppressErrors: () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    return {
      restore: () => {
        errorSpy.mockRestore();
        warnSpy.mockRestore();
      },
    };
  },
};

// ============================================================================
// Test Cleanup
// ============================================================================

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

// Reset all mocks after all tests in a file
afterAll(() => {
  jest.restoreAllMocks();
});

// ============================================================================
// Environment Detection
// ============================================================================

// Ensure we're running in jsdom environment
if (typeof window === 'undefined') {
  throw new Error(
    'Tests must run in jsdom environment. Check jest.config.js testEnvironment setting.'
  );
}

// Log test environment info (can be disabled by setting JEST_SILENT=true)
if (!process.env.JEST_SILENT) {
  console.log('✅ Jest setup complete');
  console.log('   - IndexedDB: fake-indexeddb');
  console.log('   - localStorage: mocked');
  console.log('   - navigator.storage: mocked');
}
