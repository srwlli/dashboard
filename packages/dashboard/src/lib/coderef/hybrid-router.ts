/**
 * Hybrid Router for CodeRef Explorer
 *
 * Intelligently routes between local (File System API) and API modes
 * with automatic fallback if permissions are denied
 */

import type { Project, TreeNode, FileInfo, HybridResult, AccessMode } from './types';
import { getDirectoryHandle } from './indexeddb';
import { ensurePermission, isFileSystemAccessSupported, verifyHandleValid } from './permissions';
import { buildTreeFromHandle, getFileHandleByPath, loadFileFromHandle } from './local-access';
import { CodeRefApi } from './api-access';

/**
 * Load project directory tree with hybrid routing
 * Tries local mode first, falls back to API if unavailable
 */
export async function loadProjectTree(
  project: Project
): Promise<HybridResult<TreeNode[]>> {
  // Step 1: Try local mode first (if supported and project uses directory handle)
  if (isFileSystemAccessSupported() && project.path.startsWith('[Directory:')) {
    const localResult = await tryLocalTreeLoad(project);
    if (localResult) {
      return { data: localResult, mode: 'local' };
    }
  }

  // Step 2: Fallback to API mode
  const apiResult = await loadTreeViaAPI(project);
  return { data: apiResult, mode: 'api' };
}

/**
 * Load file content with hybrid routing
 * Tries local mode first, falls back to API if unavailable
 */
export async function loadFileContent(
  project: Project,
  filePath: string
): Promise<HybridResult<FileInfo>> {
  // Step 1: Try local mode first
  if (isFileSystemAccessSupported() && project.path.startsWith('[Directory:')) {
    const localResult = await tryLocalFileLoad(project, filePath);
    if (localResult) {
      return { data: localResult, mode: 'local' };
    }
  }

  // Step 2: Fallback to API mode
  const apiResult = await loadFileViaAPI(project, filePath);
  return { data: apiResult, mode: 'api' };
}

/**
 * Try to load tree using local File System API
 * Returns null if unavailable (permissions, stale handle, etc.)
 */
async function tryLocalTreeLoad(project: Project): Promise<TreeNode[] | null> {
  try {
    // Get directory handle from IndexedDB
    const dirHandle = await getDirectoryHandle(project.id);

    if (!dirHandle) {
      console.log('[Hybrid Router] No directory handle found for project:', project.id);
      return null;
    }

    // Verify handle is still valid
    const isValid = await verifyHandleValid(dirHandle);
    if (!isValid) {
      console.log('[Hybrid Router] Directory handle is stale:', project.id);
      return null;
    }

    // Check/request permission
    const hasPermission = await ensurePermission(dirHandle, 'read');
    if (!hasPermission) {
      console.log('[Hybrid Router] Permission denied for project:', project.id);
      return null;
    }

    // Build tree from handle
    console.log('[Hybrid Router] Loading tree via local File System API');
    const tree = await buildTreeFromHandle(dirHandle);

    // Return children (tree root is the directory itself)
    return tree.children || [];
  } catch (error) {
    console.error('[Hybrid Router] Local tree load failed:', error);
    return null;
  }
}

/**
 * Try to load file using local File System API
 * Returns null if unavailable
 */
async function tryLocalFileLoad(
  project: Project,
  filePath: string
): Promise<FileInfo | null> {
  try {
    // Get directory handle from IndexedDB
    const dirHandle = await getDirectoryHandle(project.id);

    if (!dirHandle) {
      return null;
    }

    // Verify handle and permissions
    const isValid = await verifyHandleValid(dirHandle);
    if (!isValid) {
      return null;
    }

    const hasPermission = await ensurePermission(dirHandle, 'read');
    if (!hasPermission) {
      return null;
    }

    // Get file handle by path
    const fileHandle = await getFileHandleByPath(dirHandle, filePath);
    if (!fileHandle) {
      console.log('[Hybrid Router] File not found:', filePath);
      return null;
    }

    // Load file content
    console.log('[Hybrid Router] Loading file via local File System API');
    const fileInfo = await loadFileFromHandle(fileHandle);

    return fileInfo;
  } catch (error) {
    console.error('[Hybrid Router] Local file load failed:', error);
    return null;
  }
}

/**
 * Load tree via API route
 */
async function loadTreeViaAPI(project: Project): Promise<TreeNode[]> {
  console.log('[Hybrid Router] Loading tree via API');

  // If project has a real path (not [Directory:...]), use it
  const projectPath = project.path.startsWith('[Directory:')
    ? null
    : project.path;

  if (!projectPath) {
    throw new Error('Project path not available for API mode');
  }

  const response = await CodeRefApi.tree.load(projectPath);
  return response.tree;
}

/**
 * Load file via API route
 */
async function loadFileViaAPI(project: Project, filePath: string): Promise<FileInfo> {
  console.log('[Hybrid Router] Loading file via API');

  // Build absolute file path
  const projectPath = project.path.startsWith('[Directory:')
    ? null
    : project.path;

  if (!projectPath) {
    throw new Error('Project path not available for API mode');
  }

  // Construct absolute path
  const absolutePath = `${projectPath}/${filePath}`.replace(/\\/g, '/');

  const fileData = await CodeRefApi.file.load(absolutePath);
  return fileData;
}

/**
 * Get current access mode for a project
 * Useful for displaying mode indicator to user
 */
export async function getProjectAccessMode(project: Project): Promise<AccessMode> {
  if (!isFileSystemAccessSupported()) {
    return 'api';
  }

  if (!project.path.startsWith('[Directory:')) {
    return 'api';
  }

  try {
    const dirHandle = await getDirectoryHandle(project.id);
    if (!dirHandle) {
      return 'api';
    }

    const isValid = await verifyHandleValid(dirHandle);
    if (!isValid) {
      return 'api';
    }

    const hasPermission = await ensurePermission(dirHandle, 'read');
    return hasPermission ? 'local' : 'api';
  } catch {
    return 'api';
  }
}
