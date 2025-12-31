'use client';

import { useState, useEffect } from 'react';
import { CodeRefApi } from '@/lib/coderef/api-access';
import type { Project } from '@/lib/coderef/types';
import { fileSystem, platform } from '@/lib/coderef/platform';
import { Folder, Plus, Trash2, AlertCircle } from 'lucide-react';
import { ContextMenu } from './ContextMenu';
import { BatchRestoreUI } from './BatchRestoreUI';

interface ProjectSelectorProps {
  /** Currently selected project ID */
  selectedProjectId?: string;

  /** Callback when project selection changes */
  onProjectChange: (project: Project | null) => void;

  /** Initial project ID to auto-select on first load (for persistence) */
  initialProjectId?: string;

  /** Optional custom class name */
  className?: string;
}

export function ProjectSelector({
  selectedProjectId,
  onProjectChange,
  initialProjectId,
  className = '',
}: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [staleProjects, setStaleProjects] = useState<Set<string>>(new Set());
  const [hasRestoredInitial, setHasRestoredInitial] = useState(false);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Auto-select initial project after projects load (for persistence restoration)
  useEffect(() => {
    if (!hasRestoredInitial && !loading && projects.length > 0 && initialProjectId) {
      console.log('[ProjectSelector] Attempting to restore project:', initialProjectId);
      const projectToRestore = projects.find((p) => p.id === initialProjectId);
      if (projectToRestore) {
        console.log('[ProjectSelector] Found project to restore:', projectToRestore.name);
        onProjectChange(projectToRestore);
      } else {
        console.log('[ProjectSelector] Project not found in list:', initialProjectId);
      }
      setHasRestoredInitial(true);
    }
  }, [projects, loading, initialProjectId, hasRestoredInitial, onProjectChange]);

  // Initialize persistence layer on mount - attempt silent restoration
  useEffect(() => {
    if (projects.length === 0) return;

    const initPersistence = async () => {
      try {
        console.log(`[${platform}] Initializing persistence for ${projects.length} projects...`);

        // Platform-specific persistence initialization
        if (platform === 'web') {
          const { initializePersistence } = await import('@/lib/coderef/persistence');
          const needsReauth = await initializePersistence(projects);

          // Update stale projects with those that need re-authorization
          if (needsReauth.length > 0) {
            console.log(`[Web] ${needsReauth.length} projects need re-authorization`);
            setStaleProjects(new Set(needsReauth));
          }
        } else {
          console.log('[Electron] No persistence initialization needed (direct fs access)');
        }
      } catch (error) {
        console.error(`[${platform}] Persistence initialization failed:`, error);
      }
    };

    initPersistence();
  }, [projects]);

  // Check for stale directory handles when projects load (fallback detection)
  useEffect(() => {
    checkForStaleHandles();
  }, [projects]);

  // Notify parent when selected project changes
  useEffect(() => {
    if (selectedProjectId) {
      const project = projects.find((p) => p.id === selectedProjectId);
      onProjectChange(project || null);
    } else {
      onProjectChange(null);
    }
  }, [selectedProjectId, projects]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await CodeRefApi.projects.list();
      setProjects(response.projects);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async () => {
    try {
      setAdding(true);
      setError(null);

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

      // Step 3: Register project with API
      // ProjectPath format depends on platform:
      //   Web:      "[Directory: folder-name]"
      //   Electron: "C:/absolute/path/to/folder"
      await CodeRefApi.projects.create({
        id: projectId,
        name: projectName,
        path: projectPath, // Works for both platforms!
      });

      console.log(`[${platform}] Project registered successfully`);

      // Step 4: For Web, save the directory handle
      if (platform === 'web') {
        // Re-open picker to get handle (workaround for abstraction layer)
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

      // Step 5: Select the new project immediately
      const newProject: Project = {
        id: projectId,
        name: projectName,
        path: projectPath,
        addedAt: new Date().toISOString(),
      };
      onProjectChange(newProject);

      // Step 6: Reload projects list to refresh UI
      await loadProjects();
    } catch (err) {
      console.error(`[${platform}] Failed to add project:`, err);
      setError((err as Error).message);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveProject = async () => {
    if (!selectedProjectId) return;

    const confirmed = confirm('Are you sure you want to remove this project?');
    if (!confirmed) return;

    try {
      console.log(`[${platform}] Removing project:`, selectedProjectId);

      // Remove from API
      await CodeRefApi.projects.remove(selectedProjectId);

      // Platform-specific cleanup
      if (platform === 'web') {
        // Remove from IndexedDB (if it exists)
        try {
          const { deleteDirectoryHandle } = await import('@/lib/coderef/indexeddb');
          await deleteDirectoryHandle(selectedProjectId);
          console.log('[Web] Removed from IndexedDB');
        } catch (err) {
          // IndexedDB handle might not exist, that's okay
          console.log('[Web] No IndexedDB handle to remove:', err);
        }
      } else {
        console.log('[Electron] Path reference removed (no cleanup needed)');
      }

      await loadProjects();
      onProjectChange(null);
    } catch (err) {
      console.error(`[${platform}] Failed to remove project:`, err);
      setError((err as Error).message);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = e.target.value;
    const project = projects.find((p) => p.id === projectId);
    onProjectChange(project || null);
  };

  /**
   * Check all projects for stale directory handles
   */
  const checkForStaleHandles = async () => {
    const stale = new Set<string>();

    console.log(`[${platform}] Checking ${projects.length} projects for validity...`);

    for (const project of projects) {
      try {
        // Use platform abstraction to check validity
        const isValid = await fileSystem.isProjectValid(project.id, project.path);

        if (!isValid) {
          console.log(`[${platform}] Project invalid:`, project.name);
          stale.add(project.id);
        } else {
          console.log(`[${platform}] Project valid:`, project.name);
        }
      } catch (error) {
        console.error(`[${platform}] Error checking project ${project.name}:`, error);
        stale.add(project.id);
      }
    }

    console.log(`[${platform}] Found ${stale.size} stale projects`);
    setStaleProjects(stale);
  };

  /**
   * Handle project restore from BatchRestoreUI
   */
  const handleProjectRestore = (projectId: string) => {
    setStaleProjects((prev) => {
      const next = new Set(prev);
      next.delete(projectId);
      return next;
    });

    // Trigger recheck to update UI
    checkForStaleHandles();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!selectedProjectId) return; // Only show context menu if a project is selected
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-1.5">
        <div className="flex-1 relative min-w-0">
          <select
            value={selectedProjectId || ''}
            onChange={handleSelectChange}
            onContextMenu={handleContextMenu}
            disabled={loading || projects.length === 0}
            className="
              w-full px-2 py-1.5 pl-7 pr-6 rounded text-sm
              bg-ind-bg border border-ind-border
              text-ind-text
              focus:outline-none focus:border-ind-accent focus:ring-1 focus:ring-ind-accent/30
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
              appearance-none
              truncate
            "
          >
            <option value="">
              {loading ? 'Loading...' : projects.length === 0 ? 'No projects' : 'Select'}
            </option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <Folder className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ind-text-muted pointer-events-none" />
        </div>

        <button
          onClick={handleAddProject}
          disabled={loading || adding}
          className="
            p-1.5 rounded flex-shrink-0
            bg-ind-accent text-ind-panel
            hover:bg-ind-accent/90
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
            flex items-center justify-center
          "
          title="Browse folder to add project"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-1.5 p-2 rounded bg-red-500/10 border border-red-500/30">
          <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-red-500">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Batch restore UI for stale projects */}
      <BatchRestoreUI
        staleProjects={staleProjects}
        projects={projects}
        onRestore={handleProjectRestore}
      />

      {/* Directory path display removed - cleaner UI */}

      {/* Context menu */}
      {contextMenu && selectedProjectId && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={[
            {
              label: 'Remove Project',
              icon: Trash2,
              onClick: handleRemoveProject,
              textClassName: 'text-red-500',
              iconClassName: 'text-red-500',
            },
          ]}
          onClose={() => setContextMenu(null)}
        />
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

export default ProjectSelector;
