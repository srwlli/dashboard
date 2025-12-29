'use client';

import { useState, useEffect } from 'react';
import type { Project, TreeNode } from '@/lib/coderef/types';
import { ViewModeToggle, type ViewMode } from '@/components/coderef/ViewModeToggle';
import { ProjectSelector } from '@/components/coderef/ProjectSelector';
import { FileTypeFilter, type FileType, FILE_TYPE_OPTIONS } from '@/components/coderef/FileTypeFilter';
import { FileTree } from '@/components/coderef/FileTree';
import { FileViewer } from '@/components/coderef/FileViewer';
import { CodeRefApi } from '@/lib/coderef/api-access';
import { aggregateCodeRefTrees, filterTreeByPattern, flattenTree } from '@/lib/coderef/aggregateCodeRefTrees';

export type SortMode = 'name' | 'date' | 'project';

export function CodeRefExplorerWidget() {
  const [viewMode, setViewMode] = useState<ViewMode>('projects');
  const [fileType, setFileType] = useState<FileType>('all');
  const [sortBy, setSortBy] = useState<SortMode>('name');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedFile, setSelectedFile] = useState<TreeNode | null>(null);

  // CodeRef mode state
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [aggregatedTree, setAggregatedTree] = useState<TreeNode[]>([]);
  const [isLoadingAggregate, setIsLoadingAggregate] = useState(false);

  // Load all projects when switching to CodeRef mode
  useEffect(() => {
    if (viewMode === 'coderef') {
      loadAllProjects();
    }
  }, [viewMode]);

  // Re-aggregate when projects change or filter changes
  useEffect(() => {
    if (viewMode === 'coderef' && allProjects.length > 0) {
      aggregateTrees();
    }
  }, [allProjects, viewMode]);

  const loadAllProjects = async () => {
    try {
      setIsLoadingAggregate(true);
      const result = await CodeRefApi.projects.list();
      setAllProjects(result.projects);
    } catch (error) {
      console.error('Failed to load projects for CodeRef view:', error);
      setAllProjects([]);
    } finally {
      setIsLoadingAggregate(false);
    }
  };

  const aggregateTrees = async () => {
    try {
      setIsLoadingAggregate(true);
      const aggregated = await aggregateCodeRefTrees(allProjects);
      setAggregatedTree(aggregated);
    } catch (error) {
      console.error('Failed to aggregate trees:', error);
      setAggregatedTree([]);
    } finally {
      setIsLoadingAggregate(false);
    }
  };

  const handleProjectChange = (project: Project | null) => {
    setSelectedProject(project);
    // Clear selected file when project changes
    setSelectedFile(null);
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
    // Reset filter when switching to Projects mode
    if (mode === 'projects') {
      setFileType('all');
    }
  };

  const handleFileTypeChange = (type: FileType) => {
    setFileType(type);
    setSelectedFile(null); // Clear selection when filter changes
  };

  // Sort tree nodes
  const sortTree = (nodes: TreeNode[], mode: SortMode): TreeNode[] => {
    const sorted = [...nodes];

    const sortRecursive = (items: TreeNode[]): TreeNode[] => {
      const sortedItems = [...items];

      // Sort current level
      sortedItems.sort((a, b) => {
        // Always keep directories before files
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }

        // For files, apply the selected sort mode
        if (a.type === 'file' && b.type === 'file') {
          switch (mode) {
            case 'date':
              if (a.lastModified && b.lastModified) {
                return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
              }
              return 0;
            case 'project':
              // Extract project name from path (first segment)
              const projectA = a.path.split('/')[0];
              const projectB = b.path.split('/')[0];
              return projectA.localeCompare(projectB);
            case 'name':
            default:
              return a.name.localeCompare(b.name);
          }
        }

        // For directories, always sort by name
        return a.name.localeCompare(b.name);
      });

      // Recursively sort children
      return sortedItems.map((item) => ({
        ...item,
        children: item.children ? sortRecursive(item.children) : undefined,
      }));
    };

    return sortRecursive(sorted);
  };

  // Get the tree to display based on mode and filter
  const getDisplayTree = (): TreeNode[] => {
    if (viewMode === 'projects') {
      return []; // FileTree component will handle fetching for selected project
    }

    // CodeRef mode
    let tree = aggregatedTree;

    // Apply file type filter
    if (fileType !== 'all') {
      const option = FILE_TYPE_OPTIONS.find((opt) => opt.id === fileType);
      if (option) {
        tree = filterTreeByPattern(tree, option.pattern);
      }
    }

    // Apply sorting
    tree = sortTree(tree, sortBy);

    return tree;
  };

  // Calculate file counts for badges
  const getFileCounts = (): Record<FileType, number> => {
    if (viewMode !== 'coderef' || aggregatedTree.length === 0) {
      return {
        all: 0,
        claude: 0,
        plan: 0,
        deliverables: 0,
        architecture: 0,
        readme: 0,
      };
    }

    const counts: Record<FileType, number> = {
      all: flattenTree(aggregatedTree).length,
      claude: 0,
      plan: 0,
      deliverables: 0,
      architecture: 0,
      readme: 0,
    };

    // Count files for each type
    FILE_TYPE_OPTIONS.forEach((option) => {
      if (option.id !== 'all') {
        const filtered = filterTreeByPattern(aggregatedTree, option.pattern);
        counts[option.id] = flattenTree(filtered).length;
      }
    });

    return counts;
  };

  const displayTree = getDisplayTree();
  const fileCounts = getFileCounts();

  return (
    <div className="h-full flex overflow-hidden bg-ind-bg">
      {/* Page Sidebar - extends to top */}
      <div className="w-80 border-r border-ind-border bg-ind-panel flex flex-col">
        {/* Controls section */}
        <div className="flex-shrink-0 sticky top-0 z-10 bg-ind-panel">
          {/* Top controls area with padding */}
          <div className="p-4 space-y-3">
            {/* Project Selector - visible only in Projects mode */}
            {viewMode === 'projects' && (
              <ProjectSelector
                selectedProjectId={selectedProject?.id}
                onProjectChange={handleProjectChange}
              />
            )}

            {/* File Type Filter - visible only in CodeRef mode */}
            {viewMode === 'coderef' && (
              <>
                <FileTypeFilter
                  value={fileType}
                  onChange={handleFileTypeChange}
                  counts={fileCounts}
                />

                {/* Sort Dropdown */}
                <div className="space-y-2">
                  <label htmlFor="sort-select" className="text-xs text-ind-text-muted font-medium">
                    Sort by:
                  </label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortMode)}
                    className="w-full px-2.5 py-1.5 rounded text-sm bg-ind-bg text-ind-text border border-ind-border hover:border-ind-accent focus:border-ind-accent focus:outline-none focus:ring-1 focus:ring-ind-accent"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="date">Date Modified (Newest)</option>
                    <option value="project">Project Name</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* View Mode Toggle - border-attached tabs at bottom */}
          <ViewModeToggle value={viewMode} onChange={handleViewModeChange} />
        </div>

        {/* File tree */}
        {viewMode === 'projects' ? (
          <FileTree
            project={selectedProject}
            selectedPath={selectedFile?.path}
            onFileClick={handleFileClick}
            className="flex-1"
          />
        ) : (
          <FileTree
            project={null}
            customTree={displayTree}
            selectedPath={selectedFile?.path}
            onFileClick={handleFileClick}
            className="flex-1"
            loading={isLoadingAggregate}
          />
        )}
      </div>

      {/* Right column - page header + file viewer */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page-level header - sticky */}
        <div className="flex-shrink-0 p-4 border-b border-ind-border bg-ind-panel sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-ind-text">
            {selectedFile?.name || (viewMode === 'coderef' ? 'CodeRef' : 'Explorer')}
          </h1>
          {selectedFile && (
            <div className="text-sm text-ind-text-muted mt-1">
              {viewMode === 'coderef' ? 'All Projects' : selectedProject?.name} • {selectedFile.path}
            </div>
          )}
        </div>

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
