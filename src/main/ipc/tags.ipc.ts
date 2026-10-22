import { ipcMain } from 'electron';
import Database from 'better-sqlite3';
import { IPC_CHANNELS } from '../../shared/constants/ipc-channels';
import { TagRepository } from '../database/repositories/tag.repository';
import { CreateTagSchema, UpdateTagSchema } from '../../shared/schemas/tag.schema';
import { z } from 'zod';

export function registerTagsIpc(db: Database.Database): void {
  const repo = new TagRepository(db);

  ipcMain.handle(IPC_CHANNELS.TAGS_GET_ALL, async () => {
    return repo.getAll();
  });

  ipcMain.handle(IPC_CHANNELS.TAGS_CREATE, async (_event, input) => {
    const validInput = CreateTagSchema.parse(input);
    return repo.create(validInput);
  });

  ipcMain.handle(IPC_CHANNELS.TAGS_UPDATE, async (_event, input) => {
    const validInput = UpdateTagSchema.parse(input);
    return repo.update(validInput);
  });

  ipcMain.handle(IPC_CHANNELS.TAGS_DELETE, async (_event, id: string) => {
    z.string().uuid().parse(id);
    repo.delete(id);
  });
}
