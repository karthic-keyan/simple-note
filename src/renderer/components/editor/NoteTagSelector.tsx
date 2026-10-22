import React, { useState } from 'react';
import { Tag as TagIcon, Plus, X, Check } from 'lucide-react';
import { Note } from '../../../shared/types/note';
import { useTagsStore } from '../../stores/tags.store';
import { useNotesStore } from '../../stores/notes.store';
import { useUIStore } from '../../stores/ui.store';

interface NoteTagSelectorProps {
  note: Note;
}

export const NoteTagSelector: React.FC<NoteTagSelectorProps> = ({ note }) => {
  const { tags } = useTagsStore();
  const { assignTag, removeTag } = useNotesStore();
  const { openTagModal } = useUIStore();
  const [isOpen, setIsOpen] = useState(false);

  const assignedTagIds = note.tags || [];
  const assignedTags = assignedTagIds.map((id: string) => tags.find(t => t.id === id)).filter(Boolean);
  const unassignedTags = tags.filter(t => !assignedTagIds.includes(t.id));

  return (
    <div className="flex items-center flex-wrap gap-1.5 px-6 pt-3 select-none">
      {assignedTags.map((tag: any) => tag && (
        <span
          key={tag.id}
          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
          style={{
            backgroundColor: `${tag.color}20`,
            color: tag.color,
          }}
        >
          <span>#{tag.name}</span>
          <button
            onClick={() => removeTag(note.id, tag.id)}
            className="hover:opacity-75 transition-opacity"
            title={`Remove #${tag.name}`}
          >
            <X size={11} />
          </button>
        </span>
      ))}

      {/* Add Tag Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-[11px] transition-colors"
        >
          <Plus size={11} />
          <span>Add Tag</span>
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
            <div className="absolute left-0 top-7 z-40 w-44 bg-white dark:bg-slate-800 rounded-lg shadow-dropdown border border-slate-200 dark:border-slate-700 py-1 text-xs">
              <div className="px-3 py-1 font-semibold text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Select Tag
              </div>

              <div className="max-h-40 overflow-y-auto">
                {unassignedTags.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      assignTag(note.id, t.id);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-left"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: t.color }}
                    />
                    <span className="truncate">#{t.name}</span>
                  </button>
                ))}

                {unassignedTags.length === 0 && (
                  <div className="px-3 py-1.5 text-slate-400 text-[11px] italic">
                    No more tags
                  </div>
                )}
              </div>

              <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
              <button
                onClick={() => {
                  setIsOpen(false);
                  openTagModal(null);
                }}
                className="w-full flex items-center space-x-1.5 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 font-medium"
              >
                <Plus size={12} />
                <span>Create New Tag</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
