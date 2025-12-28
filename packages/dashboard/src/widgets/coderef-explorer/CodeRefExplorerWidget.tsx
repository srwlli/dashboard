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
    <div className="h-full flex flex-col bg-ind-bg">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-ind-border bg-ind-panel">
        <h2 className="text-lg font-semibold text-ind-text mb-3">CodeRef Explorer</h2>
        <ProjectSelector
          selectedProjectId={selectedProject?.id}
          onProjectChange={handleProjectChange}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* File tree sidebar */}
        <div className="w-80 border-r border-ind-border bg-ind-panel overflow-hidden flex flex-col">
          <FileTree
            project={selectedProject}
            selectedPath={selectedFile?.path}
            onFileClick={handleFileClick}
            className="flex-1"
          />
        </div>

        {/* File viewer */}
        <div className="flex-1 overflow-hidden">
          <FileViewer
            project={selectedProject}
            filePath={selectedFile?.path || null}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}

export default CodeRefExplorerWidget;
