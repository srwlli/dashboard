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
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { projectRoot, filePath } = body;

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

    // Validate delete path (reuse write validation)
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

    // Check if file exists
    try {
      const stats = await fs.stat(resolvedPath);
      if (!stats.isFile()) {
        const errorResponse = createErrorResponse(
          {
            code: 'INVALID_PATH',
            message: 'Path is not a file',
          },
          { path: resolvedPath }
        );
        return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        const errorResponse = createErrorResponse(
          {
            code: 'FILE_NOT_FOUND',
            message: 'File not found',
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

    // Delete file
    try {
      await fs.unlink(resolvedPath);
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
    });

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error) {
    const errorResponse = createErrorResponse(ErrorCodes.INTERNAL_ERROR, {
      reason: (error as Error).message,
    });
    return NextResponse.json(errorResponse, { status: HttpStatus.INTERNAL_ERROR });
  }
}
