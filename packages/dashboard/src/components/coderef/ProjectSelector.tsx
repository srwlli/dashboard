'use client';

import { useState, useEffect } from 'react';
import { CodeRefApi } from '@/lib/coderef/api-access';
import type { Project } from '@/lib/coderef/types';
import { showDirectoryPicker } from '@/lib/coderef/local-access';
import { saveDirectoryHandle, deleteDirectoryHandle } from '@/lib/coderef/indexeddb';
import { isFileSystemAccessSupported } from '@/lib/coderef/permissions';
import { Folder, Plus, Trash2, AlertCircle } from 'lucide-react';

interface ProjectSelectorProps {
  /** Currently selected project ID */
  selectedProjectId?: string;

  /** Callback when project selection changes */
  onProjectChange: (project: Project | null) => void;

  /** Optional custom class name */
  className?: string;
}

export function ProjectSelector({
  selectedProjectId,
  onProjectChange,
  className = '',
}: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [adding, setAdding] = useState(false);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

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
    // Check if File System Access API is supported
    if (!isFileSystemAccessSupported()) {
      setError('File System Access API is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    try {
      setAdding(true);
      setError(null);

      // Step 1: Show directory picker
      const dirHandle = await showDirectoryPicker();

      if (!dirHandle) {
        // User cancelled
        setAdding(false);
        return;
      }

      // Step 2: Generate project ID and create project object
      const projectId = `project-${Date.now()}`;
      const projectName = dirHandle.name;
      const projectPath = `[Directory: ${dirHandle.name}]`;

      // Step 3: Store directory handle in IndexedDB
      await saveDirectoryHandle(projectId, dirHandle);

      // Step 4: Register project with API
      await CodeRefApi.projects.create({
        id: projectId,
        name: projectName,
        path: projectPath,
      });

      // Step 5: Reload projects and select the new one
      await loadProjects();

      // Auto-select the new project
      const newProject = projects.find((p) => p.id === projectId);
      if (newProject) {
        onProjectChange(newProject);
      }
    } catch (err) {
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
      setRemoving(true);

      // Remove from API
      await CodeRefApi.projects.remove(selectedProjectId);

      // Remove from IndexedDB (if it exists)
      try {
        await deleteDirectoryHandle(selectedProjectId);
      } catch (err) {
        // IndexedDB handle might not exist, that's okay
        console.log('No IndexedDB handle to remove:', err);
      }

      await loadProjects();
      onProjectChange(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRemoving(false);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = e.target.value;
    const project = projects.find((p) => p.id === projectId);
    onProjectChange(project || null);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <select
            value={selectedProjectId || ''}
            onChange={handleSelectChange}
            disabled={loading || projects.length === 0}
            className="
              w-full px-3 py-2 pl-9 rounded
              bg-ind-bg border border-ind-border
              text-ind-text
              focus:outline-none focus:border-ind-accent focus:ring-1 focus:ring-ind-accent/30
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
              appearance-none
            "
          >
            <option value="">
              {loading ? 'Loading...' : projects.length === 0 ? 'No projects' : 'Select a project'}
            </option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <Folder className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ind-text-muted pointer-events-none" />
        </div>

        <button
          onClick={handleAddProject}
          disabled={loading || adding}
          className="
            px-3 py-2 rounded
            bg-ind-accent text-ind-panel font-medium
            hover:bg-ind-accent/90
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
            flex items-center gap-2
          "
          title="Browse folder to add project"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{adding ? 'Adding...' : 'Add'}</span>
        </button>

        <button
          onClick={handleRemoveProject}
          disabled={!selectedProjectId || removing || loading}
          className="
            px-3 py-2 rounded
            bg-ind-bg text-ind-text-muted
            border border-ind-border
            hover:border-red-500/50 hover:text-red-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
            flex items-center gap-2
          "
          title="Remove project"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Remove</span>
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded bg-red-500/10 border border-red-500/30">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-500">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {selectedProjectId && (
        <div className="text-xs text-ind-text-muted">
          <strong>Path:</strong>{' '}
          <span className="font-mono">
            {projects.find((p) => p.id === selectedProjectId)?.path || 'N/A'}
          </span>
        </div>
      )}
    </div>
  );
}

export default ProjectSelector;
