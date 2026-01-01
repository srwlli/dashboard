import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getVersion: () => ipcRenderer.invoke('app:version'),
  getPlatform: () => ipcRenderer.invoke('app:platform'),

  // Backend health check
  checkBackendHealth: () => ipcRenderer.invoke('backend:health'),

  // Filesystem operations
  fs: {
    selectDirectory: () => ipcRenderer.invoke('fs:selectDirectory'),
    stat: (filePath: string) => ipcRenderer.invoke('fs:stat', filePath),
    readdir: (dirPath: string) => ipcRenderer.invoke('fs:readdir', dirPath),
    readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
    validatePath: (pathToValidate: string) => ipcRenderer.invoke('fs:validatePath', pathToValidate),
  },

  // IPC communication
  send: (channel: string, ...args: any[]) => {
    if (['log'].includes(channel)) {
      ipcRenderer.send(channel, ...args);
    }
  },

  receive: (channel: string, func: (...args: any[]) => void) => {
    if (['message'].includes(channel)) {
      // Subscribe to the Electron event
      ipcRenderer.on(channel, (_event, ...args) => func(...args));

      // Return unsubscribe function
      return () => {
        ipcRenderer.removeListener(channel, func);
      };
    }
    return undefined;
  },
});

// Type definitions for TypeScript
declare global {
  interface Window {
    electronAPI: {
      getVersion: () => Promise<string>;
      getPlatform: () => Promise<string>;
      checkBackendHealth: () => Promise<{ status: string }>;
      fs: {
        selectDirectory: () => Promise<string | null>;
        stat: (filePath: string) => Promise<{ isDirectory: boolean; isFile: boolean }>;
        readdir: (dirPath: string) => Promise<{ name: string; isDirectory: boolean }[]>;
        readFile: (filePath: string) => Promise<string>;
        validatePath: (pathToValidate: string) => Promise<{ valid: boolean; reason?: string }>;
      };
      send: (channel: string, ...args: any[]) => void;
      receive: (channel: string, func: (...args: any[]) => void) => () => void;
    };
  }
}
