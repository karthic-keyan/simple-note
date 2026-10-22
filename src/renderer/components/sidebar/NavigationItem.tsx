import React from 'react';

interface NavigationItemProps {
  icon: React.ReactNode;
  label: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
  accentColor?: string;
  badge?: React.ReactNode;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  icon,
  label,
  count,
  isActive,
  onClick,
  accentColor,
  badge,
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium transition-colors group ${
        isActive
          ? 'bg-sidebar-activeLight dark:bg-sidebar-activeDark text-slate-900 dark:text-white font-semibold'
          : 'text-slate-600 dark:text-slate-400 hover:bg-sidebar-hoverLight dark:hover:bg-sidebar-hoverDark hover:text-slate-900 dark:hover:text-slate-200'
      }`}
    >
      <div className="flex items-center space-x-2.5 truncate">
        <span className={`flex-shrink-0 ${accentColor || ''}`}>{icon}</span>
        <span className="truncate">{label}</span>
      </div>

      <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
        {badge}
        {count !== undefined && count > 0 && (
          <span className="text-[11px] px-1.5 py-0.2 rounded-full text-slate-500 dark:text-slate-400 font-normal">
            {count}
          </span>
        )}
      </div>
    </button>
  );
};
