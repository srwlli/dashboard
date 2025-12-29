/**
 * FileTypeFilter Component
 *
 * Filter buttons for CodeRef view mode to filter by file type.
 * Displays: [All Files] [CLAUDE.md] [plan.json] [DELIVERABLES.md] [ARCHITECTURE.md]
 */

'use client';

import { FileText, Code, CheckSquare, FileCode, BookOpen } from 'lucide-react';

export type FileType = 'all' | 'claude' | 'plan' | 'deliverables' | 'architecture' | 'readme';

export interface FileTypeOption {
  id: FileType;
  label: string;
  pattern: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const FILE_TYPE_OPTIONS: FileTypeOption[] = [
  { id: 'all', label: 'All Files', pattern: '*', icon: FileText },
  { id: 'claude', label: 'CLAUDE.md', pattern: 'CLAUDE.md', icon: Code },
  { id: 'plan', label: 'plan.json', pattern: '**/plan.json', icon: FileCode },
  { id: 'deliverables', label: 'DELIVERABLES.md', pattern: '**/DELIVERABLES.md', icon: CheckSquare },
  { id: 'architecture', label: 'ARCHITECTURE.md', pattern: 'ARCHITECTURE.md', icon: BookOpen },
];

interface FileTypeFilterProps {
  /** Current active filter */
  value: FileType;
  /** Callback when filter changes */
  onChange: (type: FileType) => void;
  /** Optional file counts per type */
  counts?: Record<FileType, number>;
  /** Optional className for styling */
  className?: string;
}

/**
 * FileTypeFilter component with button group
 */
export function FileTypeFilter({ value, onChange, counts, className = '' }: FileTypeFilterProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-xs text-ind-text-muted font-medium">Filter by type:</p>

      <div className="flex flex-wrap gap-2">
        {FILE_TYPE_OPTIONS.map((option) => {
          const isActive = value === option.id;
          const Icon = option.icon;
          const count = counts?.[option.id];

          return (
            <button
              key={option.id}
              onClick={() => onChange(option.id)}
              className={`
                px-2.5 py-1.5 rounded text-xs font-medium
                transition-colors duration-200
                flex items-center gap-1.5
                ${
                  isActive
                    ? 'bg-ind-accent text-white'
                    : 'bg-ind-bg text-ind-text hover:bg-ind-panel hover:text-ind-accent border border-ind-border'
                }
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{option.label}</span>
              {count !== undefined && count > 0 && (
                <span className={`
                  ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold
                  ${isActive ? 'bg-white/20' : 'bg-ind-accent/10 text-ind-accent'}
                `}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default FileTypeFilter;
