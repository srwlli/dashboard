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
  Star,
} from 'lucide-react';
import { ContextMenu } from './ContextMenu';

interface FileTreeNodeProps {
  /** Tree node data */
  node: TreeNode;

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

export function FileTreeNode({
  node,
  depth,
  selectedPath,
  onFileClick,
  onToggleFavorite,
  isFavorite,
  className = '',
}: FileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

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
          ]}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

// formatFileSize function removed - file size metadata no longer displayed in sidebar

export default FileTreeNode;
