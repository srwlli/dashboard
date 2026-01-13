'use client';

import { Folder, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import type { CodeRefProject } from '@/app/api/coderef/projects/route';

interface ProjectCardProps {
  /** Project to display */
  project: CodeRefProject;

  /** Whether project is stale (needs re-authorization) */
  isStale: boolean;

  /** Optional reason for staleness */
  staleReason?: string;

  /** Callback when remove button clicked */
  onRemove: (projectId: string) => void;

  /** Callback when restore button clicked */
  onRestore: (projectId: string) => void;
}

/**
 * ProjectCard Component
 *
 * Displays a single project with:
 * - Project name and path
 * - Added date
 * - Stale status indicator
 * - Remove button
 * - Restore button (for stale projects)
 */
export function ProjectCard({
  project,
  isStale,
  staleReason,
  onRemove,
  onRestore,
}: ProjectCardProps) {
  const addedDate = new Date(project.addedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      className={`
        border rounded-lg p-4 transition-all
        ${
          isStale
            ? 'border-yellow-500/50 bg-yellow-500/5'
            : 'border-ind-border bg-ind-bg hover:border-ind-accent/50'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`
          mt-1 flex-shrink-0
          ${isStale ? 'text-yellow-500' : 'text-ind-accent'}
        `}
        >
          <Folder className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Project name */}
          <h3 className="text-sm font-bold text-ind-text mb-1">{project.name}</h3>

          {/* Project path */}
          <p className="text-xs text-ind-text-muted font-mono truncate mb-2">{project.path}</p>

          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs text-ind-text-muted">
            <span>Added {addedDate}</span>
            {isStale && (
              <>
                <span>•</span>
                <span className="text-yellow-500 font-medium">Needs Attention</span>
              </>
            )}
          </div>

          {/* Stale reason */}
          {isStale && staleReason && (
            <div className="mt-2 flex items-start gap-1.5 p-2 rounded bg-yellow-500/10 border border-yellow-500/30">
              <AlertCircle className="w-3.5 h-3.5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-500">{staleReason}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Restore button (stale only) */}
          {isStale && (
            <button
              onClick={() => onRestore(project.id)}
              className="
                p-1.5 rounded
                bg-yellow-500/10 text-yellow-500 border border-yellow-500/30
                hover:bg-yellow-500/20
                transition-colors duration-200
                flex items-center justify-center
              "
              title="Restore access to this project"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Remove button */}
          <button
            onClick={() => onRemove(project.id)}
            className="
              p-1.5 rounded
              bg-red-500/10 text-red-500 border border-red-500/30
              hover:bg-red-500/20
              transition-colors duration-200
              flex items-center justify-center
            "
            title="Remove this project"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
