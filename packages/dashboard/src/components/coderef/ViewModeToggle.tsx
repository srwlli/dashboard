/**
 * ViewModeToggle Component
 *
 * Tab toggle for switching between Projects and CodeRef view modes in Explorer.
 * Displays [Projects] [CodeRef] tabs above ProjectSelector.
 */

'use client';

import { useState } from 'react';

export type ViewMode = 'projects' | 'coderef';

interface ViewModeToggleProps {
  /** Current active view mode */
  value: ViewMode;
  /** Callback when view mode changes */
  onChange: (mode: ViewMode) => void;
  /** Optional className for styling */
  className?: string;
}

/**
 * ViewModeToggle component with Projects/CodeRef tabs
 */
export function ViewModeToggle({ value, onChange, className = '' }: ViewModeToggleProps) {
  const tabs: Array<{ id: ViewMode; label: string }> = [
    { id: 'projects', label: 'Projects' },
    { id: 'coderef', label: 'CodeRef' },
  ];

  return (
    <div className={`flex gap-1 ${className}`}>
      {tabs.map((tab) => {
        const isActive = value === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              px-3 py-1.5 rounded text-sm font-medium
              transition-colors duration-200
              ${
                isActive
                  ? 'bg-ind-accent text-white'
                  : 'bg-ind-bg text-ind-text hover:bg-ind-panel hover:text-ind-accent border border-ind-border'
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default ViewModeToggle;
