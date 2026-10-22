import { Note, CreateNoteInput, UpdateNoteInput, NoteSortOptions, NoteFilterOptions } from './note';
import { Notebook, CreateNotebookInput, UpdateNotebookInput, DeleteNotebookOptions } from './notebook';
import { Tag, CreateTagInput, UpdateTagInput } from './tag';
import { UserSettings } from './settings';
import { SearchQueryParams, SearchResultItem } from './search';
import { BackupExportResult, BackupImportOptions, BackupImportResult } from './backup';

export interface IElectronAPI {
  // Notes
  getNotes: (filter?: NoteFilterOptions, sort?: NoteSortOptions) => Promise<Note[]>;
  getNoteById: (id: string) => Promise<Note | null>;
  createNote: (input: CreateNoteInput) => Promise<Note>;
  updateNote: (input: UpdateNoteInput) => Promise<Note>;
  trashNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  deleteNotePermanently: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
  togglePinNote: (id: string) => Promise<Note>;
  toggleFavoriteNote: (id: string) => Promise<Note>;
  moveNoteToNotebook: (noteId: string, notebookId: string | null) => Promise<Note>;
  assignTagToNote: (noteId: string, tagId: string) => Promise<void>;
  removeTagFromNote: (noteId: string, tagId: string) => Promise<void>;

  // Notebooks
  getNotebooks: () => Promise<Notebook[]>;
  createNotebook: (input: CreateNotebookInput) => Promise<Notebook>;
  updateNotebook: (input: UpdateNotebookInput) => Promise<Notebook>;
  deleteNotebook: (options: DeleteNotebookOptions) => Promise<void>;
  reorderNotebooks: (notebookIds: string[]) => Promise<void>;

  // Tags
  getTags: () => Promise<Tag[]>;
  createTag: (input: CreateTagInput) => Promise<Tag>;
  updateTag: (input: UpdateTagInput) => Promise<Tag>;
  deleteTag: (id: string) => Promise<void>;

  // Search
  searchNotes: (params: SearchQueryParams) => Promise<SearchResultItem[]>;

  // Settings
  getSettings: () => Promise<UserSettings>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<UserSettings>;

  // Backup & Restore
  exportBackup: () => Promise<BackupExportResult>;
  importBackup: (options: BackupImportOptions) => Promise<BackupImportResult>;

  // Window Controls
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
