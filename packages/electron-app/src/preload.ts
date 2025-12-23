import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getVersion: () => ipcRenderer.invoke('app:version'),
  getPlatform: () => ipcRenderer.invoke('app:platform'),

  // Backend health check
  checkBackendHealth: () => ipcRenderer.invoke('backend:health'),

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
      send: (channel: string, ...args: any[]) => void;
      receive: (channel: string, func: (...args: any[]) => void) => () => void;
    };
  }
}
