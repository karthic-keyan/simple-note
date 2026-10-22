import React, { useState, useEffect } from 'react';
import { X, Tag as TagIcon, Check } from 'lucide-react';
import { useTagsStore } from '../../stores/tags.store';
import { useUIStore } from '../../stores/ui.store';

const COLOR_PALETTE = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#6366f1', // Indigo
  '#64748b', // Slate
];

export const TagModal: React.FC = () => {
  const { isTagModalOpen, tagModalTargetId, closeTagModal, addToast } = useUIStore();
  const { tags, createTag, updateTag } = useTagsStore();

  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(tagModalTargetId);

  useEffect(() => {
    if (isTagModalOpen) {
      if (tagModalTargetId) {
        const target = tags.find(t => t.id === tagModalTargetId);
        if (target) {
          setName(target.name);
          setColor(target.color);
        }
      } else {
        setName('');
        setColor('#3b82f6');
      }
    }
  }, [isTagModalOpen, tagModalTargetId, tags]);

  if (!isTagModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim().replace(/^#+/, '');
    if (!cleanName) return;

    setIsSubmitting(true);
    try {
      if (isEditing && tagModalTargetId) {
        await updateTag({
          id: tagModalTargetId,
          name: cleanName,
          color,
        });
        addToast('success', `Tag #${cleanName} updated`);
      } else {
        await createTag({
          name: cleanName,
          color,
        });
        addToast('success', `Tag #${cleanName} created`);
      }
      closeTagModal();
    } catch {
      addToast('error', 'Failed to save tag');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm select-none p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <TagIcon size={16} className="text-blue-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isEditing ? 'Edit Tag' : 'New Tag'}
            </h3>
          </div>
          <button
            onClick={closeTagModal}
            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-semibold block mb-1.5 text-slate-800 dark:text-slate-200">
              Tag Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                #
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="idea, urgent, reading"
                autoFocus
                className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1.5 text-slate-800 dark:text-slate-200">
              Tag Color
            </label>
            <div className="flex items-center flex-wrap gap-2">
              {COLOR_PALETTE.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative"
                >
                  {color === c && <Check size={12} className="text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="pt-1">
            <label className="font-semibold block mb-1 text-slate-500 text-[11px]">
              Preview
            </label>
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: `${color}25`,
                color: color,
              }}
            >
              #{name.trim() || 'tag-preview'}
            </span>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={closeTagModal}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-medium transition-colors"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Tag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
