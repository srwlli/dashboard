'use client';

import { useState, useEffect } from 'react';
import type { Project, TreeNode, AccessMode } from '@/lib/coderef/types';
import type { FavoritesData } from '@/lib/coderef/favorites-types';
import { loadProjectTree } from '@/lib/coderef/hybrid-router';
import { FileTreeNode } from './FileTreeNode';
import { FavoritesList } from './FavoritesList';
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

  /** Optional filter to show only a specific subfolder (e.g., 'coderef') */
  filterPath?: string;

  /** Callback to toggle favorite status */
  onToggleFavorite?: (path: string, groupName?: string) => void;

  /** Function to check if a path is favorited */
  isFavorite?: (path: string) => boolean;

  /** Show only favorited items */
  showOnlyFavorites?: boolean;

  /** Favorites data with groups */
  favoritesData?: FavoritesData;

  /** Callback to create a new group */
  onCreateGroup?: (name: string, color?: string) => void;

  /** Callback to delete a group */
  onDeleteGroup?: (groupId: string) => void;

  /** Callback to rename a group */
  onRenameGroup?: (groupId: string, newName: string) => void;

  /** Callback to assign a file to a group */
  onAssignToGroup?: (path: string, groupName?: string) => void;

  /** Optional custom class name */
  className?: string;
}

export function FileTree({
  project,
  customTree,
  selectedPath,
  onFileClick,
  loading: externalLoading,
  filterPath,
  onToggleFavorite,
  isFavorite,
  showOnlyFavorites = false,
  favoritesData,
  onCreateGroup,
  onDeleteGroup,
  onRenameGroup,
  onAssignToGroup,
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

  // Filter tree to show only a specific subfolder
  const filterTreeToFolder = (nodes: TreeNode[], folderName: string): TreeNode[] => {
    for (const node of nodes) {
      if (node.type === 'directory' && node.name === folderName) {
        // Return the children of the matching folder
        return node.children || [];
      }
      // Recursively search in children
      if (node.children) {
        const found = filterTreeToFolder(node.children, folderName);
        if (found.length > 0) return found;
      }
    }
    return [];
  };

  // Filter tree to show only favorited items
  const filterTreeToFavorites = (nodes: TreeNode[]): TreeNode[] => {
    if (!isFavorite) return nodes;

    const filtered: TreeNode[] = [];

    for (const node of nodes) {
      const nodeFavorited = isFavorite(node.path);
      const childrenFiltered = node.children ? filterTreeToFavorites(node.children) : [];

      // Include node if it's favorited OR if any of its children are favorited
      if (nodeFavorited || childrenFiltered.length > 0) {
        filtered.push({
          ...node,
          children: childrenFiltered.length > 0 ? childrenFiltered : node.children,
        });
      }
    }

    return filtered;
  };

  // Apply filters
  let displayTree = tree;

  // First apply folder filter if specified
  if (filterPath) {
    displayTree = filterTreeToFolder(displayTree, filterPath);
  }

  // Then apply favorites filter if specified
  if (showOnlyFavorites) {
    displayTree = filterTreeToFavorites(displayTree);
  }

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

  // Show FavoritesList when in favorites mode
  if (showOnlyFavorites && favoritesData) {
    return (
      <div className={className}>
        <FavoritesList
          favoritesData={favoritesData}
          selectedPath={selectedPath}
          onFileClick={onFileClick}
          onCreateGroup={onCreateGroup}
          onDeleteGroup={onDeleteGroup}
          onRenameGroup={onRenameGroup}
          onToggleFavorite={onToggleFavorite}
          onAssignToGroup={onAssignToGroup}
          availableGroups={favoritesData.groups}
        />
      </div>
    );
  }

  if (displayTree.length === 0) {
    return (
      <div className={`p-4 text-center ${className}`}>
        <FolderOpen className="w-12 h-12 mx-auto mb-3 text-ind-text-muted opacity-50" />
        <p className="text-sm text-ind-text-muted">
          {filterPath ? `No ${filterPath}/ folder found in this project` : 'No files found in this project'}
        </p>
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
        {displayTree.map((node) => (
          <FileTreeNode
            key={node.path}
            node={node}
            project={project}
            depth={0}
            selectedPath={selectedPath}
            onFileClick={onFileClick}
            onToggleFavorite={onToggleFavorite}
            isFavorite={isFavorite}
            availableGroups={favoritesData?.groups || []}
            onAssignToGroup={onAssignToGroup}
          />
        ))}
      </div>
    </div>
  );
}

export default FileTree;
