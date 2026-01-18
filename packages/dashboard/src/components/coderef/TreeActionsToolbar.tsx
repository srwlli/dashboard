/**
 * TreeActionsToolbar Component
 *
 * @description Toolbar with quick actions for file tree management (expand all, collapse all, refresh).
 * Provides convenient shortcuts for common tree navigation operations.
 *
 * @component
 * @example
 * ```tsx
 * <TreeActionsToolbar
 *   onExpandAll={() => expandAllNodes()}
 *   onCollapseAll={() => collapseAllNodes()}
 *   onRefresh={() => reloadTree()}
 * />
 * ```
 *
 * @remarks
 * **Features**:
 * - Expand All: Opens all directory nodes in tree
 * - Collapse All: Closes all directory nodes in tree
 * - Refresh: Reloads tree from filesystem/API
 *
 * **Design Tokens**:
 * - Uses `text-ind-text-muted` for icons
 * - Uses `hover:text-ind-accent` for hover state
 * - Uses `hover:bg-ind-panel` for button backgrounds
 */
'use client';

import { ChevronDown, ChevronRight, RotateCw } from 'lucide-react';

export interface TreeActionsToolbarProps {
  /** Callback to expand all nodes in tree */
  onExpandAll?: () => void;
  /** Callback to collapse all nodes in tree */
  onCollapseAll?: () => void;
  /** Callback to refresh/reload tree */
  onRefresh?: () => void;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * TreeActionsToolbar - Quick actions toolbar for tree operations
 *
 * @param props - Component props
 * @returns Toolbar with tree action buttons
 */
export function TreeActionsToolbar({
  onExpandAll,
  onCollapseAll,
  onRefresh,
  className = '',
}: TreeActionsToolbarProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Expand All */}
      {onExpandAll && (
        <button
          onClick={onExpandAll}
          className="p-1.5 rounded hover:bg-ind-panel text-ind-text-muted hover:text-ind-accent transition-colors"
          aria-label="Expand all folders"
          title="Expand All (Open all folders)"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      )}

      {/* Collapse All */}
      {onCollapseAll && (
        <button
          onClick={onCollapseAll}
          className="p-1.5 rounded hover:bg-ind-panel text-ind-text-muted hover:text-ind-accent transition-colors"
          aria-label="Collapse all folders"
          title="Collapse All (Close all folders)"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Refresh */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="p-1.5 rounded flex-shrink-0 bg-ind-accent text-ind-panel hover:bg-ind-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
          aria-label="Refresh tree"
          title="Refresh (Reload from filesystem)"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
