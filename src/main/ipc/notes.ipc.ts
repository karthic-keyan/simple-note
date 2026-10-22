import { ipcMain } from 'electron';
import Database from 'better-sqlite3';
import { IPC_CHANNELS } from '../../shared/constants/ipc-channels';
import { NoteRepository } from '../database/repositories/note.repository';
import {
  CreateNoteSchema,
  UpdateNoteSchema,
  NoteFilterOptionsSchema,
  NoteSortOptionsSchema,
} from '../../shared/schemas/note.schema';
import { z } from 'zod';

export function registerNotesIpc(db: Database.Database): void {
  const repo = new NoteRepository(db);

  ipcMain.handle(IPC_CHANNELS.NOTES_GET_ALL, async (_event, filter, sort) => {
    const validFilter = NoteFilterOptionsSchema.parse(filter);
    const validSort = NoteSortOptionsSchema.parse(sort);
    return repo.getAll(validFilter, validSort);
  });

  ipcMain.handle(IPC_CHANNELS.NOTES_GET_BY_ID, async (_event, id: string) => {
    z.string().uuid().parse(id);
    return repo.getById(id);
  });

  ipcMain.handle(IPC_CHANNELS.NOTES_CREATE, async (_event, input) => {
    const validInput = CreateNoteSchema.parse(input);
    return repo.create(validInput);
  });

  ipcMain.handle(IPC_CHANNELS.NOTES_UPDATE, async (_event, input) => {
    const validInput = UpdateNoteSchema.parse(input);
    return repo.update(validInput);
  });

  ipcMain.handle(IPC_CHANNELS.NOTES_TRASH, async (_event, id: string) => {
    z.string().uuid().parse(id);
    repo.trash(id);
  });

  ipcMain.handle(IPC_CHANNELS.NOTES_RESTORE, async (_event, id: string) => {
    z.string().uuid().parse(id);
    repo.restore(id);
  });

  ipcMain.handle(IPC_CHANNELS.NOTES_DELETE_PERMANENT, async (_event, id: string) => {
    z.string().uuid().parse(id);
    repo.deletePermanent(id);
  });

  ipcMain.handle(IPC_CHANNELS.NOTES_EMPTY_TRASH, async () => {
    repo.emptyTrash();
  });

  ipcMain.handle(IPC_CHANNELS.NOTES_TOGGLE_PIN, async (_event, id: string) => {
    z.string().uuid().parse(id);
    return repo.togglePin(id);
  });

  ipcMain.handle(IPC_CHANNELS.NOTES_TOGGLE_FAVORITE, async (_event, id: string) => {
    z.string().uuid().parse(id);
    return repo.toggleFavorite(id);
  });

  ipcMain.handle(IPC_CHANNELS.NOTES_MOVE_TO_NOTEBOOK, async (_event, noteId: string, notebookId: string | null) => {
    z.string().uuid().parse(noteId);
    if (notebookId !== null) z.string().uuid().parse(notebookId);
    return repo.moveToNotebook(noteId, notebookId);
  });

  ipcMain.handle(IPC_CHANNELS.NOTES_ASSIGN_TAG, async (_event, noteId: string, tagId: string) => {
    z.string().uuid().parse(noteId);
    z.string().uuid().parse(tagId);
    repo.assignTag(noteId, tagId);
  });

  ipcMain.handle(IPC_CHANNELS.NOTES_REMOVE_TAG, async (_event, noteId: string, tagId: string) => {
    z.string().uuid().parse(noteId);
    z.string().uuid().parse(tagId);
    repo.removeTag(noteId, tagId);
  });
}
