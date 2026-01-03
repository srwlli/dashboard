/**
 * /api/coderef/tree
 *
 * Returns directory tree structure for a given project path
 * Query param: ?path=<absolute-path-to-project>
 */

import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse, ErrorCodes, HttpStatus } from '@/types/api';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Tree node interface
 */
export interface TreeNode {
  /** Node name (file or folder name) */
  name: string;

  /** Node type */
  type: 'file' | 'directory';

  /** Relative path from project root */
  path: string;

  /** Children nodes (only for directories) */
  children?: TreeNode[];

  /** File size in bytes (only for files) */
  size?: number;

  /** File extension (only for files) */
  extension?: string;

  /** Last modified timestamp in ISO 8601 format (only for files) */
  lastModified?: string;
}

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
 * Hidden directories to allow (not skip)
 */
const ALLOWED_HIDDEN = new Set(['.env', '.coderef']);

/**
 * Build directory tree recursively
 */
async function buildTree(
  rootPath: string,
  currentPath: string,
  maxDepth: number = 10,
  currentDepth: number = 0
): Promise<TreeNode[]> {
  if (currentDepth >= maxDepth) {
    return [];
  }

  try {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    const nodes: TreeNode[] = [];

    for (const entry of entries) {
      // Skip hidden files and excluded directories
      if (entry.name.startsWith('.') && !ALLOWED_HIDDEN.has(entry.name)) {
        continue;
      }

      if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) {
        continue;
      }

      const fullPath = path.join(currentPath, entry.name);
      const relativePath = path.relative(rootPath, fullPath);

      if (entry.isDirectory()) {
        // Recursively build directory tree
        const children = await buildTree(rootPath, fullPath, maxDepth, currentDepth + 1);

        nodes.push({
          name: entry.name,
          type: 'directory',
          path: relativePath.replace(/\\/g, '/'),
          children,
        });
      } else {
        // File node
        const stats = await fs.stat(fullPath);
        const ext = path.extname(entry.name);

        nodes.push({
          name: entry.name,
          type: 'file',
          path: relativePath.replace(/\\/g, '/'),
          size: stats.size,
          extension: ext || undefined,
          lastModified: stats.mtime.toISOString(),
        });
      }
    }

    // Sort: directories first, then files, alphabetically
    nodes.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === 'directory' ? -1 : 1;
    });

    return nodes;
  } catch (error: any) {
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      // Permission denied, return empty array
      return [];
    }
    throw error;
  }
}

/**
 * GET /api/coderef/tree?path=<project-path>
 * Returns directory tree for the specified project path
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectPath = searchParams.get('path');

    if (!projectPath) {
      const errorResponse = createErrorResponse(
        {
          code: 'VALIDATION_ERROR',
          message: 'Missing required query parameter: path',
        },
        { received: searchParams.toString() }
      );
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Verify path exists
    try {
      const stats = await fs.stat(projectPath);
      if (!stats.isDirectory()) {
        const errorResponse = createErrorResponse(
          {
            code: 'INVALID_PATH',
            message: 'Path is not a directory',
          },
          { path: projectPath }
        );
        return NextResponse.json(errorResponse, { status: 400 });
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        const errorResponse = createErrorResponse(ErrorCodes.FOLDER_NOT_FOUND, {
          path: projectPath,
        });
        return NextResponse.json(errorResponse, { status: HttpStatus.NOT_FOUND });
      }
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        const errorResponse = createErrorResponse(ErrorCodes.PERMISSION_DENIED, {
          path: projectPath,
        });
        return NextResponse.json(errorResponse, { status: HttpStatus.FORBIDDEN });
      }
      throw error;
    }

    // Build tree
    const tree = await buildTree(projectPath, projectPath);

    const response = createSuccessResponse({
      path: projectPath,
      tree,
      total_nodes: countNodes(tree),
    });

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error) {
    const errorResponse = createErrorResponse(ErrorCodes.INTERNAL_ERROR, {
      reason: (error as Error).message,
    });
    return NextResponse.json(errorResponse, { status: HttpStatus.INTERNAL_ERROR });
  }
}

/**
 * Count total nodes in tree (for metadata)
 */
function countNodes(nodes: TreeNode[]): number {
  let count = nodes.length;
  for (const node of nodes) {
    if (node.children) {
      count += countNodes(node.children);
    }
  }
  return count;
}
