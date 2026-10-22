import { BrowserWindow } from 'electron';
import Database from 'better-sqlite3';
import { IPC_CHANNELS } from '../../shared/constants/ipc-channels';
import { BackupService } from '../services/backup.service';
import { registerSecureHandler } from './security';
import { BackupImportOptions } from '../../shared/types/backup';
import { z } from 'zod';

const BackupImportOptionsSchema = z.object({
  mode: z.enum(['merge', 'replace']),
});

export function registerBackupIpc(db: Database.Database, getMainWindow: () => BrowserWindow | null): void {
  const service = new BackupService(db);

  registerSecureHandler(IPC_CHANNELS.BACKUP_EXPORT, getMainWindow, async () => {
    const win = getMainWindow();
    return service.exportBackup(win || undefined);
  });

  registerSecureHandler(IPC_CHANNELS.BACKUP_IMPORT, getMainWindow, async (_event, options: BackupImportOptions) => {
    const validOptions = BackupImportOptionsSchema.parse(options);
    const win = getMainWindow();
    return service.importBackup(validOptions, win || undefined);
  });
}
