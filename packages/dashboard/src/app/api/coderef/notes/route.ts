/**
 * /api/coderef/notes
 *
 * Lists all notes in the coderef/notes/ directory
 * Query param: ?projectRoot=<absolute-path>
 */

import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse, ErrorCodes, HttpStatus } from '@/types/api';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Note metadata interface
 */
export interface NoteMetadata {
  /** Note file name */
  name: string;

  /** Relative path from coderef/notes/ */
  path: string;

  /** File size in bytes */
  size: number;

  /** Last modified timestamp */
  modified: string;

  /** File extension */
  extension: string;
}

/**
 * Notes list response
 */
export interface NotesListResponse {
  /** Array of note metadata */
  notes: NoteMetadata[];

  /** Total count */
  total: number;

  /** Timestamp of response */
  timestamp: string;
}

/**
 * Allowlisted file extensions for notes
 */
const ALLOWED_NOTE_EXTENSIONS = new Set(['.md', '.txt', '.json']);

/**
 * GET /api/coderef/notes?projectRoot=<path>
 * Returns list of notes with metadata
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectRoot = searchParams.get('projectRoot');

    if (!projectRoot) {
      const errorResponse = createErrorResponse(
        {
          code: 'VALIDATION_ERROR',
          message: 'Missing required query parameter: projectRoot',
        },
        { received: searchParams.toString() }
      );
      return NextResponse.json(errorResponse, { status: HttpStatus.BAD_REQUEST });
    }

    // Build notes directory path
    const notesDir = path.join(projectRoot, 'coderef', 'notes');

    // Check if notes directory exists
    let dirExists = false;
    try {
      const stats = await fs.stat(notesDir);
      dirExists = stats.isDirectory();
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // Directory doesn't exist - return empty array
        const response: NotesListResponse = {
          notes: [],
          total: 0,
          timestamp: new Date().toISOString(),
        };
        return NextResponse.json(createSuccessResponse(response), { status: HttpStatus.OK });
      }
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        const errorResponse = createErrorResponse(ErrorCodes.PERMISSION_DENIED, {
          path: notesDir,
        });
        return NextResponse.json(errorResponse, { status: HttpStatus.FORBIDDEN });
      }
      throw error;
    }

    if (!dirExists) {
      const response: NotesListResponse = {
        notes: [],
        total: 0,
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(createSuccessResponse(response), { status: HttpStatus.OK });
    }

    // Read directory contents
    let entries;
    try {
      entries = await fs.readdir(notesDir, { withFileTypes: true });
    } catch (error: any) {
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        const errorResponse = createErrorResponse(ErrorCodes.PERMISSION_DENIED, {
          path: notesDir,
        });
        return NextResponse.json(errorResponse, { status: HttpStatus.FORBIDDEN });
      }
      throw error;
    }

    // Filter and map to note metadata
    const notes: NoteMetadata[] = [];

    for (const entry of entries) {
      // Skip directories and hidden files
      if (entry.isDirectory() || entry.name.startsWith('.')) {
        continue;
      }

      const ext = path.extname(entry.name).toLowerCase();

      // Skip files with non-allowlisted extensions
      if (!ALLOWED_NOTE_EXTENSIONS.has(ext)) {
        continue;
      }

      const filePath = path.join(notesDir, entry.name);

      try {
        const stats = await fs.stat(filePath);

        notes.push({
          name: entry.name,
          path: entry.name, // Relative path (just filename for flat structure)
          size: stats.size,
          modified: stats.mtime.toISOString(),
          extension: ext,
        });
      } catch (error) {
        // Skip files that can't be stat'd (permissions, etc.)
        continue;
      }
    }

    // Sort by modified date (newest first)
    notes.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());

    const response: NotesListResponse = {
      notes,
      total: notes.length,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(createSuccessResponse(response), { status: HttpStatus.OK });
  } catch (error) {
    const errorResponse = createErrorResponse(ErrorCodes.INTERNAL_ERROR, {
      reason: (error as Error).message,
    });
    return NextResponse.json(errorResponse, { status: HttpStatus.INTERNAL_ERROR });
  }
}
