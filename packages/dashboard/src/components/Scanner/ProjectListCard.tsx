'use client';

import { useState, useEffect } from 'react';

/**
 * Scanner project interface
 */
interface ScannerProject {
  id: string;
  name: string;
  path: string;
  addedAt: string;
}

/**
 * ProjectListCard Component
 * Left panel - saved projects list with checkboxes
 * Shows empty state when no projects configured
 */
interface ProjectListCardProps {
  onSelectionChange?: (selectedIds: string[]) => void;
  onProjectsChange?: () => void;
}

export function ProjectListCard({ onSelectionChange, onProjectsChange }: ProjectListCardProps) {
  const [projects, setProjects] = useState<ScannerProject[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load projects from API
  useEffect(() => {
    loadProjects();
  }, []);

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(selectedIds);
  }, [selectedIds, onSelectionChange]);

  async function loadProjects() {
    try {
      const response = await fetch('/api/scanner/projects');
      const data = await response.json();

      console.log('[ProjectListCard] API response:', data);

      if (data.success) {
        console.log('[ProjectListCard] Setting projects:', data.data.projects);
        setProjects(data.data.projects);
      } else {
        console.error('[ProjectListCard] API error:', data.error);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPath() {
    try {
      // Use Electron IPC to select directory
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        const selectedPath = await (window as any).electronAPI.fs.selectDirectory();

        if (selectedPath) {
          // Add project via API
          const response = await fetch('/api/scanner/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: selectedPath }),
          });

          const data = await response.json();

          if (data.success) {
            await loadProjects();
            onProjectsChange?.();
          } else {
            alert(`Failed to add project: ${data.error.message}`);
          }
        }
      } else {
        // Fallback for web browser (non-Electron)
        alert('Electron environment required for folder selection');
      }
    } catch (error) {
      console.error('Failed to add path:', error);
      alert('Failed to add project path');
    }
  }

  async function handleRemove(id: string) {
    if (!confirm('Remove this project from scanner?')) {
      return;
    }

    try {
      const response = await fetch(`/api/scanner/projects/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await loadProjects();
        setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
        onProjectsChange?.();
      }
    } catch (error) {
      console.error('Failed to remove project:', error);
    }
  }

  function handleCheckboxChange(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      if (checked) {
        return [...prev, id];
      } else {
        return prev.filter((selectedId) => selectedId !== id);
      }
    });
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 h-full flex items-center justify-center">
        <p className="text-neutral-600 dark:text-neutral-400">Loading projects...</p>
      </div>
    );
  }

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
            <button
              onClick={handleAddPath}
              className="px-4 py-2 bg-ind-accent-color hover:bg-ind-accent-hover text-white rounded-md text-sm font-medium transition-colors"
            >
              Add Path
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center gap-3 p-3 rounded-md bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(project.id)}
                  onChange={(e) => handleCheckboxChange(project.id, e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-ind-accent-color focus:ring-2 focus:ring-ind-accent-color/50"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {project.name}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                    {project.path}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(project.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-all"
                  title="Remove project"
                >
                  <svg
                    className="w-4 h-4 text-neutral-600 dark:text-neutral-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
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
