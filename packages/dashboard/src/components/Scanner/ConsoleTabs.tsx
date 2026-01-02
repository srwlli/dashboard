'use client';

import { useState } from 'react';

type TabType = 'console' | 'history' | 'config';

/**
 * ConsoleTabs Component
 * Right sidebar - Console/History/Config tabs
 * Shows terminal-style output and configuration
 */
export function ConsoleTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('console');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'console', label: 'Console' },
    { id: 'history', label: 'History' },
    { id: 'config', label: 'Config' },
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 h-full flex flex-col">
      {/* Tab Headers */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-3 text-sm font-medium transition-colors relative
              ${
                activeTab === tab.id
                  ? 'text-ind-accent-color border-b-2 border-ind-accent-color'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'console' && (
          <div className="p-4 font-mono text-sm bg-neutral-950 dark:bg-neutral-950 min-h-full">
            <div className="text-green-400">{'>'} System Initialized</div>
            <div className="text-blue-400 mt-2">
              {'>'} Ready for scan. Waiting for project selection...
            </div>
            <div className="text-neutral-500 mt-2">
              {'>'} Tip: Select one or more projects from the left panel
            </div>
          </div>
        )}

        {activeTab === 'history' && (
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              No Scan History
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-sm">
              Your scan history will appear here after running scans
            </p>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="p-4 font-mono text-sm bg-neutral-950 dark:bg-neutral-950 min-h-full">
            <div className="text-neutral-300">
              <div className="mb-2">
                <span className="text-neutral-500">Mode:</span> Universal
                Structure
              </div>
              <div className="mb-2">
                <span className="text-neutral-500">Filters:</span> *.js, *.ts,
                *.py
              </div>
              <div className="mb-2">
                <span className="text-neutral-500">Exclude:</span> node_modules,
                .git
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Status */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 px-4 py-2 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-600 dark:text-neutral-400">
            Status: <span className="text-green-500 font-medium">Idle</span>
          </span>
          <span className="text-neutral-500">v1.0.0</span>
        </div>
      </div>
    </div>
  );
}
