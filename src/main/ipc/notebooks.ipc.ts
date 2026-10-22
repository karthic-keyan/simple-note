import { BrowserWindow } from 'electron';
import Database from 'better-sqlite3';
import { IPC_CHANNELS } from '../../shared/constants/ipc-channels';
import { NotebookRepository } from '../database/repositories/notebook.repository';
import { registerSecureHandler } from './security';
import {
  CreateNotebookSchema,
  UpdateNotebookSchema,
  DeleteNotebookSchema,
  ReorderNotebooksSchema,
} from '../../shared/schemas/notebook.schema';

export function registerNotebooksIpc(db: Database.Database, getMainWindow: () => BrowserWindow | null): void {
  const repo = new NotebookRepository(db);

  registerSecureHandler(IPC_CHANNELS.NOTEBOOKS_GET_ALL, getMainWindow, async () => {
    return repo.getAll();
  });

  registerSecureHandler(IPC_CHANNELS.NOTEBOOKS_CREATE, getMainWindow, async (_event, input) => {
    const validInput = CreateNotebookSchema.parse(input);
    return repo.create(validInput);
  });

  registerSecureHandler(IPC_CHANNELS.NOTEBOOKS_UPDATE, getMainWindow, async (_event, input) => {
    const validInput = UpdateNotebookSchema.parse(input);
    return repo.update(validInput);
  });

  registerSecureHandler(IPC_CHANNELS.NOTEBOOKS_DELETE, getMainWindow, async (_event, options) => {
    const validOptions = DeleteNotebookSchema.parse(options);
    repo.delete(validOptions);
  });

  registerSecureHandler(IPC_CHANNELS.NOTEBOOKS_REORDER, getMainWindow, async (_event, ids: string[]) => {
    const validIds = ReorderNotebooksSchema.parse(ids);
    repo.reorder(validIds);
  });
}
