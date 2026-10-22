import React from 'react';
import { X, Folder, FolderInput, Check } from 'lucide-react';
import { useNotebooksStore } from '../../stores/notebooks.store';
import { useNotesStore } from '../../stores/notes.store';
import { useUIStore } from '../../stores/ui.store';

export const MoveNoteModal: React.FC = () => {
  const { isMoveModalOpen, moveNoteTargetId, closeMoveModal, addToast } = useUIStore();
  const { notebooks } = useNotebooksStore();
  const { notes, moveToNotebook } = useNotesStore();

  const targetNote = notes.find(n => n.id === moveNoteTargetId);
  const currentNotebookId = targetNote?.notebook_id || null;

  if (!isMoveModalOpen || !targetNote) return null;

  const handleSelect = async (nbId: string | null) => {
    try {
      await moveToNotebook(targetNote.id, nbId);
      const nbName = nbId ? notebooks.find(n => n.id === nbId)?.name : 'Uncategorized';
      addToast('success', `Moved note to "${nbName}"`);
      closeMoveModal();
    } catch {
      addToast('error', 'Failed to move note');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm select-none p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <FolderInput size={16} className="text-blue-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              Move Note
            </h3>
          </div>
          <button
            onClick={closeMoveModal}
            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Notebooks List */}
        <div className="p-3 max-h-72 overflow-y-auto space-y-1 text-xs">
          {/* Uncategorized Option */}
          <button
            onClick={() => handleSelect(null)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
              currentNotebookId === null
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Folder size={14} className="text-slate-400" />
              <span>Uncategorized</span>
            </div>
            {currentNotebookId === null && <Check size={14} className="text-blue-500" />}
          </button>

          {notebooks.map(nb => (
            <button
              key={nb.id}
              onClick={() => handleSelect(nb.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                currentNotebookId === nb.id
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <Folder size={14} className="text-amber-500 flex-shrink-0" />
                <span className="truncate">{nb.name}</span>
              </div>
              {currentNotebookId === nb.id && <Check size={14} className="text-blue-500" />}
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-800/20">
          <button
            onClick={closeMoveModal}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
