import React from 'react';
import { ArrowDownAZ, ArrowUpZA, Clock, Calendar, Check } from 'lucide-react';
import { NoteSortField, NoteSortOrder } from '../../../shared/types/note';
import { useNotesStore } from '../../stores/notes.store';

interface SortMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SortMenu: React.FC<SortMenuProps> = ({ isOpen, onClose }) => {
  const { sortOptions, setSortOptions } = useNotesStore();

  if (!isOpen) return null;

  const handleSelect = (field: NoteSortField, order: NoteSortOrder) => {
    setSortOptions({ field, order });
    onClose();
  };

  const isCurrent = (field: NoteSortField, order: NoteSortOrder) =>
    sortOptions.field === field && sortOptions.order === order;

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute right-2 top-11 z-40 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-dropdown border border-slate-200 dark:border-slate-700 py-1 text-xs">
        <div className="px-3 py-1 font-semibold text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Sort Notes By
        </div>

        <button
          onClick={() => handleSelect('updated_at', 'desc')}
          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
        >
          <div className="flex items-center space-x-2">
            <Clock size={13} />
            <span>Updated (Newest first)</span>
          </div>
          {isCurrent('updated_at', 'desc') && <Check size={13} className="text-blue-500" />}
        </button>

        <button
          onClick={() => handleSelect('updated_at', 'asc')}
          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
        >
          <div className="flex items-center space-x-2">
            <Clock size={13} />
            <span>Updated (Oldest first)</span>
          </div>
          {isCurrent('updated_at', 'asc') && <Check size={13} className="text-blue-500" />}
        </button>

        <button
          onClick={() => handleSelect('created_at', 'desc')}
          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
        >
          <div className="flex items-center space-x-2">
            <Calendar size={13} />
            <span>Created (Newest first)</span>
          </div>
          {isCurrent('created_at', 'desc') && <Check size={13} className="text-blue-500" />}
        </button>

        <button
          onClick={() => handleSelect('title', 'asc')}
          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
        >
          <div className="flex items-center space-x-2">
            <ArrowDownAZ size={13} />
            <span>Title (A to Z)</span>
          </div>
          {isCurrent('title', 'asc') && <Check size={13} className="text-blue-500" />}
        </button>

        <button
          onClick={() => handleSelect('title', 'desc')}
          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
        >
          <div className="flex items-center space-x-2">
            <ArrowUpZA size={13} />
            <span>Title (Z to A)</span>
          </div>
          {isCurrent('title', 'desc') && <Check size={13} className="text-blue-500" />}
        </button>
      </div>
    </>
  );
};
