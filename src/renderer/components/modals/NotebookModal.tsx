import React, { useState, useEffect } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { useNotebooksStore } from '../../stores/notebooks.store';
import { useUIStore } from '../../stores/ui.store';

export const NotebookModal: React.FC = () => {
  const { isNotebookModalOpen, notebookModalTargetId, closeNotebookModal, addToast } = useUIStore();
  const { notebooks, createNotebook } = useNotebooksStore();

  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isNotebookModalOpen) {
      setName('');
      setParentId(notebookModalTargetId);
    }
  }, [isNotebookModalOpen, notebookModalTargetId]);

  if (!isNotebookModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await createNotebook({
        name: name.trim(),
        parent_id: parentId,
      });

      if (created) {
        addToast('success', `Notebook "${name.trim()}" created`);
        closeNotebookModal();
      } else {
        addToast('error', 'Failed to create notebook');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm select-none p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <FolderPlus size={16} className="text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {parentId ? 'Create Sub-notebook' : 'New Notebook'}
            </h3>
          </div>
          <button
            onClick={closeNotebookModal}
            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-semibold block mb-1.5 text-slate-800 dark:text-slate-200">
              Notebook Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Work, Journal, Project Titan"
              autoFocus
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1.5 text-slate-800 dark:text-slate-200">
              Parent Notebook (Optional)
            </label>
            <select
              value={parentId || ''}
              onChange={(e) => setParentId(e.target.value || null)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
            >
              <option value="">None (Top-level Notebook)</option>
              {notebooks.map(nb => (
                <option key={nb.id} value={nb.id}>
                  {nb.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={closeNotebookModal}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-medium transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create Notebook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
