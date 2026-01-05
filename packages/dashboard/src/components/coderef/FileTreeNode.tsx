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
  FolderTree,
  Check,
  Trash2,
  Edit3,
  FolderInput,
} from 'lucide-react';
import { ContextMenu } from './ContextMenu';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { useProjects } from '@/contexts/ProjectsContext';
import { loadFileContent, loadProjectTree } from '@/lib/coderef/hybrid-router';
import { CodeRefApi } from '@/lib/coderef/api-access';
import type { Attachment } from '@/components/PromptingWorkflow/types';
import type { ContextMenuItem } from './ContextMenu';

/**
 * FileTreeNode Component Props
 *
 * @description Props for a single node in the file tree hierarchy.
 * Recursively renders children for directories.
 *
 * @see {@link https://github.com/coderef-dashboard/docs/EXPLORER-SIDEBAR.md#filetreenode} for detailed documentation
 */
interface FileTreeNodeProps {
  /**
   * Tree node data
   * Contains name, path, type, and optional children
   */
  node: TreeNode;

  /**
   * Project containing this file
   * Required for "Add to Prompt" and "Copy Path" features
   */
  project?: Project | null;

  /**
   * Current depth level (for indentation)
   * Used to calculate paddingLeft: `${depth * 12 + 8}px`
   * @minimum 0
   */
  depth: number;

  /**
   * Currently selected file path
   * Used for highlighting the active file
   */
  selectedPath?: string;

  /**
   * Callback when a file is clicked
   * Directories toggle expansion, files trigger content load
   * @param node - The clicked TreeNode
   */
  onFileClick: (node: TreeNode) => void;

  /**
   * Callback to toggle favorite status
   * @param path - File/directory path to favorite/unfavorite
   * @param groupName - Optional group name for assignment
   */
  onToggleFavorite?: (path: string, groupName?: string) => void;

  /**
   * Function to check if a path is favorited
   * @param path - Path to check
   * @returns true if favorited, false otherwise
   */
  isFavorite?: (path: string) => boolean;

  /**
   * Available groups for assignment
   * Displayed in context menu submenu
   */
  availableGroups?: { id: string; name: string }[];

  /**
   * Callback to assign file to group
   * @param path - File path
   * @param groupName - Group name (undefined for ungrouped)
   */
  onAssignToGroup?: (path: string, groupName?: string) => void;

  /**
   * Callback to refresh the tree after modifications (e.g., deletion)
   * Triggers a reload of the project tree
   */
  onTreeRefresh?: () => void;

  /**
   * Optional custom class name
   * Applied to root container div
   */
  className?: string;
}

/**
 * Get appropriate icon for file based on extension
 *
 * @param extension - File extension (e.g., '.ts', '.json', '.md')
 * @returns Lucide React icon component with appropriate color
 *
 * @example
 * getFileIcon('.json') // Returns <FileJson className="w-4 h-4 text-yellow-500" />
 * getFileIcon('.ts')   // Returns <FileCode className="w-4 h-4 text-green-500" />
 * getFileIcon('.md')   // Returns <FileText className="w-4 h-4 text-blue-500" />
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
 *
 * @param extension - File extension (e.g., '.ts', '.py', '.json')
 * @returns Language string for syntax highlighting (e.g., 'typescript', 'python', 'json')
 *
 * @example
 * getLanguageFromExtension('.ts')   // Returns 'typescript'
 * getLanguageFromExtension('.py')   // Returns 'python'
 * getLanguageFromExtension('.xyz')  // Returns 'text' (fallback)
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

/**
 * FileTreeNode Component
 *
 * @description Renders a single node in the file tree hierarchy with support for:
 * - **Directory Expansion**: Click to expand/collapse folders with chevron indicators
 * - **File Selection**: Click files to trigger content loading via onFileClick callback
 * - **Context Menu**: Right-click for Add to Favorites, Add to Prompt, Copy Path actions
 * - **Favorites Management**: Star indicator for favorited items with group assignment
 * - **Recursive Rendering**: Automatically renders child nodes for expanded directories
 * - **Visual Feedback**: Hover states, selection highlighting, icon differentiation
 * - **Add to Prompt**: Integrates with PromptingWorkflow to attach file content
 *
 * @component
 * @example
 * ```tsx
 * <FileTreeNode
 *   node={{ name: 'index.ts', path: 'src/index.ts', type: 'file', extension: '.ts' }}
 *   project={selectedProject}
 *   depth={0}
 *   selectedPath="src/index.ts"
 *   onFileClick={(node) => console.log('Clicked:', node.path)}
 *   onToggleFavorite={(path, group) => updateFavorites(path, group)}
 *   isFavorite={(path) => favorites.includes(path)}
 *   availableGroups={[{ id: 'g1', name: 'Work Files' }]}
 * />
 * ```
 *
 * @remarks
 * **Indentation Calculation**: Uses `depth * 12 + 8` pixels for paddingLeft to create visual hierarchy
 *
 * **Context Menu Actions**:
 * - **Add/Remove Favorites**: Toggles favorite status, optionally assigns to group
 * - **Add to Prompt**: Loads file content and creates Attachment object for PromptingWorkflow
 * - **Copy Path**: Copies full absolute path to clipboard with visual feedback
 *
 * **Recursive Behavior**: When directory is expanded, maps over node.children and renders
 * nested FileTreeNode components with incremented depth
 *
 * **Text Truncation Fix**: Parent container uses `min-w-0` to enable proper text truncation
 * in flex layouts (prevents sidebar expansion beyond 320px)
 *
 * @see {@link FileTree} for parent component that manages tree state
 * @see {@link ContextMenu} for right-click menu implementation
 * @see {@link FavoritesList} for favorites-only view mode
 */
export function FileTreeNode({
  node,
  project,
  depth,
  selectedPath,
  onFileClick,
  onToggleFavorite,
  isFavorite,
  availableGroups = [],
  onAssignToGroup,
  onTreeRefresh,
  className = '',
}: FileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [copiedPath, setCopiedPath] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [moveSubmenu, setMoveSubmenu] = useState<ContextMenuItem[] | null>(null);
  const { addAttachments } = useWorkflow();
  const { projects } = useProjects();

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

  const handleToggleFavorite = (groupName?: string) => {
    if (onToggleFavorite) {
      onToggleFavorite(node.path, groupName);
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

  const handleCopyPath = async () => {
    if (!project) return;

    try {
      // Clean project path - remove [Directory: ...] wrapper if present
      let projectPath = project.path;
      if (projectPath.startsWith('[Directory: ') && projectPath.endsWith(']')) {
        projectPath = projectPath.slice(12, -1); // Remove '[Directory: ' and ']'
      }

      // Construct full path
      const fullPath = `${projectPath}/${node.path}`;
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

  const handleDelete = async () => {
    if (!project) return;

    try {
      // Clean project path - remove [Directory: ...] wrapper if present
      let projectPath = project.path;
      if (projectPath.startsWith('[Directory: ') && projectPath.endsWith(']')) {
        projectPath = projectPath.slice(12, -1); // Remove '[Directory: ' and ']'
      }

      // Construct full absolute path
      const fullPath = `${projectPath}/${node.path}`;

      // Confirmation dialog
      const itemType = node.type === 'directory' ? 'directory' : 'file';
      const confirmMessage = `Are you sure you want to delete this ${itemType}?\n\n${node.name}\n\n${
        node.type === 'directory' ? 'This will delete all contents recursively.' : 'This action cannot be undone.'
      }`;

      if (!window.confirm(confirmMessage)) {
        setContextMenu(null);
        return;
      }

      // Delete via API
      const result = await CodeRefApi.file.delete(fullPath, {
        recursive: node.type === 'directory',
      });

      console.log(`Deleted ${result.type}: ${result.deleted}`);

      // Close context menu
      setContextMenu(null);

      // Refresh tree to reflect deletion
      if (onTreeRefresh) {
        onTreeRefresh();
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      alert(`Failed to delete ${node.name}: ${(error as Error).message}`);
      setContextMenu(null);
    }
  };

  const handleRename = async () => {
    if (!project || !newName.trim()) {
      setRenaming(false);
      setNewName('');
      return;
    }

    // Check if name actually changed
    if (newName.trim() === node.name) {
      setRenaming(false);
      setNewName('');
      return;
    }

    try {
      // Clean project path - remove [Directory: ...] wrapper if present
      let projectPath = project.path;
      if (projectPath.startsWith('[Directory: ') && projectPath.endsWith(']')) {
        projectPath = projectPath.slice(12, -1); // Remove '[Directory: ' and ']'
      }

      // Construct full absolute path
      const fullPath = `${projectPath}/${node.path}`;

      // Rename via API
      const result = await CodeRefApi.file.rename(fullPath, newName.trim());

      console.log(`Renamed ${result.type}: ${result.oldPath} → ${result.newPath}`);

      // Reset rename state
      setRenaming(false);
      setNewName('');

      // Refresh tree to reflect rename
      if (onTreeRefresh) {
        onTreeRefresh();
      }
    } catch (error) {
      console.error('Failed to rename:', error);
      alert(`Failed to rename ${node.name}: ${(error as Error).message}`);
      setRenaming(false);
      setNewName('');
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRename();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setRenaming(false);
      setNewName('');
    }
  };

  const handleMove = async (destinationDir: string) => {
    if (!project) return;

    try {
      // Clean project path - remove [Directory: ...] wrapper if present
      let projectPath = project.path;
      if (projectPath.startsWith('[Directory: ') && projectPath.endsWith(']')) {
        projectPath = projectPath.slice(12, -1);
      }

      // Construct full absolute source path
      const sourcePath = `${projectPath}/${node.path}`;

      // Check if moving to different project
      const sourceProjectId = project.id;
      const destProject = projects.find(p => {
        let pPath = p.path;
        if (pPath.startsWith('[Directory: ') && pPath.endsWith(']')) {
          pPath = pPath.slice(12, -1);
        }
        return destinationDir.startsWith(pPath);
      });

      const crossProject = destProject && destProject.id !== sourceProjectId;

      if (crossProject) {
        const confirmMessage = `Move ${node.name} to a different project (${destProject.name})?\n\nThis will move the file/directory from:\n${project.name}\n\nTo:\n${destProject.name}`;
        if (!window.confirm(confirmMessage)) {
          setContextMenu(null);
          return;
        }
      }

      // Move via API
      const result = await CodeRefApi.file.move(sourcePath, destinationDir);

      console.log(`Moved ${result.type}: ${result.oldPath} → ${result.newPath}`);

      // Close context menu
      setContextMenu(null);

      // Refresh tree to reflect move
      if (onTreeRefresh) {
        onTreeRefresh();
      }
    } catch (error) {
      console.error('Failed to move:', error);
      alert(`Failed to move ${node.name}: ${(error as Error).message}`);
      setContextMenu(null);
    }
  };

  const buildDirectorySubmenu = (
    treeNodes: TreeNode[],
    projectPath: string,
    depth: number = 0
  ): ContextMenuItem[] => {
    if (depth > 5) return []; // Prevent infinite recursion

    return treeNodes
      .filter(n => n.type === 'directory') // Only directories
      .filter(n => {
        // Don't show the source node as a destination
        const currentNodeFullPath = project ? `${project.path}/${node.path}` : '';
        const candidateFullPath = `${projectPath}/${n.path}`;
        return candidateFullPath !== currentNodeFullPath;
      })
      .map(dir => {
        const fullDirPath = `${projectPath}/${dir.path}`;

        return {
          label: dir.name,
          icon: Folder,
          onClick: () => handleMove(fullDirPath),
          submenu: dir.children ? buildDirectorySubmenu(dir.children, projectPath, depth + 1) : undefined,
        };
      });
  };

  const buildMoveSubmenu = async (): Promise<ContextMenuItem[]> => {
    const items: ContextMenuItem[] = [];

    for (const proj of projects) {
      try {
        // Load project tree
        const result = await loadProjectTree(proj);
        const tree = result.data;

        // Clean project path
        let projPath = proj.path;
        if (projPath.startsWith('[Directory: ') && projPath.endsWith(']')) {
          projPath = projPath.slice(12, -1);
        }

        // Build submenu for this project
        const projectSubmenu: ContextMenuItem[] = [
          // Option to move to project root
          {
            label: '(Root)',
            icon: FolderOpen,
            onClick: () => handleMove(projPath),
          },
          // Directory tree
          ...buildDirectorySubmenu(tree, projPath),
        ];

        items.push({
          label: proj.name,
          icon: FolderOpen,
          submenu: projectSubmenu,
        });
      } catch (error) {
        console.error(`Failed to load tree for project ${proj.name}:`, error);
      }
    }

    return items;
  };

  const handleMoveMenuOpen = async () => {
    if (!moveSubmenu) {
      const submenu = await buildMoveSubmenu();
      setMoveSubmenu(submenu);
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
          min-w-0
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

        {/* Name or rename input */}
        {renaming ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleRenameKeyDown}
            onBlur={handleRename}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 px-2 py-0.5 text-sm bg-ind-bg border border-ind-accent rounded text-ind-text focus:outline-none focus:border-ind-accent"
            autoFocus
          />
        ) : (
          <span className="text-sm truncate">{node.name}</span>
        )}

        {/* Favorite indicator */}
        {favorited && !renaming && (
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
              availableGroups={availableGroups}
              onAssignToGroup={onAssignToGroup}
              onTreeRefresh={onTreeRefresh}
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
            // If already favorited, show "Remove from Favorites"
            ...(favorited
              ? [
                  {
                    label: 'Remove from Favorites',
                    icon: Star,
                    onClick: () => handleToggleFavorite(),
                    iconClassName: 'fill-yellow-400 text-yellow-400',
                  },
                ]
              : // If not favorited, show "Add to Favorites" with group submenu
                [
                  {
                    label: 'Add to Favorites',
                    icon: Star,
                    onClick: availableGroups.length === 0 ? () => handleToggleFavorite() : undefined,
                    submenu:
                      availableGroups.length > 0
                        ? [
                            {
                              label: 'Ungrouped',
                              icon: Star,
                              onClick: () => handleToggleFavorite(),
                              iconClassName: '',
                            },
                            ...availableGroups.map((group) => ({
                              label: group.name,
                              icon: Star,
                              onClick: () => handleToggleFavorite(group.name),
                              iconClassName: '',
                            })),
                          ]
                        : undefined,
                  },
                ]),
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
            // Rename - works for both files and directories
            ...(project
              ? [
                  {
                    label: 'Rename',
                    icon: Edit3,
                    onClick: () => {
                      setRenaming(true);
                      setNewName(node.name);
                      setContextMenu(null);
                    },
                    iconClassName: '',
                  },
                ]
              : []),
            // Move - works for both files and directories
            ...(project && projects.length > 0
              ? [
                  {
                    label: 'Move',
                    icon: FolderInput,
                    onHover: handleMoveMenuOpen,
                    submenu: moveSubmenu || undefined,
                    iconClassName: '',
                  },
                ]
              : []),
            // Delete - works for both files and directories
            ...(project
              ? [
                  {
                    label: 'Delete',
                    icon: Trash2,
                    onClick: handleDelete,
                    iconClassName: 'text-red-500',
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
