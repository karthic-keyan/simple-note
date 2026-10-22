import { create } from 'zustand';
import { Note, CreateNoteInput, UpdateNoteInput, NoteSortOptions, NoteFilterOptions } from '../../shared/types/note';
import { SearchResultItem } from '../../shared/types/search';
import { useNotebooksStore } from './notebooks.store';
import { useTagsStore } from './tags.store';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface NotesState {
  notes: Note[];
  activeNoteId: string | null;
  activeNote: Note | null;
  saveStatus: SaveStatus;
  saveError: string | null;
  lastSavedAt: Date | null;
  searchQuery: string;
  searchResults: SearchResultItem[];
  sortOptions: NoteSortOptions;
  isLoading: boolean;

  // Actions
  loadNotes: () => Promise<void>;
  selectNote: (id: string | null) => Promise<void>;
  createNote: (input?: CreateNoteInput) => Promise<Note | null>;
  queueSave: (changes: Partial<UpdateNoteInput>) => void;
  flushPendingSave: () => Promise<void>;
  trashNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  deletePermanent: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  moveToNotebook: (noteId: string, notebookId: string | null) => Promise<void>;
  assignTag: (noteId: string, tagId: string) => Promise<void>;
  removeTag: (noteId: string, tagId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSortOptions: (options: NoteSortOptions) => void;
}

let saveTimer: NodeJS.Timeout | null = null;
let pendingChangesBuffer: Partial<UpdateNoteInput> | null = null;

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  activeNoteId: null,
  activeNote: null,
  saveStatus: 'idle',
  saveError: null,
  lastSavedAt: null,
  searchQuery: '',
  searchResults: [],
  sortOptions: { field: 'updated_at', order: 'desc' },
  isLoading: false,

  loadNotes: async () => {
    set({ isLoading: true });
    try {
      const { specialView, selectedNotebookId } = useNotebooksStore.getState();
      const { selectedTagId } = useTagsStore.getState();
      const { searchQuery, sortOptions } = get();

      // If search query is present
      if (searchQuery.trim().length > 0) {
        const results = await window.electronAPI.searchNotes({
          query: searchQuery,
          notebook_id: selectedNotebookId,
          tag_id: selectedTagId || undefined,
          include_trash: specialView === 'trash',
        });
        const notes = results.map(r => r.note);
        set({ notes, searchResults: results, isLoading: false });

        // Maintain or select first
        if (notes.length > 0 && (!get().activeNoteId || !notes.find(n => n.id === get().activeNoteId))) {
          await get().selectNote(notes[0].id);
        } else if (notes.length === 0) {
          set({ activeNoteId: null, activeNote: null });
        }
        return;
      }

      const filter: NoteFilterOptions = {};
      if (selectedTagId) {
        filter.is_trash = false;
        filter.tag_id = selectedTagId;
      } else if (specialView === 'trash') {
        filter.is_trash = true;
      } else {
        filter.is_trash = false;
        if (specialView === 'favorites') {
          filter.is_favorite = true;
        } else if (specialView === 'unorganized') {
          filter.notebook_id = null;
        } else if (selectedNotebookId) {
          filter.notebook_id = selectedNotebookId;
        }
      }

      const notes = await window.electronAPI.getNotes(filter, sortOptions);
      set({ notes, searchResults: [], isLoading: false });

      // Automatically select the first note if active note is no longer in current view
      const currentActive = get().activeNoteId;
      if (notes.length > 0) {
        if (!currentActive || !notes.find(n => n.id === currentActive)) {
          await get().selectNote(notes[0].id);
        } else {
          // Refresh activeNote instance with fresh data from database
          const refreshed = notes.find(n => n.id === currentActive);
          if (refreshed) {
            set({ activeNote: refreshed });
          }
        }
      } else {
        set({ activeNoteId: null, activeNote: null });
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
      set({ isLoading: false });
    }
  },

  selectNote: async (id: string | null) => {
    // 1. Flush any pending save for previous note first!
    await get().flushPendingSave();

    if (!id) {
      set({ activeNoteId: null, activeNote: null });
      return;
    }

    try {
      const note = await window.electronAPI.getNoteById(id);
      set({
        activeNoteId: id,
        activeNote: note,
        saveStatus: 'idle',
        saveError: null,
      });
    } catch (err) {
      console.error(`Failed to load note ${id}:`, err);
    }
  },

  createNote: async (input) => {
    await get().flushPendingSave();

    const { selectedNotebookId, specialView } = useNotebooksStore.getState();
    const { selectedTagId } = useTagsStore.getState();

    let targetNotebookId: string | null = null;
    if (input?.notebook_id !== undefined) {
      targetNotebookId = input.notebook_id;
    } else if (selectedNotebookId) {
      targetNotebookId = selectedNotebookId;
    } else if (specialView === 'unorganized' || specialView === 'all' || specialView === 'favorites') {
      targetNotebookId = null;
    }

    const tagIds = input?.tag_ids || (selectedTagId ? [selectedTagId] : []);

    try {
      const newNote = await window.electronAPI.createNote({
        title: input?.title || 'Untitled Note',
        content_json: input?.content_json || '{"type":"doc","content":[{"type":"paragraph"}]}',
        content_text: input?.content_text || '',
        notebook_id: targetNotebookId,
        tag_ids: tagIds,
      });

      // Reload notes and refresh tag and notebook counts
      await get().loadNotes();
      useTagsStore.getState().loadTags();
      useNotebooksStore.getState().loadNotebooks();
      await get().selectNote(newNote.id);
      return newNote;
    } catch (err) {
      console.error('Failed to create note:', err);
      return null;
    }
  },

  queueSave: (changes: Partial<UpdateNoteInput>) => {
    const activeNote = get().activeNote;
    if (!activeNote) return;

    // Buffer changes
    pendingChangesBuffer = {
      ...(pendingChangesBuffer || {}),
      ...changes,
      id: activeNote.id,
    };

    // Update activeNote optimistically in store
    const optimisticNote: Note = {
      ...activeNote,
      ...(changes.title !== undefined ? { title: changes.title } : {}),
      ...(changes.content_json !== undefined ? { content_json: changes.content_json } : {}),
      ...(changes.content_text !== undefined ? { content_text: changes.content_text } : {}),
      ...(changes.notebook_id !== undefined ? { notebook_id: changes.notebook_id } : {}),
      ...(changes.is_pinned !== undefined ? { is_pinned: changes.is_pinned } : {}),
      ...(changes.is_favorite !== undefined ? { is_favorite: changes.is_favorite } : {}),
      updated_at: new Date().toISOString(),
    };

    // Update note item in notes list as well
    const updatedNotes = get().notes.map(n => n.id === activeNote.id ? optimisticNote : n);

    set({
      activeNote: optimisticNote,
      notes: updatedNotes,
      saveStatus: 'saving',
      saveError: null,
    });

    // Clear existing timer and schedule debounced save (500ms)
    if (saveTimer) {
      clearTimeout(saveTimer);
    }

    saveTimer = setTimeout(async () => {
      await get().flushPendingSave();
    }, 500);
  },

  flushPendingSave: async () => {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }

    if (!pendingChangesBuffer) {
      return;
    }

    const payload = { ...pendingChangesBuffer };
    pendingChangesBuffer = null;

    try {
      set({ saveStatus: 'saving' });
      const savedNote = await window.electronAPI.updateNote(payload as UpdateNoteInput);
      
      // Update active note with saved response
      if (get().activeNoteId === savedNote.id) {
        set({
          activeNote: savedNote,
          saveStatus: 'saved',
          lastSavedAt: new Date(),
          saveError: null,
        });
      }

      // Update notes list
      set(state => ({
        notes: state.notes.map(n => n.id === savedNote.id ? savedNote : n),
      }));

      // Refresh tag and notebook counts if tags or notebook were modified
      if (payload.notebook_id !== undefined || payload.tag_ids !== undefined) {
        useTagsStore.getState().loadTags();
        useNotebooksStore.getState().loadNotebooks();
      }
    } catch (err: any) {
      console.error('Failed to save note:', err);
      // Keep buffer so user edits are not lost, allow retry
      pendingChangesBuffer = payload;
      set({
        saveStatus: 'error',
        saveError: err.message || 'Auto-save failed. Will retry...',
      });
    }
  },

  trashNote: async (id: string) => {
    await get().flushPendingSave();
    try {
      await window.electronAPI.trashNote(id);
      await get().loadNotes();
      // Also reload notebooks / tags to refresh count badges
      useNotebooksStore.getState().loadNotebooks();
      useTagsStore.getState().loadTags();
    } catch (err) {
      console.error(`Failed to trash note ${id}:`, err);
    }
  },

  restoreNote: async (id: string) => {
    try {
      await window.electronAPI.restoreNote(id);
      await get().loadNotes();
      useNotebooksStore.getState().loadNotebooks();
      useTagsStore.getState().loadTags();
    } catch (err) {
      console.error(`Failed to restore note ${id}:`, err);
    }
  },

  deletePermanent: async (id: string) => {
    try {
      await window.electronAPI.deleteNotePermanently(id);
      await get().loadNotes();
      useNotebooksStore.getState().loadNotebooks();
      useTagsStore.getState().loadTags();
    } catch (err) {
      console.error(`Failed to permanently delete note ${id}:`, err);
    }
  },

  emptyTrash: async () => {
    try {
      await window.electronAPI.emptyTrash();
      await get().loadNotes();
      useNotebooksStore.getState().loadNotebooks();
      useTagsStore.getState().loadTags();
    } catch (err) {
      console.error('Failed to empty trash:', err);
    }
  },

  togglePin: async (id: string) => {
    try {
      await window.electronAPI.togglePinNote(id);
      await get().loadNotes();
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  },

  toggleFavorite: async (id: string) => {
    try {
      await window.electronAPI.toggleFavoriteNote(id);
      await get().loadNotes();
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  },

  moveToNotebook: async (noteId: string, notebookId: string | null) => {
    try {
      await window.electronAPI.moveNoteToNotebook(noteId, notebookId);
      await get().loadNotes();
      useNotebooksStore.getState().loadNotebooks();
    } catch (err) {
      console.error('Failed to move note:', err);
    }
  },

  assignTag: async (noteId: string, tagId: string) => {
    try {
      await window.electronAPI.assignTagToNote(noteId, tagId);
      await get().loadNotes();
      useTagsStore.getState().loadTags();
    } catch (err) {
      console.error('Failed to assign tag:', err);
    }
  },

  removeTag: async (noteId: string, tagId: string) => {
    try {
      await window.electronAPI.removeTagFromNote(noteId, tagId);
      await get().loadNotes();
      useTagsStore.getState().loadTags();
    } catch (err) {
      console.error('Failed to remove tag:', err);
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().loadNotes();
  },

  setSortOptions: (options: NoteSortOptions) => {
    set({ sortOptions: options });
    get().loadNotes();
  },
}));
