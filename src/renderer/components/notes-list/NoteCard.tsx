import React, { useState } from 'react';
import { 
  Pin, 
  Star, 
  Trash2, 
  RotateCcw, 
  MoreHorizontal, 
  FolderInput
} from 'lucide-react';
import { Note } from '../../../shared/types/note';
import { useNotesStore } from '../../stores/notes.store';
import { useNotebooksStore } from '../../stores/notebooks.store';
import { useTagsStore } from '../../stores/tags.store';
import { useUIStore } from '../../stores/ui.store';

interface NoteCardProps {
  note: Note;
  snippet?: string;
}

function formatNoteDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return dateStr;
  }
}

export const NoteCardComponent: React.FC<NoteCardProps> = ({ note, snippet }) => {
  const isActive = useNotesStore(state => state.activeNoteId === note.id);
  const isTrashSpecial = useNotebooksStore(state => state.specialView === 'trash');
  const tags = useTagsStore(state => state.tags);
  const openMoveModal = useUIStore(state => state.openMoveModal);
  const openDeleteModal = useUIStore(state => state.openDeleteModal);

  const selectNote = useNotesStore.getState().selectNote;
  const togglePin = useNotesStore.getState().togglePin;
  const toggleFavorite = useNotesStore.getState().toggleFavorite;
  const trashNote = useNotesStore.getState().trashNote;
  const restoreNote = useNotesStore.getState().restoreNote;

  const [menuOpen, setMenuOpen] = useState(false);

  const isTrashView = isTrashSpecial || note.deleted_at !== null;

  // Resolve note tags
  const noteTags = (note.tags || [])
    .map((tid: string) => tags.find(t => t.id === tid))
    .filter(Boolean);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(true);
  };

  return (
    <div
      onClick={() => selectNote(note.id)}
      onContextMenu={handleContextMenu}
      className={`relative px-3.5 py-3 border-b border-notesList-borderLight dark:border-notesList-borderDark cursor-pointer transition-colors group select-none ${
        isActive
          ? 'bg-notesList-activeLight dark:bg-notesList-activeDark border-l-4 border-l-blue-600'
          : 'hover:bg-notesList-hoverLight dark:hover:bg-notesList-hoverDark'
      }`}
    >
      {/* Title & Status Badges */}
      <div className="flex items-start justify-between space-x-1.5 mb-1">
        <h4 className={`text-xs truncate flex-1 ${
          isActive 
            ? 'font-bold text-slate-900 dark:text-white' 
            : 'font-semibold text-slate-800 dark:text-slate-200'
        }`}>
          {note.title.trim() ? note.title : 'Untitled Note'}
        </h4>

        <div className="flex items-center space-x-1 flex-shrink-0">
          {note.is_pinned === 1 && !isTrashView && (
            <Pin size={12} className="text-amber-500 fill-amber-500 transform rotate-45" />
          )}
          {note.is_favorite === 1 && !isTrashView && (
            <Star size={12} className="text-amber-400 fill-amber-400" />
          )}

          {/* Context Options Button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-opacity"
              title="Note actions"
            >
              <MoreHorizontal size={13} />
            </button>

            {menuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                  }} 
                />
                <div 
                  className="absolute right-0 top-6 z-50 w-44 bg-white dark:bg-slate-800 rounded-lg shadow-dropdown border border-slate-200 dark:border-slate-700 py-1 text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  {!isTrashView ? (
                    <>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          togglePin(note.id);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                      >
                        <Pin size={13} />
                        <span>{note.is_pinned ? 'Unpin Note' : 'Pin Note'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          toggleFavorite(note.id);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                      >
                        <Star size={13} />
                        <span>{note.is_favorite ? 'Remove Favorite' : 'Mark Favorite'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          openMoveModal(note.id);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                      >
                        <FolderInput size={13} />
                        <span>Move to Notebook...</span>
                      </button>

                      <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          trashNote(note.id);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400"
                      >
                        <Trash2 size={13} />
                        <span>Move to Trash</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          restoreNote(note.id);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400"
                      >
                        <RotateCcw size={13} />
                        <span>Restore Note</span>
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          openDeleteModal('note', note.id, note.title);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400"
                      >
                        <Trash2 size={13} />
                        <span>Delete Permanently</span>
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Snippet / Preview */}
      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2 min-h-[1.5rem]">
        {snippet ? (
          <span dangerouslySetInnerHTML={{ __html: snippet }} />
        ) : (
          note.content_text.trim() || 'No additional text'
        )}
      </div>

      {/* Footer: Date & Tags */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
        <span>{formatNoteDate(note.updated_at)}</span>

        {noteTags.length > 0 && (
          <div className="flex items-center space-x-1 overflow-hidden max-w-[55%]">
            {noteTags.slice(0, 2).map((tag: any) => tag && (
              <span
                key={tag.id}
                className="px-1.5 py-0.5 rounded text-[9px] font-medium truncate"
                style={{
                  backgroundColor: `${tag.color}20`,
                  color: tag.color,
                }}
              >
                #{tag.name}
              </span>
            ))}
            {noteTags.length > 2 && (
              <span className="text-[9px] text-slate-400">+{noteTags.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const NoteCard = React.memo<NoteCardProps>(NoteCardComponent, (prev, next) => {
  return (
    prev.note.id === next.note.id &&
    prev.note.title === next.note.title &&
    prev.note.content_text === next.note.content_text &&
    prev.note.updated_at === next.note.updated_at &&
    prev.note.is_pinned === next.note.is_pinned &&
    prev.note.is_favorite === next.note.is_favorite &&
    prev.note.deleted_at === next.note.deleted_at &&
    prev.snippet === next.snippet &&
    prev.note.tags?.length === next.note.tags?.length &&
    (prev.note.tags || []).every((t, i) => t === next.note.tags?.[i])
  );
});
