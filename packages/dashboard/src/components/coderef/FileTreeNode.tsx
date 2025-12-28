'use client';

import { useState } from 'react';
import type { TreeNode } from '@/app/api/coderef/tree/route';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  File,
  FileJson,
  FileCode,
  FileText,
} from 'lucide-react';

interface FileTreeNodeProps {
  /** Tree node data */
  node: TreeNode;

  /** Current depth level (for indentation) */
  depth: number;

  /** Currently selected file path */
  selectedPath?: string;

  /** Callback when a file is clicked */
  onFileClick: (node: TreeNode) => void;

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

export function FileTreeNode({
  node,
  depth,
  selectedPath,
  onFileClick,
  className = '',
}: FileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isDirectory = node.type === 'directory';
  const isSelected = selectedPath === node.path;
  const hasChildren = isDirectory && node.children && node.children.length > 0;

  const handleClick = () => {
    if (isDirectory) {
      setIsExpanded(!isExpanded);
    } else {
      onFileClick(node);
    }
  };

  const paddingLeft = `${depth * 12 + 8}px`;

  return (
    <div className={className}>
      <div
        onClick={handleClick}
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

        {/* File size (only for files) */}
        {!isDirectory && node.size !== undefined && (
          <span className="text-xs text-ind-text-muted ml-auto flex-shrink-0">
            {formatFileSize(node.size)}
          </span>
        )}
      </div>

      {/* Recursively render children if directory is expanded */}
      {isDirectory && isExpanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default FileTreeNode;
