import React from 'react';
import { useNotesStore } from '../../stores/notes.store';
import { useNotebooksStore } from '../../stores/notebooks.store';
import { NotesHeader } from './NotesHeader';
import { NoteCard } from './NoteCard';
import { FileText, Plus, SearchX, Trash2 } from 'lucide-react';

export const NotesList: React.FC = () => {
  const { notes, searchResults, searchQuery, isLoading, createNote } = useNotesStore();
  const { specialView } = useNotebooksStore();

  const isTrash = specialView === 'trash';

  return (
    <section className="h-full flex flex-col bg-notesList-light dark:bg-notesList-dark border-r border-notesList-borderLight dark:border-notesList-borderDark select-none overflow-hidden flex-shrink-0">
      <NotesHeader />

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-xs text-slate-400">
            Loading notes...
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 px-4 text-center">
            {searchQuery ? (
              <>
                <SearchX size={32} className="text-slate-400 dark:text-slate-600 mb-2" />
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  No notes match "{searchQuery}"
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Try checking your spelling or using different keywords
                </p>
              </>
            ) : isTrash ? (
              <>
                <Trash2 size={32} className="text-slate-400 dark:text-slate-600 mb-2" />
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Trash is empty
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Deleted notes will show up here
                </p>
              </>
            ) : (
              <>
                <FileText size={32} className="text-slate-400 dark:text-slate-600 mb-2" />
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  No notes in this view
                </p>
                <button
                  onClick={() => createNote()}
                  className="mt-3 flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
                >
                  <Plus size={13} />
                  <span>Create a Note</span>
                </button>
              </>
            )}
          </div>
        ) : (
          <div>
            {(() => {
              const snippetMap = new Map<string, string>();
              for (const r of searchResults) {
                if (r.snippet) snippetMap.set(r.note.id, r.snippet);
              }
              return notes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  snippet={snippetMap.get(note.id)}
                />
              ));
            })()}
          </div>
        )}
      </div>
    </section>
  );
};
