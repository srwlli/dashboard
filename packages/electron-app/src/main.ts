import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import path from 'path';
import http from 'http';
import fs from 'fs';

// Check if running in development mode
const isDev = process.env.ELECTRON_DEV === 'true' || process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;
let server: http.Server | null = null;
const PORT = 9000;

// Simple HTTP server for serving static files
function startStaticServer() {
  return new Promise<void>((resolve) => {
    const dashboardDir = path.join(__dirname, '../../dashboard/out');

    server = http.createServer((req, res) => {
      const url = req.url || '/';
      let filePath = path.join(dashboardDir, url === '/' ? 'index.html' : url);

      // Try to serve the file
      fs.readFile(filePath, (err, data) => {
        if (err) {
          // If not found, serve index.html for SPA routing
          fs.readFile(path.join(dashboardDir, 'index.html'), (err, data) => {
            if (err) {
              res.writeHead(404);
              res.end('Not found');
              return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
          });
          return;
        }

        // Set correct content type
        let contentType = 'text/plain';
        if (filePath.endsWith('.html')) contentType = 'text/html';
        if (filePath.endsWith('.js')) contentType = 'application/javascript';
        if (filePath.endsWith('.css')) contentType = 'text/css';
        if (filePath.endsWith('.json')) contentType = 'application/json';
        if (filePath.endsWith('.png')) contentType = 'image/png';
        if (filePath.endsWith('.ico')) contentType = 'image/x-icon';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
    });

    server.listen(PORT, '127.0.0.1', () => {
      console.log(`[Electron] Static server running on http://localhost:${PORT}`);
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
    },
    icon: path.join(__dirname, '../assets/icon.png'),
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `http://localhost:${PORT}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App event listeners
app.on('ready', async () => {
  // Start static server in production mode
  if (!isDev) {
    await startStaticServer();
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
