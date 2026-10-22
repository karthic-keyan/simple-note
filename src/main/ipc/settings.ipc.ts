import { BrowserWindow } from 'electron';
import Database from 'better-sqlite3';
import { IPC_CHANNELS } from '../../shared/constants/ipc-channels';
import { SettingsRepository } from '../database/repositories/settings.repository';
import { registerSecureHandler } from './security';
import { UpdateSettingsSchema } from '../../shared/schemas/settings.schema';

export function registerSettingsIpc(db: Database.Database, getMainWindow: () => BrowserWindow | null): void {
  const repo = new SettingsRepository(db);

  registerSecureHandler(IPC_CHANNELS.SETTINGS_GET, getMainWindow, async () => {
    return repo.getSettings();
  });

  registerSecureHandler(IPC_CHANNELS.SETTINGS_UPDATE, getMainWindow, async (_event, updates) => {
    const validUpdates = UpdateSettingsSchema.parse(updates);
    return repo.updateSettings(validUpdates);
  });
}
