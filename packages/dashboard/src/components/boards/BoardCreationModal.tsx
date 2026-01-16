'use client';

/**
 * BoardCreationModal Component
 *
 * Modal dialog for creating a new board
 * Allows optional linking to project or directory
 */

import { useState } from 'react';
import { X, Folder, Link as LinkIcon } from 'lucide-react';
import { useProjects } from '@/contexts/ProjectsContext';
import type { CreateBoardRequest } from '@/types/boards';

interface BoardCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBoardCreated?: (boardId: string) => void;
}

export function BoardCreationModal({
  isOpen,
  onClose,
  onBoardCreated,
}: BoardCreationModalProps) {
  const { projects } = useProjects();
  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState<string>('');
  const [linkedPath, setLinkedPath] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleCreate() {
    // Validation
    if (!name.trim()) {
      setError('Board name is required');
      return;
    }

    setError('');
    setCreating(true);

    try {
      const payload: CreateBoardRequest = {
        name: name.trim(),
      };

      // Add optional fields if provided
      if (projectId) {
        payload.projectId = projectId;
      }
      if (linkedPath.trim()) {
        payload.linkedPath = linkedPath.trim();
      }

      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        // Notify parent of new board
        if (onBoardCreated) {
          onBoardCreated(data.data.board.id);
        }

        // Reset form and close
        setName('');
        setProjectId('');
        setLinkedPath('');
        onClose();
      } else {
        setError(data.error?.message || 'Failed to create board');
      }
    } catch (err) {
      console.error('Failed to create board:', err);
      setError('Failed to create board. Please try again.');
    } finally {
      setCreating(false);
    }
  }

  function handleClose() {
    if (!creating) {
      setName('');
      setProjectId('');
      setLinkedPath('');
      setError('');
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-ind-panel border-2 border-ind-border shadow-xl max-w-lg w-full mx-4">
        {/* Header */}
        <div className="border-b-2 border-ind-border p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-ind-text">Create New Board</h2>
          <button
            onClick={handleClose}
            disabled={creating}
            className="p-1 hover:bg-ind-border transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-ind-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Board Name */}
          <div>
            <label
              htmlFor="board-name"
              className="block text-sm font-medium text-ind-text mb-2"
            >
              Board Name <span className="text-red-500">*</span>
            </label>
            <input
              id="board-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Project Board"
              disabled={creating}
              className="w-full px-3 py-2 bg-ind-bg border-2 border-ind-border text-ind-text placeholder:text-ind-text-muted focus:border-ind-accent outline-none transition-colors disabled:opacity-50"
            />
          </div>

          {/* Project Selector (Optional) */}
          <div>
            <label
              htmlFor="project-id"
              className="block text-sm font-medium text-ind-text mb-2 flex items-center gap-2"
            >
              <Folder className="w-4 h-4 text-ind-accent" />
              Link to Project <span className="text-xs text-ind-text-muted font-normal">(optional)</span>
            </label>
            <select
              id="project-id"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={creating}
              className="w-full px-3 py-2 bg-ind-bg border-2 border-ind-border text-ind-text focus:border-ind-accent outline-none transition-colors disabled:opacity-50"
            >
              <option value="">No project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-ind-text-muted mt-1">
              Associate this board with a project from your settings
            </p>
          </div>

          {/* Linked Path (Optional) */}
          <div>
            <label
              htmlFor="linked-path"
              className="block text-sm font-medium text-ind-text mb-2 flex items-center gap-2"
            >
              <LinkIcon className="w-4 h-4 text-blue-400" />
              Linked Directory <span className="text-xs text-ind-text-muted font-normal">(optional)</span>
            </label>
            <input
              id="linked-path"
              type="text"
              value={linkedPath}
              onChange={(e) => setLinkedPath(e.target.value)}
              placeholder="C:\path\to\directory"
              disabled={creating}
              className="w-full px-3 py-2 bg-ind-bg border-2 border-ind-border text-ind-text placeholder:text-ind-text-muted focus:border-ind-accent outline-none transition-colors disabled:opacity-50"
            />
            <p className="text-xs text-ind-text-muted mt-1">
              Link this board to a specific directory path
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-ind-border p-6">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={creating}
              className="px-4 py-2 text-sm font-medium text-ind-text-muted hover:bg-ind-border transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !name.trim()}
              className="px-6 py-2 text-sm font-medium bg-ind-accent hover:bg-ind-accent-hover text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? 'Creating...' : 'Create Board'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
