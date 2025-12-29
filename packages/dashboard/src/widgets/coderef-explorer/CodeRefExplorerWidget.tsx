'use client';

import { useState } from 'react';
import type { Project, TreeNode } from '@/lib/coderef/types';
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

  // DORMANT: Multi-project aggregation state and sorting (for future use)
  // const [sortBy, setSortBy] = useState<SortMode>('name');
  // const [allProjects, setAllProjects] = useState<Project[]>([]);
  // const [aggregatedTree, setAggregatedTree] = useState<TreeNode[]>([]);
  // const [isLoadingAggregate, setIsLoadingAggregate] = useState(false);

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
  };

  // DORMANT: Sorting logic (for future use with multi-project aggregation)
  // const sortTree = (nodes: TreeNode[], mode: SortMode): TreeNode[] => { ... }
  // const getDisplayTree = (): TreeNode[] => { ... }
  // const getFileCounts = (): Record<FileType, number> => { ... }

  return (
    <div className="h-full flex overflow-hidden bg-ind-bg">
      {/* Page Sidebar - extends to top */}
      <div className="w-80 border-r border-ind-border bg-ind-panel flex flex-col">
        {/* Controls section */}
        <div className="flex-shrink-0 sticky top-0 z-10 bg-ind-panel">
          {/* Top controls area with padding */}
          <div className="p-4 space-y-3">
            {/* Project Selector - visible in both modes */}
            <ProjectSelector
              selectedProjectId={selectedProject?.id}
              onProjectChange={handleProjectChange}
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
        />
      </div>

      {/* Right column - page header + file viewer */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page-level header - sticky */}
        <div className="flex-shrink-0 p-4 border-b border-ind-border bg-ind-panel sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-ind-text">
            {selectedFile?.name || (viewMode === 'coderef' ? 'CodeRef' : 'Project')}
          </h1>
          {selectedFile && (
            <div className="text-sm text-ind-text-muted mt-1">
              {selectedProject?.name} • {selectedFile.path}
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
