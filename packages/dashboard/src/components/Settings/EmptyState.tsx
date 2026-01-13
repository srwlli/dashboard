'use client';

import { FolderPlus, Loader2 } from 'lucide-react';

interface EmptyStateProps {
  /** Callback when Add Project button clicked */
  onAddProject: () => void;

  /** Whether add operation is in progress */
  isAdding: boolean;
}

/**
 * EmptyState Component
 *
 * Displays when no projects are registered.
 * Shows friendly message and prominent Add Project button.
 */
export function EmptyState({ onAddProject, isAdding }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-ind-accent/10 flex items-center justify-center mb-4">
        <FolderPlus className="w-8 h-8 text-ind-accent" />
      </div>

      {/* Message */}
      <h3 className="text-lg font-bold text-ind-text mb-2">No Projects Yet</h3>
      <p className="text-sm text-ind-text-muted mb-6 max-w-md">
        Add your first project to get started. Projects added here will be available across the
        entire dashboard, including the Scanner and CodeRef Explorer.
      </p>

      {/* Action button */}
      <button
        onClick={onAddProject}
        disabled={isAdding}
        className="
          px-6 py-3 rounded-lg flex items-center gap-3
          bg-ind-accent text-ind-panel text-sm font-medium
          hover:bg-ind-accent/90
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          shadow-lg hover:shadow-xl
        "
      >
        {isAdding ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Adding Project...
          </>
        ) : (
          <>
            <FolderPlus className="w-5 h-5" />
            Add Your First Project
          </>
        )}
      </button>

      {/* Hint */}
      <p className="text-xs text-ind-text-muted mt-6">
        You&apos;ll be prompted to select a directory on your computer
      </p>
    </div>
  );
}
