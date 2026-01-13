'use client';

import { useState, useEffect } from 'react';
import { useProjects } from '@/contexts/ProjectsContext';
import Link from 'next/link';
import { Settings } from 'lucide-react';

/**
 * ProjectListCard Component
 * Left panel - saved projects list with checkboxes
 * Shows empty state when no projects configured
 * Consumes projects from ProjectsContext (managed in Settings)
 */
interface ProjectSelection {
  directories: boolean;
  scan: boolean;
  populate: boolean;
}

interface ProjectListCardProps {
  onSelectionChange?: (selections: Map<string, ProjectSelection>) => void;
}

export function ProjectListCard({ onSelectionChange }: ProjectListCardProps) {
  const { projects, isLoading, error } = useProjects();
  const [selections, setSelections] = useState<Map<string, ProjectSelection>>(new Map());

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(selections);
  }, [selections, onSelectionChange]);

  function handleDirectoriesCheckboxChange(id: string, checked: boolean) {
    setSelections((prev) => {
      const newSelections = new Map(prev);
      const current = newSelections.get(id) || { directories: false, scan: false, populate: false };
      newSelections.set(id, { ...current, directories: checked });
      console.log('[ProjectListCard] Directories checkbox changed:', id, checked, newSelections);
      return newSelections;
    });
  }

  function handleScanCheckboxChange(id: string, checked: boolean) {
    setSelections((prev) => {
      const newSelections = new Map(prev);
      const current = newSelections.get(id) || { directories: false, scan: false, populate: false };
      newSelections.set(id, { ...current, scan: checked });
      return newSelections;
    });
  }

  function handlePopulateCheckboxChange(id: string, checked: boolean) {
    setSelections((prev) => {
      const newSelections = new Map(prev);
      const current = newSelections.get(id) || { directories: false, scan: false, populate: false };
      newSelections.set(id, { ...current, populate: checked });
      return newSelections;
    });
  }

  if (isLoading) {
    return (
      <div className="bg-ind-panel border-2 border-ind-border h-full flex items-center justify-center">
        <p className="text-ind-text-muted">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="bg-ind-panel border-2 border-ind-border h-full flex flex-col">
      {/* Header */}
      <div className="border-b-2 border-ind-border p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-ind-text">
            Saved Projects
          </h2>
          <Link
            href="/settings"
            className="px-3 py-1.5 bg-ind-bg border border-ind-border hover:border-ind-accent text-ind-text text-xs font-medium uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <Settings className="w-3.5 h-3.5" />
            Manage in Settings
          </Link>
        </div>
        <p className="text-sm text-ind-text-muted">
          Select projects to include in scan
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-4 mt-4 p-3 rounded bg-red-500/10 border border-red-500/30 text-sm text-red-500">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-4">
            <div className="w-16 h-16 bg-ind-bg border-2 border-ind-border flex items-center justify-center mb-4">
              <Settings className="w-8 h-8 text-ind-text-muted" />
            </div>
            <h3 className="text-lg font-medium text-ind-text mb-2">
              No Projects Configured
            </h3>
            <p className="text-sm text-ind-text-muted max-w-sm mb-4">
              Add projects in Settings to start scanning your codebase
            </p>
            <Link
              href="/settings"
              className="px-4 py-2 bg-ind-accent hover:bg-ind-accent/90 text-ind-panel text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Go to Settings
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map((project) => {
              const selection = selections.get(project.id) || { directories: false, scan: false, populate: false };

              return (
                <div
                  key={project.id}
                  className="flex items-center gap-3 p-3 bg-ind-bg border border-ind-border hover:border-ind-accent transition-colors group"
                >
                  {/* Directories Checkbox */}
                  <div className="flex flex-col items-center gap-1">
                    <input
                      type="checkbox"
                      checked={selection.directories}
                      onChange={(e) => handleDirectoriesCheckboxChange(project.id, e.target.checked)}
                      className="w-4 h-4 border-ind-border text-ind-accent focus:ring-2 focus:ring-ind-accent/50"
                      title="Directories"
                    />
                    <span className="text-[10px] text-ind-text-muted">Directories</span>
                  </div>

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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Tip */}
      <div className="border-t-2 border-ind-border p-4 bg-ind-bg">
        <p className="text-xs text-ind-text-muted">
          💡 <span className="font-medium">Tip:</span> Manage projects in Settings to add or remove
        </p>
      </div>
    </div>
  );
}
