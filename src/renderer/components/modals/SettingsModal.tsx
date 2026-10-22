import React from 'react';
import { X, Sun, Moon, Laptop, Keyboard, Sliders, HardDrive } from 'lucide-react';
import { useSettingsStore } from '../../stores/settings.store';
import { useUIStore } from '../../stores/ui.store';
import { EditorFontSize } from '../../../shared/types/settings';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, closeSettings } = useUIStore();
  const { settings, updateSettings, setTheme } = useSettingsStore();

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm select-none p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Sliders size={16} className="text-blue-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Preferences
            </h3>
          </div>
          <button
            onClick={closeSettings}
            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {/* Theme Option */}
          <div>
            <label className="font-semibold block mb-2 text-slate-800 dark:text-slate-200">
              Appearance & Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                  settings.theme === 'light'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Sun size={14} />
                <span>Light</span>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                  settings.theme === 'dark'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Moon size={14} />
                <span>Dark</span>
              </button>

              <button
                onClick={() => setTheme('system')}
                className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                  settings.theme === 'system'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Laptop size={14} />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* Editor Font Size */}
          <div>
            <label className="font-semibold block mb-2 text-slate-800 dark:text-slate-200">
              Editor Font Size
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['small', 'medium', 'large', 'xlarge'] as EditorFontSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => updateSettings({ editor_font_size: size })}
                  className={`py-1.5 px-3 rounded-lg border text-xs capitalize transition-all ${
                    settings.editor_font_size === size
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Offline & Storage Info */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-start space-x-3">
            <HardDrive size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                Offline-First SQLite Storage
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                All notes, notebooks, and attachments are saved 100% locally on your Windows device. No account or internet connection is required.
              </p>
            </div>
          </div>

          {/* Keyboard Shortcuts Reference */}
          <div>
            <div className="flex items-center space-x-1.5 font-semibold text-slate-800 dark:text-slate-200 mb-2">
              <Keyboard size={14} />
              <span>Keyboard Shortcuts</span>
            </div>
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50/50 dark:bg-slate-800/30">
                <span>New Note</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">Ctrl + N</kbd>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5">
                <span>Search Notes</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">Ctrl + F</kbd>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50/50 dark:bg-slate-800/30">
                <span>Toggle Sidebar</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">Ctrl + \</kbd>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5">
                <span>New Notebook</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">Ctrl + Shift + N</kbd>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50/50 dark:bg-slate-800/30">
                <span>Toggle Pin</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">Ctrl + Shift + P</kbd>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5">
                <span>Toggle Favorite</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">Ctrl + Shift + F</kbd>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50/50 dark:bg-slate-800/30">
                <span>Bold / Italic / Underline</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">Ctrl + B / I / U</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-800/20">
          <button
            onClick={closeSettings}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
