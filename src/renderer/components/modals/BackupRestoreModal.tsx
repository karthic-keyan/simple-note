import React, { useState } from 'react';
import { X, Download, Upload, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { useUIStore } from '../../stores/ui.store';
import { useNotesStore } from '../../stores/notes.store';
import { useNotebooksStore } from '../../stores/notebooks.store';
import { useTagsStore } from '../../stores/tags.store';
import { useSettingsStore } from '../../stores/settings.store';

export const BackupRestoreModal: React.FC = () => {
  const { isBackupModalOpen, closeBackupModal, addToast } = useUIStore();
  const { loadNotes } = useNotesStore();
  const { loadNotebooks } = useNotebooksStore();
  const { loadTags } = useTagsStore();
  const { loadSettings } = useSettingsStore();

  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  if (!isBackupModalOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await window.electronAPI.exportBackup();
      if (result.success && result.filePath) {
        addToast('success', `Backup saved successfully to ${result.filePath}`);
      } else if (!result.cancelled) {
        addToast('error', result.error || 'Failed to export backup');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error exporting backup');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const result = await window.electronAPI.importBackup({ mode: importMode });
      if (result.success) {
        addToast('success', `Restored ${result.notesImported} notes, ${result.notebooksImported} notebooks, and ${result.tagsImported} tags`);
        // Refresh all application stores
        await Promise.all([
          loadNotebooks(),
          loadTags(),
          loadNotes(),
          loadSettings(),
        ]);
        closeBackupModal();
      } else if (!result.cancelled) {
        addToast('error', result.error || 'Failed to restore backup');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error restoring backup');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm select-none p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <ShieldCheck size={16} className="text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Backup & Restore
            </h3>
          </div>
          <button
            onClick={closeBackupModal}
            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {/* Export Section */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center space-x-1.5">
                  <Download size={14} className="text-blue-500" />
                  <span>Export Notes & Settings</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Export all your notes, notebook structures, tags, and preferences into a structured, validated JSON file.
                </p>
              </div>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="ml-4 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-xs flex items-center space-x-1.5 flex-shrink-0 transition-colors"
              >
                {isExporting ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />}
                <span>Export Now</span>
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-800/40">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center space-x-1.5 mb-1">
              <Upload size={14} className="text-emerald-500" />
              <span>Import & Restore</span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              Restore notes from a previously exported Simple Note JSON backup. The file will be thoroughly verified before importing.
            </p>

            {/* Mode selection */}
            <div className="space-y-2 mb-4 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="merge"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="mt-0.5 text-blue-600"
                />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                    Merge with existing notes
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Retains current notes and adds or updates items from the backup.
                  </span>
                </div>
              </label>

              <label className="flex items-start space-x-2 cursor-pointer pt-1 border-t border-slate-100 dark:border-slate-800">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="mt-0.5 text-rose-600"
                />
                <div>
                  <span className="font-semibold text-rose-600 dark:text-rose-400 block">
                    Replace all local notes
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Replaces current database with the exact contents of the backup.
                  </span>
                </div>
              </label>
            </div>

            <button
              onClick={handleImport}
              disabled={isImporting}
              className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors"
            >
              {isImporting ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} />}
              <span>Select File & Restore</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-800/20">
          <button
            onClick={closeBackupModal}
            className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
