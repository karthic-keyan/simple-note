import { create } from 'zustand';
import { Tag, CreateTagInput, UpdateTagInput } from '../../shared/types/tag';

interface TagsState {
  tags: Tag[];
  selectedTagId: string | null;
  isLoading: boolean;
  loadTags: () => Promise<void>;
  createTag: (input: CreateTagInput) => Promise<Tag | null>;
  updateTag: (input: UpdateTagInput) => Promise<Tag | null>;
  deleteTag: (id: string) => Promise<void>;
  selectTag: (id: string | null) => void;
}

export const useTagsStore = create<TagsState>((set, get) => ({
  tags: [],
  selectedTagId: null,
  isLoading: false,

  loadTags: async () => {
    set({ isLoading: true });
    try {
      const tags = await window.electronAPI.getTags();
      set({ tags, isLoading: false });
    } catch (err) {
      console.error('Failed to load tags:', err);
      set({ isLoading: false });
    }
  },

  createTag: async (input) => {
    try {
      const newTag = await window.electronAPI.createTag(input);
      await get().loadTags();
      return newTag;
    } catch (err) {
      console.error('Failed to create tag:', err);
      return null;
    }
  },

  updateTag: async (input) => {
    try {
      const updated = await window.electronAPI.updateTag(input);
      await get().loadTags();
      return updated;
    } catch (err) {
      console.error('Failed to update tag:', err);
      return null;
    }
  },

  deleteTag: async (id) => {
    try {
      await window.electronAPI.deleteTag(id);
      if (get().selectedTagId === id) {
        set({ selectedTagId: null });
      }
      await get().loadTags();
    } catch (err) {
      console.error('Failed to delete tag:', err);
    }
  },

  selectTag: (id) => {
    set({ selectedTagId: id });
  },
}));
