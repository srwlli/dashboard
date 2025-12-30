'use client';

import { useState } from 'react';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
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

export function BatchRestoreUI({
  staleProjects,
  projects,
  onRestore,
  className = '',
}: BatchRestoreUIProps) {
  const [restoring, setRestoring] = useState(false);
  const [currentProject, setCurrentProject] = useState<string | null>(null);

  // Don't render if no stale projects
  if (staleProjects.size === 0) return null;

  // Get stale project details
  const staleProjectList = projects.filter((p) => staleProjects.has(p.id));

  const handleRestoreAll = async () => {
    setRestoring(true);

    for (const project of staleProjectList) {
      try {
        setCurrentProject(project.id);

        // Show directory picker for this project
        const dirHandle = await showDirectoryPicker();

        if (!dirHandle) {
          // User cancelled - stop restoring
          break;
        }

        // Save new directory handle with persistent storage
        await saveDirectoryHandlePersistent(project.id, dirHandle);

        // Notify parent that this project is restored
        onRestore(project.id);
      } catch (error) {
        console.error(`[BatchRestoreUI] Failed to restore ${project.name}:`, error);
        // Continue with next project
      }
    }

    setCurrentProject(null);
    setRestoring(false);
  };

  return (
    <div className={`rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 ${className}`}>
      <div className="flex items-start gap-2">
        <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-yellow-500 mb-2">
            Access Required: {staleProjects.size} {staleProjects.size === 1 ? 'project needs' : 'projects need'} re-authorization
          </div>

          {/* Project list */}
          <div className="mb-3 space-y-1">
            {staleProjectList.map((project) => (
              <div
                key={project.id}
                className="flex items-center gap-2 text-xs text-yellow-500/80"
              >
                {currentProject === project.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <div className="w-3 h-3 rounded-full border border-yellow-500/50" />
                )}
                <span className="truncate">{project.name}</span>
              </div>
            ))}
          </div>

          {/* Restore All button */}
          <button
            onClick={handleRestoreAll}
            disabled={restoring}
            className="
              flex items-center gap-2 px-3 py-1.5 rounded text-sm
              bg-yellow-500/20 hover:bg-yellow-500/30
              text-yellow-500
              border border-yellow-500/30
              transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {restoring ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Restoring...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Restore All Projects
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BatchRestoreUI;
