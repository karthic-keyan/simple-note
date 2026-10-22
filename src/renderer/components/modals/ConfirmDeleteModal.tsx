import React, { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { useUIStore } from '../../stores/ui.store';
import { useNotebooksStore } from '../../stores/notebooks.store';
import { useNotesStore } from '../../stores/notes.store';
import { useTagsStore } from '../../stores/tags.store';

export const ConfirmDeleteModal: React.FC = () => {
  const { isDeleteModalOpen, deleteTarget, closeDeleteModal, addToast } = useUIStore();
  const { deleteNotebook, notebooks } = useNotebooksStore();
  const { deletePermanent } = useNotesStore();
  const { deleteTag } = useTagsStore();

  const [notebookStrategy, setNotebookStrategy] = useState<'move_notes_to_trash' | 'move_notes_to_parent' | 'keep_notes_unassigned'>('keep_notes_unassigned');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isDeleteModalOpen || !deleteTarget) return null;

  const currentNotebook = deleteTarget.type === 'notebook' ? notebooks.find(n => n.id === deleteTarget.id) : null;
  const hasParent = Boolean(currentNotebook?.parent_id);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'note') {
        await deletePermanent(deleteTarget.id);
        addToast('success', 'Note permanently deleted');
      } else if (deleteTarget.type === 'notebook') {
        await deleteNotebook({
          id: deleteTarget.id,
          strategy: notebookStrategy,
        });
        addToast('success', `Notebook "${deleteTarget.name}" deleted`);
      } else if (deleteTarget.type === 'tag') {
        await deleteTag(deleteTarget.id);
        addToast('success', `Tag #${deleteTarget.name} deleted`);
      }
      closeDeleteModal();
    } catch {
      addToast('error', 'Failed to complete deletion');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm select-none p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle size={16} />
            <h3 className="text-sm font-bold">
              {deleteTarget.type === 'note' && 'Delete Note Permanently'}
              {deleteTarget.type === 'notebook' && 'Delete Notebook'}
              {deleteTarget.type === 'tag' && 'Delete Tag'}
            </h3>
          </div>
          <button
            onClick={closeDeleteModal}
            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-700 dark:text-slate-300">
          {deleteTarget.type === 'note' && (
            <p className="leading-relaxed">
              Are you sure you want to permanently delete this note? This action cannot be reversed.
            </p>
          )}

          {deleteTarget.type === 'tag' && (
            <p className="leading-relaxed">
              Are you sure you want to delete tag <span className="font-semibold text-slate-900 dark:text-white">#{deleteTarget.name}</span>? Notes containing this tag will remain intact.
            </p>
          )}

          {deleteTarget.type === 'notebook' && (
            <div className="space-y-3">
              <p className="leading-relaxed">
                Choose what to do with notes currently inside <span className="font-semibold text-slate-900 dark:text-white">"{deleteTarget.name}"</span>:
              </p>

              <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <label className="flex items-start space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="strategy"
                    value="keep_notes_unassigned"
                    checked={notebookStrategy === 'keep_notes_unassigned'}
                    onChange={() => setNotebookStrategy('keep_notes_unassigned')}
                    className="mt-0.5 text-blue-600"
                  />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                      Keep notes (Uncategorized)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Notes will stay in "All Notes" without an assigned notebook.
                    </span>
                  </div>
                </label>

                {hasParent && (
                  <label className="flex items-start space-x-2 cursor-pointer pt-2 border-t border-slate-200 dark:border-slate-700">
                    <input
                      type="radio"
                      name="strategy"
                      value="move_notes_to_parent"
                      checked={notebookStrategy === 'move_notes_to_parent'}
                      onChange={() => setNotebookStrategy('move_notes_to_parent')}
                      className="mt-0.5 text-blue-600"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                        Move notes to parent notebook
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Notes will move directly to the containing parent notebook.
                      </span>
                    </div>
                  </label>
                )}

                <label className="flex items-start space-x-2 cursor-pointer pt-2 border-t border-slate-200 dark:border-slate-700">
                  <input
                    type="radio"
                    name="strategy"
                    value="move_notes_to_trash"
                    checked={notebookStrategy === 'move_notes_to_trash'}
                    onChange={() => setNotebookStrategy('move_notes_to_trash')}
                    className="mt-0.5 text-rose-600"
                  />
                  <div>
                    <span className="font-semibold text-rose-600 dark:text-rose-400 block">
                      Move all notes inside to Trash
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      All notes in this notebook will be sent to the Trash.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={closeDeleteModal}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-medium transition-colors flex items-center space-x-1.5"
            >
              <Trash2 size={13} />
              <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
