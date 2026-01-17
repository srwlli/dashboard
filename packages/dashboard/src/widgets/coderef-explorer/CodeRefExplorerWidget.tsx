/**
 * CodeRef Explorer Widget
 *
 * @description Main widget component for the CodeRef Explorer sidebar feature.
 * Provides a complete file exploration interface with:
 * - **View Modes**: Projects (single-project tree), CodeRef (multi-project coderef/ folders), Favorites (starred items)
 * - **Project Selection**: Dropdown to switch between registered projects
 * - **File Tree**: Hierarchical file/folder navigation with expansion and selection
 * - **File Viewer**: Right-hand content panel displaying selected file contents
 * - **Favorites Management**: Per-project favorites with custom groups and localStorage persistence
 * - **Cross-Tab Sync**: Storage event listeners for multi-tab awareness (conservative logging approach)
 * - **State Restoration**: Auto-restores last selected project from localStorage on mount
 *
 * @component
 * @example
 * ```tsx
 * // Rendered as a page widget
 * <CodeRefExplorerWidget />
 * ```
 *
 * @remarks
 * **Layout Structure**: 2-column responsive layout:
 * - Left: View mode tabs → Project selector → File tree (320px fixed width, min-w-0 for truncation)
 * - Right: File viewer with syntax highlighting and file metadata
 *
 * **State Management**:
 * - View mode: Controls which tree is displayed (Projects/CodeRef/Favorites)
 * - Selected project: Current project context (persisted in localStorage)
 * - Selected file: Currently viewed file (passed to FileViewer)
 * - Favorites data: Per-project favorites with groups (persisted in localStorage)
 * - Restoration flag: Prevents localStorage writes during initial mount/restore phase
 *
 * **LocalStorage Persistence**:
 * - `coderef-explorer-selected-project`: Global selected project ID
 * - `coderef-favorites-{projectId}`: Per-project favorites data (groups + paths)
 * - Quota handling: Catches QuotaExceededError and continues in degraded mode
 * - Migration: Automatically migrates old array format to new object format
 *
 * **Cross-Tab Synchronization**: Listens for storage events from other tabs but takes
 * a conservative approach - logs changes but doesn't auto-sync to avoid interrupting
 * user's intentional multi-tab workflows. Aggressive auto-sync is commented out but available.
 *
 * **Performance Considerations**:
 * - Favorites loaded lazily on project change (not all projects at once)
 * - Tree rendering is recursive but not virtualized (may be slow for large directories)
 * - File viewer syntax highlighting uses rehype-prism-plus (client-side processing)
 *
 * @see {@link https://github.com/coderef-dashboard/docs/EXPLORER-SIDEBAR.md} for comprehensive documentation
 * @see {@link FileTree} for tree rendering logic
 * @see {@link FileViewer} for file content display
 * @see {@link ViewModeToggle} for view mode switching UI
 * @see {@link ProjectSelector} for project selection dropdown
 */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Project, TreeNode } from '@/lib/coderef/types';
import type { FavoritesData, FavoriteGroup } from '@/lib/coderef/favorites-types';
import { createEmptyFavoritesData } from '@/lib/coderef/favorites-types';
import { ViewModeToggle, type ViewMode } from '@/components/coderef/ViewModeToggle';
import { ProjectSelector } from '@/components/coderef/ProjectSelector';
import { ResizableSidebar } from '@/components/coderef/ResizableSidebar';
import { useExplorer } from '@/contexts/ExplorerContext';
// DORMANT: FileTypeFilter - will be used for multi-project aggregation in future
// import { FileTypeFilter, type FileType, FILE_TYPE_OPTIONS } from '@/components/coderef/FileTypeFilter';
import { FileTree } from '@/components/coderef/FileTree';
import { FileViewer } from '@/components/coderef/FileViewer';
// DORMANT: Aggregation utilities - will be used for multi-project view in future
// import { CodeRefApi } from '@/lib/coderef/api-access';
// import { aggregateCodeRefTrees, filterTreeByPattern, flattenTree } from '@/lib/coderef/aggregateCodeRefTrees';

/**
 * Sort Mode Type
 *
 * @description Defines sorting options for file tree display.
 * Currently defined but not implemented in UI.
 *
 * @typedef {('name' | 'date')} SortMode
 * @property {'name'} name - Sort alphabetically by filename (default behavior)
 * @property {'date'} date - Sort by modification date (not yet implemented)
 */
export type SortMode = 'name' | 'date';

/**
 * CodeRef Explorer Widget Component
 *
 * @description Main export component that renders the complete Explorer sidebar interface.
 * Manages all state, localStorage persistence, and coordinates child components.
 *
 * @returns {JSX.Element} Complete Explorer widget with 2-column layout
 */
export function CodeRefExplorerWidget() {
  const { viewMode, selectedFile, setViewMode, setSelectedFile } = useExplorer();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isRestoringProject, setIsRestoringProject] = useState(true);
  const [initialProjectId, setInitialProjectId] = useState<string | undefined>(undefined);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Favorites state - persisted per project in localStorage
  const [favoritesData, setFavoritesData] = useState<FavoritesData>(createEmptyFavoritesData());

  // Handle scroll for visual hierarchy shadow effect
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const scrollTop = scrollContainerRef.current.scrollTop;
      setIsScrolled(scrollTop > 0);
    }
  }, []);

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
    if (selectedProject && !isRestoringProject) {
      const storageKey = `coderef-favorites-${selectedProject.id}`;
      try {
        localStorage.setItem(storageKey, JSON.stringify(favoritesData));
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.warn('[CodeRefExplorer] localStorage quota exceeded when saving favorites', {
            projectId: selectedProject.id,
          });
        } else {
          console.error('[CodeRefExplorer] Failed to save favorites:', error);
        }
      }
    }
  }, [favoritesData, selectedProject?.id, isRestoringProject]);

  // Save selected project ID to localStorage
  useEffect(() => {
    if (selectedProject && !isRestoringProject) {
      console.log('[CodeRefExplorer] Saving project ID to localStorage:', selectedProject.id);
      try {
        localStorage.setItem('coderef-explorer-selected-project', selectedProject.id);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.warn('[CodeRefExplorer] localStorage quota exceeded when saving project', {
            projectId: selectedProject.id,
            action: 'continuing_in_degraded_mode',
          });
          // Component continues to work, just can't persist selection
        } else {
          console.error('[CodeRefExplorer] Failed to save project ID:', error);
        }
      }
    }
  }, [selectedProject?.id, isRestoringProject]);

  // Listen for storage changes from other tabs (cross-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Only respond to project selection changes from other tabs
      if (e.key === 'coderef-explorer-selected-project' && e.newValue) {
        console.log('[CodeRefExplorer] Another tab changed project to:', e.newValue);

        // Conservative approach: Only log changes, don't auto-sync
        // This avoids interrupting user's work if they intentionally want different projects in different tabs
        // User can manually refresh if they want to sync

        // Aggressive approach (commented out - uncomment if auto-sync desired):
        // if (e.newValue !== selectedProject?.id) {
        //   // Would need access to all projects list to find and set the new project
        //   // const newProject = allProjects.find(p => p.id === e.newValue);
        //   // if (newProject) setSelectedProject(newProject);
        // }
      }

      // Also listen for favorites changes
      if (e.key?.startsWith('coderef-favorites-') && selectedProject) {
        const projectId = e.key.replace('coderef-favorites-', '');
        if (projectId === selectedProject.id && e.newValue) {
          console.log('[CodeRefExplorer] Favorites updated in another tab for current project');
          // Could reload favorites here, but might interrupt user's work
          // Conservative approach: just log the change
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [selectedProject?.id]);

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
    // Note: setViewMode in context already clears selection
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
      {/* Resizable Sidebar - drag handle allows width adjustment (240px-600px) */}
      <ResizableSidebar
        defaultWidth={320}
        minWidth={240}
        maxWidth={600}
        storageKey="coderef-explorer-sidebar-width"
      >
        {/* Controls section - stays fixed at top */}
        <div className={`flex-shrink-0 sticky top-0 z-10 bg-ind-panel/80 backdrop-blur-sm border-b border-ind-border transition-shadow ${isScrolled ? 'shadow-md' : ''}`}>
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

        {/* Scroll container - only FileTree scrolls */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto overflow-x-hidden"
        >
          {/* File tree - same project, different root based on view mode */}
          <FileTree
            project={selectedProject}
            selectedPath={selectedFile?.path}
            onFileClick={handleFileClick}
            className=""
            filterPath={
              viewMode === 'coderef' ? 'coderef' :
              viewMode === 'dotcoderef' ? '.coderef' :
              undefined
            }
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
      </ResizableSidebar>

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
