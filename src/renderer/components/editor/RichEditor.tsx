import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

import { useNotesStore } from '../../stores/notes.store';
import { useSettingsStore } from '../../stores/settings.store';
import { EditorToolbar } from './EditorToolbar';
import { EditorHeader } from './EditorHeader';
import { NoteTagSelector } from './NoteTagSelector';
import { WordCounter } from './WordCounter';
import { FileText, Plus, AlertTriangle } from 'lucide-react';

export const RichEditor: React.FC = () => {
  const { activeNote, queueSave, createNote, restoreNote } = useNotesStore();
  const { settings } = useSettingsStore();
  const isUpdatingContentRef = useRef(false);
  const activeNoteIdRef = useRef<string | null>(null);

  const isTrash = activeNote?.deleted_at !== null;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 dark:text-blue-400 underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: 'Write your thoughts here...',
      }),
    ],
    editable: !isTrash,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-6 py-4',
      },
    },
    onUpdate: ({ editor }) => {
      if (isUpdatingContentRef.current) return;
      if (!activeNote) return;

      const content_json = JSON.stringify(editor.getJSON());
      const content_text = editor.getText();

      queueSave({ content_json, content_text });
    },
  });

  // Keep editable state synced with trash status
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isTrash);
    }
  }, [editor, isTrash]);

  // When activeNote changes, load content into editor
  useEffect(() => {
    if (!editor || !activeNote) return;

    if (activeNoteIdRef.current !== activeNote.id) {
      activeNoteIdRef.current = activeNote.id;
      isUpdatingContentRef.current = true;

      try {
        const parsedJson = JSON.parse(activeNote.content_json);
        editor.commands.setContent(parsedJson);
      } catch (err) {
        // Fallback to text content
        editor.commands.setContent(activeNote.content_text || '');
      }

      setTimeout(() => {
        isUpdatingContentRef.current = false;
      }, 50);
    }
  }, [editor, activeNote]);

  // Compute font size class based on user preferences
  const getFontSizeClass = () => {
    switch (settings.editor_font_size) {
      case 'small':
        return 'text-xs';
      case 'large':
        return 'text-base';
      case 'xlarge':
        return 'text-lg';
      case 'medium':
      default:
        return 'text-sm';
    }
  };

  if (!activeNote) {
    return (
      <main className="flex-1 h-full flex flex-col items-center justify-center bg-white dark:bg-editor-dark text-slate-400 dark:text-slate-500 select-none">
        <div className="flex flex-col items-center space-y-3 max-w-sm text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <FileText size={32} />
          </div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No note selected
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Choose a note from the list or create a fresh one to start capturing your ideas.
          </p>
          <button
            onClick={() => createNote()}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-subtle transition-colors"
          >
            <Plus size={14} />
            <span>Create New Note</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 h-full flex flex-col bg-white dark:bg-editor-dark select-text overflow-hidden">
      {/* Breadcrumb Header */}
      <EditorHeader note={activeNote} />

      {/* Formatting Toolbar (Only when active & not in trash) */}
      {!isTrash && <EditorToolbar editor={editor} />}

      {/* Trash Warning Banner if Note is in Trash */}
      {isTrash && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/60 px-6 py-2 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300 select-none">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={14} />
            <span>This note is in the Trash. Edits are disabled until it is restored.</span>
          </div>
          <button
            onClick={() => restoreNote(activeNote.id)}
            className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors"
          >
            Restore Note
          </button>
        </div>
      )}

      {/* Note Tags Row */}
      <NoteTagSelector note={activeNote} />

      {/* Scrollable Note Body */}
      <div className="flex-1 overflow-y-auto">
        {/* Title Input */}
        <div className="px-6 pt-4 pb-2">
          <input
            type="text"
            value={activeNote.title}
            onChange={(e) => queueSave({ title: e.target.value })}
            placeholder="Note Title..."
            disabled={isTrash}
            className="w-full bg-transparent text-2xl font-bold text-slate-900 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600 outline-none border-none tracking-tight"
          />
        </div>

        {/* Tiptap Editor Content */}
        <div className={getFontSizeClass()}>
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Bottom Word & Character Counter */}
      <WordCounter text={activeNote.content_text || ''} />
    </main>
  );
};
