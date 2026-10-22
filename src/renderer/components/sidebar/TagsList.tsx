import React, { useState } from 'react';
import { Tag as TagIcon, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useTagsStore } from '../../stores/tags.store';
import { useNotebooksStore } from '../../stores/notebooks.store';
import { useNotesStore } from '../../stores/notes.store';
import { useUIStore } from '../../stores/ui.store';

export const TagsList: React.FC = () => {
  const { tags, selectedTagId, selectTag } = useTagsStore();
  const { loadNotes } = useNotesStore();
  const { openTagModal, openDeleteModal } = useUIStore();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    if (selectedTagId === id) {
      selectTag(null);
      useNotebooksStore.getState().selectSpecialView('all');
    } else {
      useNotebooksStore.getState().selectNotebook(null);
      useNotebooksStore.getState().selectSpecialView(null as any);
      selectTag(id);
    }
    loadNotes();
  };

  if (tags.length === 0) {
    return (
      <div className="px-3 py-2 text-xs text-slate-400 dark:text-slate-500 italic">
        No tags yet
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {tags.map(tag => {
        const isSelected = selectedTagId === tag.id;
        const isMenuOpen = activeMenuId === tag.id;

        return (
          <div
            key={tag.id}
            onClick={() => handleSelect(tag.id)}
            className={`group relative flex items-center justify-between px-3 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
              isSelected
                ? 'bg-sidebar-activeLight dark:bg-sidebar-activeDark text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-sidebar-hoverLight dark:hover:bg-sidebar-hoverDark hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-2 truncate min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: tag.color || '#3b82f6' }}
              />
              <span className="truncate">#{tag.name}</span>
            </div>

            <div className="flex items-center space-x-1 flex-shrink-0">
              {tag.note_count !== undefined && tag.note_count > 0 && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500 group-hover:hidden">
                  {tag.note_count}
                </span>
              )}

              {/* Tag Menu Button */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(isMenuOpen ? null : tag.id);
                  }}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-opacity"
                  title="Tag options"
                >
                  <MoreHorizontal size={13} />
                </button>

                {isMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(null);
                      }}
                    />
                    <div
                      className="absolute right-0 top-6 z-40 w-36 bg-white dark:bg-slate-800 rounded-lg shadow-dropdown border border-slate-200 dark:border-slate-700 py-1 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setActiveMenuId(null);
                          openTagModal(tag.id);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                      >
                        <Pencil size={13} />
                        <span>Edit Tag</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveMenuId(null);
                          openDeleteModal('tag', tag.id, tag.name);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400"
                      >
                        <Trash2 size={13} />
                        <span>Delete Tag</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
