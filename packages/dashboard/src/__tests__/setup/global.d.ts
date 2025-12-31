/**
 * Global type declarations for test utilities
 *
 * Extends the global namespace with custom test utilities
 * defined in jest.setup.js
 */

declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        spyConsole: () => {
          spy: jest.SpyInstance;
          getCalls: () => any[][];
          restore: () => void;
        };
        suppressErrors: () => {
          restore: () => void;
        };
      };
    }
  }

  var testUtils: {
    spyConsole: () => {
      spy: jest.SpyInstance;
      getCalls: () => any[][];
      restore: () => void;
    };
    suppressErrors: () => {
      restore: () => void;
    };
  };
}

export {};
