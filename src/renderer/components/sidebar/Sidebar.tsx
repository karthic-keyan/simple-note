import React from 'react';
import { 
  FileText, 
  Star, 
  Trash2, 
  FolderPlus, 
  Tag as TagIcon, 
  Plus, 
  Settings as SettingsIcon,
  Archive
} from 'lucide-react';
import { NavigationItem } from './NavigationItem';
import { NotebooksTree } from './NotebooksTree';
import { TagsList } from './TagsList';
import { useNotebooksStore } from '../../stores/notebooks.store';
import { useNotesStore } from '../../stores/notes.store';
import { useTagsStore } from '../../stores/tags.store';
import { useUIStore } from '../../stores/ui.store';

export const Sidebar: React.FC = () => {
  const { specialView, selectSpecialView } = useNotebooksStore();
  const { notes, loadNotes } = useNotesStore();
  const { selectedTagId, selectTag } = useTagsStore();
  const { openNotebookModal, openTagModal, openSettings } = useUIStore();

  const handleAllNotes = () => {
    selectTag(null);
    selectSpecialView('all');
    loadNotes();
  };

  const handleFavorites = () => {
    selectTag(null);
    selectSpecialView('favorites');
    loadNotes();
  };

  const handleTrash = () => {
    selectTag(null);
    selectSpecialView('trash');
    loadNotes();
  };

  const isAllActive = specialView === 'all' && selectedTagId === null;
  const isFavoritesActive = specialView === 'favorites' && selectedTagId === null;
  const isTrashActive = specialView === 'trash' && selectedTagId === null;

  return (
    <aside className="h-full flex flex-col bg-sidebar-light dark:bg-sidebar-dark border-r border-sidebar-borderLight dark:border-sidebar-borderDark select-none overflow-hidden flex-shrink-0">
      {/* Top Core Navigation */}
      <div className="p-2 space-y-0.5 border-b border-sidebar-borderLight dark:border-sidebar-borderDark">
        <NavigationItem
          icon={<FileText size={15} />}
          label="All Notes"
          isActive={isAllActive}
          onClick={handleAllNotes}
          accentColor="text-blue-500"
        />
        <NavigationItem
          icon={<Star size={15} />}
          label="Favorites"
          isActive={isFavoritesActive}
          onClick={handleFavorites}
          accentColor="text-amber-500"
        />
        <NavigationItem
          icon={<Trash2 size={15} />}
          label="Trash"
          isActive={isTrashActive}
          onClick={handleTrash}
          accentColor="text-rose-500"
        />
      </div>

      {/* Scrollable Sections: Notebooks & Tags */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-5">
        {/* Notebooks Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <span>Notebooks</span>
            <button
              onClick={() => openNotebookModal(null)}
              className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              title="Add Notebook (Ctrl+Shift+N)"
            >
              <Plus size={13} />
            </button>
          </div>
          <NotebooksTree />
        </div>

        {/* Tags Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <span>Tags</span>
            <button
              onClick={() => openTagModal(null)}
              className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              title="Add Tag"
            >
              <Plus size={13} />
            </button>
          </div>
          <TagsList />
        </div>
      </div>

      {/* Bottom Settings Link */}
      <div className="p-2 border-t border-sidebar-borderLight dark:border-sidebar-borderDark">
        <button
          onClick={openSettings}
          className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-sidebar-hoverLight dark:hover:bg-sidebar-hoverDark hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          <SettingsIcon size={14} />
          <span>Preferences</span>
        </button>
      </div>
    </aside>
  );
};
