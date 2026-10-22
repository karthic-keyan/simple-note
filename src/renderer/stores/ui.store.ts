import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface UIState {
  sidebarOpen: boolean;
  isSettingsOpen: boolean;
  isBackupModalOpen: boolean;
  isNotebookModalOpen: boolean;
  notebookModalTargetId: string | null; // null for new root notebook, or parent notebook id
  isTagModalOpen: boolean;
  tagModalTargetId: string | null;
  isMoveModalOpen: boolean;
  moveNoteTargetId: string | null;
  isDeleteModalOpen: boolean;
  deleteTarget: { type: 'note' | 'notebook' | 'tag'; id: string; name?: string } | null;

  toasts: ToastMessage[];

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openSettings: () => void;
  closeSettings: () => void;
  openBackupModal: () => void;
  closeBackupModal: () => void;
  openNotebookModal: (parentId?: string | null) => void;
  closeNotebookModal: () => void;
  openTagModal: (tagId?: string | null) => void;
  closeTagModal: () => void;
  openMoveModal: (noteId: string) => void;
  closeMoveModal: () => void;
  openDeleteModal: (type: 'note' | 'notebook' | 'tag', id: string, name?: string) => void;
  closeDeleteModal: () => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  isSettingsOpen: false,
  isBackupModalOpen: false,
  isNotebookModalOpen: false,
  notebookModalTargetId: null,
  isTagModalOpen: false,
  tagModalTargetId: null,
  isMoveModalOpen: false,
  moveNoteTargetId: null,
  isDeleteModalOpen: false,
  deleteTarget: null,
  toasts: [],

  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
  openBackupModal: () => set({ isBackupModalOpen: true }),
  closeBackupModal: () => set({ isBackupModalOpen: false }),
  openNotebookModal: (parentId = null) => set({ isNotebookModalOpen: true, notebookModalTargetId: parentId }),
  closeNotebookModal: () => set({ isNotebookModalOpen: false, notebookModalTargetId: null }),
  openTagModal: (tagId = null) => set({ isTagModalOpen: true, tagModalTargetId: tagId }),
  closeTagModal: () => set({ isTagModalOpen: false, tagModalTargetId: null }),
  openMoveModal: (noteId) => set({ isMoveModalOpen: true, moveNoteTargetId: noteId }),
  closeMoveModal: () => set({ isMoveModalOpen: false, moveNoteTargetId: null }),
  openDeleteModal: (type, id, name) => set({ isDeleteModalOpen: true, deleteTarget: { type, id, name } }),
  closeDeleteModal: () => set({ isDeleteModalOpen: false, deleteTarget: null }),

  addToast: (type, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    set(state => ({ toasts: [...state.toasts, { id, type, message }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },

  removeToast: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },
}));
