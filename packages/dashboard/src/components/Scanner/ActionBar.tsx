'use client';

import { useState } from 'react';
import { ConfirmationDialog } from './ConfirmationDialog';

interface ProjectSelection {
  directories: boolean;
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
  let directoriesCount = 0;
  let scanCount = 0;
  let populateCount = 0;
  const selectedProjectIds: string[] = [];

  selections.forEach((selection, projectId) => {
    if (selection.directories || selection.scan || selection.populate) {
      selectedProjectIds.push(projectId);
    }
    if (selection.directories) directoriesCount++;
    if (selection.scan) scanCount++;
    if (selection.populate) populateCount++;
  });

  const hasSelections = directoriesCount > 0 || scanCount > 0 || populateCount > 0;

  // Open confirmation dialog
  function handleExecuteClick() {
    if (!hasSelections || scanning) return;
    setShowConfirmDialog(true);
  }

  /**
   * Validate selections before sending to backend
   * Prevents silent errors by catching invalid state at UI boundary
   */
  function validateSelections(): { valid: boolean; error?: string } {
    // Validation 1: At least one project must be selected
    if (selectedProjectIds.length === 0) {
      return { valid: false, error: 'No projects selected' };
    }

    // Validation 2: At least one phase must be selected across all projects
    if (!hasSelections) {
      return { valid: false, error: 'No operations selected. Check at least one: Directories, Scan, or Populate' };
    }

    // Validation 3: Each selection must have all required fields
    for (const [projectId, selection] of selections.entries()) {
      if (typeof selection.directories !== 'boolean' ||
          typeof selection.scan !== 'boolean' ||
          typeof selection.populate !== 'boolean') {
        const project = projects.find(p => p.id === projectId);
        return {
          valid: false,
          error: `Invalid selection format for project "${project?.name || projectId}". Missing phase fields.`
        };
      }

      // Validation 4: At least one phase must be selected per project
      if (!selection.directories && !selection.scan && !selection.populate) {
        const project = projects.find(p => p.id === projectId);
        return {
          valid: false,
          error: `No operations selected for project "${project?.name || projectId}"`
        };
      }
    }

    // Validation 5: Project IDs must exist in projects list
    for (const projectId of selectedProjectIds) {
      const project = projects.find(p => p.id === projectId);
      if (!project) {
        return {
          valid: false,
          error: `Invalid project ID: ${projectId}. Project not found.`
        };
      }
    }

    return { valid: true };
  }

  // Execute scan after confirmation
  async function handleConfirmedExecution() {
    setShowConfirmDialog(false);

    try {
      setScanning(true);

      // Validate selections before sending to backend (fail-fast)
      const validation = validateSelections();
      if (!validation.valid) {
        alert(`❌ Validation Error\n\n${validation.error}\n\nPlease check your selections and try again.`);
        return;
      }

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
    if (directoriesCount > 0) parts.push(`${directoriesCount} directories`);
    if (scanCount > 0) parts.push(`${scanCount} scan${scanCount > 1 ? 's' : ''}`);
    if (populateCount > 0) parts.push(`${populateCount} populate`);

    if (parts.length === 0) return 'No selections';
    return parts.join(', ') + ' selected';
  };

  return (
    <>
      <div className="bg-ind-panel border-2 border-ind-border p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Status */}
          <div className="text-sm text-ind-text-muted">
            {buildSelectionText()}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleExecuteClick}
              disabled={!hasSelections || scanning}
              className={`
                flex items-center gap-2 px-6 py-2 text-sm font-bold uppercase tracking-wider transition-colors active:translate-y-0.5
                ${
                  !hasSelections || scanning
                    ? 'bg-ind-border text-ind-text-muted cursor-not-allowed'
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
