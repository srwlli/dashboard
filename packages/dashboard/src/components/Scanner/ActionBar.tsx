'use client';

import { useState } from 'react';
import { ConfirmationDialog } from './ConfirmationDialog';

interface ProjectSelection {
  scan: boolean;
  populate: boolean;
}

/**
 * ActionBar Component
 * Bottom action bar - Play button to execute scan/populate
 * Shows selection counts and disabled state when nothing selected
 */
interface ActionBarProps {
  selections: Map<string, ProjectSelection>;
  projects: Array<{ id: string; name: string; path: string }>;
  onScanStart?: (scanId: string) => void;
}

export function ActionBar({ selections, projects, onScanStart }: ActionBarProps) {
  const [scanning, setScanning] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Count how many projects have each option checked
  let scanCount = 0;
  let populateCount = 0;
  const selectedProjectIds: string[] = [];

  selections.forEach((selection, projectId) => {
    if (selection.scan || selection.populate) {
      selectedProjectIds.push(projectId);
    }
    if (selection.scan) scanCount++;
    if (selection.populate) populateCount++;
  });

  const hasSelections = scanCount > 0 || populateCount > 0;

  // Open confirmation dialog
  function handleExecuteClick() {
    if (!hasSelections || scanning) return;
    setShowConfirmDialog(true);
  }

  // Execute scan after confirmation
  async function handleConfirmedExecution() {
    setShowConfirmDialog(false);

    try {
      setScanning(true);

      // Convert Map to Record for JSON serialization
      const selectionsRecord: Record<string, ProjectSelection> = {};
      selections.forEach((selection, projectId) => {
        selectionsRecord[projectId] = selection;
      });

      const response = await fetch('/api/scanner/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectIds: selectedProjectIds,
          selections: selectionsRecord,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onScanStart?.(data.data.scanId);
      } else {
        alert(`Failed to start scan: ${data.error.message}`);
      }
    } catch (error) {
      console.error('Failed to start scan:', error);
      alert('Failed to start scan');
    } finally {
      setScanning(false);
    }
  }

  // Build selection count text
  const buildSelectionText = () => {
    const parts: string[] = [];
    if (scanCount > 0) parts.push(`${scanCount} scan${scanCount > 1 ? 's' : ''}`);
    if (populateCount > 0) parts.push(`${populateCount} populate`);

    if (parts.length === 0) return 'No selections';
    return parts.join(', ') + ' selected';
  };

  return (
    <>
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Status */}
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {buildSelectionText()}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleExecuteClick}
              disabled={!hasSelections || scanning}
              className={`
                flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-colors active:translate-y-0.5
                ${
                  !hasSelections || scanning
                    ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                    : 'bg-ind-accent hover:bg-ind-accent-hover text-black'
                }
              `}
              title="Start scan and/or populate operations"
            >
              {scanning ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Starting...
                </>
              ) : (
                <>
                  {/* Play Icon */}
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4 3.5v9l7-4.5-7-4.5z" />
                  </svg>
                  Execute
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmedExecution}
        selections={selections}
        projects={projects}
      />
    </>
  );
}
