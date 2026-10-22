import { IElectronAPI } from '../../shared/types/ipc';
import { Note } from '../../shared/types/note';
import { Notebook } from '../../shared/types/notebook';
import { Tag } from '../../shared/types/tag';
import { UserSettings, DEFAULT_SETTINGS } from '../../shared/types/settings';

const INITIAL_NOTEBOOKS: Notebook[] = [
  { id: 'nb-1', name: 'Work', parent_id: null, display_order: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), note_count: 2 },
  { id: 'nb-2', name: 'Personal', parent_id: null, display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), note_count: 1 },
  { id: 'nb-3', name: 'Project Titan', parent_id: 'nb-1', display_order: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), note_count: 1 },
];

const INITIAL_TAGS: Tag[] = [
  { id: 'tag-1', name: 'ideas', color: '#3b82f6', note_count: 1 },
  { id: 'tag-2', name: 'important', color: '#ef4444', note_count: 2 },
  { id: 'tag-3', name: 'reading', color: '#10b981', note_count: 0 },
];

const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'Welcome to Simple Note for Windows',
    content_json: JSON.stringify({
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Welcome to Simple Note' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'This is your clean, offline-first notes application called Simple Note. It features rich-text editing, SQLite persistence, and instant full-text search.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Quick Features' }] },
        {
          type: 'taskList',
          content: [
            { type: 'taskItem', attrs: { checked: true }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Local offline storage with SQLite' }] }] },
            { type: 'taskItem', attrs: { checked: true }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Instant debounced autosave (500ms)' }] }] },
            { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Create nested notebooks and colored tags' }] }] },
            { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Backup and restore anytime' }] }] },
          ],
        },
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Writing is thinking. Keep your ideas organized and accessible.' }] }] },
      ],
    }),
    content_text: 'Welcome to Simple Note. This is your clean, offline-first notes application called Simple Note. Features: Local offline storage, Instant debounced autosave, nested notebooks, backup & restore.',
    notebook_id: 'nb-1',
    is_pinned: 1,
    is_favorite: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    tags: ['tag-1', 'tag-2'],
  },
  {
    id: 'note-2',
    title: 'Project Roadmap',
    content_json: JSON.stringify({
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Project Roadmap' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'High priority milestones for the upcoming sprint.' }] },
      ],
    }),
    content_text: 'Project Roadmap. High priority milestones for the upcoming sprint.',
    notebook_id: 'nb-3',
    is_pinned: 0,
    is_favorite: 1,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    deleted_at: null,
    tags: ['tag-2'],
  },
];

export function setupBrowserMock(): void {
  if (typeof window.electronAPI !== 'undefined') return;

  let notes: Note[] = (() => {
    try {
      const saved = localStorage.getItem('simplenote_notes') || localStorage.getItem('upnote_notes');
      return saved ? JSON.parse(saved) : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  })();

  let notebooks: Notebook[] = (() => {
    try {
      const saved = localStorage.getItem('simplenote_notebooks') || localStorage.getItem('upnote_notebooks');
      return saved ? JSON.parse(saved) : INITIAL_NOTEBOOKS;
    } catch {
      return INITIAL_NOTEBOOKS;
    }
  })();

  let tags: Tag[] = (() => {
    try {
      const saved = localStorage.getItem('simplenote_tags') || localStorage.getItem('upnote_tags');
      return saved ? JSON.parse(saved) : INITIAL_TAGS;
    } catch {
      return INITIAL_TAGS;
    }
  })();

  let settings: UserSettings = (() => {
    try {
      const saved = localStorage.getItem('simplenote_settings') || localStorage.getItem('upnote_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  })();

  const saveStorage = () => {
    try {
      localStorage.setItem('simplenote_notes', JSON.stringify(notes));
      localStorage.setItem('simplenote_notebooks', JSON.stringify(notebooks));
      localStorage.setItem('simplenote_tags', JSON.stringify(tags));
      localStorage.setItem('simplenote_settings', JSON.stringify(settings));
    } catch {}
  };

  const mockAPI: IElectronAPI = {
    getNotes: async (filter, sort) => {
      let result = notes.filter(n => {
        if (filter?.is_trash) return n.deleted_at !== null;
        if (n.deleted_at !== null) return false;
        if (filter?.is_favorite && !n.is_favorite) return false;
        if (filter?.is_pinned && !n.is_pinned) return false;
        if (filter?.notebook_id !== undefined) {
          if (filter.notebook_id === null && n.notebook_id !== null) return false;
          if (filter.notebook_id !== null && n.notebook_id !== filter.notebook_id) return false;
        }
        if (filter?.tag_id && (!n.tags || !n.tags.includes(filter.tag_id))) return false;
        return true;
      });

      result.sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return b.is_pinned - a.is_pinned;
        const field = sort?.field || 'updated_at';
        const order = sort?.order || 'desc';
        let cmp = 0;
        if (field === 'title') cmp = a.title.localeCompare(b.title);
        else cmp = new Date(b[field]).getTime() - new Date(a[field]).getTime();
        return order === 'asc' ? -cmp : cmp;
      });

      return result;
    },
    getNoteById: async (id) => notes.find(n => n.id === id) || null,
    createNote: async (input) => {
      const now = new Date().toISOString();
      const newNote: Note = {
        id: 'note-' + Math.random().toString(36).substring(2, 9),
        title: input.title || 'Untitled Note',
        content_json: input.content_json || '{"type":"doc","content":[{"type":"paragraph"}]}',
        content_text: input.content_text || '',
        notebook_id: input.notebook_id || null,
        is_pinned: 0,
        is_favorite: 0,
        created_at: now,
        updated_at: now,
        deleted_at: null,
        tags: input.tag_ids || [],
      };
      notes.unshift(newNote);
      saveStorage();
      return newNote;
    },
    updateNote: async (input) => {
      const idx = notes.findIndex(n => n.id === input.id);
      if (idx === -1) throw new Error('Note not found');
      const updated: Note = {
        ...notes[idx],
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.content_json !== undefined ? { content_json: input.content_json } : {}),
        ...(input.content_text !== undefined ? { content_text: input.content_text } : {}),
        ...(input.notebook_id !== undefined ? { notebook_id: input.notebook_id } : {}),
        ...(input.is_pinned !== undefined ? { is_pinned: input.is_pinned } : {}),
        ...(input.is_favorite !== undefined ? { is_favorite: input.is_favorite } : {}),
        ...(input.tag_ids !== undefined ? { tags: input.tag_ids } : {}),
        updated_at: new Date().toISOString(),
      };
      notes[idx] = updated;
      saveStorage();
      return updated;
    },
    trashNote: async (id) => {
      const n = notes.find(x => x.id === id);
      if (n) {
        n.deleted_at = new Date().toISOString();
        n.is_pinned = 0;
        saveStorage();
      }
    },
    restoreNote: async (id) => {
      const n = notes.find(x => x.id === id);
      if (n) {
        n.deleted_at = null;
        saveStorage();
      }
    },
    deleteNotePermanently: async (id) => {
      notes = notes.filter(x => x.id !== id);
      saveStorage();
    },
    emptyTrash: async () => {
      notes = notes.filter(x => x.deleted_at === null);
      saveStorage();
    },
    togglePinNote: async (id: string) => {
      const n = notes.find(x => x.id === id);
      if (n) {
        n.is_pinned = n.is_pinned ? 0 : 1;
        saveStorage();
        return n;
      }
      throw new Error('Not found');
    },
    toggleFavoriteNote: async (id: string) => {
      const n = notes.find(x => x.id === id);
      if (n) {
        n.is_favorite = n.is_favorite ? 0 : 1;
        saveStorage();
        return n;
      }
      throw new Error('Not found');
    },
    moveNoteToNotebook: async (noteId, notebookId) => {
      const n = notes.find(x => x.id === noteId);
      if (n) {
        n.notebook_id = notebookId;
        saveStorage();
        return n;
      }
      throw new Error('Not found');
    },
    assignTagToNote: async (noteId, tagId) => {
      const n = notes.find(x => x.id === noteId);
      if (n) {
        n.tags = [...(n.tags || []).filter(t => t !== tagId), tagId];
        saveStorage();
      }
    },
    removeTagFromNote: async (noteId, tagId) => {
      const n = notes.find(x => x.id === noteId);
      if (n) {
        n.tags = (n.tags || []).filter(t => t !== tagId);
        saveStorage();
      }
    },

    getNotebooks: async () => {
      return notebooks.map(nb => ({
        ...nb,
        note_count: notes.filter(n => n.notebook_id === nb.id && n.deleted_at === null).length,
      }));
    },
    createNotebook: async (input) => {
      const now = new Date().toISOString();
      const nb: Notebook = {
        id: 'nb-' + Math.random().toString(36).substring(2, 9),
        name: input.name,
        parent_id: input.parent_id || null,
        display_order: notebooks.length,
        created_at: now,
        updated_at: now,
        note_count: 0,
      };
      notebooks.push(nb);
      saveStorage();
      return nb;
    },
    updateNotebook: async (input) => {
      const nb = notebooks.find(n => n.id === input.id);
      if (!nb) throw new Error('Notebook not found');
      if (input.name) nb.name = input.name;
      if (input.parent_id !== undefined) nb.parent_id = input.parent_id;
      nb.updated_at = new Date().toISOString();
      saveStorage();
      return nb;
    },
    deleteNotebook: async (opts) => {
      if (opts.strategy === 'move_notes_to_trash') {
        notes.forEach(n => {
          if (n.notebook_id === opts.id) n.deleted_at = new Date().toISOString();
        });
      } else {
        notes.forEach(n => {
          if (n.notebook_id === opts.id) n.notebook_id = null;
        });
      }
      notebooks = notebooks.filter(n => n.id !== opts.id);
      saveStorage();
    },
    reorderNotebooks: async () => {},

    getTags: async () => {
      return tags.map(t => ({
        ...t,
        note_count: notes.filter(n => n.tags?.includes(t.id) && n.deleted_at === null).length,
      }));
    },
    createTag: async (input) => {
      const t: Tag = {
        id: 'tag-' + Math.random().toString(36).substring(2, 9),
        name: input.name,
        color: input.color || '#3b82f6',
        note_count: 0,
      };
      tags.push(t);
      saveStorage();
      return t;
    },
    updateTag: async (input) => {
      const t = tags.find(x => x.id === input.id);
      if (!t) throw new Error('Tag not found');
      if (input.name) t.name = input.name;
      if (input.color) t.color = input.color;
      saveStorage();
      return t;
    },
    deleteTag: async (id) => {
      tags = tags.filter(x => x.id !== id);
      notes.forEach(n => {
        if (n.tags) n.tags = n.tags.filter(tid => tid !== id);
      });
      saveStorage();
    },

    searchNotes: async (params) => {
      const q = params.query.toLowerCase();
      const matched = notes.filter(n => {
        if (!params.include_trash && n.deleted_at !== null) return false;
        return n.title.toLowerCase().includes(q) || n.content_text.toLowerCase().includes(q);
      });
      return matched.map(m => ({
        note: m,
        snippet: m.content_text.slice(0, 80),
        matchScore: 1,
      }));
    },

    getSettings: async () => settings,
    updateSettings: async (updates) => {
      settings = { ...settings, ...updates };
      saveStorage();
      return settings;
    },

    exportBackup: async () => {
      const data = { version: '1.0.0', exported_at: new Date().toISOString(), app: 'Simple Note', notes, notebooks, tags, settings };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `simplenote-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      return { success: true, filePath: 'Downloads folder' };
    },
    importBackup: async () => {
      return { success: true, notesImported: notes.length, notebooksImported: notebooks.length, tagsImported: tags.length };
    },

    minimizeWindow: async () => {},
    maximizeWindow: async () => {},
    closeWindow: async () => {},
  };

  (window as any).electronAPI = mockAPI;
}
