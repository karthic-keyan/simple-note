import React from 'react';
import { 
  Folder, 
  Pin, 
  Star, 
  Trash2, 
  FolderInput, 
  Clock,
  RotateCcw
} from 'lucide-react';
import { Note } from '../../../shared/types/note';
import { useNotebooksStore } from '../../stores/notebooks.store';
import { useNotesStore } from '../../stores/notes.store';
import { useUIStore } from '../../stores/ui.store';

interface EditorHeaderProps {
  note: Note;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({ note }) => {
  const { notebooks } = useNotebooksStore();
  const { togglePin, toggleFavorite, trashNote, restoreNote } = useNotesStore();
  const { openMoveModal, openDeleteModal } = useUIStore();

  const notebook = note.notebook_id ? notebooks.find(n => n.id === note.notebook_id) : null;
  const isDeleted = note.deleted_at !== null;

  return (
    <div className="flex items-center justify-between px-6 py-2 border-b border-editor-borderLight dark:border-editor-borderDark bg-white dark:bg-editor-dark text-slate-500 dark:text-slate-400 select-none text-xs flex-shrink-0">
      {/* Left: Breadcrumbs / Notebook Badge */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => !isDeleted && openMoveModal(note.id)}
          className="flex items-center space-x-1.5 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 font-medium transition-colors"
          title="Change notebook"
        >
          <Folder size={13} className="text-amber-500" />
          <span>{notebook ? notebook.name : 'Uncategorized'}</span>
        </button>

        <span className="text-slate-300 dark:text-slate-700">|</span>

        <div className="flex items-center space-x-1 text-[11px] text-slate-400">
          <Clock size={12} />
          <span>
            Updated {new Date(note.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Right: Quick actions */}
      <div className="flex items-center space-x-1">
        {!isDeleted ? (
          <>
            <button
              onClick={() => togglePin(note.id)}
              className={`p-1.5 rounded transition-colors ${
                note.is_pinned === 1
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              title={note.is_pinned === 1 ? 'Unpin Note (Ctrl+Shift+P)' : 'Pin Note (Ctrl+Shift+P)'}
            >
              <Pin size={15} className={note.is_pinned === 1 ? 'fill-amber-500 rotate-45' : ''} />
            </button>

            <button
              onClick={() => toggleFavorite(note.id)}
              className={`p-1.5 rounded transition-colors ${
                note.is_favorite === 1
                  ? 'text-amber-400 bg-amber-50 dark:bg-amber-950/40'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              title={note.is_favorite === 1 ? 'Remove from Favorites (Ctrl+Shift+F)' : 'Add to Favorites (Ctrl+Shift+F)'}
            >
              <Star size={15} className={note.is_favorite === 1 ? 'fill-amber-400' : ''} />
            </button>

            <button
              onClick={() => openMoveModal(note.id)}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              title="Move note..."
            >
              <FolderInput size={15} />
            </button>

            <button
              onClick={() => trashNote(note.id)}
              className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Move to Trash (Delete)"
            >
              <Trash2 size={15} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => restoreNote(note.id)}
              className="flex items-center space-x-1 px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 text-xs font-medium transition-colors"
              title="Restore Note"
            >
              <RotateCcw size={13} />
              <span>Restore</span>
            </button>
            <button
              onClick={() => openDeleteModal('note', note.id, note.title)}
              className="flex items-center space-x-1 px-2 py-1 rounded bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-medium transition-colors"
              title="Delete permanently"
            >
              <Trash2 size={13} />
              <span>Delete Permanently</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
