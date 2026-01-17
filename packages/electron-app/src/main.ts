import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import path from 'path';
import createServer from 'next';
import http from 'http';
import * as fs from 'fs/promises';

// Check if running in development mode
const isDev = process.env.ELECTRON_DEV === 'true' || process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;
let server: http.Server | null = null;
const PORT = 9000;

// Start Next.js server for both dev and production
async function startNextServer() {
  const nextApp = createServer({
    dev: isDev,
    dir: path.join(__dirname, '../../dashboard'),
  });

  // Next.js requires prepare() to be called before getRequestHandler()
  await nextApp.prepare();

  const handle = nextApp.getRequestHandler();

  return new Promise<void>((resolve) => {
    server = http.createServer(handle);
    server.listen(PORT, '127.0.0.1', () => {
      console.log(`[Electron] Next.js server running on http://localhost:${PORT}`);
      resolve();
    });
  });
}

// Create the browser window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      navigateOnDragDrop: false,
    },
    icon: path.join(__dirname, '../assets/icon.png'),
  });

  const startUrl = isDev
    ? 'http://localhost:3004' // Next.js dev server port
    : `http://localhost:${PORT}`;

  mainWindow.loadURL(startUrl);

  // Handle SPA routing - allow same-origin navigation
  // This prevents Electron from treating route changes as full page loads
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const parsedUrl = new URL(url);
    const parsedStart = new URL(startUrl);

    // Allow navigation within the same origin
    if (parsedUrl.origin !== parsedStart.origin) {
      event.preventDefault();
    }
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App event listeners
app.on('ready', async () => {
  // Start Next.js server in production mode
  // In dev mode, Next.js dev server runs on port 3000 separately
  if (!isDev) {
    await startNextServer();
  }
  createWindow();
});

app.on('window-all-closed', () => {
  // Clean up server
  if (server) {
    server.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('app:version', () => app.getVersion());

ipcMain.handle('app:platform', () => process.platform);

ipcMain.handle('backend:health', async () => {
  // TODO: Implement backend health check
  return { status: 'ok' };
});

// Filesystem IPC handlers
ipcMain.handle('fs:selectDirectory', async () => {
  if (!mainWindow) {
    throw new Error('Main window not available');
  }

  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Project Folder',
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.handle('fs:stat', async (_event, filePath: string) => {
  const stats = await fs.stat(filePath);
  return {
    isDirectory: stats.isDirectory(),
    isFile: stats.isFile(),
  };
});

ipcMain.handle('fs:readdir', async (_event, dirPath: string) => {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries.map(entry => ({
    name: entry.name,
    isDirectory: entry.isDirectory(),
  }));
});

ipcMain.handle('fs:readFile', async (_event, filePath: string) => {
  return await fs.readFile(filePath, 'utf-8');
});

// File dialog handlers for Notepad clone
ipcMain.handle('fs:saveFileDialog', async (_event, options: {
  title?: string;
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
}) => {
  if (!mainWindow) {
    throw new Error('Main window not available');
  }

  const result = await dialog.showSaveDialog(mainWindow, {
    title: options.title || 'Save file',
    defaultPath: options.defaultPath,
    filters: options.filters || [{ name: 'All files', extensions: ['*'] }],
  });

  if (result.canceled) {
    return { canceled: true };
  }

  return { filePath: result.filePath, canceled: false };
});

ipcMain.handle('fs:writeFile', async (_event, options: {
  filePath: string;
  content: string;
}) => {
  try {
    await fs.writeFile(options.filePath, options.content, 'utf-8');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
});

ipcMain.handle('fs:openFileDialog', async (_event, options: {
  title?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
}) => {
  if (!mainWindow) {
    throw new Error('Main window not available');
  }

  const result = await dialog.showOpenDialog(mainWindow, {
    title: options.title || 'Open file',
    properties: ['openFile'],
    filters: options.filters || [{ name: 'All files', extensions: ['*'] }],
  });

  if (result.canceled) {
    return { canceled: true };
  }

  return { filePath: result.filePaths[0], canceled: false };
});

// Open notes in new window
ipcMain.handle('window:openNotes', () => {
  const notesWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../assets/icon.png'),
  });

  const startUrl = isDev
    ? 'http://localhost:3004/notes-standalone'
    : `http://localhost:${PORT}/notes-standalone`;

  notesWindow.loadURL(startUrl);

  if (isDev) {
    notesWindow.webContents.openDevTools();
  }

  return { success: true };
});

// Open board in new window
ipcMain.handle('window:openBoard', (_event, boardId?: string) => {
  const boardWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../assets/icon.png'),
  });

  const baseUrl = isDev
    ? 'http://localhost:3004/boards-standalone'
    : `http://localhost:${PORT}/boards-standalone`;

  const fullUrl = boardId ? `${baseUrl}?boardId=${boardId}` : baseUrl;

  boardWindow.loadURL(fullUrl);

  if (isDev) {
    boardWindow.webContents.openDevTools();
  }

  return { success: true };
});

// Open list in new window
ipcMain.handle('window:openList', (_event, boardId: string, listId: string) => {
  const listWindow = new BrowserWindow({
    width: 800,
    height: 900,
    minWidth: 600,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../assets/icon.png'),
  });

  const baseUrl = isDev
    ? 'http://localhost:3004/list-standalone'
    : `http://localhost:${PORT}/list-standalone`;

  const fullUrl = `${baseUrl}?boardId=${boardId}&listId=${listId}`;

  listWindow.loadURL(fullUrl);

  if (isDev) {
    listWindow.webContents.openDevTools();
  }

  return { success: true };
});

// Set always on top for focused window
ipcMain.handle('window:setAlwaysOnTop', (event, alwaysOnTop: boolean) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.setAlwaysOnTop(alwaysOnTop);
    return { success: true };
  }
  return { success: false };
});

// Filesystem validation - no permission dialogs
ipcMain.handle('fs:validatePath', async (_event, pathToValidate: string) => {
  try {
    // Check if path exists
    await fs.access(pathToValidate);

    // Check if it's a directory
    const stats = await fs.stat(pathToValidate);
    if (!stats.isDirectory()) {
      return {
        valid: false,
        reason: 'Not a directory'
      };
    }

    // Path is valid
    return {
      valid: true
    };
  } catch (error: any) {
    // Handle specific error codes
    if (error.code === 'ENOENT') {
      return {
        valid: false,
        reason: 'Path not found'
      };
    }

    if (error.code === 'EACCES') {
      return {
        valid: false,
        reason: 'Permission denied'
      };
    }

    if (error.code === 'ENOTDIR') {
      return {
        valid: false,
        reason: 'Not a directory'
      };
    }

    // Unknown error
    return {
      valid: false,
      reason: 'Path not accessible'
    };
  }
});

// Application menu
const template: any[] = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Exit',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          app.quit();
        },
      },
    ],
  },
  {
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
      { label: 'Redo', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
      { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
      { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
    ],
  },
  {
    label: 'View',
    submenu: [
      { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
      {
        label: 'Toggle DevTools',
        accelerator: isDev ? 'CmdOrCtrl+I' : null,
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.toggleDevTools();
          }
        },
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
