import { BrowserWindow } from 'electron';
import Database from 'better-sqlite3';
import { IPC_CHANNELS } from '../../shared/constants/ipc-channels';
import { NoteRepository } from '../database/repositories/note.repository';
import { registerSecureHandler } from './security';
import {
  CreateNoteSchema,
  UpdateNoteSchema,
  NoteFilterOptionsSchema,
  NoteSortOptionsSchema,
} from '../../shared/schemas/note.schema';
import { z } from 'zod';

export function registerNotesIpc(db: Database.Database, getMainWindow: () => BrowserWindow | null): void {
  const repo = new NoteRepository(db);

  registerSecureHandler(IPC_CHANNELS.NOTES_GET_ALL, getMainWindow, async (_event, filter, sort) => {
    const validFilter = NoteFilterOptionsSchema.parse(filter);
    const validSort = NoteSortOptionsSchema.parse(sort);
    return repo.getAll(validFilter, validSort);
  });

  registerSecureHandler(IPC_CHANNELS.NOTES_GET_BY_ID, getMainWindow, async (_event, id: string) => {
    z.string().uuid().parse(id);
    return repo.getById(id);
  });

  registerSecureHandler(IPC_CHANNELS.NOTES_CREATE, getMainWindow, async (_event, input) => {
    const validInput = CreateNoteSchema.parse(input);
    return repo.create(validInput);
  });

  registerSecureHandler(IPC_CHANNELS.NOTES_UPDATE, getMainWindow, async (_event, input) => {
    const validInput = UpdateNoteSchema.parse(input);
    return repo.update(validInput);
  });

  registerSecureHandler(IPC_CHANNELS.NOTES_TRASH, getMainWindow, async (_event, id: string) => {
    z.string().uuid().parse(id);
    repo.trash(id);
  });

  registerSecureHandler(IPC_CHANNELS.NOTES_RESTORE, getMainWindow, async (_event, id: string) => {
    z.string().uuid().parse(id);
    repo.restore(id);
  });

  registerSecureHandler(IPC_CHANNELS.NOTES_DELETE_PERMANENT, getMainWindow, async (_event, id: string) => {
    z.string().uuid().parse(id);
    repo.deletePermanent(id);
  });

  registerSecureHandler(IPC_CHANNELS.NOTES_EMPTY_TRASH, getMainWindow, async () => {
    repo.emptyTrash();
  });

  registerSecureHandler(IPC_CHANNELS.NOTES_TOGGLE_PIN, getMainWindow, async (_event, id: string) => {
    z.string().uuid().parse(id);
    return repo.togglePin(id);
  });

  registerSecureHandler(IPC_CHANNELS.NOTES_TOGGLE_FAVORITE, getMainWindow, async (_event, id: string) => {
    z.string().uuid().parse(id);
    return repo.toggleFavorite(id);
  });

  registerSecureHandler(IPC_CHANNELS.NOTES_MOVE_TO_NOTEBOOK, getMainWindow, async (_event, noteId: string, notebookId: string | null) => {
    z.string().uuid().parse(noteId);
    if (notebookId !== null) z.string().uuid().parse(notebookId);
    return repo.moveToNotebook(noteId, notebookId);
  });

  registerSecureHandler(IPC_CHANNELS.NOTES_ASSIGN_TAG, getMainWindow, async (_event, noteId: string, tagId: string) => {
    z.string().uuid().parse(noteId);
    z.string().uuid().parse(tagId);
    repo.assignTag(noteId, tagId);
  });

  registerSecureHandler(IPC_CHANNELS.NOTES_REMOVE_TAG, getMainWindow, async (_event, noteId: string, tagId: string) => {
    z.string().uuid().parse(noteId);
    z.string().uuid().parse(tagId);
    repo.removeTag(noteId, tagId);
  });
}
