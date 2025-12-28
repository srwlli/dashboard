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
