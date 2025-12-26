/**
 * TabNavigation Component
 *
 * Displays tab buttons for switching between different views
 * Used in the Assistant page to switch between Workorders, Stubs, and Documentation
 */

'use client';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
}

export function TabNavigation({ tabs, activeTabId, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex gap-2 border-b border-ind-border pb-4">
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-t
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
            {tab.icon && <span className="text-lg">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default TabNavigation;
