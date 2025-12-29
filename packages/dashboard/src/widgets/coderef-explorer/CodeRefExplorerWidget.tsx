'use client';

import { useState } from 'react';
import type { Project, TreeNode } from '@/lib/coderef/types';
import { ProjectSelector } from '@/components/coderef/ProjectSelector';
import { FileTree } from '@/components/coderef/FileTree';
import { FileViewer } from '@/components/coderef/FileViewer';

export function CodeRefExplorerWidget() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedFile, setSelectedFile] = useState<TreeNode | null>(null);

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

  return (
    <div className="h-full flex overflow-hidden bg-ind-bg">
      {/* Page Sidebar - extends to top */}
      <div className="w-80 border-r border-ind-border bg-ind-panel flex flex-col">
        {/* Controls section - matches header height */}
        <div className="flex-shrink-0 p-4 border-b border-ind-border sticky top-0 z-10 bg-ind-panel">
          <ProjectSelector
            selectedProjectId={selectedProject?.id}
            onProjectChange={handleProjectChange}
          />
        </div>

        {/* File tree */}
        <FileTree
          project={selectedProject}
          selectedPath={selectedFile?.path}
          onFileClick={handleFileClick}
          className="flex-1"
        />
      </div>

      {/* Right column - page header + file viewer */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page-level header - sticky */}
        <div className="flex-shrink-0 p-4 border-b border-ind-border bg-ind-panel sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-ind-text">
            {selectedFile?.name || 'Explorer'}
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
