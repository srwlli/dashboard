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
interface ProjectSelection {
  scan: boolean;
  populate: boolean;
}

interface ProjectListCardProps {
  onSelectionChange?: (selections: Map<string, ProjectSelection>) => void;
  onProjectsChange?: () => void;
  onProjectsLoad?: (projects: ScannerProject[]) => void;
}

export function ProjectListCard({ onSelectionChange, onProjectsChange, onProjectsLoad }: ProjectListCardProps) {
  const [projects, setProjects] = useState<ScannerProject[]>([]);
  const [selections, setSelections] = useState<Map<string, ProjectSelection>>(new Map());
  const [loading, setLoading] = useState(true);

  // Load projects from API
  useEffect(() => {
    loadProjects();
  }, []);

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(selections);
  }, [selections, onSelectionChange]);

  // Notify parent when projects load
  useEffect(() => {
    onProjectsLoad?.(projects);
  }, [projects, onProjectsLoad]);

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
        setSelections((prev) => {
          const newSelections = new Map(prev);
          newSelections.delete(id);
          return newSelections;
        });
        onProjectsChange?.();
      }
    } catch (error) {
      console.error('Failed to remove project:', error);
    }
  }

  function handleScanCheckboxChange(id: string, checked: boolean) {
    setSelections((prev) => {
      const newSelections = new Map(prev);
      const current = newSelections.get(id) || { scan: false, populate: false };
      newSelections.set(id, { ...current, scan: checked });
      return newSelections;
    });
  }

  function handlePopulateCheckboxChange(id: string, checked: boolean) {
    setSelections((prev) => {
      const newSelections = new Map(prev);
      const current = newSelections.get(id) || { scan: false, populate: false };
      newSelections.set(id, { ...current, populate: checked });
      return newSelections;
    });
  }

  if (loading) {
    return (
      <div className="bg-ind-panel border-2 border-ind-border h-full flex items-center justify-center">
        <p className="text-ind-text-muted">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="bg-ind-panel border-2 border-ind-border h-full flex flex-col">
      {/* Header */}
      <div className="border-b-2 border-ind-border p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ind-text">
            Saved Projects
          </h2>
          <p className="text-sm text-ind-text-muted mt-1">
            Select projects to include in scan
          </p>
        </div>
        <button
          onClick={handleAddPath}
          className="px-4 py-2 bg-ind-accent hover:bg-ind-accent-hover text-black text-sm font-bold uppercase tracking-wider transition-colors active:translate-y-0.5 flex-shrink-0"
        >
          Add Path
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-4">
            <div className="w-16 h-16 bg-ind-bg border-2 border-ind-border flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-ind-text-muted"
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
            <h3 className="text-lg font-medium text-ind-text mb-2">
              No Projects Configured
            </h3>
            <p className="text-sm text-ind-text-muted max-w-sm">
              Add project paths to include in the scan
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map((project) => {
              const selection = selections.get(project.id) || { scan: false, populate: false };

              return (
                <div
                  key={project.id}
                  className="flex items-center gap-3 p-3 bg-ind-bg border border-ind-border hover:border-ind-accent transition-colors group"
                >
                  {/* Scan Checkbox */}
                  <div className="flex flex-col items-center gap-1">
                    <input
                      type="checkbox"
                      checked={selection.scan}
                      onChange={(e) => handleScanCheckboxChange(project.id, e.target.checked)}
                      className="w-4 h-4 border-ind-border text-ind-accent focus:ring-2 focus:ring-ind-accent/50"
                      title="Scan"
                    />
                    <span className="text-[10px] text-ind-text-muted">Scan</span>
                  </div>

                  {/* Populate Checkbox */}
                  <div className="flex flex-col items-center gap-1">
                    <input
                      type="checkbox"
                      checked={selection.populate}
                      onChange={(e) => handlePopulateCheckboxChange(project.id, e.target.checked)}
                      className="w-4 h-4 border-ind-border text-ind-accent focus:ring-2 focus:ring-ind-accent/50"
                      title="Populate"
                    />
                    <span className="text-[10px] text-ind-text-muted">Populate</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ind-text">
                      {project.name}
                    </p>
                    <p className="text-xs text-ind-text-muted truncate">
                      {project.path}
                    </p>
                  </div>
                <button
                  onClick={() => handleRemove(project.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-ind-border transition-all"
                  title="Remove project"
                >
                  <svg
                    className="w-4 h-4 text-ind-text-muted"
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
            );
            })}
          </div>
        )}
      </div>

      {/* Footer Tip */}
      <div className="border-t-2 border-ind-border p-4 bg-ind-bg">
        <p className="text-xs text-ind-text-muted">
          💡 <span className="font-medium">Tip:</span> Projects are saved
          across sessions
        </p>
      </div>
    </div>
  );
}
