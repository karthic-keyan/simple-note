import { app, BrowserWindow, shell, dialog, nativeImage } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, closeDatabase } from './database/connection';
import { registerAllIpcHandlers } from './ipc';

import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { WindowStateManager } from './services/window-state';

let mainWindow: BrowserWindow | null = null;
let windowStateManager: WindowStateManager | null = null;

function resolveAppIcon(): Electron.NativeImage | undefined {
  const iconCandidates = [
    path.join(__dirname, '../../build/icon.ico'),
    path.join(__dirname, '../../build/icon.png'),
    path.join(process.resourcesPath || '', 'build/icon.ico'),
    path.join(process.resourcesPath || '', 'icon.ico'),
    path.join(app.getAppPath(), 'build/icon.ico'),
  ];
  for (const candidate of iconCandidates) {
    if (fs.existsSync(candidate)) {
      return nativeImage.createFromPath(candidate);
    }
  }
  return undefined;
}

function createWindow(): void {
  const preloadCjs = path.join(__dirname, '../preload/index.cjs');
  const preloadJs = path.join(__dirname, '../preload/index.js');
  const preloadPath = fs.existsSync(preloadCjs) ? preloadCjs : preloadJs;

  if (!windowStateManager) {
    windowStateManager = new WindowStateManager();
  }
  const savedState = windowStateManager.getState();

  const windowIcon = resolveAppIcon();

  mainWindow = new BrowserWindow({
    width: savedState.width,
    height: savedState.height,
    x: savedState.x,
    y: savedState.y,
    minWidth: 860,
    minHeight: 560,
    frame: false, // Frameless window with custom Fluent Windows titlebar
    title: 'Simple Note',
    icon: windowIcon,
    backgroundColor: '#181a1f',
    show: false, // Hidden until ready-to-show prevents visual flash and improves perceived startup
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true, // Sandboxed renderer for hardened security
      spellcheck: true,
    },
  });

  // Track window resizing and movement for state persistence
  windowStateManager.track(mainWindow);

  // Restore maximized state if previous session was maximized
  if (savedState.isMaximized) {
    mainWindow.maximize();
  }

  // Smooth window reveal: show as soon as renderer has painted first frame
  let hasShown = false;
  const showWindow = () => {
    if (hasShown || !mainWindow || mainWindow.isDestroyed()) return;
    hasShown = true;
    mainWindow.show();
  };

  mainWindow.once('ready-to-show', showWindow);

  // Safety fallback: reveal window within 1200ms if ready-to-show delayed
  const safetyTimeout = setTimeout(showWindow, 1200);
  mainWindow.once('show', () => clearTimeout(safetyTimeout));

  // Handle external links safely - deny new windows and route web URLs to default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://') || url.startsWith('mailto:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Prevent renderer navigation away from application origin
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
    clearTimeout(safetyTimeout);
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
