import { ipcMain, BrowserWindow } from 'electron';
import Database from 'better-sqlite3';
import { IPC_CHANNELS } from '../../shared/constants/ipc-channels';
import { registerNotesIpc } from './notes.ipc';
import { registerNotebooksIpc } from './notebooks.ipc';
import { registerTagsIpc } from './tags.ipc';
import { registerSearchIpc } from './search.ipc';
import { registerSettingsIpc } from './settings.ipc';
import { registerBackupIpc } from './backup.ipc';

export function registerAllIpcHandlers(db: Database.Database, getMainWindow: () => BrowserWindow | null): void {
  // Domain handlers
  registerNotesIpc(db);
  registerNotebooksIpc(db);
  registerTagsIpc(db);
  registerSearchIpc(db);
  registerSettingsIpc(db);
  registerBackupIpc(db, getMainWindow);

  // Window control handlers
  ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    const win = getMainWindow();
    if (win) win.minimize();
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
    const win = getMainWindow();
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, () => {
    const win = getMainWindow();
    if (win) win.close();
  });
}
