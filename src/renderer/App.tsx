import React, { useEffect } from 'react';
import { TitleBar } from './components/layout/TitleBar';
import { ThreePaneLayout } from './components/layout/ThreePaneLayout';
import { ToastContainer } from './components/layout/Toast';
import { SettingsModal } from './components/modals/SettingsModal';
import { NotebookModal } from './components/modals/NotebookModal';
import { TagModal } from './components/modals/TagModal';
import { MoveNoteModal } from './components/modals/MoveNoteModal';
import { BackupRestoreModal } from './components/modals/BackupRestoreModal';
import { ConfirmDeleteModal } from './components/modals/ConfirmDeleteModal';

import { useSettingsStore } from './stores/settings.store';
import { useNotebooksStore } from './stores/notebooks.store';
import { useTagsStore } from './stores/tags.store';
import { useNotesStore } from './stores/notes.store';
import { useUIStore } from './stores/ui.store';

export const App: React.FC = () => {
  const { loadSettings } = useSettingsStore();
  const { loadNotebooks } = useNotebooksStore();
  const { loadTags } = useTagsStore();
  const { loadNotes, createNote, flushPendingSave, togglePin, toggleFavorite, activeNote } = useNotesStore();
  const { toggleSidebar, openSettings, openNotebookModal } = useUIStore();

  // Load initial data on mount
  useEffect(() => {
    async function initApp() {
      await loadSettings();
      await Promise.all([
        loadNotebooks(),
        loadTags(),
      ]);
      await loadNotes();
    }
    initApp();
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + N: New Note
      if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        createNote();
        return;
      }

      // Ctrl + Shift + N: New Notebook
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        openNotebookModal(null);
        return;
      }

      // Ctrl + \: Toggle Sidebar
      if (e.ctrlKey && e.key === '\\') {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // Ctrl + ,: Open Settings
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        openSettings();
        return;
      }

      // Ctrl + S: Force Immediate Save
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        flushPendingSave();
        return;
      }

      // Ctrl + Shift + P: Toggle Pin
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'p') {
        if (activeNote) {
          e.preventDefault();
          togglePin(activeNote.id);
        }
        return;
      }

      // Ctrl + Shift + F: Toggle Favorite
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'f') {
        if (activeNote) {
          e.preventDefault();
          toggleFavorite(activeNote.id);
        }
        return;
      }

      // Ctrl + F: Focus Search
      if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'f') {
        const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="Search in notes"]');
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
          searchInput.select();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeNote, createNote, flushPendingSave, togglePin, toggleFavorite, toggleSidebar, openSettings, openNotebookModal]);

  return (
    <div className="flex flex-col h-screen w-screen bg-white dark:bg-editor-dark text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Title Bar */}
      <TitleBar />

      {/* Main 3-Pane Body */}
      <ThreePaneLayout />

      {/* Modals & Dialogs */}
      <SettingsModal />
      <NotebookModal />
      <TagModal />
      <MoveNoteModal />
      <BackupRestoreModal />
      <ConfirmDeleteModal />

      {/* Floating Toasts */}
      <ToastContainer />
    </div>
  );
};
