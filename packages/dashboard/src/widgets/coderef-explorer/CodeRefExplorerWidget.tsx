'use client';

import { useState, useEffect } from 'react';
import type { Project, TreeNode } from '@/lib/coderef/types';
import type { FavoritesData, FavoriteGroup } from '@/lib/coderef/favorites-types';
import { createEmptyFavoritesData } from '@/lib/coderef/favorites-types';
import { ViewModeToggle, type ViewMode } from '@/components/coderef/ViewModeToggle';
import { ProjectSelector } from '@/components/coderef/ProjectSelector';
// DORMANT: FileTypeFilter - will be used for multi-project aggregation in future
// import { FileTypeFilter, type FileType, FILE_TYPE_OPTIONS } from '@/components/coderef/FileTypeFilter';
import { FileTree } from '@/components/coderef/FileTree';
import { FileViewer } from '@/components/coderef/FileViewer';
// DORMANT: Aggregation utilities - will be used for multi-project view in future
// import { CodeRefApi } from '@/lib/coderef/api-access';
// import { aggregateCodeRefTrees, filterTreeByPattern, flattenTree } from '@/lib/coderef/aggregateCodeRefTrees';

export type SortMode = 'name' | 'date';

export function CodeRefExplorerWidget() {
  const [viewMode, setViewMode] = useState<ViewMode>('projects');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedFile, setSelectedFile] = useState<TreeNode | null>(null);
  const [isRestoringProject, setIsRestoringProject] = useState(true);
  const [initialProjectId, setInitialProjectId] = useState<string | undefined>(undefined);

  // Favorites state - persisted per project in localStorage
  const [favoritesData, setFavoritesData] = useState<FavoritesData>(createEmptyFavoritesData());

  // Load saved project ID from localStorage on mount
  useEffect(() => {
    const savedProjectId = localStorage.getItem('coderef-explorer-selected-project');
    console.log('[CodeRefExplorer] Restoring saved project ID:', savedProjectId);
    if (savedProjectId) {
      setInitialProjectId(savedProjectId);
    } else {
      // No saved project, mark restoration as complete
      setIsRestoringProject(false);
    }
  }, []);

  // Load favorites from localStorage when project changes
  useEffect(() => {
    if (selectedProject) {
      const storageKey = `coderef-favorites-${selectedProject.id}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const data = JSON.parse(stored) as FavoritesData;
          // Validate structure
          if (data.groups && data.favorites) {
            setFavoritesData(data);
          } else {
            // Migration: old format was array of paths
            const oldFormat = JSON.parse(stored) as string[];
            if (Array.isArray(oldFormat)) {
              setFavoritesData({
                groups: [],
                favorites: oldFormat.map(path => ({ path })),
              });
            } else {
              setFavoritesData(createEmptyFavoritesData());
            }
          }
        } catch (e) {
          console.error('Failed to parse favorites from localStorage:', e);
          setFavoritesData(createEmptyFavoritesData());
        }
      } else {
        setFavoritesData(createEmptyFavoritesData());
      }
    } else {
      setFavoritesData(createEmptyFavoritesData());
    }
  }, [selectedProject?.id]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (selectedProject) {
      const storageKey = `coderef-favorites-${selectedProject.id}`;
      localStorage.setItem(storageKey, JSON.stringify(favoritesData));
    }
  }, [favoritesData, selectedProject?.id]);

  // Save selected project ID to localStorage
  useEffect(() => {
    if (selectedProject && !isRestoringProject) {
      console.log('[CodeRefExplorer] Saving project ID to localStorage:', selectedProject.id);
      localStorage.setItem('coderef-explorer-selected-project', selectedProject.id);
    }
  }, [selectedProject?.id, isRestoringProject]);

  // DORMANT: Multi-project aggregation state and sorting (for future use)
  // const [sortBy, setSortBy] = useState<SortMode>('name');
  // const [allProjects, setAllProjects] = useState<Project[]>([]);
  // const [aggregatedTree, setAggregatedTree] = useState<TreeNode[]>([]);
  // const [isLoadingAggregate, setIsLoadingAggregate] = useState(false);

  const handleProjectChange = (project: Project | null) => {
    console.log('[CodeRefExplorer] Project changed:', project?.name, 'isRestoring:', isRestoringProject);
    setSelectedProject(project);
    // Clear selected file when project changes
    setSelectedFile(null);

    // Mark restoration as complete after first project selection (including restored)
    if (isRestoringProject) {
      console.log('[CodeRefExplorer] Marking restoration as complete');
      setIsRestoringProject(false);
    }
  };

  const handleFileClick = (node: TreeNode) => {
    if (node.type === 'file') {
      setSelectedFile(node);
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    // Clear selection when switching modes
    setSelectedFile(null);
  };

  const handleToggleFavorite = (path: string, groupName?: string) => {
    setFavoritesData((prev) => {
      const existingIndex = prev.favorites.findIndex(f => f.path === path);

      if (existingIndex >= 0) {
        // Remove favorite
        return {
          ...prev,
          favorites: prev.favorites.filter((_, i) => i !== existingIndex),
        };
      } else {
        // Add favorite
        return {
          ...prev,
          favorites: [...prev.favorites, { path, group: groupName }],
        };
      }
    });
  };

  const isFavorite = (path: string): boolean => {
    return favoritesData.favorites.some(f => f.path === path);
  };

  // Group management functions
  const createGroup = (name: string, color?: string) => {
    const newGroup: FavoriteGroup = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      color,
    };
    setFavoritesData((prev) => ({
      ...prev,
      groups: [...prev.groups, newGroup],
    }));
  };

  const deleteGroup = (groupId: string) => {
    setFavoritesData((prev) => ({
      groups: prev.groups.filter(g => g.id !== groupId),
      // Remove group assignment from favorites
      favorites: prev.favorites.map(f =>
        prev.groups.find(g => g.id === groupId)?.name === f.group
          ? { ...f, group: undefined }
          : f
      ),
    }));
  };

  const renameGroup = (groupId: string, newName: string) => {
    setFavoritesData((prev) => {
      const group = prev.groups.find(g => g.id === groupId);
      if (!group) return prev;

      const oldName = group.name;

      return {
        groups: prev.groups.map(g =>
          g.id === groupId ? { ...g, name: newName } : g
        ),
        // Update group assignment in favorites
        favorites: prev.favorites.map(f =>
          f.group === oldName ? { ...f, group: newName } : f
        ),
      };
    });
  };

  const assignToGroup = (path: string, groupName?: string) => {
    setFavoritesData((prev) => ({
      ...prev,
      favorites: prev.favorites.map(f =>
        f.path === path ? { ...f, group: groupName } : f
      ),
    }));
  };

  // DORMANT: Sorting logic (for future use with multi-project aggregation)
  // const sortTree = (nodes: TreeNode[], mode: SortMode): TreeNode[] => { ... }
  // const getDisplayTree = (): TreeNode[] => { ... }
  // const getFileCounts = (): Record<FileType, number> => { ... }

  return (
    <div className="h-full flex overflow-hidden bg-ind-bg">
      {/* Page Sidebar - fixed 320px width with overflow clipping prevents width expansion from long file names */}
      <div className="w-80 min-w-80 max-w-80 basis-80 flex-shrink-0 flex-grow-0 overflow-hidden border-r border-ind-border bg-ind-panel flex flex-col">
        {/* Controls section */}
        <div className="flex-shrink-0 sticky top-0 z-10 bg-ind-panel">
          {/* Top controls area with padding */}
          <div className="p-4 space-y-3">
            {/* Project Selector - visible in both modes */}
            <ProjectSelector
              selectedProjectId={selectedProject?.id}
              onProjectChange={handleProjectChange}
              initialProjectId={initialProjectId}
            />

            {/* DORMANT: Sort Dropdown - will be used for multi-project view in future */}
            {/* <div className="space-y-2">
              <label htmlFor="sort-select">Sort by:</label>
              <select id="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortMode)}>
                <option value="name">Name (A-Z)</option>
                <option value="date">Date Modified (Newest)</option>
              </select>
            </div> */}

            {/* DORMANT: FileTypeFilter - will be used for multi-project view in future */}
            {/* {viewMode === 'coderef' && <FileTypeFilter ... />} */}
          </div>

          {/* View Mode Toggle - border-attached tabs at bottom */}
          <ViewModeToggle value={viewMode} onChange={handleViewModeChange} />
        </div>

        {/* File tree - same project, different root based on view mode */}
        <FileTree
          project={selectedProject}
          selectedPath={selectedFile?.path}
          onFileClick={handleFileClick}
          className="flex-1"
          filterPath={viewMode === 'coderef' ? 'coderef' : undefined}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={isFavorite}
          showOnlyFavorites={viewMode === 'favorites'}
          favoritesData={favoritesData}
          onCreateGroup={createGroup}
          onDeleteGroup={deleteGroup}
          onRenameGroup={renameGroup}
          onAssignToGroup={assignToGroup}
        />
      </div>

      {/* Right column - file viewer only (page-level header removed to avoid redundancy with FileViewer header) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* File viewer */}
        <FileViewer
          project={selectedProject}
          filePath={selectedFile?.path || null}
          className="flex-1"
        />
      </div>
    </div>
  );
}

export default CodeRefExplorerWidget;
