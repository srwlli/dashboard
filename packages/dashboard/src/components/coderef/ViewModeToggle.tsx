/**
 * ViewModeToggle Component
 *
 * Tab toggle for switching between root, coderef, .coderef, and favorite view modes in Explorer.
 * Displays [root] [coderef] [.coderef] [favorite] tabs as border-attached tabs.
 * - root = full project directory
 * - coderef = coderef/ subdirectory only
 * - .coderef = .coderef/ subdirectory only (system files, hides index.json)
 * - favorite = user-favorited files/folders
 */

'use client';

export type ViewMode = 'projects' | 'coderef' | 'dotcoderef' | 'favorites';

interface ViewModeToggleProps {
  /** Current active view mode */
  value: ViewMode;
  /** Callback when view mode changes */
  onChange: (mode: ViewMode) => void;
  /** Optional className for styling */
  className?: string;
}

/**
 * ViewModeToggle component with root/coderef/.coderef/favorite tabs
 * Styled as border-attached tabs (browser-style)
 */
export function ViewModeToggle({ value, onChange, className = '' }: ViewModeToggleProps) {
  const tabs: Array<{ id: ViewMode; label: string }> = [
    { id: 'projects', label: 'root' },
    { id: 'coderef', label: 'coderef' },
    { id: 'dotcoderef', label: '.coderef' },
    { id: 'favorites', label: 'favorite' },
  ];

  return (
    <div className={`flex border-b border-ind-border overflow-x-auto overflow-y-hidden ${className}`}>
      {tabs.map((tab) => {
        const isActive = value === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex-1 px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap
              transition-all duration-200
              border-t border-l border-r
              ${
                isActive
                  ? 'bg-ind-panel text-ind-accent border-ind-border border-b-0 translate-y-px'
                  : 'bg-ind-bg text-ind-text-muted hover:text-ind-text border-transparent hover:border-ind-border/50'
              }
              rounded-t
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
