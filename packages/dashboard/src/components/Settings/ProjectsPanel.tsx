'use client';

import { useState, useEffect } from 'react';
import { useProjects } from '@/contexts/ProjectsContext';
import { fileSystem, platform } from '@/lib/coderef/platform';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { EmptyState } from './EmptyState';

/**
 * ProjectsPanel Component
 *
 * Settings panel for managing projects. Provides:
 * - Add new projects via directory picker
 * - Remove projects with confirmation
 * - Restore stale projects (lost permissions)
 * - Display project metadata (name, path, added date)
 *
 * Part of Settings page - centralizes project management.
 * Scanner and other pages consume projects via useProjects() hook.
 */
export function ProjectsPanel() {
  const { projects, isLoading, error: contextError, addProject, removeProject } = useProjects();

  // Local state
  const [adding, setAdding] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [staleProjects, setStaleProjects] = useState<Set<string>>(new Set());
  const [staleReasons, setStaleReasons] = useState<Map<string, string>>(new Map());

  // Combine errors
  const error = contextError || localError;

  // Check for stale directory handles when projects load
  useEffect(() => {
    checkForStaleHandles();
  }, [projects]);

  /**
   * Handle add project
   * Opens platform-appropriate directory picker and adds to context
   */
  const handleAddProject = async () => {
    try {
      setAdding(true);
      setLocalError(null);

      console.log(`[${platform}] Adding new project...`);

      // Step 1: Show platform-appropriate directory picker
      const projectPath = await fileSystem.selectDirectory();

      if (!projectPath) {
        // User cancelled
        console.log(`[${platform}] User cancelled project selection`);
        setAdding(false);
        return;
      }

      // Step 2: Generate project ID and extract name
      const projectId = `project-${Date.now()}`;
      const projectName = extractProjectName(projectPath);

      console.log(`[${platform}] Selected project:`, { projectId, projectName, projectPath });

      // Step 3: For Web, save the directory handle BEFORE adding to context
      if (platform === 'web') {
        const { showDirectoryPicker } = await import('@/lib/coderef/local-access');
        const { saveDirectoryHandlePersistent } = await import('@/lib/coderef/persistence');

        const dirHandle = await showDirectoryPicker();
        if (dirHandle) {
          await saveDirectoryHandlePersistent(projectId, dirHandle);
          console.log('[Web] Directory handle saved to IndexedDB');
        }
      } else {
        console.log('[Electron] Path stored permanently:', projectPath);
      }

      // Step 4: Add project via context (optimistic update with rollback)
      await addProject({
        id: projectId,
        name: projectName,
        path: projectPath,
      });

      console.log(`[${platform}] Project added successfully`);
    } catch (err) {
      console.error(`[${platform}] Failed to add project:`, err);
      setLocalError((err as Error).message);
    } finally {
      setAdding(false);
    }
  };

  /**
   * Handle remove project
   * Shows confirmation and removes from context + persistence layer
   */
  const handleRemoveProject = async (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const confirmed = confirm(`Are you sure you want to remove "${project.name}"?`);
    if (!confirmed) return;

    try {
      console.log(`[${platform}] Removing project:`, projectId);

      // Platform-specific cleanup BEFORE removing from context
      if (platform === 'web') {
        try {
          const { deleteDirectoryHandle } = await import('@/lib/coderef/indexeddb');
          await deleteDirectoryHandle(projectId);
          console.log('[Web] Removed from IndexedDB');
        } catch (err) {
          console.log('[Web] No IndexedDB handle to remove:', err);
        }
      } else {
        console.log('[Electron] Path reference removed (no cleanup needed)');
      }

      // Remove via context (optimistic update with rollback)
      await removeProject(projectId);

      // Clear stale projects set
      setStaleProjects((prev) => {
        const next = new Set(prev);
        next.delete(projectId);
        return next;
      });
    } catch (err) {
      console.error(`[${platform}] Failed to remove project:`, err);
      setLocalError((err as Error).message);
    }
  };

  /**
   * Handle restore stale project
   * Re-authorizes access for Web or validates path for Electron
   */
  const handleRestoreProject = async (projectId: string) => {
    try {
      console.log(`[${platform}] Restoring project:`, projectId);

      if (platform === 'web') {
        // Web: Re-open directory picker to get fresh handle
        const { showDirectoryPicker } = await import('@/lib/coderef/local-access');
        const { saveDirectoryHandlePersistent } = await import('@/lib/coderef/persistence');

        const dirHandle = await showDirectoryPicker();
        if (dirHandle) {
          await saveDirectoryHandlePersistent(projectId, dirHandle);
          console.log('[Web] Directory handle restored');

          // Remove from stale set
          setStaleProjects((prev) => {
            const next = new Set(prev);
            next.delete(projectId);
            return next;
          });
        }
      } else {
        // Electron: Validate path again
        await checkForStaleHandles();
      }
    } catch (err) {
      console.error(`[${platform}] Failed to restore project:`, err);
      setLocalError((err as Error).message);
    }
  };

  /**
   * Check all projects for stale directory handles
   */
  const checkForStaleHandles = async () => {
    const stale = new Set<string>();
    const reasons = new Map<string, string>();

    console.log(`[${platform}] Checking ${projects.length} projects for validity...`);

    for (const project of projects) {
      try {
        let isValid = false;
        let reason: string | undefined;

        // Use platform abstraction for validation
        isValid = await fileSystem.isProjectValid(project.id, project.path);

        if (!isValid) {
          reason = platform === 'web' ? 'Re-authorization required' : 'Path no longer accessible';
        }

        if (!isValid) {
          console.log(`[${platform}] Project invalid:`, project.name);
          stale.add(project.id);
          if (reason) {
            reasons.set(project.id, reason);
          }
        } else {
          console.log(`[${platform}] Project valid:`, project.name);
        }
      } catch (error) {
        console.error(`[${platform}] Error checking project ${project.name}:`, error);
        stale.add(project.id);
        reasons.set(project.id, 'Validation error');
      }
    }

    console.log(`[${platform}] Found ${stale.size} stale projects`);
    setStaleProjects(stale);
    setStaleReasons(reasons);
  };

  // Show loading state
  if (isLoading && projects.length === 0) {
    return (
      <div className="bg-ind-panel border border-ind-border rounded-lg p-6">
        <div className="flex items-center justify-center gap-3 text-ind-text-muted">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading projects...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ind-panel border border-ind-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="border-b border-ind-border p-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm uppercase tracking-widest text-ind-text font-mono font-bold">
            Projects
          </h2>
          <p className="text-xs text-ind-text-muted mt-1">
            Manage registered projects for the dashboard
          </p>
        </div>
        <button
          onClick={handleAddProject}
          disabled={isLoading || adding}
          className="
            px-3 py-1.5 rounded flex items-center gap-2
            bg-ind-accent text-ind-panel text-sm font-medium
            hover:bg-ind-accent/90
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
          "
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-4 mt-4 p-3 rounded bg-red-500/10 border border-red-500/30 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-500">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {projects.length === 0 ? (
          <EmptyState onAddProject={handleAddProject} isAdding={adding} />
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isStale={staleProjects.has(project.id)}
                staleReason={staleReasons.get(project.id)}
                onRemove={handleRemoveProject}
                onRestore={handleRestoreProject}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {projects.length > 0 && (
        <div className="border-t border-ind-border p-3 bg-ind-bg">
          <p className="text-xs text-ind-text-muted">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} registered
            {staleProjects.size > 0 && (
              <span className="text-yellow-500">
                {' '}• {staleProjects.size} need{staleProjects.size === 1 ? 's' : ''} attention
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Extract project name from path
 * Web:      "[Directory: my-app]" → "my-app"
 * Electron: "C:/projects/my-app" → "my-app"
 */
function extractProjectName(projectPath: string): string {
  if (projectPath.startsWith('[Directory:')) {
    // Web format
    const match = projectPath.match(/\[Directory: (.+)\]/);
    return match ? match[1] : 'Unnamed Project';
  } else {
    // Electron format - get last path segment
    const parts = projectPath.replace(/\\/g, '/').split('/');
    return parts[parts.length - 1] || 'Unnamed Project';
  }
}
