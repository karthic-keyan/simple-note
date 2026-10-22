import { create } from 'zustand';
import { Notebook, CreateNotebookInput, UpdateNotebookInput, DeleteNotebookOptions } from '../../shared/types/notebook';

export type SpecialView = 'all' | 'favorites' | 'trash' | 'unorganized';

interface NotebooksState {
  notebooks: Notebook[];
  selectedNotebookId: string | null;
  specialView: SpecialView | null;
  expandedNotebookIds: string[];
  isLoading: boolean;
  loadNotebooks: () => Promise<void>;
  createNotebook: (input: CreateNotebookInput) => Promise<Notebook | null>;
  updateNotebook: (input: UpdateNotebookInput) => Promise<Notebook | null>;
  deleteNotebook: (options: DeleteNotebookOptions) => Promise<void>;
  reorderNotebooks: (ids: string[]) => Promise<void>;
  selectNotebook: (id: string | null) => void;
  selectSpecialView: (view: SpecialView) => void;
  toggleExpandNotebook: (id: string) => void;
}

export const useNotebooksStore = create<NotebooksState>((set, get) => ({
  notebooks: [],
  selectedNotebookId: null,
  specialView: 'all', // Default initial view: All Notes
  expandedNotebookIds: [],
  isLoading: false,

  loadNotebooks: async () => {
    set({ isLoading: true });
    try {
      const notebooks = await window.electronAPI.getNotebooks();
      set({ notebooks, isLoading: false });
    } catch (err) {
      console.error('Failed to load notebooks:', err);
      set({ isLoading: false });
    }
  },

  createNotebook: async (input) => {
    try {
      const nb = await window.electronAPI.createNotebook(input);
      await get().loadNotebooks();
      // Auto-expand parent if created inside a notebook
      if (input.parent_id && !get().expandedNotebookIds.includes(input.parent_id)) {
        set({ expandedNotebookIds: [...get().expandedNotebookIds, input.parent_id] });
      }
      return nb;
    } catch (err) {
      console.error('Failed to create notebook:', err);
      return null;
    }
  },

  updateNotebook: async (input) => {
    try {
      const updated = await window.electronAPI.updateNotebook(input);
      await get().loadNotebooks();
      return updated;
    } catch (err) {
      console.error('Failed to update notebook:', err);
      return null;
    }
  },

  deleteNotebook: async (options) => {
    try {
      await window.electronAPI.deleteNotebook(options);
      if (get().selectedNotebookId === options.id) {
        set({ selectedNotebookId: null, specialView: 'all' });
      }
      await get().loadNotebooks();
    } catch (err) {
      console.error('Failed to delete notebook:', err);
    }
  },

  reorderNotebooks: async (ids) => {
    try {
      await window.electronAPI.reorderNotebooks(ids);
      await get().loadNotebooks();
    } catch (err) {
      console.error('Failed to reorder notebooks:', err);
    }
  },

  selectNotebook: (id) => {
    set({ selectedNotebookId: id, specialView: null });
  },

  selectSpecialView: (view) => {
    set({ specialView: view, selectedNotebookId: null });
  },

  toggleExpandNotebook: (id) => {
    const current = get().expandedNotebookIds;
    if (current.includes(id)) {
      set({ expandedNotebookIds: current.filter(x => x !== id) });
    } else {
      set({ expandedNotebookIds: [...current, id] });
    }
  },
}));
