'use client';

import { useState } from 'react';

/**
 * ProjectListCard Component
 * Left panel - saved projects list with checkboxes
 * Shows empty state when no projects configured
 */
export function ProjectListCard() {
  const [projects] = useState<string[]>([]); // Empty - UI mockup only

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 p-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Saved Projects
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Select projects to include in scan
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-4">
            <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-neutral-400 dark:text-neutral-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              No Projects Configured
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 max-w-sm">
              Add project paths to include in the scan
            </p>
            <button className="px-4 py-2 bg-ind-accent-color hover:bg-ind-accent-hover text-white rounded-md text-sm font-medium transition-colors">
              Add Path
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Project list would go here - currently empty */}
          </div>
        )}
      </div>

      {/* Footer Tip */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50 dark:bg-neutral-900/50">
        <p className="text-xs text-neutral-600 dark:text-neutral-500">
          💡 <span className="font-medium">Tip:</span> Projects are saved
          across sessions
        </p>
      </div>
    </div>
  );
}
