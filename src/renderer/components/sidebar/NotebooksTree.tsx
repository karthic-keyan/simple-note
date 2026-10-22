import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderPlus, 
  MoreHorizontal, 
  Pencil, 
  Trash2,
  FolderOpen
} from 'lucide-react';
import { Notebook } from '../../../shared/types/notebook';
import { useNotebooksStore } from '../../stores/notebooks.store';
import { useNotesStore } from '../../stores/notes.store';
import { useTagsStore } from '../../stores/tags.store';
import { useUIStore } from '../../stores/ui.store';

interface NotebookNodeProps {
  notebook: Notebook;
  childrenByParent: Map<string | null, Notebook[]>;
  level?: number;
}

const NotebookNodeComponent: React.FC<NotebookNodeProps> = ({ notebook, childrenByParent, level = 0 }) => {
  const selectedNotebookId = useNotebooksStore(state => state.selectedNotebookId);
  const specialView = useNotebooksStore(state => state.specialView);
  const selectNotebook = useNotebooksStore(state => state.selectNotebook);
  const isExpanded = useNotebooksStore(state => state.expandedNotebookIds.includes(notebook.id));
  const toggleExpandNotebook = useNotebooksStore(state => state.toggleExpandNotebook);

  const loadNotes = useNotesStore.getState().loadNotes;
  const openNotebookModal = useUIStore.getState().openNotebookModal;
  const openDeleteModal = useUIStore.getState().openDeleteModal;
  const [menuOpen, setMenuOpen] = useState(false);

  const children = childrenByParent.get(notebook.id) || [];
  const hasChildren = children.length > 0;
  const isSelected = selectedNotebookId === notebook.id && specialView === null;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    useTagsStore.getState().selectTag(null);
    selectNotebook(notebook.id);
    loadNotes();
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleExpandNotebook(notebook.id);
  };

  return (
    <div className="select-none">
      <div
        onClick={handleSelect}
        style={{ paddingLeft: `${12 + level * 14}px` }}
        className={`group relative flex items-center justify-between pr-2 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
          isSelected
            ? 'bg-sidebar-activeLight dark:bg-sidebar-activeDark text-slate-900 dark:text-white font-semibold'
            : 'text-slate-600 dark:text-slate-400 hover:bg-sidebar-hoverLight dark:hover:bg-sidebar-hoverDark hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <div className="flex items-center space-x-1.5 truncate flex-1 min-w-0">
          {hasChildren ? (
            <button
              onClick={handleToggleExpand}
              className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
          ) : (
            <span className="w-3" />
          )}

          {isSelected || isExpanded ? (
            <FolderOpen size={14} className="text-amber-500 flex-shrink-0" />
          ) : (
            <Folder size={14} className="text-amber-500/80 flex-shrink-0" />
          )}

          <span className="truncate">{notebook.name}</span>
        </div>

        <div className="flex items-center space-x-1 flex-shrink-0">
          {notebook.note_count !== undefined && notebook.note_count > 0 && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500 group-hover:hidden">
              {notebook.note_count}
            </span>
          )}

          {/* Action Menu Button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-opacity"
              title="Notebook options"
            >
              <MoreHorizontal size={13} />
            </button>

            {menuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                  }} 
                />
                <div 
                  className="absolute right-0 top-6 z-40 w-44 bg-white dark:bg-slate-800 rounded-lg shadow-dropdown border border-slate-200 dark:border-slate-700 py-1 text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      openNotebookModal(notebook.id);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  >
                    <FolderPlus size={13} />
                    <span>Add Sub-notebook</span>
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      openNotebookModal(notebook.id); // Triggers edit if implemented or open edit dialog
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  >
                    <Pencil size={13} />
                    <span>Rename</span>
                  </button>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      openDeleteModal('notebook', notebook.id, notebook.name);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400"
                  >
                    <Trash2 size={13} />
                    <span>Delete Notebook</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Render Nested Children */}
      {hasChildren && isExpanded && (
        <div className="space-y-0.5">
          {children.map(child => (
            <NotebookNode
              key={child.id}
              notebook={child}
              childrenByParent={childrenByParent}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const NotebookNode = React.memo(NotebookNodeComponent);

export const NotebooksTree: React.FC = () => {
  const notebooks = useNotebooksStore(state => state.notebooks);

  const childrenByParent = React.useMemo(() => {
    const map = new Map<string | null, Notebook[]>();
    for (const nb of notebooks) {
      const parent = nb.parent_id || null;
      const list = map.get(parent);
      if (list) {
        list.push(nb);
      } else {
        map.set(parent, [nb]);
      }
    }
    return map;
  }, [notebooks]);

  const rootNotebooks = childrenByParent.get(null) || [];

  if (notebooks.length === 0) {
    return (
      <div className="px-3 py-2 text-xs text-slate-400 dark:text-slate-500 italic">
        No notebooks yet
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {rootNotebooks.map(notebook => (
        <NotebookNode
          key={notebook.id}
          notebook={notebook}
          childrenByParent={childrenByParent}
          level={0}
        />
      ))}
    </div>
  );
};
