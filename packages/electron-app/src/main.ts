import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import path from 'path';

// Check if running in development mode
const isDev = process.env.ELECTRON_DEV === 'true' || process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;

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
    },
    icon: path.join(__dirname, '../assets/icon.png'),
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../../dashboard/out/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App event listeners
app.on('ready', createWindow);

app.on('window-all-closed', () => {
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
