import React from 'react';
import { useUIStore } from '../../stores/ui.store';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg shadow-elevated border text-xs font-medium animate-in slide-in-from-bottom-2 fade-in duration-200 transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : toast.type === 'error'
              ? 'bg-red-50 dark:bg-red-950/80 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
              : 'bg-blue-50 dark:bg-blue-950/80 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />}
          {toast.type === 'error' && <AlertCircle size={15} className="text-red-600 dark:text-red-400 flex-shrink-0" />}
          {toast.type === 'info' && <Info size={15} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />}
          
          <span className="max-w-xs">{toast.message}</span>

          <button
            onClick={() => removeToast(toast.id)}
            className="p-0.5 ml-2 hover:opacity-75 transition-opacity"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
};
