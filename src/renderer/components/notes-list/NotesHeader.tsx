import React, { useState } from 'react';
import { 
  Plus, 
  ArrowUpDown, 
  Search, 
  X, 
  Trash2,
  Folder,
  Tag as TagIcon
} from 'lucide-react';
import { useNotesStore } from '../../stores/notes.store';
import { useNotebooksStore } from '../../stores/notebooks.store';
import { useTagsStore } from '../../stores/tags.store';
import { SortMenu } from './SortMenu';

export const NotesHeader: React.FC = () => {
  const { notes, createNote, searchQuery, setSearchQuery, emptyTrash } = useNotesStore();
  const { specialView, selectedNotebookId, notebooks } = useNotebooksStore();
  const { selectedTagId, tags } = useTagsStore();
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Compute Current Title
  let viewTitle = 'All Notes';
  let viewIcon = null;

  if (searchQuery.trim().length > 0) {
    viewTitle = `Search: "${searchQuery}"`;
  } else if (selectedTagId) {
    const currentTag = tags.find(t => t.id === selectedTagId);
    viewTitle = currentTag ? `#${currentTag.name}` : 'Tag';
    viewIcon = <TagIcon size={14} className="text-blue-500" />;
  } else if (specialView === 'favorites') {
    viewTitle = 'Favorites';
  } else if (specialView === 'trash') {
    viewTitle = 'Trash';
  } else if (selectedNotebookId) {
    const currentNotebook = notebooks.find(n => n.id === selectedNotebookId);
    viewTitle = currentNotebook ? currentNotebook.name : 'Notebook';
    viewIcon = <Folder size={14} className="text-amber-500" />;
  }

  const isTrashView = specialView === 'trash';

  return (
    <div className="p-3 border-b border-notesList-borderLight dark:border-notesList-borderDark bg-notesList-light dark:bg-notesList-dark flex-shrink-0 select-none">
      {/* Top row: Title, Count, Sort, New Note */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center space-x-1.5 truncate">
          {viewIcon}
          <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {viewTitle}
          </h2>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
            ({notes.length})
          </span>
        </div>

        <div className="flex items-center space-x-1 relative">
          {!isTrashView ? (
            <>
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                title="Sort notes"
              >
                <ArrowUpDown size={14} />
              </button>

              <button
                onClick={() => createNote()}
                className="flex items-center space-x-1 px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-subtle transition-colors"
                title="Create New Note (Ctrl+N)"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">New</span>
              </button>
            </>
          ) : (
            notes.length > 0 && (
              <button
                onClick={() => emptyTrash()}
                className="flex items-center space-x-1 px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors"
                title="Empty Trash"
              >
                <Trash2 size={13} />
                <span>Empty Trash</span>
              </button>
            )
          )}

          <SortMenu isOpen={isSortOpen} onClose={() => setIsSortOpen(false)} />
        </div>
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <Search
          size={13}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search in notes (Ctrl+F)..."
          className="w-full bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs pl-8 pr-7 py-1.5 rounded-md border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );
};
