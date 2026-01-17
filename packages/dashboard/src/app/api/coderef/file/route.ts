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
  '.csv', // CSV data files
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
    '.csv': 'text/csv',
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
 * Supports 30+ text/code file formats for Notepad clone
 */
const WRITE_ALLOWED_EXTENSIONS = new Set([
  // Markdown and text
  '.md', '.txt',

  // Web development
  '.html', '.htm', '.css', '.scss', '.sass', '.js', '.jsx', '.ts', '.tsx',

  // Programming languages
  '.py', '.java', '.c', '.cpp', '.rs', '.go', '.rb', '.php',

  // Data and config
  '.json', '.yaml', '.yml', '.toml', '.ini', '.env', '.csv',

  // Markup and data
  '.xml', '.svg',

  // Database and scripts
  '.sql', '.sh', '.bash',
]);

/**
 * Maximum file size for writes (1MB)
 */
const MAX_WRITE_SIZE = 1024 * 1024; // 1MB

/**
 * Unified path validation for all file operations
 * Ensures paths are within project root and prevents directory traversal
 *
 * @param projectRoot - Absolute path to project root directory
 * @param targetPath - Path to validate (can be absolute or relative)
 * @param options - Validation options
 * @returns Validation result with resolved absolute path
 */
function validateFilePath(
  projectRoot: string,
  targetPath: string,
  options: {
    requireExtension?: boolean;
    allowedExtensions?: Set<string>;
  } = {}
): {
  valid: boolean;
  error?: string;
  resolvedPath?: string;
} {
  // Normalize project root to ensure consistent comparison
  const normalizedRoot = path.resolve(projectRoot);

  // Handle both absolute and relative paths
  let resolvedPath: string;

  if (path.isAbsolute(targetPath)) {
    // For absolute paths, use directly
    resolvedPath = path.resolve(targetPath);
  } else {
    // For relative paths, join with project root
    // First check for directory traversal attempts
    if (targetPath.includes('..')) {
      return { valid: false, error: 'Directory traversal not allowed (..)' };
    }

    resolvedPath = path.resolve(normalizedRoot, targetPath);
  }

  // Critical security check: Verify the resolved path is within project root
  // Use path.relative to detect if path escapes project root
  const relativePath = path.relative(normalizedRoot, resolvedPath);
  const isWithinRoot =
    !relativePath.startsWith('..') &&
    !path.isAbsolute(relativePath);

  if (!isWithinRoot) {
    return {
      valid: false,
      error: 'Path must be within project root directory'
    };
  }

  // Validate file extension if required
  if (options.requireExtension && options.allowedExtensions) {
    const ext = path.extname(resolvedPath).toLowerCase();
    if (!options.allowedExtensions.has(ext)) {
      return {
        valid: false,
        error: `Invalid file extension. Allowed: ${Array.from(options.allowedExtensions).join(', ')}`,
      };
    }
  }

  return { valid: true, resolvedPath };
}

/**
 * Validate write path (wrapper for backward compatibility)
 * @deprecated Use validateFilePath instead
 */
function validateWritePath(projectRoot: string, relativePath: string): {
  valid: boolean;
  error?: string;
  resolvedPath?: string;
} {
  return validateFilePath(projectRoot, relativePath, {
    requireExtension: true,
    allowedExtensions: WRITE_ALLOWED_EXTENSIONS,
  });
}

/**
 * PUT /api/coderef/file
 * Writes content to a file anywhere within project root
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
 * Deletes a file or directory within project root
 * Body: { projectRoot: string, filePath: string, recursive?: boolean }
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { projectRoot, filePath, recursive = false } = body;

    // Validate required fields
    if (!projectRoot || !filePath) {
      const errorResponse = createErrorResponse(
        {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: projectRoot, filePath',
        },
        { received: Object.keys(body) }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
    }

    // Validate path using unified validation
    const validation = validateFilePath(projectRoot, filePath);
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

    // Check if path is protected
    if (isProtectedPath(resolvedPath)) {
      const errorResponse = createErrorResponse(
        {
          code: 'FORBIDDEN',
          message: 'Cannot delete protected path',
        },
        { path: resolvedPath, protected: true }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.FORBIDDEN });
    }

    // Check if file/directory exists
    let stats;
    try {
      stats = await fs.stat(resolvedPath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        const errorResponse = createErrorResponse(
          {
            code: 'FILE_NOT_FOUND',
            message: 'File or directory not found',
          },
          { path: resolvedPath }
        );
        return NextResponse.json(errorResponse, { status: HttpStatus.NOT_FOUND });
      }
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        const errorResponse = createErrorResponse(ErrorCodes.PERMISSION_DENIED, {
          path: resolvedPath,
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
        { path: resolvedPath, isDirectory: true }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
    }

    // Delete file or directory
    try {
      if (isDirectory) {
        await fs.rm(resolvedPath, { recursive: true, force: true });
      } else {
        await fs.unlink(resolvedPath);
      }
    } catch (error: any) {
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        const errorResponse = createErrorResponse(ErrorCodes.PERMISSION_DENIED, {
          path: resolvedPath,
          operation: 'delete',
        });
        return NextResponse.json(errorResponse, { status: HttpStatus.FORBIDDEN });
      }
      throw error;
    }

    const response = createSuccessResponse({
      success: true,
      deleted: resolvedPath,
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
 * Rename or move a file/directory within project root
 * Body: { projectRoot: string, sourcePath: string, operation: 'rename' | 'move', newName?: string, destinationDir?: string }
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { projectRoot, sourcePath, operation, newName, destinationDir } = body;

    // Validate required fields
    if (!projectRoot || !sourcePath || !operation) {
      const errorResponse = createErrorResponse(
        {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: projectRoot, sourcePath, operation',
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

    // Validate source path using unified validation
    const sourceValidation = validateFilePath(projectRoot, sourcePath);
    if (!sourceValidation.valid) {
      const errorResponse = createErrorResponse(
        {
          code: 'INVALID_PATH',
          message: sourceValidation.error!,
        },
        { projectRoot, sourcePath }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.FORBIDDEN });
    }

    const resolvedSourcePath = sourceValidation.resolvedPath!;

    // Check if source is protected
    if (isProtectedPath(resolvedSourcePath)) {
      const errorResponse = createErrorResponse(
        {
          code: 'FORBIDDEN',
          message: 'Cannot rename or move protected path',
        },
        { path: resolvedSourcePath, protected: true }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.FORBIDDEN });
    }

    // Verify source exists
    let sourceStats;
    try {
      sourceStats = await fs.stat(resolvedSourcePath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        const errorResponse = createErrorResponse(
          {
            code: 'FILE_NOT_FOUND',
            message: 'Source file or directory not found',
          },
          { path: resolvedSourcePath }
        );
        return NextResponse.json(errorResponse, { status: HttpStatus.NOT_FOUND });
      }
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        const errorResponse = createErrorResponse(ErrorCodes.PERMISSION_DENIED, {
          path: resolvedSourcePath,
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
      const sourceDir = path.dirname(resolvedSourcePath);
      destinationPath = path.join(sourceDir, newName!);

      // Check if renaming to same name
      if (resolvedSourcePath === destinationPath) {
        const errorResponse = createErrorResponse(
          {
            code: 'VALIDATION_ERROR',
            message: 'New name is the same as current name',
          },
          { sourcePath: resolvedSourcePath, newName }
        );
        return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
      }
    } else {
      // Move operation
      // Validate destination directory using unified validation
      const destValidation = validateFilePath(projectRoot, destinationDir!);
      if (!destValidation.valid) {
        const errorResponse = createErrorResponse(
          {
            code: 'INVALID_PATH',
            message: destValidation.error!,
          },
          { projectRoot, destinationDir }
        );
        return NextResponse.json(errorResponse, { status: HttpStatus.FORBIDDEN });
      }

      const resolvedDestDir = destValidation.resolvedPath!;

      // Verify destination directory exists and is a directory
      try {
        const destStats = await fs.stat(resolvedDestDir);
        if (!destStats.isDirectory()) {
          const errorResponse = createErrorResponse(
            {
              code: 'INVALID_PATH',
              message: 'Destination must be a directory',
            },
            { destinationDir: resolvedDestDir }
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
            { path: resolvedDestDir }
          );
          return NextResponse.json(errorResponse, { status: HttpStatus.NOT_FOUND });
        }
        throw error;
      }

      // Build destination path (new directory, same name)
      const sourceName = path.basename(resolvedSourcePath);
      destinationPath = path.join(resolvedDestDir, sourceName);

      // Check if moving to same location
      if (path.dirname(resolvedSourcePath) === resolvedDestDir) {
        const errorResponse = createErrorResponse(
          {
            code: 'VALIDATION_ERROR',
            message: 'Source is already in destination directory',
          },
          { sourcePath: resolvedSourcePath, destinationDir: resolvedDestDir }
        );
        return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
      }

      // Check if trying to move into itself (for directories)
      if (sourceStats.isDirectory() && resolvedDestDir.startsWith(resolvedSourcePath + path.sep)) {
        const errorResponse = createErrorResponse(
          {
            code: 'VALIDATION_ERROR',
            message: 'Cannot move directory into itself',
          },
          { sourcePath: resolvedSourcePath, destinationDir: resolvedDestDir }
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
      await fs.rename(resolvedSourcePath, destinationPath);
    } catch (error: any) {
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        const errorResponse = createErrorResponse(ErrorCodes.PERMISSION_DENIED, {
          path: resolvedSourcePath,
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
          { sourcePath: resolvedSourcePath, destinationPath }
        );
        return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
      }
      throw error;
    }

    const response = createSuccessResponse({
      success: true,
      operation,
      oldPath: resolvedSourcePath,
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
