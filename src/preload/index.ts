import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/constants/ipc-channels';
import { IElectronAPI } from '../shared/types/ipc';

const electronAPI: IElectronAPI = {
  // Notes
  getNotes: (filter, sort) => ipcRenderer.invoke(IPC_CHANNELS.NOTES_GET_ALL, filter, sort),
  getNoteById: (id) => ipcRenderer.invoke(IPC_CHANNELS.NOTES_GET_BY_ID, id),
  createNote: (input) => ipcRenderer.invoke(IPC_CHANNELS.NOTES_CREATE, input),
  updateNote: (input) => ipcRenderer.invoke(IPC_CHANNELS.NOTES_UPDATE, input),
  trashNote: (id) => ipcRenderer.invoke(IPC_CHANNELS.NOTES_TRASH, id),
  restoreNote: (id) => ipcRenderer.invoke(IPC_CHANNELS.NOTES_RESTORE, id),
  deleteNotePermanently: (id) => ipcRenderer.invoke(IPC_CHANNELS.NOTES_DELETE_PERMANENT, id),
  emptyTrash: () => ipcRenderer.invoke(IPC_CHANNELS.NOTES_EMPTY_TRASH),
  togglePinNote: (id) => ipcRenderer.invoke(IPC_CHANNELS.NOTES_TOGGLE_PIN, id),
  toggleFavoriteNote: (id) => ipcRenderer.invoke(IPC_CHANNELS.NOTES_TOGGLE_FAVORITE, id),
  moveNoteToNotebook: (noteId, notebookId) => ipcRenderer.invoke(IPC_CHANNELS.NOTES_MOVE_TO_NOTEBOOK, noteId, notebookId),
  assignTagToNote: (noteId, tagId) => ipcRenderer.invoke(IPC_CHANNELS.NOTES_ASSIGN_TAG, noteId, tagId),
  removeTagFromNote: (noteId, tagId) => ipcRenderer.invoke(IPC_CHANNELS.NOTES_REMOVE_TAG, noteId, tagId),

  // Notebooks
  getNotebooks: () => ipcRenderer.invoke(IPC_CHANNELS.NOTEBOOKS_GET_ALL),
  createNotebook: (input) => ipcRenderer.invoke(IPC_CHANNELS.NOTEBOOKS_CREATE, input),
  updateNotebook: (input) => ipcRenderer.invoke(IPC_CHANNELS.NOTEBOOKS_UPDATE, input),
  deleteNotebook: (options) => ipcRenderer.invoke(IPC_CHANNELS.NOTEBOOKS_DELETE, options),
  reorderNotebooks: (ids) => ipcRenderer.invoke(IPC_CHANNELS.NOTEBOOKS_REORDER, ids),

  // Tags
  getTags: () => ipcRenderer.invoke(IPC_CHANNELS.TAGS_GET_ALL),
  createTag: (input) => ipcRenderer.invoke(IPC_CHANNELS.TAGS_CREATE, input),
  updateTag: (input) => ipcRenderer.invoke(IPC_CHANNELS.TAGS_UPDATE, input),
  deleteTag: (id) => ipcRenderer.invoke(IPC_CHANNELS.TAGS_DELETE, id),

  // Search
  searchNotes: (params) => ipcRenderer.invoke(IPC_CHANNELS.SEARCH_QUERY, params),

  // Settings
  getSettings: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),
  updateSettings: (settings) => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_UPDATE, settings),

  // Backup & Restore
  exportBackup: () => ipcRenderer.invoke(IPC_CHANNELS.BACKUP_EXPORT),
  importBackup: (options) => ipcRenderer.invoke(IPC_CHANNELS.BACKUP_IMPORT, options),

  // Window Controls
  minimizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
  maximizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE),
  closeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
