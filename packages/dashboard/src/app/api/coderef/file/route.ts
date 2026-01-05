/**
 * /api/coderef/file
 *
 * Returns file content and metadata for a given file path
 * Query param: ?path=<absolute-file-path>
 */

import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse, ErrorCodes, HttpStatus } from '@/types/api';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * File metadata and content response
 */
export interface FileData {
  /** Absolute file path */
  path: string;

  /** File name */
  name: string;

  /** File extension */
  extension: string;

  /** File size in bytes */
  size: number;

  /** File content (text or base64 for binary) */
  content: string;

  /** Content encoding (utf-8 or base64) */
  encoding: 'utf-8' | 'base64';

  /** MIME type */
  mimeType: string;

  /** Last modified timestamp */
  lastModified: string;
}

/**
 * Text file extensions (will be returned as UTF-8)
 */
const TEXT_EXTENSIONS = new Set([
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
  '.toml',
  '.ini',
  '.conf',
  '.sh',
  '.bash',
  '.py',
  '.rb',
  '.java',
  '.c',
  '.cpp',
  '.h',
  '.hpp',
  '.go',
  '.rs',
  '.php',
  '.sql',
  '.graphql',
  '.vue',
  '.svelte',
  '.env',
  '.gitignore',
  '.dockerignore',
  '.editorconfig',
  '.mmd', // Mermaid diagram files
]);

/**
 * Get MIME type from file extension
 */
function getMimeType(ext: string): string {
  const mimeTypes: Record<string, string> = {
    '.json': 'application/json',
    '.md': 'text/markdown',
    '.txt': 'text/plain',
    '.js': 'application/javascript',
    '.jsx': 'application/javascript',
    '.ts': 'application/typescript',
    '.tsx': 'application/typescript',
    '.css': 'text/css',
    '.html': 'text/html',
    '.xml': 'application/xml',
    '.yml': 'application/yaml',
    '.yaml': 'application/yaml',
    '.mmd': 'text/vnd.mermaid',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
  };

  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Check if file is text-based
 */
function isTextFile(ext: string): boolean {
  return TEXT_EXTENSIONS.has(ext);
}

/**
 * Allowlisted file extensions for writing
 * Restricted to safe text formats for notes
 */
const WRITE_ALLOWED_EXTENSIONS = new Set(['.md', '.txt', '.json']);

/**
 * Maximum file size for writes (1MB)
 */
const MAX_WRITE_SIZE = 1024 * 1024; // 1MB

/**
 * Validate write path to ensure it's within coderef/notes/
 * Prevents directory traversal and unauthorized writes
 */
function validateWritePath(projectRoot: string, relativePath: string): {
  valid: boolean;
  error?: string;
  resolvedPath?: string;
} {
  // Reject absolute paths
  if (path.isAbsolute(relativePath)) {
    return { valid: false, error: 'Relative path required (absolute paths not allowed)' };
  }

  // Reject paths with directory traversal attempts
  if (relativePath.includes('..')) {
    return { valid: false, error: 'Directory traversal not allowed (..)' };
  }

  // Normalize and join paths to prevent traversal
  const normalizedRelative = path.normalize(relativePath);
  const resolvedPath = path.join(projectRoot, 'coderef', 'notes', normalizedRelative);

  // Verify the resolved path is still within coderef/notes/
  const notesDir = path.join(projectRoot, 'coderef', 'notes');
  if (!resolvedPath.startsWith(notesDir)) {
    return { valid: false, error: 'Path must be within coderef/notes/ directory' };
  }

  // Validate file extension
  const ext = path.extname(normalizedRelative).toLowerCase();
  if (!WRITE_ALLOWED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `Invalid file extension. Allowed: ${Array.from(WRITE_ALLOWED_EXTENSIONS).join(', ')}`,
    };
  }

  return { valid: true, resolvedPath };
}

/**
 * PUT /api/coderef/file
 * Writes content to a file in coderef/notes/ directory
 * Body: { projectRoot: string, filePath: string, content: string }
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { projectRoot, filePath, content } = body;

    // Validate required fields
    if (!projectRoot || !filePath || content === undefined) {
      const errorResponse = createErrorResponse(
        {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: projectRoot, filePath, content',
        },
        { received: Object.keys(body) }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
    }

    // Validate content type
    if (typeof content !== 'string') {
      const errorResponse = createErrorResponse(
        {
          code: 'VALIDATION_ERROR',
          message: 'Content must be a string',
        },
        { contentType: typeof content }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
    }

    // Enforce size limit (1MB)
    const contentSize = Buffer.byteLength(content, 'utf-8');
    if (contentSize > MAX_WRITE_SIZE) {
      const errorResponse = createErrorResponse(
        {
          code: 'FILE_TOO_LARGE',
          message: 'Content exceeds maximum size limit (1MB)',
        },
        { size: contentSize, limit: MAX_WRITE_SIZE }
      );
      return NextResponse.json(errorResponse, { status: 413 });
    }

    // Validate write path
    const validation = validateWritePath(projectRoot, filePath);
    if (!validation.valid) {
      const errorResponse = createErrorResponse(
        {
          code: 'INVALID_PATH',
          message: validation.error!,
        },
        { projectRoot, filePath }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.FORBIDDEN });
    }

    const resolvedPath = validation.resolvedPath!;

    // Ensure directory exists
    const dir = path.dirname(resolvedPath);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error: any) {
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        const errorResponse = createErrorResponse(ErrorCodes.PERMISSION_DENIED, {
          path: dir,
          operation: 'mkdir',
        });
        return NextResponse.json(errorResponse, { status: HttpStatus.FORBIDDEN });
      }
      throw error;
    }

    // Write file
    try {
      await fs.writeFile(resolvedPath, content, 'utf-8');
    } catch (error: any) {
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        const errorResponse = createErrorResponse(ErrorCodes.PERMISSION_DENIED, {
          path: resolvedPath,
          operation: 'write',
        });
        return NextResponse.json(errorResponse, { status: HttpStatus.FORBIDDEN });
      }
      throw error;
    }

    const response = createSuccessResponse({
      success: true,
      path: resolvedPath,
      size: contentSize,
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
 * GET /api/coderef/file?path=<file-path>
 * Returns file content and metadata
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filePath = searchParams.get('path');

    if (!filePath) {
      const errorResponse = createErrorResponse(
        {
          code: 'VALIDATION_ERROR',
          message: 'Missing required query parameter: path',
        },
        { received: searchParams.toString() }
      );
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Verify file exists and is a file
    let stats;
    try {
      stats = await fs.stat(filePath);
      if (!stats.isFile()) {
        const errorResponse = createErrorResponse(
          {
            code: 'INVALID_PATH',
            message: 'Path is not a file',
          },
          { path: filePath }
        );
        return NextResponse.json(errorResponse, { status: 400 });
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        const errorResponse = createErrorResponse(
          {
            code: 'FILE_NOT_FOUND',
            message: 'File not found',
          },
          { path: filePath }
        );
        return NextResponse.json(errorResponse, { status: HttpStatus.NOT_FOUND });
      }
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        const errorResponse = createErrorResponse(ErrorCodes.PERMISSION_DENIED, {
          path: filePath,
        });
        return NextResponse.json(errorResponse, { status: HttpStatus.FORBIDDEN });
      }
      throw error;
    }

    // Check file size (limit to 10MB for API responses)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (stats.size > MAX_FILE_SIZE) {
      const errorResponse = createErrorResponse(
        {
          code: 'FILE_TOO_LARGE',
          message: 'File exceeds maximum size limit (10MB)',
        },
        { path: filePath, size: stats.size, limit: MAX_FILE_SIZE }
      );
      return NextResponse.json(errorResponse, { status: 413 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const name = path.basename(filePath);
    const isText = isTextFile(ext);

    // Read file content
    let content: string;
    let encoding: 'utf-8' | 'base64';

    try {
      if (isText) {
        content = await fs.readFile(filePath, 'utf-8');
        encoding = 'utf-8';
      } else {
        const buffer = await fs.readFile(filePath);
        content = buffer.toString('base64');
        encoding = 'base64';
      }
    } catch (error: any) {
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        const errorResponse = createErrorResponse(ErrorCodes.PERMISSION_DENIED, {
          path: filePath,
        });
        return NextResponse.json(errorResponse, { status: HttpStatus.FORBIDDEN });
      }
      throw error;
    }

    const fileData: FileData = {
      path: filePath,
      name,
      extension: ext,
      size: stats.size,
      content,
      encoding,
      mimeType: getMimeType(ext),
      lastModified: stats.mtime.toISOString(),
    };

    const response = createSuccessResponse(fileData);

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error) {
    const errorResponse = createErrorResponse(ErrorCodes.INTERNAL_ERROR, {
      reason: (error as Error).message,
    });
    return NextResponse.json(errorResponse, { status: HttpStatus.INTERNAL_ERROR });
  }
}

/**
 * DELETE /api/coderef/file
 * Deletes a file in coderef/notes/ directory
 * Body: { projectRoot: string, filePath: string }
 */
/**
 * Critical paths that should never be deleted
 */
const PROTECTED_PATHS = new Set([
  '.git',
  'node_modules',
  'package.json',
  'package-lock.json',
  '.env',
  '.env.local',
  '.env.production',
]);

/**
 * Check if a path is protected from deletion
 */
function isProtectedPath(filePath: string): boolean {
  const basename = path.basename(filePath);
  return PROTECTED_PATHS.has(basename);
}

/**
 * DELETE /api/coderef/file
 * Deletes a file or directory
 * Body: { filePath: string, recursive?: boolean }
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { filePath, recursive = false } = body;

    // Validate required fields
    if (!filePath) {
      const errorResponse = createErrorResponse(
        {
          code: 'VALIDATION_ERROR',
          message: 'Missing required field: filePath',
        },
        { received: Object.keys(body) }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
    }

    // Validate path is absolute
    if (!path.isAbsolute(filePath)) {
      const errorResponse = createErrorResponse(
        {
          code: 'INVALID_PATH',
          message: 'Path must be absolute',
        },
        { filePath }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
    }

    // Check if path is protected
    if (isProtectedPath(filePath)) {
      const errorResponse = createErrorResponse(
        {
          code: 'FORBIDDEN',
          message: 'Cannot delete protected path',
        },
        { path: filePath, protected: true }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.FORBIDDEN });
    }

    // Check if file/directory exists
    let stats;
    try {
      stats = await fs.stat(filePath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        const errorResponse = createErrorResponse(
          {
            code: 'FILE_NOT_FOUND',
            message: 'File or directory not found',
          },
          { path: filePath }
        );
        return NextResponse.json(errorResponse, { status: HttpStatus.NOT_FOUND });
      }
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        const errorResponse = createErrorResponse(ErrorCodes.PERMISSION_DENIED, {
          path: filePath,
        });
        return NextResponse.json(errorResponse, { status: HttpStatus.FORBIDDEN });
      }
      throw error;
    }

    const isDirectory = stats.isDirectory();

    // If directory and not recursive, reject
    if (isDirectory && !recursive) {
      const errorResponse = createErrorResponse(
        {
          code: 'VALIDATION_ERROR',
          message: 'Cannot delete directory without recursive flag',
        },
        { path: filePath, isDirectory: true }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
    }

    // Delete file or directory
    try {
      if (isDirectory) {
        await fs.rm(filePath, { recursive: true, force: true });
      } else {
        await fs.unlink(filePath);
      }
    } catch (error: any) {
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        const errorResponse = createErrorResponse(ErrorCodes.PERMISSION_DENIED, {
          path: filePath,
          operation: 'delete',
        });
        return NextResponse.json(errorResponse, { status: HttpStatus.FORBIDDEN });
      }
      throw error;
    }

    const response = createSuccessResponse({
      success: true,
      deleted: filePath,
      type: isDirectory ? 'directory' : 'file',
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
 * Validate file name for rename operations
 */
function isValidFileName(name: string): boolean {
  // No slashes, no directory traversal
  if (name.includes('/') || name.includes('\\') || name.includes('..')) {
    return false;
  }
  // No empty names
  if (name.trim() === '') {
    return false;
  }
  // No reserved names on Windows
  const reserved = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'LPT1', 'LPT2', 'LPT3'];
  if (reserved.includes(name.toUpperCase())) {
    return false;
  }
  return true;
}

/**
 * PATCH /api/coderef/file
 * Rename or move a file/directory
 * Body: { sourcePath: string, operation: 'rename' | 'move', newName?: string, destinationDir?: string }
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { sourcePath, operation, newName, destinationDir } = body;

    // Validate required fields
    if (!sourcePath || !operation) {
      const errorResponse = createErrorResponse(
        {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: sourcePath, operation',
        },
        { received: Object.keys(body) }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
    }

    // Validate operation type
    if (operation !== 'rename' && operation !== 'move') {
      const errorResponse = createErrorResponse(
        {
          code: 'VALIDATION_ERROR',
          message: 'Invalid operation. Must be "rename" or "move"',
        },
        { operation }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
    }

    // Validate operation-specific parameters
    if (operation === 'rename' && !newName) {
      const errorResponse = createErrorResponse(
        {
          code: 'VALIDATION_ERROR',
          message: 'Missing required field for rename: newName',
        },
        { operation }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
    }

    if (operation === 'move' && !destinationDir) {
      const errorResponse = createErrorResponse(
        {
          code: 'VALIDATION_ERROR',
          message: 'Missing required field for move: destinationDir',
        },
        { operation }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
    }

    // Validate source path is absolute
    if (!path.isAbsolute(sourcePath)) {
      const errorResponse = createErrorResponse(
        {
          code: 'INVALID_PATH',
          message: 'Source path must be absolute',
        },
        { sourcePath }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
    }

    // Check if source is protected
    if (isProtectedPath(sourcePath)) {
      const errorResponse = createErrorResponse(
        {
          code: 'FORBIDDEN',
          message: 'Cannot rename or move protected path',
        },
        { path: sourcePath, protected: true }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.FORBIDDEN });
    }

    // Verify source exists
    let sourceStats;
    try {
      sourceStats = await fs.stat(sourcePath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        const errorResponse = createErrorResponse(
          {
            code: 'FILE_NOT_FOUND',
            message: 'Source file or directory not found',
          },
          { path: sourcePath }
        );
        return NextResponse.json(errorResponse, { status: HttpStatus.NOT_FOUND });
      }
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        const errorResponse = createErrorResponse(ErrorCodes.PERMISSION_DENIED, {
          path: sourcePath,
        });
        return NextResponse.json(errorResponse, { status: HttpStatus.FORBIDDEN });
      }
      throw error;
    }

    let destinationPath: string;

    if (operation === 'rename') {
      // Validate new name
      if (!isValidFileName(newName!)) {
        const errorResponse = createErrorResponse(
          {
            code: 'VALIDATION_ERROR',
            message: 'Invalid file name. Cannot contain slashes, "..", or be empty',
          },
          { newName }
        );
        return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
      }

      // Build destination path (same directory, new name)
      const sourceDir = path.dirname(sourcePath);
      destinationPath = path.join(sourceDir, newName!);

      // Check if renaming to same name
      if (sourcePath === destinationPath) {
        const errorResponse = createErrorResponse(
          {
            code: 'VALIDATION_ERROR',
            message: 'New name is the same as current name',
          },
          { sourcePath, newName }
        );
        return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
      }
    } else {
      // Move operation
      // Validate destination directory is absolute
      if (!path.isAbsolute(destinationDir!)) {
        const errorResponse = createErrorResponse(
          {
            code: 'INVALID_PATH',
            message: 'Destination directory must be absolute',
          },
          { destinationDir }
        );
        return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
      }

      // Verify destination directory exists
      try {
        const destStats = await fs.stat(destinationDir!);
        if (!destStats.isDirectory()) {
          const errorResponse = createErrorResponse(
            {
              code: 'INVALID_PATH',
              message: 'Destination must be a directory',
            },
            { destinationDir }
          );
          return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
        }
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          const errorResponse = createErrorResponse(
            {
              code: 'FILE_NOT_FOUND',
              message: 'Destination directory not found',
            },
            { path: destinationDir }
          );
          return NextResponse.json(errorResponse, { status: HttpStatus.NOT_FOUND });
        }
        throw error;
      }

      // Build destination path (new directory, same name)
      const sourceName = path.basename(sourcePath);
      destinationPath = path.join(destinationDir!, sourceName);

      // Check if moving to same location
      if (path.dirname(sourcePath) === destinationDir) {
        const errorResponse = createErrorResponse(
          {
            code: 'VALIDATION_ERROR',
            message: 'Source is already in destination directory',
          },
          { sourcePath, destinationDir }
        );
        return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
      }

      // Check if trying to move into itself (for directories)
      if (sourceStats.isDirectory() && destinationDir!.startsWith(sourcePath + path.sep)) {
        const errorResponse = createErrorResponse(
          {
            code: 'VALIDATION_ERROR',
            message: 'Cannot move directory into itself',
          },
          { sourcePath, destinationDir }
        );
        return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
      }
    }

    // Check if destination already exists
    try {
      await fs.access(destinationPath);
      const errorResponse = createErrorResponse(
        {
          code: 'FILE_EXISTS',
          message: 'Destination already exists',
        },
        { destinationPath }
      );
      return NextResponse.json(errorResponse, { status: 409 }); // Conflict
    } catch (error: any) {
      // ENOENT is expected - destination should not exist
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    // Perform rename/move operation
    try {
      await fs.rename(sourcePath, destinationPath);
    } catch (error: any) {
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        const errorResponse = createErrorResponse(ErrorCodes.PERMISSION_DENIED, {
          path: sourcePath,
          operation,
        });
        return NextResponse.json(errorResponse, { status: HttpStatus.FORBIDDEN });
      }
      // Handle cross-device move (different filesystems)
      if (error.code === 'EXDEV') {
        const errorResponse = createErrorResponse(
          {
            code: 'CROSS_DEVICE_MOVE',
            message: 'Cannot move across different filesystems. Use copy instead.',
          },
          { sourcePath, destinationPath }
        );
        return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
      }
      throw error;
    }

    const response = createSuccessResponse({
      success: true,
      operation,
      oldPath: sourcePath,
      newPath: destinationPath,
      type: sourceStats.isDirectory() ? 'directory' : 'file',
    });

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error) {
    const errorResponse = createErrorResponse(ErrorCodes.INTERNAL_ERROR, {
      reason: (error as Error).message,
    });
    return NextResponse.json(errorResponse, { status: HttpStatus.INTERNAL_ERROR });
  }
}
