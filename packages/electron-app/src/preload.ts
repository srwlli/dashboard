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

  // File dialog operations for Notepad clone
  saveFileDialog: (options: {
    title?: string;
    defaultPath?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
  }) => ipcRenderer.invoke('fs:saveFileDialog', options),

  writeFile: (options: {
    filePath: string;
    content: string;
  }) => ipcRenderer.invoke('fs:writeFile', options),

  openFileDialog: (options: {
    title?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
  }) => ipcRenderer.invoke('fs:openFileDialog', options),

  readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),

  // Window operations
  openNotesWindow: () => ipcRenderer.invoke('window:openNotes'),
  setAlwaysOnTop: (alwaysOnTop: boolean) => ipcRenderer.invoke('window:setAlwaysOnTop', alwaysOnTop),

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
      saveFileDialog: (options: {
        title?: string;
        defaultPath?: string;
        filters?: Array<{ name: string; extensions: string[] }>;
      }) => Promise<{ filePath?: string; canceled: boolean }>;
      writeFile: (options: {
        filePath: string;
        content: string;
      }) => Promise<{ success?: boolean; error?: string }>;
      openFileDialog: (options: {
        title?: string;
        filters?: Array<{ name: string; extensions: string[] }>;
      }) => Promise<{ filePath?: string; canceled: boolean }>;
      readFile: (filePath: string) => Promise<{ content?: string; filename?: string; error?: string }>;
      openNotesWindow: () => Promise<{ success: boolean }>;
      setAlwaysOnTop: (alwaysOnTop: boolean) => Promise<{ success: boolean }>;
      send: (channel: string, ...args: any[]) => void;
      receive: (channel: string, func: (...args: any[]) => void) => () => void;
    };
  }
}
