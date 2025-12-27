/**
 * TabNavigation Component
 *
 * Displays tab buttons for switching between different views
 * Used in the Assistant page to switch between Workorders, Stubs, and Documentation
 */

'use client';

import { LucideIcon } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
}

export function TabNavigation({ tabs, activeTabId, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex gap-1 sm:gap-2 border-b border-ind-border pb-4 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-t
              whitespace-nowrap shrink-0 sm:shrink
              transition-colors duration-200
              ${
                isActive
                  ? 'bg-ind-bg border-b-2 border-ind-accent text-ind-text font-semibold'
                  : 'bg-transparent text-ind-text-muted hover:text-ind-text hover:bg-ind-bg/30'
              }
            `}
            aria-selected={isActive}
            role="tab"
          >
            {tab.icon && <tab.icon className="w-3 sm:w-4 h-3 sm:h-4" />}
            <span className="text-xs sm:text-sm">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default TabNavigation;
