import React, { useState, useEffect } from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { NotesList } from '../notes-list/NotesList';
import { RichEditor } from '../editor/RichEditor';
import { Resizer } from './Resizer';
import { useSettingsStore } from '../../stores/settings.store';
import { useUIStore } from '../../stores/ui.store';

export const ThreePaneLayout: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const { sidebarOpen } = useUIStore();

  const [sidebarWidth, setSidebarWidth] = useState(settings.sidebar_width || 240);
  const [notesListWidth, setNotesListWidth] = useState(settings.notes_list_width || 320);

  useEffect(() => {
    if (settings.sidebar_width) setSidebarWidth(settings.sidebar_width);
    if (settings.notes_list_width) setNotesListWidth(settings.notes_list_width);
  }, [settings.sidebar_width, settings.notes_list_width]);

  return (
    <div className="flex-1 flex w-full h-[calc(100vh-36px)] overflow-hidden">
      {/* Pane 1: Navigation Sidebar */}
      {sidebarOpen && (
        <>
          <div style={{ width: `${sidebarWidth}px` }} className="h-full flex-shrink-0">
            <Sidebar />
          </div>
          <Resizer
            currentWidth={sidebarWidth}
            minWidth={180}
            maxWidth={400}
            defaultWidth={240}
            direction="right"
            onResize={setSidebarWidth}
            onResizeEnd={(finalWidth) => updateSettings({ sidebar_width: finalWidth })}
          />
        </>
      )}

      {/* Pane 2: Notes List */}
      <div style={{ width: `${notesListWidth}px` }} className="h-full flex-shrink-0">
        <NotesList />
      </div>
      <Resizer
        currentWidth={notesListWidth}
        minWidth={220}
        maxWidth={550}
        defaultWidth={320}
        direction="right"
        onResize={setNotesListWidth}
        onResizeEnd={(finalWidth) => updateSettings({ notes_list_width: finalWidth })}
      />

      {/* Pane 3: Rich-Text Editor */}
      <div className="flex-1 h-full min-w-[320px]">
        <RichEditor />
      </div>
    </div>
  );
};
