import { BrowserWindow } from 'electron';
import Database from 'better-sqlite3';
import { IPC_CHANNELS } from '../../shared/constants/ipc-channels';
import { TagRepository } from '../database/repositories/tag.repository';
import { registerSecureHandler } from './security';
import { CreateTagSchema, UpdateTagSchema } from '../../shared/schemas/tag.schema';
import { z } from 'zod';

export function registerTagsIpc(db: Database.Database, getMainWindow: () => BrowserWindow | null): void {
  const repo = new TagRepository(db);

  registerSecureHandler(IPC_CHANNELS.TAGS_GET_ALL, getMainWindow, async () => {
    return repo.getAll();
  });

  registerSecureHandler(IPC_CHANNELS.TAGS_CREATE, getMainWindow, async (_event, input) => {
    const validInput = CreateTagSchema.parse(input);
    return repo.create(validInput);
  });

  registerSecureHandler(IPC_CHANNELS.TAGS_UPDATE, getMainWindow, async (_event, input) => {
    const validInput = UpdateTagSchema.parse(input);
    return repo.update(validInput);
  });

  registerSecureHandler(IPC_CHANNELS.TAGS_DELETE, getMainWindow, async (_event, id: string) => {
    z.string().uuid().parse(id);
    repo.delete(id);
  });
}
