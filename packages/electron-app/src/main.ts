import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import path from 'path';
import createServer from 'next';
import http from 'http';
import remote from '@electron/remote/main';

// Initialize @electron/remote for filesystem access
remote.initialize();

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
      nodeIntegration: true,  // Required for @electron/remote
      contextIsolation: false, // Required for @electron/remote
      preload: path.join(__dirname, 'preload.js'),
      navigateOnDragDrop: false,
    },
    icon: path.join(__dirname, '../assets/icon.png'),
  });

  // Enable @electron/remote for this window
  remote.enable(mainWindow.webContents);

  const startUrl = isDev
    ? 'http://localhost:3005' // Next.js dev server port
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
