import { create } from 'zustand';
import { UserSettings, DEFAULT_SETTINGS, AppTheme } from '../../shared/types/settings';

interface SettingsState {
  settings: UserSettings;
  effectiveTheme: 'light' | 'dark';
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<UserSettings>) => Promise<void>;
  setTheme: (theme: AppTheme) => Promise<void>;
}

function computeEffectiveTheme(theme: AppTheme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

function applyThemeToDocument(effectiveTheme: 'light' | 'dark') {
  if (effectiveTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  effectiveTheme: 'dark',
  isLoading: true,

  loadSettings: async () => {
    try {
      const settings = await window.electronAPI.getSettings();
      const effectiveTheme = computeEffectiveTheme(settings.theme);
      applyThemeToDocument(effectiveTheme);
      set({ settings, effectiveTheme, isLoading: false });

      // Listen to OS theme changes if system theme selected
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (get().settings.theme === 'system') {
          const newEffective = computeEffectiveTheme('system');
          applyThemeToDocument(newEffective);
          set({ effectiveTheme: newEffective });
        }
      });
    } catch (err) {
      console.error('Failed to load settings:', err);
      set({ isLoading: false });
    }
  },

  updateSettings: async (partial) => {
    try {
      const updated = await window.electronAPI.updateSettings(partial);
      const effectiveTheme = computeEffectiveTheme(updated.theme);
      applyThemeToDocument(effectiveTheme);
      set({ settings: updated, effectiveTheme });
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  },

  setTheme: async (theme) => {
    await get().updateSettings({ theme });
  },
}));
