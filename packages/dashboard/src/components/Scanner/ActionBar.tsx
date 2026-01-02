'use client';

/**
 * ActionBar Component
 * Bottom action bar - Scan button + Clear button
 * Shows disabled state when no projects selected
 */
export function ActionBar() {
  const selectedCount = 0; // Mockup - always 0

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Status */}
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          <span className="font-medium">{selectedCount}</span> projects selected
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            disabled
            className="px-4 py-2 text-sm font-medium text-neutral-400 dark:text-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
          >
            Clear
          </button>
          <button
            disabled={selectedCount === 0}
            className={`
              px-6 py-2 rounded-md text-sm font-medium transition-colors
              ${
                selectedCount === 0
                  ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                  : 'bg-ind-accent-color hover:bg-ind-accent-hover text-white'
              }
            `}
          >
            Scan Projects
          </button>
        </div>
      </div>
    </div>
  );
}
