'use client';

import { useState, useEffect } from 'react';
import type { Project, TreeNode, AccessMode } from '@/lib/coderef/types';
import { loadProjectTree } from '@/lib/coderef/hybrid-router';
import { FileTreeNode } from './FileTreeNode';
import { Loader2, AlertCircle, FolderOpen, Zap, Cloud } from 'lucide-react';

interface FileTreeProps {
  /** Project to load tree from */
  project: Project | null;

  /** Optional custom tree (for CodeRef mode) - bypasses project loading */
  customTree?: TreeNode[];

  /** Currently selected file path */
  selectedPath?: string;

  /** Callback when a file is clicked */
  onFileClick: (node: TreeNode) => void;

  /** Optional loading state (for CodeRef mode) */
  loading?: boolean;

  /** Optional custom class name */
  className?: string;
}

export function FileTree({
  project,
  customTree,
  selectedPath,
  onFileClick,
  loading: externalLoading,
  className = '',
}: FileTreeProps) {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessMode, setAccessMode] = useState<AccessMode | null>(null);

  // Use custom tree if provided (CodeRef mode)
  useEffect(() => {
    if (customTree) {
      setTree(customTree);
      setError(null);
      setAccessMode(null);
    }
  }, [customTree]);

  // Load tree when project changes (Projects mode)
  useEffect(() => {
    if (project && !customTree) {
      loadTree(project);
    } else if (!project && !customTree) {
      setTree([]);
      setError(null);
      setAccessMode(null);
    }
  }, [project?.id, customTree]);

  const loadTree = async (proj: Project) => {
    try {
      setLoading(true);
      setError(null);
      const result = await loadProjectTree(proj);
      setTree(result.data);
      setAccessMode(result.mode);
    } catch (err) {
      setError((err as Error).message);
      setTree([]);
      setAccessMode(null);
    } finally {
      setLoading(false);
    }
  };

  if (!project && !customTree) {
    return (
      <div className={`p-4 text-center ${className}`}>
        <FolderOpen className="w-12 h-12 mx-auto mb-3 text-ind-text-muted opacity-50" />
        <p className="text-sm text-ind-text-muted">
          {customTree !== undefined ? 'No projects registered' : 'Select a project to browse files'}
        </p>
      </div>
    );
  }

  const isLoading = externalLoading !== undefined ? externalLoading : loading;

  if (isLoading) {
    return (
      <div className={`p-4 text-center ${className}`}>
        <Loader2 className="w-8 h-8 mx-auto mb-2 text-ind-accent animate-spin" />
        <p className="text-sm text-ind-text-muted">Loading file tree...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="flex items-start gap-2 p-3 rounded bg-red-500/10 border border-red-500/30">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-500">
            <strong>Error loading tree:</strong>
            <div className="mt-1">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className={`p-4 text-center ${className}`}>
        <FolderOpen className="w-12 h-12 mx-auto mb-3 text-ind-text-muted opacity-50" />
        <p className="text-sm text-ind-text-muted">No files found in this project</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Access mode indicator */}
      {accessMode && (
        <div className="px-3 py-2 border-b border-ind-border bg-ind-panel/30">
          <div className="flex items-center gap-2 text-xs text-ind-text-muted">
            {accessMode === 'local' ? (
              <>
                <Zap className="w-3.5 h-3.5 text-green-500" />
                <span>Local Mode (Fast)</span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 text-blue-500" />
                <span>API Mode</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* File tree */}
      <div className="overflow-y-auto">
        {tree.map((node) => (
          <FileTreeNode
            key={node.path}
            node={node}
            depth={0}
            selectedPath={selectedPath}
            onFileClick={onFileClick}
          />
        ))}
      </div>
    </div>
  );
}

export default FileTree;
