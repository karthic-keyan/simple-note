import React from 'react';
import { 
  Minus, 
  Square, 
  X, 
  BookOpen, 
  Check, 
  Loader2, 
  AlertCircle, 
  Settings, 
  Download,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import appLogo from '../../assets/icon.png';
import { useNotesStore } from '../../stores/notes.store';
import { useUIStore } from '../../stores/ui.store';

export const TitleBar: React.FC = () => {
  const [iconFailed, setIconFailed] = React.useState(false);
  const { saveStatus, saveError } = useNotesStore();
  const { 
    sidebarOpen, 
    toggleSidebar, 
    openSettings, 
    openBackupModal 
  } = useUIStore();

  const handleMinimize = () => window.electronAPI.minimizeWindow();
  const handleMaximize = () => window.electronAPI.maximizeWindow();
  const handleClose = () => window.electronAPI.closeWindow();

  return (
    <header 
      onDoubleClick={handleMaximize}
      className="h-9 w-full bg-sidebar-light dark:bg-sidebar-dark border-b border-sidebar-borderLight dark:border-sidebar-borderDark flex items-center justify-between select-none drag-region px-2 z-50 flex-shrink-0"
    >
      {/* Left side: App Logo & Sidebar Toggle */}
      <div className="flex items-center space-x-2 no-drag-region">
        <button
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-sidebar-hoverLight dark:hover:bg-sidebar-hoverDark text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          title={sidebarOpen ? "Hide sidebar (Ctrl+\\)" : "Show sidebar (Ctrl+\\)"}
        >
          {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        </button>

        <div className="flex items-center space-x-1.5 px-1.5 py-0.5 rounded font-semibold text-xs tracking-wide text-slate-800 dark:text-slate-200">
          {!iconFailed ? (
            <img 
              src={appLogo} 
              alt="Simple Note" 
              className="w-4 h-4 object-contain filter drop-shadow-sm" 
              onError={() => setIconFailed(true)}
            />
          ) : (
            <div className="w-4 h-4 rounded-sm bg-blue-600 flex items-center justify-center text-white">
              <BookOpen size={11} />
            </div>
          )}
          <span>Simple Note</span>
        </div>
      </div>

      {/* Middle: Save Status Indicator */}
      <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
        {saveStatus === 'saving' && (
          <span className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 animate-pulse">
            <Loader2 size={13} className="animate-spin" />
            <span>Saving...</span>
          </span>
        )}
        {saveStatus === 'saved' && (
          <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
            <Check size={13} />
            <span>All changes saved</span>
          </span>
        )}
        {saveStatus === 'error' && (
          <span className="flex items-center space-x-1 text-red-500" title={saveError || 'Save failed'}>
            <AlertCircle size={13} />
            <span>Save error</span>
          </span>
        )}
      </div>

      {/* Right side: Quick Action Buttons & Windows Window Controls */}
      <div className="flex items-center space-x-1 no-drag-region">
        <button
          onClick={openBackupModal}
          className="p-1.5 rounded hover:bg-sidebar-hoverLight dark:hover:bg-sidebar-hoverDark text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors mr-0.5"
          title="Backup & Restore"
        >
          <Download size={14} />
        </button>
        <button
          onClick={openSettings}
          className="p-1.5 rounded hover:bg-sidebar-hoverLight dark:hover:bg-sidebar-hoverDark text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors mr-1"
          title="Settings (Ctrl+,)"
        >
          <Settings size={14} />
        </button>

        {/* Windows Standard Window Controls */}
        <div className="flex items-center">
          <button
            onClick={handleMinimize}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 transition-colors"
            title="Minimize"
          >
            <Minus size={13} />
          </button>
          <button
            onClick={handleMaximize}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 transition-colors"
            title="Maximize"
          >
            <Square size={11} />
          </button>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-red-600 hover:text-white text-slate-600 dark:text-slate-300 transition-colors"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </header>
  );
};
