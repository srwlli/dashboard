'use client';

import { useState } from 'react';
import { AlertCircle, RefreshCw, Loader2, CheckCircle2 } from 'lucide-react';
import type { Project } from '@/lib/coderef/types';
import { showDirectoryPicker } from '@/lib/coderef/local-access';
import { saveDirectoryHandlePersistent } from '@/lib/coderef/persistence';

interface BatchRestoreUIProps {
  /** Set of project IDs that need re-authorization */
  staleProjects: Set<string>;

  /** Full list of all projects */
  projects: Project[];

  /** Callback when a project is restored */
  onRestore: (projectId: string) => void;

  /** Optional custom class name */
  className?: string;
}

/**
 * Extract folder name from File System Access API path
 * Input:  "[Directory: my-app]"
 * Output: "my-app"
 */
function extractFolderName(path: string): string | null {
  const match = path.match(/\[Directory: (.+)\]/);
  return match ? match[1] : null;
}

export function BatchRestoreUI({
  staleProjects,
  projects,
  onRestore,
  className = '',
}: BatchRestoreUIProps) {
  const [restoringProjects, setRestoringProjects] = useState<Set<string>>(new Set());
  const [restoredProjects, setRestoredProjects] = useState<Set<string>>(new Set());

  // Don't render if no stale projects
  if (staleProjects.size === 0) return null;

  // Get stale project details
  const staleProjectList = projects.filter((p) => staleProjects.has(p.id));

  /**
   * Restore a single project
   * Shows folder picker with context for this specific project
   */
  const handleRestoreSingle = async (project: Project) => {
    // Mark as restoring
    setRestoringProjects((prev) => new Set(prev).add(project.id));

    try {
      console.log(`[BatchRestoreUI] Restoring ${project.name}...`);

      // Show directory picker for THIS project
      // TODO: Browser API doesn't support custom title text yet
      // Ideally would show: "Select folder for: {project.name}"
      const dirHandle = await showDirectoryPicker();

      if (!dirHandle) {
        // User cancelled - just skip this project
        console.log(`[BatchRestoreUI] User cancelled restore for ${project.name}`);
        return;
      }

      // Save new directory handle with persistent storage
      await saveDirectoryHandlePersistent(project.id, dirHandle);

      // Mark as restored
      setRestoredProjects((prev) => new Set(prev).add(project.id));

      // Notify parent that this project is restored
      onRestore(project.id);

      console.log(`[BatchRestoreUI] Successfully restored ${project.name}`);
    } catch (error) {
      console.error(`[BatchRestoreUI] Failed to restore ${project.name}:`, error);
      // Don't stop - user can try again
    } finally {
      // Remove from restoring set
      setRestoringProjects((prev) => {
        const next = new Set(prev);
        next.delete(project.id);
        return next;
      });
    }
  };

  const pendingCount = staleProjectList.filter(
    (p) => !restoredProjects.has(p.id)
  ).length;

  return (
    <div className={`rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 ${className}`}>
      <div className="flex items-start gap-2">
        <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="text-sm font-medium text-yellow-500 mb-3">
            Access Required: {pendingCount} {pendingCount === 1 ? 'project needs' : 'projects need'} re-authorization
          </div>

          {/* Project list with individual restore buttons */}
          <div className="space-y-2">
            {staleProjectList.map((project) => {
              const isRestoring = restoringProjects.has(project.id);
              const isRestored = restoredProjects.has(project.id);
              const folderName = extractFolderName(project.path);

              return (
                <div
                  key={project.id}
                  className={`
                    flex items-center justify-between gap-3 p-2 rounded
                    ${isRestored ? 'bg-green-500/10 border border-green-500/30' : 'bg-yellow-500/5'}
                  `}
                >
                  {/* Project info */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* Status icon */}
                    {isRestored ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : isRestoring ? (
                      <Loader2 className="w-4 h-4 text-yellow-500 animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-yellow-500/50 flex-shrink-0" />
                    )}

                    {/* Project name and folder hint */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${isRestored ? 'text-green-500' : 'text-yellow-500'}`}>
                        {project.name}
                      </div>
                      {folderName && (
                        <div className="text-xs text-yellow-500/60 truncate">
                          Original folder: {folderName}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Restore button */}
                  {!isRestored && (
                    <button
                      onClick={() => handleRestoreSingle(project)}
                      disabled={isRestoring}
                      className="
                        flex items-center gap-1.5 px-3 py-1.5 rounded text-xs
                        bg-yellow-500/20 hover:bg-yellow-500/30
                        text-yellow-500
                        border border-yellow-500/30
                        transition-colors duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed
                        flex-shrink-0
                      "
                      title={`Select folder for: ${project.name}`}
                    >
                      {isRestoring ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Restoring...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          Restore
                        </>
                      )}
                    </button>
                  )}

                  {/* Success indicator */}
                  {isRestored && (
                    <span className="text-xs text-green-500 font-medium flex-shrink-0">
                      ✓ Restored
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Completion message */}
          {pendingCount === 0 && staleProjectList.length > 0 && (
            <div className="mt-3 p-2 rounded bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-2 text-sm text-green-500">
                <CheckCircle2 className="w-4 h-4" />
                All projects restored successfully!
              </div>
            </div>
          )}

          {/* Help text */}
          <div className="mt-3 text-xs text-yellow-500/70">
            💡 Tip: Click "Restore" for each project and select the correct folder when prompted.
          </div>
        </div>
      </div>
    </div>
  );
}

export default BatchRestoreUI;
