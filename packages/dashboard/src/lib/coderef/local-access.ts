/**
 * File System Access API Utilities
 *
 * Local file system operations using browser's File System Access API
 */

import type { TreeNode, FileInfo } from './types';

/**
 * Directories to skip during tree traversal
 */
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  '.turbo',
  'coverage',
  '.vscode',
  '.idea',
  '__pycache__',
  '.pytest_cache',
  'venv',
  'env',
]);

/**
 * Show directory picker dialog
 * Returns null if user cancels
 */
export async function showDirectoryPicker(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const handle = await window.showDirectoryPicker({
      mode: 'read',
    });
    return handle;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      // User cancelled, not an error
      return null;
    }
    throw error;
  }
}

/**
 * Build tree structure from directory handle
 */
export async function buildTreeFromHandle(
  dirHandle: FileSystemDirectoryHandle,
  parentPath: string = ''
): Promise<TreeNode> {
  const children: TreeNode[] = [];

  try {
    for await (const entry of dirHandle.values()) {
      // Skip hidden files and excluded directories
      if (entry.name.startsWith('.') && entry.name !== '.env') {
        continue;
      }

      if (entry.kind === 'directory' && SKIP_DIRS.has(entry.name)) {
        continue;
      }

      const relativePath = parentPath ? `${parentPath}/${entry.name}` : entry.name;

      if (entry.kind === 'directory') {
        // Recursively build subdirectory tree
        const subTree = await buildTreeFromHandle(
          entry as FileSystemDirectoryHandle,
          relativePath
        );
        children.push(subTree);
      } else {
        // File node
        const fileHandle = entry as FileSystemFileHandle;
        const file = await fileHandle.getFile();

        const extMatch = entry.name.match(/\.[^.]+$/);
        const extension = extMatch ? extMatch[0] : '';

        children.push({
          name: entry.name,
          type: 'file',
          path: relativePath,
          size: file.size,
          extension,
        });
      }
    }
  } catch (error: any) {
    console.error('Error building tree:', error);
    // Return partial tree if error occurs
  }

  // Sort: directories first, then files, alphabetically
  children.sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name);
    }
    return a.type === 'directory' ? -1 : 1;
  });

  return {
    name: dirHandle.name,
    type: 'directory',
    path: parentPath || dirHandle.name,
    children,
  };
}

/**
 * Load file content from file handle
 */
export async function loadFileFromHandle(
  fileHandle: FileSystemFileHandle
): Promise<FileInfo> {
  const file = await fileHandle.getFile();

  // Check file size (limit to 10MB for safety)
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error(`File too large: ${file.size} bytes (max 10MB)`);
  }

  const extMatch = file.name.match(/\.[^.]+$/);
  const extension = extMatch ? extMatch[0] : '';

  // Determine if file is text or binary
  const textExtensions = new Set([
    '.txt',
    '.md',
    '.json',
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    '.css',
    '.scss',
    '.html',
    '.xml',
    '.yml',
    '.yaml',
  ]);

  const isText = textExtensions.has(extension.toLowerCase());

  let content: string;
  let encoding: 'utf-8' | 'base64';

  if (isText) {
    content = await file.text();
    encoding = 'utf-8';
  } else {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    content = btoa(String.fromCharCode(...bytes));
    encoding = 'base64';
  }

  return {
    path: file.name,
    name: file.name,
    extension,
    size: file.size,
    content,
    encoding,
    mimeType: file.type || 'application/octet-stream',
    lastModified: new Date(file.lastModified).toISOString(),
  };
}

/**
 * Get file handle by relative path from directory handle
 */
export async function getFileHandleByPath(
  dirHandle: FileSystemDirectoryHandle,
  relativePath: string
): Promise<FileSystemFileHandle | null> {
  try {
    const parts = relativePath.split('/').filter((p) => p.length > 0);

    let currentHandle: FileSystemDirectoryHandle | FileSystemFileHandle = dirHandle;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (currentHandle.kind === 'directory') {
        const dirHandle = currentHandle as FileSystemDirectoryHandle;
        const entry: FileSystemHandle = await (dirHandle.getDirectoryHandle(part, {
          create: false,
        }).catch(() =>
          dirHandle.getFileHandle(part, { create: false })
        ) as Promise<FileSystemHandle>);

        if (!entry) return null;

        if (isLast && entry.kind === 'file') {
          return entry as FileSystemFileHandle;
        }

        currentHandle = entry as FileSystemDirectoryHandle | FileSystemFileHandle;
      } else {
        // Reached a file before the end of the path
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting file handle:', error);
    return null;
  }
}
