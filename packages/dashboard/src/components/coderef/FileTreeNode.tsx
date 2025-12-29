'use client';

import { useState } from 'react';
import type { TreeNode } from '@/app/api/coderef/tree/route';
import type { Project } from '@/lib/coderef/types';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  File,
  FileJson,
  FileCode,
  FileText,
  Star,
  Plus,
} from 'lucide-react';
import { ContextMenu } from './ContextMenu';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { loadFileContent } from '@/lib/coderef/hybrid-router';
import type { Attachment } from '@/components/PromptingWorkflow/types';

interface FileTreeNodeProps {
  /** Tree node data */
  node: TreeNode;

  /** Project containing this file */
  project?: Project | null;

  /** Current depth level (for indentation) */
  depth: number;

  /** Currently selected file path */
  selectedPath?: string;

  /** Callback when a file is clicked */
  onFileClick: (node: TreeNode) => void;

  /** Callback to toggle favorite status */
  onToggleFavorite?: (path: string) => void;

  /** Function to check if a path is favorited */
  isFavorite?: (path: string) => boolean;

  /** Optional custom class name */
  className?: string;
}

/**
 * Get appropriate icon for file based on extension
 */
function getFileIcon(extension?: string): React.ReactNode {
  const ext = extension?.toLowerCase();

  switch (ext) {
    case '.json':
      return <FileJson className="w-4 h-4 text-yellow-500" />;
    case '.md':
    case '.txt':
      return <FileText className="w-4 h-4 text-blue-500" />;
    case '.ts':
    case '.tsx':
    case '.js':
    case '.jsx':
    case '.py':
    case '.java':
    case '.c':
    case '.cpp':
    case '.rs':
      return <FileCode className="w-4 h-4 text-green-500" />;
    default:
      return <File className="w-4 h-4 text-ind-text-muted" />;
  }
}

/**
 * Get language identifier from file extension for syntax highlighting
 */
function getLanguageFromExtension(extension: string): string {
  const ext = extension.toLowerCase();
  const langMap: Record<string, string> = {
    '.ts': 'typescript',
    '.tsx': 'tsx',
    '.js': 'javascript',
    '.jsx': 'jsx',
    '.py': 'python',
    '.java': 'java',
    '.c': 'c',
    '.cpp': 'cpp',
    '.rs': 'rust',
    '.go': 'go',
    '.json': 'json',
    '.md': 'markdown',
    '.txt': 'text',
  };
  return langMap[ext] || 'text';
}

export function FileTreeNode({
  node,
  project,
  depth,
  selectedPath,
  onFileClick,
  onToggleFavorite,
  isFavorite,
  className = '',
}: FileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const { addAttachments } = useWorkflow();

  const isDirectory = node.type === 'directory';
  const isSelected = selectedPath === node.path;
  const hasChildren = isDirectory && node.children && node.children.length > 0;
  const favorited = isFavorite ? isFavorite(node.path) : false;

  const handleClick = () => {
    if (isDirectory) {
      setIsExpanded(!isExpanded);
    } else {
      onFileClick(node);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(node.path);
    }
  };

  const handleAddToPrompt = async () => {
    if (!project || node.type === 'directory') return;

    try {
      // Load file content
      const result = await loadFileContent(project, node.path);
      const fileData = result.data;

      // Create attachment object
      const attachment: Attachment = {
        id: Math.random().toString(36).substring(2, 11),
        filename: fileData.name,
        type: 'FILE',
        extension: fileData.extension,
        mimeType: fileData.mimeType,
        size: fileData.size,
        content: fileData.content,
        preview: fileData.content.substring(0, 200),
        language: getLanguageFromExtension(fileData.extension),
        isText: fileData.encoding === 'utf-8',
        isBinary: fileData.encoding === 'base64',
        createdAt: new Date(),
      };

      // Add to workflow
      addAttachments([attachment]);

      // Close context menu
      setContextMenu(null);

      // Show feedback (optional)
      console.log(`Added ${fileData.name} to prompt`);
    } catch (error) {
      console.error('Failed to add file to prompt:', error);
      alert('Failed to add file to prompt');
    }
  };

  const paddingLeft = `${depth * 12 + 8}px`;

  return (
    <div className={className}>
      <div
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        style={{ paddingLeft }}
        className={`
          flex items-center gap-2 py-1.5 px-2 cursor-pointer
          transition-colors duration-150
          ${
            isSelected
              ? 'bg-ind-accent/20 text-ind-accent font-medium'
              : 'text-ind-text hover:bg-ind-bg/50'
          }
        `}
      >
        {/* Expand/collapse chevron for directories */}
        {isDirectory ? (
          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
            {hasChildren &&
              (isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-ind-text-muted" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-ind-text-muted" />
              ))}
          </div>
        ) : (
          <div className="w-4 h-4 flex-shrink-0" />
        )}

        {/* Icon */}
        <div className="flex-shrink-0">
          {isDirectory ? (
            isExpanded ? (
              <FolderOpen className="w-4 h-4 text-ind-accent" />
            ) : (
              <Folder className="w-4 h-4 text-ind-text-muted" />
            )
          ) : (
            getFileIcon(node.extension)
          )}
        </div>

        {/* Name */}
        <span className="text-sm truncate">{node.name}</span>

        {/* Favorite indicator */}
        {favorited && (
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
        )}

        {/* File size metadata removed - cleaner sidebar UI */}
      </div>

      {/* Recursively render children if directory is expanded */}
      {isDirectory && isExpanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              project={project}
              depth={depth + 1}
              selectedPath={selectedPath}
              onFileClick={onFileClick}
              onToggleFavorite={onToggleFavorite}
              isFavorite={isFavorite}
            />
          ))}
        </div>
      )}

      {/* Context menu */}
      {contextMenu && onToggleFavorite && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={[
            {
              label: favorited ? 'Remove from Favorites' : 'Add to Favorites',
              icon: Star,
              onClick: handleToggleFavorite,
              iconClassName: favorited ? 'fill-yellow-400 text-yellow-400' : '',
            },
            // Only show "Add to Prompt" for files (not directories)
            ...(node.type === 'file' && project
              ? [
                  {
                    label: 'Add to Prompt',
                    icon: Plus,
                    onClick: handleAddToPrompt,
                    iconClassName: '',
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

// formatFileSize function removed - file size metadata no longer displayed in sidebar

export default FileTreeNode;
