import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Quote, 
  Code, 
  FileCode, 
  Minus, 
  Link as LinkIcon, 
  Unlink, 
  Undo, 
  Redo 
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  const [isLinkPromptOpen, setIsLinkPromptOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  if (!editor) return null;

  const handleSetLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run();
      setIsLinkPromptOpen(false);
      return;
    }

    let formattedUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    editor.chain().focus().setLink({ href: formattedUrl }).run();
    setLinkUrl('');
    setIsLinkPromptOpen(false);
  };

  const openLinkModal = () => {
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setIsLinkPromptOpen(true);
  };

  return (
    <div className="flex items-center flex-wrap gap-0.5 px-3 py-1.5 border-b border-editor-borderLight dark:border-editor-borderDark bg-white dark:bg-editor-dark text-slate-700 dark:text-slate-300 flex-shrink-0 select-none relative">
      {/* Undo / Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        title="Undo (Ctrl+Z)"
      >
        <Undo size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        title="Redo (Ctrl+Y)"
      >
        <Redo size={14} />
      </button>

      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Headings */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('heading', { level: 1 })
            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Heading 1"
      >
        <Heading1 size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('heading', { level: 2 })
            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Heading 2"
      >
        <Heading2 size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('heading', { level: 3 })
            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Heading 3"
      >
        <Heading3 size={14} />
      </button>

      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Formatting Marks */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('bold')
            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Bold (Ctrl+B)"
      >
        <Bold size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('italic')
            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Italic (Ctrl+I)"
      >
        <Italic size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('underline')
            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('strike')
            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Strikethrough"
      >
        <Strikethrough size={14} />
      </button>

      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Lists & Tasks */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('bulletList')
            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Bullet List"
      >
        <List size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('orderedList')
            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Numbered List"
      >
        <ListOrdered size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('taskList')
            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Checklist / Task list"
      >
        <CheckSquare size={14} />
      </button>

      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Blockquote, Code & Dividers */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('blockquote')
            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Blockquote"
      >
        <Quote size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('code')
            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Inline Code"
      >
        <Code size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('codeBlock')
            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Code Block"
      >
        <FileCode size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Horizontal Divider"
      >
        <Minus size={14} />
      </button>

      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Hyperlink */}
      <button
        onClick={openLinkModal}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('link')
            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Add Link"
      >
        <LinkIcon size={14} />
      </button>
      {editor.isActive('link') && (
        <button
          onClick={() => editor.chain().focus().unsetLink().run()}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500 transition-colors"
          title="Remove Link"
        >
          <Unlink size={14} />
        </button>
      )}

      {/* Link prompt popover */}
      {isLinkPromptOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsLinkPromptOpen(false)} />
          <div className="absolute left-64 top-10 z-40 w-72 bg-white dark:bg-slate-800 p-2.5 rounded-lg shadow-dropdown border border-slate-200 dark:border-slate-700 text-xs">
            <div className="font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Insert Link
            </div>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSetLink();
                if (e.key === 'Escape') setIsLinkPromptOpen(false);
              }}
              autoFocus
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs outline-none focus:border-blue-500 mb-2"
            />
            <div className="flex justify-end space-x-1.5">
              <button
                onClick={() => setIsLinkPromptOpen(false)}
                className="px-2 py-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 text-[11px]"
              >
                Cancel
              </button>
              <button
                onClick={handleSetLink}
                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px]"
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
