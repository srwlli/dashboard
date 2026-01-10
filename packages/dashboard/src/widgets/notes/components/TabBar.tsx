'use client';

/**
 * TabBar Component
 *
 * Horizontal tab interface for multi-file editing
 * Shows file names, unsaved indicators, and close buttons
 */

import { X, FileText } from 'lucide-react';
import type { NotepadTab } from '../types/notepad';

interface TabBarProps {
  /** Array of open tabs */
  tabs: NotepadTab[];

  /** Currently active tab ID */
  activeTabId: string | null;

  /** Callback when tab is selected */
  onSelectTab: (tabId: string) => void;

  /** Callback when tab close button clicked */
  onCloseTab: (tabId: string) => void;

  /** Optional className */
  className?: string;
}

export function TabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  className = '',
}: TabBarProps) {
  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 bg-ind-bg border-b border-ind-border overflow-x-auto ${className}`}
    >
      {tabs.length === 0 ? (
        <div className="flex items-center gap-2 px-3 py-2 text-sm text-ind-text-muted">
          <FileText className="w-4 h-4" />
          <span>No files open</span>
        </div>
      ) : (
        tabs.map((tab) => (
          <Tab
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            onSelect={() => onSelectTab(tab.id)}
            onClose={() => onCloseTab(tab.id)}
          />
        ))
      )}
    </div>
  );
}

/**
 * Individual tab component
 */
function Tab({
  tab,
  isActive,
  onSelect,
  onClose,
}: {
  tab: NotepadTab;
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
}) {
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      onClick={onSelect}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-t
        min-w-[120px] max-w-[200px]
        cursor-pointer transition-colors
        ${isActive
          ? 'bg-ind-panel text-ind-text border-t-2 border-ind-accent'
          : 'bg-ind-bg/50 text-ind-text-muted hover:bg-ind-bg border-t-2 border-transparent'
        }
      `}
    >
      {/* File icon */}
      <FileText className="w-4 h-4 flex-shrink-0" />

      {/* Tab title */}
      <span className="flex-1 truncate text-sm">
        {tab.title}
        {tab.isDirty && <span className="ml-1">•</span>}
      </span>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-0.5 rounded hover:bg-ind-border transition-colors"
        title="Close tab"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
