import { app, BrowserWindow, shell, dialog, nativeImage } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, closeDatabase } from './database/connection';
import { registerAllIpcHandlers } from './ipc';

import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow(): void {
  const preloadCjs = path.join(__dirname, '../preload/index.cjs');
  const preloadJs = path.join(__dirname, '../preload/index.js');
  const preloadPath = fs.existsSync(preloadCjs) ? preloadCjs : preloadJs;
  const indexPath = path.join(__dirname, '../../dist/index.html');
  console.log('[Main] Preload path:', preloadPath, 'exists:', fs.existsSync(preloadPath));
  console.log('[Main] Index path:', indexPath, 'exists:', fs.existsSync(indexPath));

  const iconCandidates = [
    path.join(__dirname, '../../build/icon.ico'),
    path.join(__dirname, '../../build/icon.png'),
    path.join(__dirname, '../../dist/icon.png'),
    path.join(__dirname, '../../public/icon.png'),
    path.join(app.getAppPath(), 'build/icon.ico'),
    path.join(app.getAppPath(), 'build/icon.png'),
    path.join(app.getAppPath(), 'dist/icon.png'),
    path.join(process.resourcesPath || '', 'build/icon.ico'),
    path.join(process.resourcesPath || '', 'icon.ico'),
    path.join(process.resourcesPath || '', 'icon.png'),
  ];
  const windowIconPath = iconCandidates.find(p => fs.existsSync(p));
  const windowIcon = windowIconPath ? nativeImage.createFromPath(windowIconPath) : undefined;

  mainWindow = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 860,
    minHeight: 560,
    frame: false, // Frameless window with custom Fluent Windows titlebar
    title: 'Simple Note',
    icon: windowIcon,
    backgroundColor: '#181a1f',
    show: true,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: true,
    },
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[Main] Renderer did-finish-load');
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error('[Main] Renderer did-fail-load:', errorCode, errorDescription);
  });

  // Handle external links safely
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://') || url.startsWith('mailto:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== mainWindow?.webContents.getURL()) {
      event.preventDefault();
      if (url.startsWith('https://') || url.startsWith('http://')) {
        shell.openExternal(url);
      }
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Ensure single instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    try {
      // 1. Initialize SQLite Database & run migrations
      const db = initDatabase();

      // 2. Register all IPC handlers
      registerAllIpcHandlers(db, () => mainWindow);

      // 3. Create main window
      createWindow();

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createWindow();
        }
      });
    } catch (err: any) {
      console.error('Failed to initialize Simple Note:', err);
      dialog.showErrorBox('Simple Note Startup Error', err?.stack || err?.message || String(err));
    }
  }).catch((err) => {
    console.error('Simple Note failed to start:', err);
    dialog.showErrorBox('Simple Note Startup Error', err?.stack || err?.message || String(err));
  });

  app.on('window-all-closed', () => {
    closeDatabase();
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('before-quit', () => {
    closeDatabase();
  });
}
