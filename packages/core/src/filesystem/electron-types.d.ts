/**
 * TypeScript declarations for Electron IPC API
 * Defines window.electronAPI interface for IPC communication
 */

declare global {
  interface Window {
    electronAPI?: {
      getVersion: () => Promise<string>;
      getPlatform: () => Promise<string>;
      checkBackendHealth: () => Promise<{ status: string }>;
      fs: {
        selectDirectory: () => Promise<string | null>;
        stat: (filePath: string) => Promise<{ isDirectory: boolean; isFile: boolean }>;
        readdir: (dirPath: string) => Promise<{ name: string; isDirectory: boolean }[]>;
        readFile: (filePath: string) => Promise<string>;
      };
      send: (channel: string, ...args: any[]) => void;
      receive: (channel: string, func: (...args: any[]) => void) => () => void;
    };
  }
}

export {};
