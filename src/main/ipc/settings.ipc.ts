import { ipcMain } from 'electron';
import Database from 'better-sqlite3';
import { IPC_CHANNELS } from '../../shared/constants/ipc-channels';
import { SettingsRepository } from '../database/repositories/settings.repository';
import { UpdateSettingsSchema } from '../../shared/schemas/settings.schema';

export function registerSettingsIpc(db: Database.Database): void {
  const repo = new SettingsRepository(db);

  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, async () => {
    return repo.getSettings();
  });

  ipcMain.handle(IPC_CHANNELS.SETTINGS_UPDATE, async (_event, updates) => {
    const validUpdates = UpdateSettingsSchema.parse(updates);
    return repo.updateSettings(validUpdates);
  });
}
