import { BrowserWindow } from 'electron';
import Database from 'better-sqlite3';
import { IPC_CHANNELS } from '../../shared/constants/ipc-channels';
import { registerNotesIpc } from './notes.ipc';
import { registerNotebooksIpc } from './notebooks.ipc';
import { registerTagsIpc } from './tags.ipc';
import { registerSearchIpc } from './search.ipc';
import { registerSettingsIpc } from './settings.ipc';
import { registerBackupIpc } from './backup.ipc';
import { registerSecureHandler } from './security';

export function registerAllIpcHandlers(db: Database.Database, getMainWindow: () => BrowserWindow | null): void {
  // Domain handlers with sender verification
  registerNotesIpc(db, getMainWindow);
  registerNotebooksIpc(db, getMainWindow);
  registerTagsIpc(db, getMainWindow);
  registerSearchIpc(db, getMainWindow);
  registerSettingsIpc(db, getMainWindow);
  registerBackupIpc(db, getMainWindow);

  // Window control handlers with sender verification
  registerSecureHandler(IPC_CHANNELS.WINDOW_MINIMIZE, getMainWindow, () => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) win.minimize();
  });

  registerSecureHandler(IPC_CHANNELS.WINDOW_MAXIMIZE, getMainWindow, () => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });

  registerSecureHandler(IPC_CHANNELS.WINDOW_CLOSE, getMainWindow, () => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) win.close();
  });
}
