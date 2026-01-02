'use client';

import { useState } from 'react';
import type { TreeNode, Project } from '@/lib/coderef/types';
import type { FavoritesData } from '@/lib/coderef/favorites-types';
import { ContextMenu } from './ContextMenu';
import {
  ChevronRight,
  ChevronDown,
  Star,
  Plus,
  Edit2,
  Trash2,
  Folder,
  FolderOpen,
  FolderTree,
  Check,
} from 'lucide-react';

interface FavoritesListProps {
  favoritesData: FavoritesData;
  selectedPath?: string;
  project?: Project | null;
  onFileClick: (node: TreeNode) => void;
  onCreateGroup?: (name: string) => void;
  onDeleteGroup?: (groupId: string) => void;
  onRenameGroup?: (groupId: string, newName: string) => void;
  onToggleFavorite?: (path: string) => void;
  onAssignToGroup?: (path: string, groupName?: string) => void;
  availableGroups?: { id: string; name: string }[];
}

export function FavoritesList({
  favoritesData,
  selectedPath,
  project,
  onFileClick,
  onCreateGroup,
  onDeleteGroup,
  onRenameGroup,
  onToggleFavorite,
  onAssignToGroup,
  availableGroups = [],
}: FavoritesListProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string } | null>(null);
  const [copiedPath, setCopiedPath] = useState(false);

  // Group favorites by group name
  const ungroupedFavorites = favoritesData.favorites.filter(f => !f.group);
  const groupedFavorites = favoritesData.groups.map(group => ({
    group,
    favorites: favoritesData.favorites.filter(f => f.group === group.name),
  }));

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim() && onCreateGroup) {
      onCreateGroup(newGroupName.trim());
      setNewGroupName('');
      setCreatingGroup(false);
    }
  };

  const handleRenameGroup = (groupId: string) => {
    if (editingGroupName.trim() && onRenameGroup) {
      onRenameGroup(groupId, editingGroupName.trim());
      setEditingGroupId(null);
      setEditingGroupName('');
    }
  };

  const handleFileClick = (path: string) => {
    // Create a synthetic TreeNode for the file
    const node: TreeNode = {
      name: path.split('/').pop() || path,
      path,
      type: 'file',
      extension: '.' + (path.split('.').pop() || ''),
    };
    onFileClick(node);
  };

  const handleContextMenu = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, path });
  };

  const handleRemoveFavorite = () => {
    if (contextMenu && onToggleFavorite) {
      onToggleFavorite(contextMenu.path);
    }
  };

  const handleReassignToGroup = (groupName?: string) => {
    if (contextMenu && onAssignToGroup) {
      onAssignToGroup(contextMenu.path, groupName);
    }
  };

  const handleCopyPath = async () => {
    if (!contextMenu || !project) return;

    try {
      // Clean project path - remove [Directory: ...] wrapper if present
      let projectPath = project.path;
      if (projectPath.startsWith('[Directory: ') && projectPath.endsWith(']')) {
        projectPath = projectPath.slice(12, -1); // Remove '[Directory: ' and ']'
      }

      // Construct full path
      const fullPath = `${projectPath}/${contextMenu.path}`;
      await navigator.clipboard.writeText(fullPath);

      // Show feedback
      setCopiedPath(true);
      setTimeout(() => setCopiedPath(false), 2000);

      // Close context menu
      setContextMenu(null);
    } catch (error) {
      console.error('Failed to copy path:', error);
      alert('Failed to copy path to clipboard');
    }
  };

  if (favoritesData.favorites.length === 0) {
    return (
      <div className="p-4 text-center">
        <Star className="w-12 h-12 mx-auto mb-3 text-ind-text-muted opacity-50" />
        <p className="text-sm text-ind-text-muted">No favorites yet</p>
        <p className="text-xs text-ind-text-muted mt-1">
          Right-click any file and select "Add to Favorites"
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Group management header */}
      <div className="p-3 border-b border-ind-border bg-ind-panel/30">
        {!creatingGroup ? (
          <button
            onClick={() => setCreatingGroup(true)}
            className="flex items-center gap-2 text-xs text-ind-accent hover:text-ind-accent-hover transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Group</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateGroup();
                if (e.key === 'Escape') {
                  setCreatingGroup(false);
                  setNewGroupName('');
                }
              }}
              placeholder="Group name..."
              className="flex-1 px-2 py-1 text-xs bg-ind-bg border border-ind-border rounded text-ind-text focus:outline-none focus:border-ind-accent"
              autoFocus
            />
            <button
              onClick={handleCreateGroup}
              className="px-2 py-1 text-xs bg-ind-accent text-black rounded hover:bg-ind-accent-hover"
            >
              Create
            </button>
            <button
              onClick={() => {
                setCreatingGroup(false);
                setNewGroupName('');
              }}
              className="px-2 py-1 text-xs text-ind-text-muted hover:text-ind-text"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Favorites list */}
      <div className="flex-1 overflow-y-auto">
        {/* Grouped favorites */}
        {groupedFavorites.map(({ group, favorites }) => (
          <div key={group.id}>
            {/* Group header */}
            <div
              className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-ind-bg/50 transition-colors border-b border-ind-border/50"
              onClick={() => toggleGroup(group.name)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  {expandedGroups.has(group.name) ? (
                    <ChevronDown className="w-3.5 h-3.5 text-ind-text-muted" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-ind-text-muted" />
                  )}
                </div>
                {expandedGroups.has(group.name) ? (
                  <FolderOpen className="w-4 h-4 text-ind-accent flex-shrink-0" />
                ) : (
                  <Folder className="w-4 h-4 text-ind-text-muted flex-shrink-0" />
                )}
                {editingGroupId === group.id ? (
                  <input
                    type="text"
                    value={editingGroupName}
                    onChange={(e) => setEditingGroupName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameGroup(group.id);
                      if (e.key === 'Escape') {
                        setEditingGroupId(null);
                        setEditingGroupName('');
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 px-2 py-0.5 text-sm bg-ind-bg border border-ind-border rounded text-ind-text focus:outline-none focus:border-ind-accent"
                    autoFocus
                  />
                ) : (
                  <span className="text-sm font-medium text-ind-text truncate">
                    {group.name}
                  </span>
                )}
                <span className="text-xs text-ind-text-muted">({favorites.length})</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => {
                    setEditingGroupId(group.id);
                    setEditingGroupName(group.name);
                  }}
                  className="p-1 hover:bg-ind-bg rounded transition-colors"
                  title="Rename group"
                >
                  <Edit2 className="w-3 h-3 text-ind-text-muted hover:text-ind-text" />
                </button>
                <button
                  onClick={() => onDeleteGroup && onDeleteGroup(group.id)}
                  className="p-1 hover:bg-ind-bg rounded transition-colors"
                  title="Delete group"
                >
                  <Trash2 className="w-3 h-3 text-ind-text-muted hover:text-red-500" />
                </button>
              </div>
            </div>

            {/* Group files */}
            {expandedGroups.has(group.name) && (
              <div>
                {favorites.map((fav) => (
                  <div
                    key={fav.path}
                    onClick={() => handleFileClick(fav.path)}
                    onContextMenu={(e) => handleContextMenu(e, fav.path)}
                    className={`
                      flex items-center gap-2 py-1.5 px-2 pl-12 cursor-pointer
                      transition-colors duration-150
                      ${
                        selectedPath === fav.path
                          ? 'bg-ind-accent/20 text-ind-accent font-medium'
                          : 'text-ind-text hover:bg-ind-bg/50'
                      }
                    `}
                  >
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                    <span className="text-sm truncate">{fav.path.split('/').pop()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Ungrouped favorites */}
        {ungroupedFavorites.length > 0 && (
          <div>
            <div className="px-3 py-2 text-xs uppercase tracking-widest text-ind-text-muted font-mono border-b border-ind-border/50">
              Ungrouped
            </div>
            {ungroupedFavorites.map((fav) => (
              <div
                key={fav.path}
                onClick={() => handleFileClick(fav.path)}
                onContextMenu={(e) => handleContextMenu(e, fav.path)}
                className={`
                  flex items-center gap-2 py-1.5 px-2 pl-8 cursor-pointer
                  transition-colors duration-150
                  ${
                    selectedPath === fav.path
                      ? 'bg-ind-accent/20 text-ind-accent font-medium'
                      : 'text-ind-text hover:bg-ind-bg/50'
                  }
                `}
              >
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                <span className="text-sm truncate">{fav.path.split('/').pop()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={[
            {
              label: 'Remove from Favorites',
              icon: Star,
              onClick: handleRemoveFavorite,
              iconClassName: 'fill-yellow-400 text-yellow-400',
            },
            {
              label: 'Reassign to Group',
              icon: Folder,
              submenu: [
                {
                  label: 'Ungrouped',
                  icon: Star,
                  onClick: () => handleReassignToGroup(undefined),
                  iconClassName: '',
                },
                ...availableGroups.map((group) => ({
                  label: group.name,
                  icon: Folder,
                  onClick: () => handleReassignToGroup(group.name),
                  iconClassName: '',
                })),
              ],
            },
            // Copy Path - works for both files and directories
            ...(project
              ? [
                  {
                    label: 'Copy Path',
                    icon: copiedPath ? Check : FolderTree,
                    onClick: handleCopyPath,
                    iconClassName: copiedPath ? 'text-green-500' : '',
                  },
                ]
              : []),
          ]}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

export default FavoritesList;
