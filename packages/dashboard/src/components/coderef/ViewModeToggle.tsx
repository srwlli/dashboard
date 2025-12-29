/**
 * ViewModeToggle Component
 *
 * Tab toggle for switching between Project and CodeRef view modes in Explorer.
 * Displays [Project] [CodeRef] tabs as border-attached tabs.
 * Project = full project directory, CodeRef = coderef/ subdirectory only.
 */

'use client';

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
 * ViewModeToggle component with Project/CodeRef tabs
 * Styled as border-attached tabs (browser-style)
 */
export function ViewModeToggle({ value, onChange, className = '' }: ViewModeToggleProps) {
  const tabs: Array<{ id: ViewMode; label: string }> = [
    { id: 'projects', label: 'Project' },
    { id: 'coderef', label: 'CodeRef' },
  ];

  return (
    <div className={`flex gap-0.5 border-b border-ind-border ${className}`}>
      {tabs.map((tab) => {
        const isActive = value === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              px-4 py-2 text-sm font-medium
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
