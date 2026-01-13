'use client';

import { useProjects } from '@/contexts/ProjectsContext';

interface ProjectSelection {
  directories: boolean;
  scan: boolean;
  populate: boolean;
}

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selections: Map<string, ProjectSelection>;
}

/**
 * ConfirmationDialog Component
 * Modal dialog showing what operations will be executed for each project
 * Displays: "Project A: Scan → Populate" format
 */
export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  selections,
}: ConfirmationDialogProps) {
  const { projects } = useProjects();

  if (!isOpen) return null;

  // Build operation list from selections
  const operations = Array.from(selections.entries())
    .map(([projectId, selection]) => {
      const project = projects.find((p) => p.id === projectId);
      if (!project || (!selection.directories && !selection.scan && !selection.populate)) return null;

      const steps: string[] = [];
      if (selection.directories) steps.push('Directories');
      if (selection.scan) steps.push('Scan');
      if (selection.populate) steps.push('Populate');

      return {
        projectName: project.name,
        projectPath: project.path,
        steps: steps.join(' → '),
      };
    })
    .filter((op) => op !== null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-ind-panel border-2 border-ind-border shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b-2 border-ind-border p-6">
          <h2 className="text-xl font-semibold text-ind-text">
            Confirm Execution
          </h2>
          <p className="text-sm text-ind-text-muted mt-1">
            The following operations will be executed for each project:
          </p>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {operations.map((op, index) => (
              <div
                key={index}
                className="bg-ind-bg p-4 border border-ind-border"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-8 h-8 bg-ind-accent/10 flex items-center justify-center mt-0.5">
                    <svg
                      className="w-4 h-4 text-ind-accent"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M4 3.5v9l7-4.5-7-4.5z" />
                    </svg>
                  </div>

                  {/* Project Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ind-text">
                      {op!.projectName}
                    </p>
                    <p className="text-xs text-ind-text-muted truncate mt-0.5">
                      {op!.projectPath}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs font-medium text-ind-accent">
                        {op!.steps}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Notice */}
          <div className="mt-4 p-3 bg-ind-bg border border-ind-accent/30">
            <div className="flex gap-2">
              <svg
                className="w-5 h-5 text-ind-accent flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm text-ind-text">
                <p className="font-medium">Execution Order</p>
                <p className="text-xs mt-1 text-ind-text-muted">
                  Phases execute in order: <strong>Directories</strong> → <strong>Scan</strong> → <strong>Populate</strong>.
                  Directory creation errors do not block subsequent phases. Scan failures skip populate for that project.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="border-t-2 border-ind-border p-6">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-ind-text-muted hover:bg-ind-border transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 text-sm font-medium bg-ind-accent hover:bg-ind-accent-hover text-black transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4 3.5v9l7-4.5-7-4.5z" />
              </svg>
              Start Execution
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
