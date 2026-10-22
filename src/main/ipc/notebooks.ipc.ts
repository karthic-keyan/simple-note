import { ipcMain } from 'electron';
import Database from 'better-sqlite3';
import { IPC_CHANNELS } from '../../shared/constants/ipc-channels';
import { NotebookRepository } from '../database/repositories/notebook.repository';
import {
  CreateNotebookSchema,
  UpdateNotebookSchema,
  DeleteNotebookSchema,
  ReorderNotebooksSchema,
} from '../../shared/schemas/notebook.schema';

export function registerNotebooksIpc(db: Database.Database): void {
  const repo = new NotebookRepository(db);

  ipcMain.handle(IPC_CHANNELS.NOTEBOOKS_GET_ALL, async () => {
    return repo.getAll();
  });

  ipcMain.handle(IPC_CHANNELS.NOTEBOOKS_CREATE, async (_event, input) => {
    const validInput = CreateNotebookSchema.parse(input);
    return repo.create(validInput);
  });

  ipcMain.handle(IPC_CHANNELS.NOTEBOOKS_UPDATE, async (_event, input) => {
    const validInput = UpdateNotebookSchema.parse(input);
    return repo.update(validInput);
  });

  ipcMain.handle(IPC_CHANNELS.NOTEBOOKS_DELETE, async (_event, options) => {
    const validOptions = DeleteNotebookSchema.parse(options);
    repo.delete(validOptions);
  });

  ipcMain.handle(IPC_CHANNELS.NOTEBOOKS_REORDER, async (_event, ids: string[]) => {
    const validIds = ReorderNotebooksSchema.parse(ids);
    repo.reorder(validIds);
  });
}
